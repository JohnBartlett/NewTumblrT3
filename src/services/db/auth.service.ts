import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  emailVerified: boolean;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12; // Increased from 10 for better security
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
  
  /**
   * Validate password strength
   */
  private static validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      return { 
        valid: false, 
        error: `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters` 
      };
    }
    
    // Check for at least one number and one letter
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { 
        valid: false, 
        error: 'Password must contain at least one letter and one number' 
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Generate secure random token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<UserSession> {
    // Validate password strength
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { username: data.username.toLowerCase() }
        ]
      }
    });

    if (existing) {
      if (existing.email.toLowerCase() === data.email.toLowerCase()) {
        throw new Error('Email already registered');
      }
      throw new Error('Username already taken');
    }

    // Hash password with strong salt rounds
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    
    // Generate email verification token
    const emailVerificationToken = this.generateToken();

    // Create user with default preferences
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        passwordHash,
        displayName: data.displayName || data.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        emailVerificationToken,
        emailVerified: false,
        preferences: {
          create: {
            theme: 'system',
            fontSize: 16,
            reducedMotion: false,
            enableHaptics: true,
            enableGestures: true,
          }
        }
      },
      include: {
        preferences: true
      }
    });

    // In a real app, send verification email here
    console.log(`Email verification token for ${user.email}: ${emailVerificationToken}`);
    console.log(`Verification URL: ${window.location.origin}/auth/verify-email?token=${emailVerificationToken}`);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<UserSession> {
    // Find user by email or username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername.toLowerCase() },
          { username: data.emailOrUsername.toLowerCase() }
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid email/username or password');
    }

    // Verify password using timing-safe comparison
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email/username or password');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserSession | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: Partial<{
    displayName: string;
    avatar: string;
    bio: string;
  }>) {
    return await prisma.user.update({
      where: { id: userId },
      data
    });
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Validate new password strength
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Check if new password is same as current
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new Error('New password must be different from current password');
    }

    // Hash new password with strong salt rounds
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(emailOrUsername: string): Promise<{ success: boolean; message: string }> {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() }
        ]
      }
    });

    // Always return success to prevent user enumeration
    if (!user) {
      return { 
        success: true, 
        message: 'If an account exists with that email/username, a password reset link has been sent.' 
      };
    }

    // Generate password reset token
    const passwordResetToken = this.generateToken();
    const passwordResetExpiry = new Date(Date.now() + this.PASSWORD_RESET_EXPIRY);

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpiry
      }
    });

    // In a real app, send password reset email here
    console.log(`Password reset token for ${user.email}: ${passwordResetToken}`);
    console.log(`Reset URL: ${window.location.origin}/auth/reset-password?token=${passwordResetToken}`);

    return {
      success: true,
      message: 'If an account exists with that email/username, a password reset link has been sent.'
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    // Validate new password strength
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token }
    });

    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }

    // Check if token is expired
    if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new Error('Password reset token has expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    return { success: true };
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<{ success: boolean }> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      throw new Error('Invalid email verification token');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    return { success: true };
  }

  /**
   * Resend email verification
   */
  static async resendVerificationEmail(userId: string): Promise<{ success: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = this.generateToken();

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken }
    });

    // In a real app, send verification email here
    console.log(`New email verification token for ${user.email}: ${emailVerificationToken}`);
    console.log(`Verification URL: ${window.location.origin}/auth/verify-email?token=${emailVerificationToken}`);

    return { success: true };
  }

  /**
   * Find account by email
   */
  static async findAccountByEmail(email: string): Promise<{ found: boolean; username?: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return { found: false };
    }

    // Return partial username for security (e.g., "j***n" for "john")
    const username = user.username;
    const maskedUsername = username.length > 3
      ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
      : '*'.repeat(username.length);

    return {
      found: true,
      username: maskedUsername
    };
  }
}


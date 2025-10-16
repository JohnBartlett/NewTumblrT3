import express from 'express';
import cors from 'cors';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Constants
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper functions
const generateToken = () => crypto.randomBytes(32).toString('hex');

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for bulk image downloads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, displayName } = req.body;

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existing) {
      if (existing.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate email verification token
    const emailVerificationToken = generateToken();

    // Create user with preferences
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName: displayName || username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        emailVerified: false,
        emailVerificationToken,
        preferences: {
          create: {
            theme: 'system',
            fontSize: 16,
            viewMode: 'full',
            reducedMotion: false,
            enableHaptics: true,
            enableGestures: true,
          }
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        emailVerified: true,
        role: true,
      }
    });

    // In production, send verification email here
    console.log(`📧 Email verification URL: http://localhost:5173/auth/verify-email?token=${emailVerificationToken}`);

    res.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      lastLoginAt: new Date(),
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Request password reset
app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { emailOrUsername } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    // Always return success to prevent account enumeration
    if (!user) {
      return res.json({ message: 'If that account exists, a password reset link has been sent' });
    }

    // Generate reset token
    const passwordResetToken = generateToken();
    const passwordResetExpiry = new Date(Date.now() + PASSWORD_RESET_EXPIRY);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpiry
      }
    });

    // In production, send password reset email here
    console.log(`🔐 Password reset URL: http://localhost:5173/auth/reset-password?token=${passwordResetToken}`);

    res.json({ message: 'If that account exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Update password and clear reset token
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = generateToken();
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken }
    });

    // In production, send verification email here
    console.log(`📧 Email verification URL: http://localhost:5173/auth/verify-email?token=${emailVerificationToken}`);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Find account by email
app.post('/api/auth/find-account', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with that email address' });
    }

    // Return masked username for security
    const username = user.username;
    const maskedUsername = username.length > 3
      ? username.substring(0, 2) + '*'.repeat(username.length - 3) + username.substring(username.length - 1)
      : '*'.repeat(username.length);

    res.json({
      username: maskedUsername,
      message: `We found an account associated with ${email}. Your username is ${maskedUsername}`
    });
  } catch (error) {
    console.error('Find account error:', error);
    res.status(500).json({ error: 'Failed to find account' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        lastLoginAt: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user preferences
app.get('/api/users/:id/preferences', async (req, res) => {
  try {
    let prefs = await prisma.userPreferences.findUnique({
      where: { userId: req.params.id }
    });

    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: {
          userId: req.params.id,
          theme: 'system',
          fontSize: 16,
          viewMode: 'full',
          reducedMotion: false,
          enableHaptics: true,
          enableGestures: true,
        }
      });
    }

    res.json(prefs);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update user preferences
app.put('/api/users/:id/preferences', async (req, res) => {
  try {
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: req.params.id },
      update: req.body,
      create: {
        userId: req.params.id,
        ...req.body,
      }
    });

    res.json(prefs);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// ==================== STORED IMAGES ROUTES ====================

// Store images
app.post('/api/stored-images', async (req, res) => {
  try {
    const { userId, images } = req.body;

    console.log('📥 Store request - userId:', userId, 'images count:', images?.length);

    if (!userId || !images || !Array.isArray(images)) {
      console.log('❌ Invalid request data');
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const storedImages = [];
    let successCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const image of images) {
      try {
        console.log('Processing image:', { postId: image.postId, blogName: image.blogName, url: image.url?.substring(0, 50) });
        
        // Check if already stored
        const existing = await prisma.storedImage.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: image.postId
            }
          }
        });

        if (existing) {
          console.log('⏭️  Already stored, skipping:', image.postId);
          skippedCount++;
          continue;
        }

        // Store the image
        const stored = await prisma.storedImage.create({
          data: {
            userId,
            postId: image.postId,
            blogName: image.blogName,
            url: image.url,
            width: image.width,
            height: image.height,
            tags: JSON.stringify(image.tags || []),
            description: image.description,
            notes: image.notes || 0,
            timestamp: new Date(image.timestamp),
          }
        });

        console.log('✅ Stored image:', stored.id);
        storedImages.push(stored);
        successCount++;
      } catch (err) {
        console.error('❌ Error storing single image:', err);
        errors.push({ postId: image.postId, error: err.message });
      }
    }

    console.log(`📊 Results - Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('❌ Errors:', errors);
    }

    res.json({
      success: true,
      stored: successCount,
      skipped: skippedCount,
      failed: errors.length,
      total: images.length,
      images: storedImages,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Store images error:', error);
    res.status(500).json({ error: 'Failed to store images' });
  }
});

// Get stored images for a user
app.get('/api/stored-images/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, blogName } = req.query;

    const where: any = { userId };
    if (blogName) {
      where.blogName = blogName;
    }

    const images = await prisma.storedImage.findMany({
      where,
      orderBy: { storedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.storedImage.count({ where });

    res.json({
      images,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get stored images error:', error);
    res.status(500).json({ error: 'Failed to get stored images' });
  }
});

// Delete stored image
app.delete('/api/stored-images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Verify ownership
    const image = await prisma.storedImage.findUnique({
      where: { id }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (image.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.storedImage.delete({
      where: { id }
    });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete stored image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get stored images stats
app.get('/api/stored-images/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const total = await prisma.storedImage.count({ where: { userId } });
    
    const byBlog = await prisma.storedImage.groupBy({
      by: ['blogName'],
      where: { userId },
      _count: true,
    });

    res.json({
      total,
      byBlog: byBlog.map(b => ({ blogName: b.blogName, count: b._count })),
    });
  } catch (error) {
    console.error('Get stored images stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (Admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId as string }
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.MODERATOR)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user role (Admin only)
app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { adminId, role } = req.body;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId as string }
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    // Prevent self-deletion
    if (req.params.id === adminId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get system stats (Admin only)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId as string }
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.MODERATOR)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const [userCount, postCount, blogCount, followCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.blog.count(),
      prisma.follow.count(),
    ]);

    res.json({
      users: userCount,
      posts: postCount,
      blogs: blogCount,
      follows: followCount,
    });
  } catch (error) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ error: 'Failed to get system stats' });
  }
});

// Helper function for batched parallel fetching with concurrency control
// Like Python's asyncio.Semaphore - limits concurrent operations
async function fetchInBatches(items: any[], batchSize: number, fetchFn: (item: any, index: number) => Promise<any>) {
  const results: any[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => fetchFn(item, i + batchIndex))
    );
    results.push(...batchResults);
    
    // Small delay between batches to prevent overwhelming the system
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Bulk download endpoint with parallel fetching (JavaScript equivalent of Python's aiohttp/asyncio)
// Fetches images in controlled batches, returns as base64 data for fast client-side downloads
app.post('/api/download/bulk', async (req, res) => {
  try {
    const { images } = req.body; // Array of { url, filename, metadata }
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const BATCH_SIZE = 20; // Fetch 20 images at a time (like Python's asyncio.Semaphore(20))
    const startTime = Date.now();
    console.log(`[Parallel Download] Starting batched fetch of ${images.length} images (${BATCH_SIZE} concurrent)...`);

    // Fetch images in controlled batches
    const results = await fetchInBatches(images, BATCH_SIZE, async (image: any, index: number) => {
      try {
        const fetchStart = Date.now();
        const response = await fetch(image.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const fetchTime = Date.now() - fetchStart;
        console.log(`[Parallel Download] ✓ ${index + 1}/${images.length}: ${image.filename} (${(buffer.byteLength / 1024).toFixed(1)}KB, ${fetchTime}ms)`);
        
        // Convert to base64 for JSON transport
        return {
          filename: image.filename,
          data: Buffer.from(buffer).toString('base64'),
          size: buffer.byteLength,
          metadata: image.metadata,
        };
      } catch (error) {
        console.error(`[Parallel Download] ✗ ${index + 1}/${images.length}: ${image.filename} - ${error}`);
        return null;
      }
    });

    const successfulDownloads = results.filter(r => r !== null);
    
    const totalTime = Date.now() - startTime;
    const totalSize = successfulDownloads.reduce((sum, r) => sum + (r?.size || 0), 0);
    
    console.log(`[Parallel Download] Completed ${successfulDownloads.length}/${images.length} images in ${(totalTime / 1000).toFixed(2)}s (${(totalSize / 1024 / 1024).toFixed(2)}MB total)`);

    res.json({
      success: true,
      total: images.length,
      downloaded: successfulDownloads.length,
      failed: images.length - successfulDownloads.length,
      totalTimeMs: totalTime,
      totalSizeBytes: totalSize,
      images: successfulDownloads,
    });
  } catch (error) {
    console.error('[Parallel Download] Error:', error);
    res.status(500).json({ error: 'Bulk download failed' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on:`);
  console.log(`   - Local:      http://localhost:${PORT}`);
  console.log(`   - Network:    http://0.0.0.0:${PORT}`);
  console.log(`   - Tailscale:  http://100.120.207.84:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});


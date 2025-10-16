import { prisma } from '@/lib/db';

export interface PreferencesData {
  theme?: string;
  fontSize?: number;
  reducedMotion?: boolean;
  enableHaptics?: boolean;
  enableGestures?: boolean;
}

export class PreferencesService {
  /**
   * Get user preferences
   */
  static async getPreferences(userId: string) {
    let prefs = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // Create default preferences if they don't exist
    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: {
          userId,
          theme: 'system',
          fontSize: 16,
          reducedMotion: false,
          enableHaptics: true,
          enableGestures: true,
        }
      });
    }

    return prefs;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(userId: string, data: PreferencesData) {
    return await prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        theme: data.theme || 'system',
        fontSize: data.fontSize || 16,
        reducedMotion: data.reducedMotion || false,
        enableHaptics: data.enableHaptics !== undefined ? data.enableHaptics : true,
        enableGestures: data.enableGestures !== undefined ? data.enableGestures : true,
      }
    });
  }
}


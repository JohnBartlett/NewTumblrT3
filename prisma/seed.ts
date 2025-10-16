import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.searchHistory.deleteMany();
  await prisma.likedPost.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.draft.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tumblr.local',
      username: 'admin',
      passwordHash: adminPassword,
      displayName: 'System Administrator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'System administrator account with full privileges',
      role: UserRole.ADMIN,
      emailVerified: true,
      preferences: {
        create: {
          theme: 'dark',
          fontSize: 16,
          reducedMotion: false,
          enableHaptics: true,
          enableGestures: true,
        }
      }
    }
  });

  // Create test user
  console.log('👤 Creating test user...');
  const testPassword = await bcrypt.hash('Test123!', SALT_ROUNDS);
  const testUser = await prisma.user.create({
    data: {
      email: 'test@tumblr.local',
      username: 'testuser',
      passwordHash: testPassword,
      displayName: 'Test User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
      bio: 'Just a test account for development',
      role: UserRole.USER,
      emailVerified: true,
      preferences: {
        create: {
          theme: 'system',
          fontSize: 16,
          reducedMotion: false,
          enableHaptics: true,
          enableGestures: true,
        }
      }
    }
  });

  // Create moderator user
  console.log('👤 Creating moderator user...');
  const modPassword = await bcrypt.hash('Mod123!', SALT_ROUNDS);
  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@tumblr.local',
      username: 'moderator',
      passwordHash: modPassword,
      displayName: 'Community Moderator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator',
      bio: 'Content moderator account',
      role: UserRole.MODERATOR,
      emailVerified: true,
      preferences: {
        create: {
          theme: 'light',
          fontSize: 16,
          reducedMotion: false,
          enableHaptics: true,
          enableGestures: true,
        }
      }
    }
  });

  // Create photoarchive blog for testing
  console.log('📝 Creating photoarchive blog...');
  const photoarchiveBlog = await prisma.blog.create({
    data: {
      userId: testUser.id,
      name: 'photoarchive',
      title: 'Photo Archive',
      description: 'A collection of amazing photography from around the world',
      url: 'https://photoarchive.tumblr.com',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=photoarchive',
      headerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      theme: 'modern',
      posts: 300,
      followers: 12543,
    }
  });

  // Create some sample posts
  console.log('📝 Creating sample posts...');
  const postTypes = ['text', 'photo', 'quote', 'link'];
  const samplePosts = [];

  for (let i = 0; i < 20; i++) {
    const type = postTypes[i % postTypes.length];
    let content = '';

    switch (type) {
      case 'text':
        content = JSON.stringify({
          title: `Sample Post ${i + 1}`,
          body: `This is a sample text post for testing purposes. Post number ${i + 1}.`
        });
        break;
      case 'photo':
        content = JSON.stringify({
          caption: `Photo post ${i + 1}`,
          images: [`https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600`]
        });
        break;
      case 'quote':
        content = JSON.stringify({
          quote: `This is an inspiring quote number ${i + 1}`,
          source: 'Unknown Author'
        });
        break;
      case 'link':
        content = JSON.stringify({
          title: `Interesting Link ${i + 1}`,
          url: `https://example.com/article-${i + 1}`,
          description: 'Check out this interesting article'
        });
        break;
    }

    samplePosts.push({
      userId: testUser.id,
      type,
      content,
      tags: JSON.stringify(['test', 'sample', type]),
      published: true,
    });
  }

  await prisma.post.createMany({ data: samplePosts });

  // Create some follows
  console.log('👥 Creating follow relationships...');
  await prisma.follow.create({
    data: {
      followerId: testUser.id,
      followingId: moderator.id,
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('─'.repeat(50));
  console.log('🔐 Admin Account:');
  console.log('   Email: admin@tumblr.local');
  console.log('   Username: admin');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('👤 Test User:');
  console.log('   Email: test@tumblr.local');
  console.log('   Username: testuser');
  console.log('   Password: Test123!');
  console.log('');
  console.log('🛡️  Moderator:');
  console.log('   Email: moderator@tumblr.local');
  console.log('   Username: moderator');
  console.log('   Password: Mod123!');
  console.log('─'.repeat(50));
  console.log('\n📊 Created:');
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.blog.count()} blogs`);
  console.log(`   - ${await prisma.post.count()} posts`);
  console.log(`   - ${await prisma.follow.count()} follows`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });


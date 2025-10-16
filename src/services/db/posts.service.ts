import { prisma } from '@/lib/db';

export interface CreatePostData {
  type: string;
  content: string;
  tags: string[];
  published?: boolean;
}

export interface UpdatePostData {
  type?: string;
  content?: string;
  tags?: string[];
  published?: boolean;
}

export class PostsService {
  /**
   * Create a new post
   */
  static async createPost(userId: string, data: CreatePostData) {
    return await prisma.post.create({
      data: {
        userId,
        type: data.type,
        content: data.content,
        tags: JSON.stringify(data.tags),
        published: data.published !== undefined ? data.published : true,
      }
    });
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(userId: string, options?: {
    limit?: number;
    offset?: number;
    publishedOnly?: boolean;
  }) {
    const where = {
      userId,
      ...(options?.publishedOnly !== false ? { published: true } : {})
    };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return posts.map(post => ({
      ...post,
      tags: JSON.parse(post.tags) as string[]
    }));
  }

  /**
   * Get post by ID
   */
  static async getPostById(postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    if (!post) return null;

    return {
      ...post,
      tags: JSON.parse(post.tags) as string[]
    };
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, userId: string, data: UpdatePostData) {
    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== userId) {
      throw new Error('Post not found or unauthorized');
    }

    return await prisma.post.update({
      where: { id: postId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.content && { content: data.content }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
        ...(data.published !== undefined && { published: data.published }),
      }
    });
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string, userId: string) {
    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== userId) {
      throw new Error('Post not found or unauthorized');
    }

    await prisma.post.delete({
      where: { id: postId }
    });
  }

  /**
   * Like a post
   */
  static async likePost(userId: string, postId: string) {
    return await prisma.likedPost.create({
      data: {
        userId,
        postId
      }
    });
  }

  /**
   * Unlike a post
   */
  static async unlikePost(userId: string, postId: string) {
    await prisma.likedPost.deleteMany({
      where: {
        userId,
        postId
      }
    });
  }

  /**
   * Get user's liked posts
   */
  static async getLikedPosts(userId: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    const liked = await prisma.likedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return liked.map(item => ({
      ...item.post,
      tags: JSON.parse(item.post.tags) as string[]
    }));
  }

  /**
   * Save a post
   */
  static async savePost(userId: string, postId: string) {
    return await prisma.savedPost.create({
      data: {
        userId,
        postId
      }
    });
  }

  /**
   * Unsave a post
   */
  static async unsavePost(userId: string, postId: string) {
    await prisma.savedPost.deleteMany({
      where: {
        userId,
        postId
      }
    });
  }

  /**
   * Get user's saved posts
   */
  static async getSavedPosts(userId: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    const saved = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return saved.map(item => ({
      ...item.post,
      tags: JSON.parse(item.post.tags) as string[]
    }));
  }
}


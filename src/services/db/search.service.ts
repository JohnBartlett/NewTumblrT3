// REMOVED: import { prisma } from '@/lib/db';
// This service runs in the browser and cannot use Prisma
// For production, this should call API endpoints instead
import type { SearchFilters } from '@/store';

export interface SearchParams extends SearchFilters {
  query: string;
  offset?: number;
  limit?: number;
}

export interface Blog {
  id: string;
  name: string;
  title: string;
  description: string;
  url: string;
  avatar?: string | null;
  headerImage?: string | null;
  posts: number;
  followers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  type: string;
  content: string;
  tags: string[];
  timestamp: Date;
  user?: {
    username: string;
    displayName?: string | null;
    avatar?: string | null;
  };
}

export interface User {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  blogs?: Blog[];
}

export type SearchResultItem = Post | Blog | User;

export interface SearchResult {
  items: SearchResultItem[];
  total: number;
  offset: number;
  limit: number;
}

// Mock blog data for development/testing
const MOCK_BLOGS: Blog[] = [
  {
    id: 'blog-0',
    name: 'photoarchive',
    title: 'Photo Archive 📸',
    description: 'A massive collection of curated photography from around the world. Perfect for testing image loading and caching with hundreds of beautiful images.',
    url: 'https://photoarchive.tumblr.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=photoarchive',
    headerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    posts: 8547,
    followers: 45238,
    createdAt: new Date('2020-03-10'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: 'blog-1',
    name: 'blog-aesthetic',
    title: 'Aesthetic Vibes',
    description: 'A collection of aesthetic photos, quotes, and inspiration for your daily life.',
    url: 'https://blog-aesthetic.tumblr.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=aesthetic',
    headerImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    posts: 1247,
    followers: 8392,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 'blog-2',
    name: 'blog-tech',
    title: 'Tech Insights',
    description: 'Exploring the latest in technology, programming, and digital innovation.',
    url: 'https://blog-tech.tumblr.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech',
    headerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    posts: 856,
    followers: 12450,
    createdAt: new Date('2022-08-20'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 'blog-3',
    name: 'blog-art',
    title: 'Art & Creativity',
    description: 'Showcasing amazing artwork from talented artists around the world.',
    url: 'https://blog-art.tumblr.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=art',
    headerImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912',
    posts: 2103,
    followers: 15678,
    createdAt: new Date('2021-05-10'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 'blog-4',
    name: 'blog-photography',
    title: 'Through the Lens',
    description: 'Photography blog featuring landscapes, portraits, and street photography.',
    url: 'https://blog-photography.tumblr.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=photo',
    headerImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
    posts: 1567,
    followers: 9821,
    createdAt: new Date('2022-03-12'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 'blog-5',
    name: 'blog-writing',
    title: 'Words & Stories',
    description: 'A blog dedicated to creative writing, poetry, and short stories.',
    url: 'https://blog-writing.tumblr.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=writing',
    headerImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    posts: 943,
    followers: 6234,
    createdAt: new Date('2023-06-25'),
    updatedAt: new Date('2024-10-11'),
  },
];

export class SearchService {
  // Search across blogs, posts, and users
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, type = 'all', offset = 0, limit = 20 } = params;

    if (!query.trim()) {
      return {
        items: [],
        total: 0,
        offset,
        limit,
      };
    }

    let items: SearchResultItem[] = [];

    // For now, we'll use mock blog data and potentially search posts from DB
    const queryLower = query.toLowerCase();

    // Search blogs (using mock data for now)
    if (type === 'all' || type === 'text') {
      const blogResults = MOCK_BLOGS.filter(
        blog =>
          blog.name.toLowerCase().includes(queryLower) ||
          blog.title.toLowerCase().includes(queryLower) ||
          blog.description.toLowerCase().includes(queryLower)
      );
      items = [...items, ...blogResults];
    }

    // Note: Post search is disabled in browser-side service
    // For production, this should call an API endpoint like:
    // const response = await fetch(`/api/search/posts?q=${query}&type=${type}`);
    // For now, we only return blog results from mock data

    // Apply pagination to combined results
    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total,
      offset,
      limit,
    };
  }

  // Get search suggestions based on query
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Add blog name suggestions
    MOCK_BLOGS.forEach(blog => {
      if (blog.name.toLowerCase().includes(queryLower)) {
        suggestions.add(blog.name);
      }
      if (blog.title.toLowerCase().includes(queryLower)) {
        suggestions.add(blog.title);
      }
    });

    // Add popular search terms
    const popularTerms = ['blog', 'art', 'photography', 'aesthetic', 'tech', 'writing'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(queryLower)) {
        suggestions.add(term);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  // Get all blogs (for development)
  async getAllBlogs(): Promise<Blog[]> {
    return MOCK_BLOGS;
  }

  // Get blog by name
  async getBlogByName(name: string): Promise<Blog | null> {
    return MOCK_BLOGS.find(blog => blog.name === name) || null;
  }
}

export const searchDbService = new SearchService();


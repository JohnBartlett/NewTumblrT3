import { api } from './client';

export interface Post {
  id: string;
  type: 'text' | 'photo' | 'video' | 'audio';
  blogId: string;
  content: string;
  timestamp: number;
  tags: string[];
  notes: number;
}

export interface CreatePostData {
  type: Post['type'];
  content: string;
  tags?: string[];
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  offset: number;
  limit: number;
}

export interface PostsQueryParams {
  offset?: number;
  limit?: number;
  type?: Post['type'];
  tag?: string;
  before?: number;
  after?: number;
}

export const postsService = {
  getPosts: async (params: PostsQueryParams = {}) => {
    return api.get<PostsResponse>('/posts', { 
      headers: { 
        'Cache-Control': 'max-age=300' // 5 minutes cache
      }
    });
  },

  getPost: async (id: string) => {
    return api.get<Post>(`/posts/${id}`);
  },

  createPost: async (data: CreatePostData) => {
    return api.post<Post>('/posts', data);
  },

  updatePost: async (id: string, data: Partial<CreatePostData>) => {
    return api.patch<Post>(`/posts/${id}`, data);
  },

  deletePost: async (id: string) => {
    return api.delete<void>(`/posts/${id}`);
  },

  likePost: async (id: string) => {
    return api.post<void>(`/posts/${id}/like`, {});
  },

  unlikePost: async (id: string) => {
    return api.delete<void>(`/posts/${id}/like`);
  },
};




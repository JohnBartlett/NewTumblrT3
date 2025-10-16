import { searchDbService } from '@/services/db';
import type { Post } from './posts';
import type { SearchFilters } from '@/store';

export interface SearchResponse {
  items: (Post | Blog | User)[];
  total: number;
  offset: number;
  limit: number;
}

export interface SearchQueryParams extends SearchFilters {
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
}

export interface User {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  blogs?: Blog[];
}

export const searchService = {
  search: async (params: SearchQueryParams): Promise<SearchResponse> => {
    // Use the database service for search
    const result = await searchDbService.search(params);
    return result as SearchResponse;
  },

  getSearchSuggestions: async (query: string): Promise<string[]> => {
    // Use the database service for suggestions
    return searchDbService.getSearchSuggestions(query);
  },
};




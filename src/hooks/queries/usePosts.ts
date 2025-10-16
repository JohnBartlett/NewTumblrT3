import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

import { postsService, type Post, type PostsQueryParams, type CreatePostData } from '@/services/api';

// Mock data generator
const generateMockPosts = (offset: number, limit: number = 10): Post[] => {
  const textPosts = [
    'Just had the most amazing coffee ☕✨',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Sometimes you just need to stop and appreciate the little things 🌸',
    'New blog post up! Check it out!',
    'Feeling grateful today 💜',
    'This quote changed my life: "Be yourself; everyone else is already taken." - Oscar Wilde',
    'Weekend vibes 🌊',
  ];

  const allTags = [
    'photography', 'nature', 'landscape', 'travel', 'wanderlust',
    'aesthetic', 'vsco', 'art', 'beautiful', 'mood',
    'sunset', 'mountains', 'ocean', 'cityscape', 'architecture',
    'minimalism', 'vintage', 'retro', 'vibes', 'inspo',
    'creative', 'inspiration', 'my photos', 'original photography',
    'artists on tumblr', 'dark academia', 'cottagecore', 'light academia',
    'cozy', 'autumn', 'winter', 'spring', 'summer',
    'street photography', 'portrait', 'black and white', 'film photography',
    'digital art', 'illustration', 'design', 'creative writing',
    'poetry', 'quotes', 'thoughts', 'personal', 'life',
  ];

  return Array.from({ length: limit }, (_, i) => {
    const postIndex = offset + i;
    // 70% photos, 30% text for better visual testing
    const isPhoto = Math.random() > 0.3;
    
    // Select 2-5 random tags
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffled.slice(0, Math.floor(Math.random() * 4) + 2);
    
    return {
      id: `post-${postIndex}`,
      type: isPhoto ? 'photo' : 'text',
      blogId: `blog-${Math.floor(Math.random() * 5) + 1}`,
      content: isPhoto 
        ? `https://picsum.photos/seed/${postIndex}/800/600`
        : `<p>${textPosts[postIndex % textPosts.length]}</p>`,
      timestamp: Date.now() - postIndex * 3600000,
      tags: selectedTags,
      notes: Math.floor(Math.random() * 5000) + 10,
    };
  });
};

export function usePosts(params: PostsQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['posts', params],
    queryFn: ({ pageParam = 0 }) => {
      // Mock API call
      const limit = 10;
      const posts = generateMockPosts(pageParam, limit);
      
      return {
        posts,
        total: 100,
        offset: pageParam,
        limit,
      };
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.posts.length < lastPage.limit) return undefined;
      return pages.length * lastPage.limit;
    },
    initialPageParam: 0,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsService.getPost(id),
  });
}

export function useCreatePost() {
  return useMutation({
    mutationFn: (data: CreatePostData) => postsService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreatePostData>;
    }) => postsService.updatePost(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: (id: string) => postsService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikePost() {
  return useMutation({
    mutationFn: (id: string) => postsService.likePost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}

export function useUnlikePost() {
  return useMutation({
    mutationFn: (id: string) => postsService.unlikePost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}
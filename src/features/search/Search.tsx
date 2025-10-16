import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { VersionBadge } from '@/components/ui/VersionBadge';
import { Container, Grid, GridItem } from '@/components/layouts';
import { useSearch, useSearchSuggestions } from '@/hooks/queries/useSearch';
import { searchFiltersAtom, type SearchFilters } from '@/store/search';
import type { Blog } from '@/services/api/search';
import { preloadBlogImages } from '@/utils/imageCache';

// Type guard to check if a search result is a blog
const isBlog = (item: any): item is Blog => {
  return 'name' in item && 'url' in item && 'followers' in item;
};

// Type guard to check if a search result is a post
const isPost = (item: any): boolean => {
  return 'type' in item && 'content' in item && 'timestamp' in item;
};

const filterOptions = {
  type: [
    { id: 'all', label: 'All' },
    { id: 'text', label: 'Text' },
    { id: 'photo', label: 'Photos' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
  ],
  sortBy: [
    { id: 'recent', label: 'Recent' },
    { id: 'popular', label: 'Popular' },
  ],
  timeRange: [
    { id: 'all', label: 'All time' },
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
    { id: 'year', label: 'This year' },
  ],
};

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('blog');
  const [filters, setFilters] = useAtom(searchFiltersAtom);
  const { data: suggestions } = useSearchSuggestions(query);
  const { data, isLoading, fetchNextPage, hasNextPage } = useSearch(query);
  const [followedBlogs, setFollowedBlogs] = useState<Set<string>>(new Set());

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFollow = (blogName: string) => {
    setFollowedBlogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogName)) {
        newSet.delete(blogName);
      } else {
        newSet.add(blogName);
      }
      return newSet;
    });
  };

  // Preload blog images when search results change
  useEffect(() => {
    if (data?.pages) {
      const blogs = data.pages
        .flatMap(page => page.items)
        .filter(isBlog);
      
      if (blogs.length > 0) {
        preloadBlogImages(blogs);
      }
    }
  }, [data]);

  return (
    <Container>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-8 px-2 sm:px-0">
        {/* Search header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Search</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Search for posts, blogs, and users across Tumblr.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Tumblr..."
            className="h-12 sm:h-14 text-base sm:text-lg"
          />
          <AnimatePresence>
            {suggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <div className="space-y-3 sm:space-y-4">
          {/* Content Type Filter */}
          <div className="space-y-2 overflow-x-auto">
            <SegmentedControl
              options={filterOptions.type}
              value={filters.type}
              onChange={value => updateFilter('type', value)}
            />
          </div>

          {/* Sort and Time Range Filters */}
          <div className="flex flex-col gap-3">
            <div className="w-full overflow-x-auto">
              <SegmentedControl
                options={filterOptions.sortBy}
                value={filters.sortBy}
                onChange={value => updateFilter('sortBy', value)}
              />
            </div>
            <div className="w-full overflow-x-auto">
              <SegmentedControl
                options={filterOptions.timeRange}
                value={filters.timeRange}
                onChange={value => updateFilter('timeRange', value)}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : !data || data.pages.length === 0 || data.pages[0].items.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              No results found. Try a different search term.
            </p>
          </div>
        ) : (
          <Grid>
            {data?.pages.map((page, i) => (
              <AnimatePresence key={i} mode="popLayout">
                {page.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GridItem>
                      <Card>
                        <CardContent className="p-0">
                          {isBlog(item) ? (
                            // Blog result
                            <div className="space-y-3">
                              {/* Blog header */}
                              {item.headerImage && (
                                <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
                                  <img
                                    src={item.headerImage}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              
                              <div className="space-y-3 p-4">
                                {/* Blog avatar and info */}
                                <div className="flex items-start gap-3">
                                  {item.avatar && (
                                    <img
                                      src={item.avatar}
                                      alt={item.name}
                                      className="h-12 w-12 rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      @{item.name}
                                    </p>
                                  </div>
                                </div>

                                {/* Blog description */}
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {item.description}
                                </p>

                                {/* Blog stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <span>{item.posts.toLocaleString()} posts</span>
                                  <span>•</span>
                                  <span>{item.followers.toLocaleString()} followers</span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    variant={followedBlogs.has(item.name) ? "outline" : "primary"}
                                    className={`flex-1 ${followedBlogs.has(item.name) ? 'border-primary-500 text-primary-600 dark:text-primary-400' : ''}`}
                                    onClick={() => toggleFollow(item.name)}
                                  >
                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      {followedBlogs.has(item.name) ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      )}
                                    </svg>
                                    {followedBlogs.has(item.name) ? 'Following' : 'Follow'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => window.open(`/blog/${item.name}`, '_blank')}
                                  >
                                    View Blog
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : isPost(item) ? (
                            // Post result
                            <div className="space-y-2 p-4">
                              <div className="flex items-center gap-2">
                                {'user' in item && item.user && (
                                  <>
                                    {item.user.avatar && (
                                      <img
                                        src={item.user.avatar}
                                        alt={item.user.username}
                                        className="h-8 w-8 rounded-full"
                                      />
                                    )}
                                    <span className="text-sm font-medium">
                                      @{item.user.username}
                                    </span>
                                  </>
                                )}
                                <span className="text-xs text-gray-500">
                                  {('type' in item && item.type) || 'post'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                {('content' in item && item.content) || 'No content'}
                              </p>
                              {'tags' in item && Array.isArray(item.tags) && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.slice(0, 3).map((tag: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-xs text-blue-600 dark:text-blue-400"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            // Fallback for unknown types
                            <div className="space-y-2 p-4">
                              <h3 className="font-semibold">
                                {('title' in item && item.title) || 'Untitled'}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {('description' in item && item.description) ||
                                  ('content' in item && item.content) ||
                                  'No description'}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </GridItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            ))}
          </Grid>
        )}

        {/* Load more */}
        {hasNextPage && (
          <div className="flex justify-center pt-8">
            <Button onClick={() => fetchNextPage()}>Load more</Button>
          </div>
        )}
      </div>
      
      <VersionBadge />
    </Container>
  );
}
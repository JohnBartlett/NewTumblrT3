import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { searchService, type SearchQueryParams } from '@/services/api';
import { searchFiltersAtom, addSearchHistoryAtom } from '@/store';

export function useSearch(query: string) {
  const [filters] = useAtom(searchFiltersAtom);
  const addToHistory = useAtom(addSearchHistoryAtom)[1];

  return useInfiniteQuery({
    queryKey: ['search', query, filters],
    queryFn: ({ pageParam = 0 }) => {
      const params: SearchQueryParams = {
        query,
        ...filters,
        offset: pageParam,
      };
      
      // Add to search history when performing a new search
      if (pageParam === 0 && query.trim()) {
        addToHistory(query);
      }

      return searchService.search(params);
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.items.length < lastPage.limit) return undefined;
      return pages.length * lastPage.limit;
    },
    initialPageParam: 0,
    enabled: Boolean(query.trim()),
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: () => searchService.getSearchSuggestions(query),
    enabled: Boolean(query.trim()),
  });
}




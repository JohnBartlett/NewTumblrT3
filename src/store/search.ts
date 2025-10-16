import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface SearchHistory {
  query: string;
  timestamp: number;
}

export interface SearchFilters {
  type: 'all' | 'text' | 'photo' | 'video' | 'audio';
  sortBy: 'recent' | 'popular';
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
}

const initialFilters: SearchFilters = {
  type: 'all',
  sortBy: 'recent',
  timeRange: 'all',
};

// Persist search history in localStorage
export const searchHistoryAtom = atomWithStorage<SearchHistory[]>('searchHistory', []);

// Current search state
export const searchQueryAtom = atom('');
export const searchFiltersAtom = atom<SearchFilters>(initialFilters);

// Derived atoms
export const recentSearchesAtom = atom(get => {
  const history = get(searchHistoryAtom);
  return history
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, Number(import.meta.env.VITE_MAX_SEARCH_HISTORY) || 100);
});

// Action atoms
export const addSearchHistoryAtom = atom(null, (get, set, query: string) => {
  const history = get(searchHistoryAtom);
  const newEntry: SearchHistory = {
    query,
    timestamp: Date.now(),
  };
  
  // Remove duplicates and add new entry
  const filteredHistory = history.filter(item => item.query !== query);
  set(searchHistoryAtom, [newEntry, ...filteredHistory]);
});

export const clearSearchHistoryAtom = atom(null, (get, set) => {
  set(searchHistoryAtom, []);
});

export const updateSearchFiltersAtom = atom(
  null,
  (get, set, filters: Partial<SearchFilters>) => {
    const currentFilters = get(searchFiltersAtom);
    set(searchFiltersAtom, { ...currentFilters, ...filters });
  }
);




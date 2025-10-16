/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_TUMBLR_API_KEY: string;
  readonly VITE_TUMBLR_API_SECRET: string;
  readonly VITE_API_VERSION: string;
  readonly VITE_API_RATE_LIMIT: number;
  readonly VITE_API_TIMEOUT: number;
  readonly VITE_TUMBLR_CALLBACK_URL: string;

  // Authentication
  readonly VITE_AUTH_METHOD: 'direct' | 'oauth';
  readonly VITE_DEFAULT_USERNAME: string;
  readonly VITE_DEFAULT_PASSWORD: string;
  readonly VITE_AUTH_SESSION_DURATION: number;
  readonly VITE_AUTH_REFRESH_THRESHOLD: number;
  readonly VITE_AUTH_MAX_ATTEMPTS: number;

  // Storage & Caching
  readonly VITE_STORAGE_VERSION: string;
  readonly VITE_MAX_SEARCH_HISTORY: number;
  readonly VITE_MAX_CACHED_POSTS: number;
  readonly VITE_CACHE_DURATION_DAYS: number;
  readonly VITE_CACHE_STRATEGY: string;
  readonly VITE_PREFETCH_ENABLED: boolean;
  readonly VITE_CACHE_WARMUP: boolean;

  // Feature Flags
  readonly VITE_ENABLE_OFFLINE_MODE: boolean;
  readonly VITE_ENABLE_PUSH_NOTIFICATIONS: boolean;
  readonly VITE_ENABLE_BACKGROUND_SYNC: boolean;
  readonly VITE_ENABLE_ANALYTICS: boolean;
  readonly VITE_ENABLE_ERROR_REPORTING: boolean;

  // UI/UX
  readonly VITE_THEME_MODE: 'light' | 'dark' | 'system';
  readonly VITE_ANIMATION_REDUCED: boolean;
  readonly VITE_DEFAULT_FONT_SIZE: number;
  readonly VITE_ENABLE_HAPTICS: boolean;
  readonly VITE_ENABLE_GESTURES: boolean;

  // Performance
  readonly VITE_PERFORMANCE_MONITORING: boolean;
  readonly VITE_METRICS_ENDPOINT: string;
  readonly VITE_BUNDLE_ANALYZER: boolean;
  readonly VITE_COMPRESSION_LEVEL: 'low' | 'medium' | 'high';

  // Development
  readonly VITE_DEV_MOCK_AUTH: boolean;
  readonly VITE_DEV_MOCK_API: boolean;
  readonly VITE_DEV_LOGGER: boolean;
  readonly VITE_STORYBOOK_ENABLED: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}



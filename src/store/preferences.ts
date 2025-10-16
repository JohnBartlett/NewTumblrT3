import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FilenamePattern = 'blog-tags-date' | 'date-blog-tags' | 'blog-description' | 'tags-only' | 'timestamp' | 'simple';
export type GridImageSize = 'compact' | 'comfortable' | 'spacious';
export type DownloadMethod = 'client-side' | 'server-side';

export interface Preferences {
  theme: ThemeMode;
  fontSize: number;
  reducedMotion: boolean;
  enableHaptics: boolean;
  enableGestures: boolean;
  filenamePattern: FilenamePattern;
  includeIndexInFilename: boolean;
  includeSidecarMetadata: boolean; // Include .txt metadata file with downloads
  downloadMethod: DownloadMethod; // Client-side (browser) or Server-side (parallel fetch + zip)
  gridColumns: number; // Number of columns in image grid (2-6)
  gridImageSize: GridImageSize; // Size/spacing of grid images
}

const initialPreferences: Preferences = {
  theme: 'system',
  fontSize: 16,
  reducedMotion: false,
  enableHaptics: true,
  enableGestures: true,
  filenamePattern: 'blog-tags-date',
  includeIndexInFilename: true,
  includeSidecarMetadata: false, // Default to not including metadata files
  downloadMethod: 'client-side', // Default to client-side downloads
  gridColumns: 4, // Default to 4 columns
  gridImageSize: 'comfortable', // Default to comfortable spacing
};

// Persist preferences in localStorage
export const preferencesAtom = atomWithStorage<Preferences>(
  'preferences',
  initialPreferences
);

// Derived atoms
export const themeModeAtom = atom(get => get(preferencesAtom).theme);
export const fontSizeAtom = atom(get => get(preferencesAtom).fontSize);
export const reducedMotionAtom = atom(get => get(preferencesAtom).reducedMotion);
export const enableHapticsAtom = atom(get => get(preferencesAtom).enableHaptics);
export const enableGesturesAtom = atom(get => get(preferencesAtom).enableGestures);
export const filenamePatternAtom = atom(get => get(preferencesAtom).filenamePattern);
export const includeIndexInFilenameAtom = atom(get => get(preferencesAtom).includeIndexInFilename);
export const includeSidecarMetadataAtom = atom(get => get(preferencesAtom).includeSidecarMetadata);
export const downloadMethodAtom = atom(get => get(preferencesAtom).downloadMethod);
export const gridColumnsAtom = atom(get => get(preferencesAtom).gridColumns);
export const gridImageSizeAtom = atom(get => get(preferencesAtom).gridImageSize);

// Action atoms
export const updatePreferencesAtom = atom(
  null,
  (get, set, preferences: Partial<Preferences>) => {
    const currentPreferences = get(preferencesAtom);
    set(preferencesAtom, { ...currentPreferences, ...preferences });
  }
);
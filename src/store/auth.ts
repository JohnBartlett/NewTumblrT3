import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  blogs: Blog[];
}

export interface Blog {
  id: string;
  name: string;
  url: string;
  title: string;
  description?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// Persist auth state in localStorage
export const authAtom = atomWithStorage<AuthState>('auth', initialAuthState);

// Derived atoms
export const isAuthenticatedAtom = atom(get => get(authAtom).isAuthenticated);
export const userAtom = atom(get => get(authAtom).user);
export const tokenAtom = atom(get => get(authAtom).token);

// Action atoms
export const loginAtom = atom(
  null,
  (get, set, { token, user }: { token: string; user: User }) => {
    set(authAtom, {
      isAuthenticated: true,
      token,
      user,
    });
  }
);

export const logoutAtom = atom(null, (get, set) => {
  set(authAtom, initialAuthState);
});



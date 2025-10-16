import { useMutation, useQuery } from '@tanstack/react-query';
import { useSetAtom, useAtom } from 'jotai';

import { authApi, type LoginData, type RegisterData } from '@/services/api/auth.api';
import { loginAtom, logoutAtom, userAtom } from '@/store/auth';

export function useAuth() {
  const setLogin = useSetAtom(loginAtom);
  const setLogout = useSetAtom(logoutAtom);
  const [user] = useAtom(userAtom);

  const loginMutation = useMutation({
    mutationFn: async ({ emailOrUsername, password }: LoginData) => {
      try {
        const userSession = await authApi.login({ emailOrUsername, password });
        
        // Store in localStorage for persistence
        localStorage.setItem('userId', userSession.id);
        
        const fullUser = {
          ...userSession,
          blogs: [], // You can add blogs later if needed
        };

        setLogin({ token: userSession.id, user: fullUser });
        
        return { token: userSession.id, user: fullUser };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Login failed');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const userSession = await authApi.register(data);
        
        // Store in localStorage for persistence
        localStorage.setItem('userId', userSession.id);
        
        const fullUser = {
          ...userSession,
          blogs: [],
        };

        setLogin({ token: userSession.id, user: fullUser });
        
        return { token: userSession.id, user: fullUser };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Registration failed');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('userId');
      setLogout();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      await authApi.changePassword(user.id, currentPassword, newPassword);
    },
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: async (emailOrUsername: string) => {
      return await authApi.requestPasswordReset(emailOrUsername);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      return await authApi.resetPassword(token, newPassword);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const result = await authApi.verifyEmail(token);
      // Update user state if currently logged in
      if (user?.id) {
        const updatedUser = await authApi.getUserById(user.id);
        if (updatedUser) {
          setLogin({ token: user.id, user: { ...updatedUser, blogs: user.blogs || [] } });
        }
      }
      return result;
    },
  });

  const resendVerificationEmailMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      return await authApi.resendVerificationEmail(user.id);
    },
  });

  const findAccountMutation = useMutation({
    mutationFn: async (email: string) => {
      return await authApi.findAccountByEmail(email);
    },
  });

  // Check for existing session on mount
  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      const userSession = await authApi.getUserById(userId);
      if (!userSession) {
        localStorage.removeItem('userId');
        return null;
      }

      const fullUser = {
        ...userSession,
        blogs: [],
      };

      setLogin({ token: userId, user: fullUser });
      return fullUser;
    },
    staleTime: Infinity, // User data doesn't go stale
  });

  return {
    // Auth actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    changePassword: changePasswordMutation.mutateAsync,
    requestPasswordReset: requestPasswordResetMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    resendVerificationEmail: resendVerificationEmailMutation.mutateAsync,
    findAccount: findAccountMutation.mutateAsync,
    
    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isRequestingReset: requestPasswordResetMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationEmailMutation.isPending,
    isFindingAccount: findAccountMutation.isPending,
    
    // User state
    currentUser: user,
    isLoadingUser: currentUserQuery.isLoading,
    
    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    changePasswordError: changePasswordMutation.error,
    passwordResetError: requestPasswordResetMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    verifyEmailError: verifyEmailMutation.error,
  };
}
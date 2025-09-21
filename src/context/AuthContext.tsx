import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  getUserProfile,
  supabase,
} from '../lib/supabase';
import {
  AuthState,
  User,
} from '../types';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Local storage keys
const AUTH_STORAGE_KEY = "kwphcda_auth_user";
const AUTH_SESSION_KEY = "kwphcda_auth_session";

// Helper functions for localStorage
const saveUserToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving user to localStorage:", error);
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
    return null;
  }
};

const saveSessionToStorage = (session: any) => {
  try {
    if (session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch (error) {
    console.error("Error saving session to localStorage:", error);
  }
};

const getSessionFromStorage = () => {
  try {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error getting session from localStorage:", error);
    return null;
  }
};

const clearAuthStorage = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (error) {
    console.error("Error clearing auth storage:", error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refreshUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: userProfile, error } = await getUserProfile(authUser.id);

        if (error) {
          console.error("Error fetching user profile:", error);
          setState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: null,
          }));
          saveUserToStorage(null);
          return;
        }

        setState((prev) => ({
          ...prev,
          user: userProfile,
          loading: false,
          error: null,
        }));
        saveUserToStorage(userProfile);
      } else {
        setState((prev) => ({
          ...prev,
          user: null,
          loading: false,
          error: null,
        }));
        saveUserToStorage(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: "Failed to refresh user",
      }));
      saveUserToStorage(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to get user from localStorage for immediate UI update
        const storedUser = getUserFromStorage();
        const storedSession = getSessionFromStorage();

        if (storedUser && mounted) {
          setState({ user: storedUser, loading: true, error: null });
        }

        // Then verify with Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          clearAuthStorage();
          if (mounted) {
            setState({ user: null, loading: false, error: null });
          }
          return;
        }

        if (session?.user && mounted) {
          // Save session to storage
          saveSessionToStorage(session);

          // Fetch fresh user profile
          const { data: userProfile, error: profileError } =
            await getUserProfile(session.user.id);

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            clearAuthStorage();
            if (mounted) {
              setState({ user: null, loading: false, error: null });
            }
            return;
          }

          if (mounted) {
            setState({ user: userProfile, loading: false, error: null });
            saveUserToStorage(userProfile);
          }
        } else {
          // No session, clear storage
          clearAuthStorage();
          if (mounted) {
            setState({ user: null, loading: false, error: null });
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        clearAuthStorage();
        if (mounted) {
          setState({
            user: null,
            loading: false,
            error: "Failed to initialize auth",
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          saveSessionToStorage(session);

          const { data: userProfile, error } = await getUserProfile(
            session.user.id
          );

          if (error) {
            console.error("Error fetching user profile on sign in:", error);
            clearAuthStorage();
            setState((prev) => ({
              ...prev,
              user: null,
              loading: false,
              error: null,
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            user: userProfile,
            loading: false,
            error: null,
          }));
          saveUserToStorage(userProfile);
        } catch (error) {
          console.error("Error handling sign in:", error);
          clearAuthStorage();
          setState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: null,
          }));
        }
      } else if (event === "SIGNED_OUT") {
        clearAuthStorage();
        setState((prev) => ({
          ...prev,
          user: null,
          loading: false,
          error: null,
        }));
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        try {
          saveSessionToStorage(session);

          // Optionally refresh user profile on token refresh
          const storedUser = getUserFromStorage();
          if (storedUser) {
            const { data: userProfile, error } = await getUserProfile(
              session.user.id
            );

            if (!error && userProfile) {
              setState((prev) => ({
                ...prev,
                user: userProfile,
                loading: false,
                error: null,
              }));
              saveUserToStorage(userProfile);
            }
          }
        } catch (error) {
          console.error("Error handling token refresh:", error);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || "",
            username: userData.username || "",
            gender: userData.gender || "male",
            lga: userData.lga || "",
            ward: userData.ward || "",
            phc_id: userData.phc_id || "",
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        saveSessionToStorage(data.session);

        // Wait for the trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          const { data: userProfile, error: profileError } =
            await getUserProfile(data.user.id);

          if (!profileError && userProfile) {
            setState((prev) => ({
              ...prev,
              user: userProfile,
              loading: false,
              error: null,
            }));
            saveUserToStorage(userProfile);
          } else {
            setState((prev) => ({
              ...prev,
              user: null,
              loading: false,
              error: null,
            }));
            saveUserToStorage(null);
          }
        } catch (refreshError) {
          console.log(
            "Profile creation in progress, will be available after approval"
          );
          setState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: null,
          }));
          saveUserToStorage(null);
        }

        toast.success(
          "Account created successfully! Please wait for admin approval to access the system."
        );
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
      clearAuthStorage();
      toast.error(
        error.message || "Failed to create account. Please try again."
      );
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        saveSessionToStorage(data.session);

        const { data: userProfile, error: profileError } = await getUserProfile(
          data.user.id
        );

        if (profileError) {
          console.error(
            "Error fetching user profile on sign in:",
            profileError
          );
          clearAuthStorage();
          setState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: null,
          }));
          toast.error("Account not found or not approved yet.");
          return;
        }

        setState((prev) => ({
          ...prev,
          user: userProfile,
          loading: false,
          error: null,
        }));
        saveUserToStorage(userProfile);
        toast.success(`Welcome back, ${userProfile.full_name}!`);
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
      clearAuthStorage();
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearAuthStorage();
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: null,
      }));
      toast.success("Signed out successfully!");
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
      toast.error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

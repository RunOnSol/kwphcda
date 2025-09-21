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
import { AuthState } from '../types';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refreshUser = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: userProfile, error } = await getUserProfile(authUser.id);

        if (error) {
          console.error("Error fetching user profile:", error);
          setState((prev) => ({ ...prev, user: null, loading: false }));
          return;
        }

        setState((prev) => ({ ...prev, user: userProfile, loading: false }));
      } else {
        setState((prev) => ({ ...prev, user: null, loading: false }));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: "Failed to refresh user",
      }));
    } finally {
      // Loading state is handled in setState elsewhere
    }
  };

  useEffect(() => {
    // Get initial session
    refreshUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await refreshUser();
      } else if (event === "SIGNED_OUT") {
        setState((prev) => ({ ...prev, user: null, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Sign up with user metadata for the trigger - ensure all fields are strings
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

      if (data.user) {
        // Wait a moment for the trigger to complete and try to refresh
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Try to refresh user profile, but don't fail if it's not ready yet
        try {
          await refreshUser();
        } catch (refreshError) {
          console.log(
            "Profile creation in progress, will be available after approval"
          );
        }

        toast.success(
          "Account created successfully! Please wait for admin approval to access the system."
        );
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
      toast.error(
        error.message || "Failed to create account. Please try again."
      );
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
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

      if (data.user) {
        await refreshUser();
        toast.success(`Welcome back!`);
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState((prev) => ({ ...prev, user: null, loading: false }));
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

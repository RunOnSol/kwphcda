import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import { getUserProfile, supabase } from "../lib/supabase";
import { AuthState } from "../types";
import { logActivity } from "../lib/activityLogger";

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
          return;
        }

        setState((prev) => ({
          ...prev,
          user: userProfile,
          loading: false,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          user: null,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: null,
      }));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session on app load/reload
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setState({ user: null, loading: false, error: null });
          }
          return;
        }

        if (session?.user && mounted) {
          // User has active session, fetch profile
          try {
            const { data: userProfile, error: profileError } =
              await getUserProfile(session.user.id);

            if (profileError) {
              console.error("Error fetching user profile:", profileError);
              if (mounted) {
                setState({ user: null, loading: false, error: null });
              }
              return;
            }

            if (mounted) {
              setState({ user: userProfile, loading: false, error: null });
            }
          } catch (profileError) {
            console.error("Profile fetch error:", profileError);
            if (mounted) {
              setState({ user: null, loading: false, error: null });
            }
          }
        } else {
          // No active session
          if (mounted) {
            setState({ user: null, loading: false, error: null });
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, session?.user?.id);

      (async () => {
        try {
          if (event === "SIGNED_IN" && session?.user) {
            // User signed in, fetch profile
            const { data: userProfile, error } = await getUserProfile(
              session.user.id
            );

            if (error) {
              console.error("Error fetching user profile on sign in:", error);
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
          } else if (event === "SIGNED_OUT") {
            // User signed out
            setState((prev) => ({
              ...prev,
              user: null,
              loading: false,
              error: null,
            }));
          } else if (event === "TOKEN_REFRESHED" && session?.user) {
            // Token refreshed, optionally refresh user profile
            console.log("Token refreshed for user:", session.user.id);
            // Keep existing user data, no need to refetch unless needed
          } else if (event === "USER_UPDATED" && session?.user) {
            // User data updated, refresh profile
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
            }
          }
        } catch (error) {
          console.error("Error handling auth state change:", error);
          setState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: null,
          }));
        }
      })();
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
          } else {
            setState((prev) => ({
              ...prev,
              user: null,
              loading: false,
              error: null,
            }));
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
        }

        toast.success(
          "Account created successfully! Please wait for admin approval to access the system."
        );

        logActivity('signup', `New user registered: ${email}`, {
          email,
          full_name: userData.full_name,
          lga: userData.lga,
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
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
        const { data: userProfile, error: profileError } = await getUserProfile(
          data.user.id
        );

        if (profileError) {
          console.error(
            "Error fetching user profile on sign in:",
            profileError
          );
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
        toast.success(`Welcome back, ${userProfile.full_name}!`);

        logActivity('login', `User logged in: ${userProfile.email}`, {
          email: userProfile.email,
          role: userProfile.role,
        });
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      if (state.user) {
        logActivity('logout', `User logged out: ${state.user.email}`, {
          email: state.user.email,
          role: state.user.role,
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

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

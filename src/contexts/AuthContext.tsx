
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  session: Session | null;
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to ensure profile exists for user
  const ensureProfileExists = async (userData: any) => {
    if (!userData) return;

    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking profile:", fetchError);
        toast({
          title: "Error in AuthContext.tsx",
          description: `${fetchError.message} (${fetchError.code})`,
          variant: "destructive",
        });
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userData.id,
            email: userData.email,
            first_name: userData.user_metadata?.first_name || null,
            last_name: userData.user_metadata?.last_name || null,
          }]);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast({
            title: "Error creating user profile",
            description: `${insertError.message} (${insertError.code})`,
            variant: "destructive",
          });
        } else {
          console.log("Profile created successfully");
        }
      } else {
        console.log("Profile already exists");
      }
    } catch (error: any) {
      console.error("Error in ensureProfileExists:", error);
      toast({
        title: "Error in AuthContext.tsx",
        description: error.message || "Failed to ensure profile exists",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          setUser(data.session.user);
          await ensureProfileExists(data.session.user);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        console.error("Error getting initial session:", error);
        toast({
          title: "Error in AuthContext.tsx",
          description: error.message || "Failed to get initial session",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          await ensureProfileExists(session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error in AuthContext.tsx",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

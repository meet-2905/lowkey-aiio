
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/task";

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name');
        
        if (error) {
          console.error("Error fetching profiles:", error);
          setError(error.message);
          toast({
            title: "Error fetching profiles",
            description: `${error.message} (${error.code})`,
            variant: "destructive",
          });
          return;
        }
        
        setProfiles(data as User[]);
      } catch (err: any) {
        console.error("Exception in useProfiles:", err);
        setError(err.message || "An unknown error occurred");
        toast({
          title: "Error in useProfiles.tsx",
          description: err.message || "Failed to fetch profiles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return { profiles, loading, error };
};

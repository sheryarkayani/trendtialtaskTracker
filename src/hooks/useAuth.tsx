
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle user signup - create or update profile
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // Check if a profile already exists for this user
              const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error checking for existing profile:', fetchError);
                return;
              }

              if (!existingProfile) {
                // Check if there's a profile with matching email that needs to be linked
                const { data: emailProfile, error: emailError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', session.user.email!)
                  .maybeSingle();

                if (emailError && emailError.code !== 'PGRST116') {
                  console.error('Error checking for email profile:', emailError);
                  return;
                }

                if (emailProfile) {
                  // Update the existing profile with the auth user ID
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ id: session.user.id })
                    .eq('email', session.user.email!);
                  
                  if (updateError) {
                    console.error('Error linking existing profile:', updateError);
                  } else {
                    console.log('Successfully linked existing profile to auth user');
                  }
                } else {
                  // Create a new profile
                  const { error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      email: session.user.email!,
                      first_name: session.user.user_metadata?.first_name || '',
                      last_name: session.user.user_metadata?.last_name || '',
                      role: session.user.user_metadata?.role || 'team_member',
                      organization_id: session.user.user_metadata?.organization_id || '00000000-0000-0000-0000-000000000001',
                      bio: session.user.user_metadata?.bio || null,
                      skills: session.user.user_metadata?.skills || null
                    });

                  if (createError) {
                    console.error('Error creating profile:', createError);
                  } else {
                    console.log('Successfully created new profile');
                  }
                }
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
            }
          }, 100);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'team_member',
          organization_id: '00000000-0000-0000-0000-000000000001'
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

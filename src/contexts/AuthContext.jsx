import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // Listen for auth changes
        // 注意: onAuthStateChange のコールバック内で await すると Supabase JS が
        // signInWithPassword 等の Promise をブロックしてデッドロックする（既知の挙動）。
        // そのため await せず、fetchProfile は fire-and-forget で呼ぶ。
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(userId) {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            setProfile(data);
        } catch {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }

    async function signInWithEmail(email) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
    }

    async function signInWithPassword(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    }

    async function signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        return data;
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setProfile(null);
    }

    const isCreator = profile?.role === 'creator';

    const value = {
        user,
        profile,
        loading,
        isCreator,
        signInWithEmail,
        signInWithPassword,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Phase 23: AuthProvider と同じファイルで Hook を export しているため
// react-refresh/only-export-components が警告を出すが、これは Vite の Fast Refresh
// （HMR）に関する dev-only の最適化ヒントで本番動作には影響しない。
// 将来的に Hook を別ファイル（src/contexts/useAuth.js 等）に分離するのが理想。
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

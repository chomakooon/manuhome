import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createSupabaseNotConfiguredError() {
    const error = new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    return error;
}

function createNoopQueryBuilder() {
    const state = {
        expectsSingle: false,
        mode: 'read',
    };

    const builder = {
        select() {
            return builder;
        },
        insert() {
            state.mode = 'write';
            return builder;
        },
        update() {
            state.mode = 'write';
            return builder;
        },
        upsert() {
            state.mode = 'write';
            return builder;
        },
        eq() {
            return builder;
        },
        in() {
            return builder;
        },
        order() {
            return builder;
        },
        single() {
            state.expectsSingle = true;
            return builder;
        },
        then(resolve, reject) {
            return Promise.resolve(getResult()).then(resolve, reject);
        },
        catch(reject) {
            return Promise.resolve(getResult()).catch(reject);
        },
        finally(callback) {
            return Promise.resolve(getResult()).finally(callback);
        },
    };

    function getResult() {
        if (state.mode === 'write' || state.expectsSingle) {
            return {
                data: state.expectsSingle ? null : [],
                error: createSupabaseNotConfiguredError(),
                count: 0,
            };
        }

        return {
            data: [],
            error: null,
            count: 0,
        };
    }

    return builder;
}

function createNoopSupabaseClient() {
    return {
        auth: {
            async getSession() {
                return { data: { session: null }, error: null };
            },
            onAuthStateChange() {
                return {
                    data: {
                        subscription: {
                            unsubscribe() {},
                        },
                    },
                };
            },
            async signInWithOtp() {
                return { data: null, error: createSupabaseNotConfiguredError() };
            },
            async signInWithPassword() {
                return { data: null, error: createSupabaseNotConfiguredError() };
            },
            async signUp() {
                return { data: null, error: createSupabaseNotConfiguredError() };
            },
            async signOut() {
                return { error: null };
            },
        },
        from() {
            return createNoopQueryBuilder();
        },
        storage: {
            from() {
                return {
                    async upload() {
                        return { error: createSupabaseNotConfiguredError() };
                    },
                    getPublicUrl() {
                        return { data: { publicUrl: '' } };
                    },
                };
            },
        },
    };
}

const hasSupabaseUrl = Boolean(
    supabaseUrl &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    !supabaseUrl.includes('your-project.supabase.co')
);
const hasSupabaseAnonKey = Boolean(
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key'
);

export const isSupabaseConfigured = hasSupabaseUrl && hasSupabaseAnonKey;

if (!isSupabaseConfigured) {
    console.warn('Supabase env vars are missing. Running in no-backend mode.');
}

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createNoopSupabaseClient();

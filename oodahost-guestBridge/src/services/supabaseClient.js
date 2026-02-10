import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	// Warning for developers running the app without configuring env vars
	// This helps surface missing config during development.
	// In production, ensure these values are provided securely.
	// eslint-disable-next-line no-console
	console.warn('Supabase: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Helper functions (small, opinionated examples) ---

export const signInWithEmail = async (email) => {
	// Sends a magic link / OTP to the provided email
	return supabase.auth.signInWithOtp({ email });
};

export const signOut = async () => {
	return supabase.auth.signOut();
};

export const getUser = async () => {
	const result = await supabase.auth.getUser();
	return result;
};

export const getTableRows = async (table, select = '*') => {
	const { data, error } = await supabase.from(table).select(select);
	if (error) throw error;
	return data;
};

export default supabase;

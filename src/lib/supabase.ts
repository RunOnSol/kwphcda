import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      phc:phcs(*)
    `)
    .eq('id', userId)
    .maybeSingle();
  
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      phc:phcs(*)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getAllPHCs = async () => {
  const { data, error } = await supabase
    .from('phcs')
    .select('*')
    .order('name', { ascending: true });
  
  return { data, error };
};

export const createPHC = async (phcData: any) => {
  const { data, error } = await supabase
    .from('phcs')
    .insert(phcData)
    .select()
    .single();
  
  return { data, error };
};

export const updatePHC = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('phcs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

export const deletePHC = async (id: string) => {
  const { error } = await supabase
    .from('phcs')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const getAllBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, username)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getBlogPost = async (id: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, username)
    `)
    .eq('id', id)
    .single();
  
  return { data, error };
};

export const createBlogPost = async (postData: any) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(postData)
    .select()
    .single();
  
  return { data, error };
};

export const updateBlogPost = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);
  
  return { error };
};
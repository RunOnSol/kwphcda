import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  userData: any
) => {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      phc:phcs(*)
    `
    )
    .eq("id", userId)
    .maybeSingle();

  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      phc:phcs(*)
    `
    )
    .order("created_at", { ascending: false });

  return { data, error };
};

export const getAllPHCs = async () => {
  const { data, error } = await supabase
    .from("phcs")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
};

export const createPHC = async (phcData: any) => {
  const { data, error } = await supabase
    .from("phcs")
    .insert(phcData)
    .select()
    .single();

  return { data, error };
};

export const updatePHC = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("phcs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

export const deletePHC = async (id: string) => {
  const { error } = await supabase.from("phcs").delete().eq("id", id);

  return { error };
};

export const getAllBlogPosts = async () => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:users(full_name, username)
    `
    )
    .order("created_at", { ascending: false });

  return { data, error };
};

export const getBlogPost = async (id: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:users(full_name, username)
    `
    )
    .eq("id", id)
    .single();

  return { data, error };
};

export const createBlogPost = async (postData: any) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(postData)
    .select()
    .single();

  return { data, error };
};

export const updateBlogPost = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  return { error };
};

// Staff management functions
export const getAllStaff = async () => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("sn", { ascending: true });

  return { data, error };
};

export const getStaff = async (id: string) => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data, error };
};

export const createStaff = async (staffData: any) => {
  const { data, error } = await supabase
    .from("staff")
    .insert(staffData)
    .select()
    .maybeSingle();

  return { data, error };
};

export const updateStaff = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("staff")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  return { data, error };
};

export const deleteStaff = async (id: string) => {
  const { error } = await supabase.from("staff").delete().eq("id", id);

  return { error };
};

export const uploadBlogImage = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { data: null, error };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("blog-images").getPublicUrl(filePath);

  return { data: { path: filePath, url: publicUrl }, error: null };
};

export const deleteBlogImage = async (imagePath: string) => {
  const { error } = await supabase.storage
    .from("blog-images")
    .remove([imagePath]);

  return { error };
};

export const uploadPHCImage = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from("phc-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { data: null, error };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("phc-images").getPublicUrl(filePath);

  return { data: { path: filePath, url: publicUrl }, error: null };
};

export const deletePHCImage = async (imagePath: string) => {
  const { error } = await supabase.storage
    .from("phc-images")
    .remove([imagePath]);

  return { error };
};

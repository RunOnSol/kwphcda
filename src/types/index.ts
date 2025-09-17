export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  gender: 'male' | 'female';
  lga: string;
  ward: string;
  phc_id?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'blogger' | 'phc_administrator' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  phc?: PHC;
}

export interface PHC {
  id: string;
  name: string;
  lga: string;
  ward: string;
  address: string;
  phone?: string;
  email?: string;
  services: string[];
  staff_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SignupData {
  full_name: string;
  username: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  lga: string;
  ward: string;
  phc_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const KWARA_LGAS = [
  'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 
  'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Patigi'
] as const;

export const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'blogger', label: 'Blogger' },
  { value: 'phc_administrator', label: 'PHC Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const;

export const BLOG_CATEGORIES = [
  'Immunization',
  'Maternal Health',
  'Child Health',
  'Disease Control',
  'Health Education',
  'Partnerships',
  'Community Health',
  'Nutrition',
  'Family Planning',
  'General Health',
] as const;
export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  gender: "male" | "female";
  lga: string;
  ward: string;
  phc_id?: string;
  role:
    | "super_admin"
    | "admin"
    | "manager"
    | "blogger"
    | "phc_administrator"
    | "user";
  status: "pending" | "approved" | "rejected";
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
  status: "active" | "inactive";
  image_url?: string;
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
  youtube_url?: string | null;
  author_id: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface GalleryImage {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  image_path: string;
  author_id: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  author?: Pick<User, "full_name" | "username">;
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
  gender: "male" | "female";
  lga: string;
  ward: string;
  phc_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const KWARA_LGAS = [
  "Asa",
  "Baruten",
  "Edu",
  "Ekiti",
  "Ifelodun",
  "Ilorin East",
  "Ilorin South",
  "Ilorin West",
  "Irepodun",
  "Isin",
  "Kaiama",
  "Moro",
  "Offa",
  "Oke Ero",
  "Oyun",
  "Patigi",
] as const;

export const USER_ROLES = [
  { value: "user", label: "User" },
  { value: "blogger", label: "Blogger" },
  { value: "phc_administrator", label: "PHC Administrator" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
] as const;

export const BLOG_CATEGORIES = [
  "Immunization",
  "Maternal Health",
  "Child Health",
  "Disease Control",
  "Health Education",
  "Partnerships",
  "Community Health",
  "Nutrition",
  "Family Planning",
  "General Health",
] as const;

export interface Staff {
  id: string;
  sn: string;
  name: string;
  psn?: string;
  gl?: string;
  sex: "Male" | "Female";
  date_of_birth?: string;
  lga: string;
  date_of_first_appt?: string;
  date_of_confirmation?: string;
  date_of_present_appt?: string;
  qualification?: string;
  rank?: string;
  cadre?: string;
  parent_mda?: string;
  present_posting?: string;
  mobile_number?: string;
  tier?: string;
  created_at: string;
  updated_at: string;
}

export const STAFF_TIERS = ["Tier 1", "Tier 2", "Tier 3"] as const;

export const STAFF_CADRES = [
  "Medical",
  "Nursing",
  "Public Health",
  "Laboratory",
  "Pharmacy",
  "Health Education",
  "Community Health",
  "Nutrition",
  "Administration",
  "Finance",
  "ICT",
  "Engineering",
] as const;

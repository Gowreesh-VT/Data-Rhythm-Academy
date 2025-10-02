export type Page =
  | "landing"
  | "login"
  | "register"
  | "booking"
  | "payment"
  | "privacy"
  | "courses"
  | "course-detail"
  | "dashboard"
  | "admin";

// New path-based navigation type
export type NavigatePath = 
  | "/"
  | "/login" 
  | "/register"
  | "/setup"
  | "/booking"
  | "/payment"
  | "/privacy"
  | "/courses"
  | "/course-detail"
  | "/dashboard"
  | "/admin";

// User roles
export type UserRole = 'student' | 'admin' | 'super_admin';

// Extended user interface with role
export interface AppUser {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}
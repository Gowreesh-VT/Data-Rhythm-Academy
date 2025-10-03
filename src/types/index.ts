export type Page =
  | "landing"
  | "login"
  | "register"
  | "booking"
  | "payment"
  | "privacy";

// New path-based navigation type
export type NavigatePath = 
  | "/"
  | "/login" 
  | "/register"
  | "/booking"
  | "/payment"
  | "/privacy";
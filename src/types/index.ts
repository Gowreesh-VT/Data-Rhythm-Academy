export type Page =
  | "landing"
  | "login"
  | "register"
  | "booking"
  | "payment";

// New path-based navigation type
export type NavigatePath = 
  | "/"
  | "/login" 
  | "/register"
  | "/booking"
  | "/payment";
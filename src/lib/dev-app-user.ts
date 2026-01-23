export type AppUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER" | "MODERATOR";
};

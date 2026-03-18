import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN" | "STAFF";
  }
}

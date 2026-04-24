import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserOAuthSigninSchema, UserSigninSchema } from "@repo/types";
import prisma from "@repo/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Extend NextAuth types so accessToken / id are recognized natively
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      accessToken?: string;
    };
  }

  interface User {
    id: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "text"     },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const body = {
          email: credentials.email,
          password: credentials.password
        }

        const parsedBody = UserSigninSchema.safeParse(body);

        if(!parsedBody.success){
          //return invalid input error to the client and this will automatically return null to indicate failed sign in
          throw new Error("Invalid input data for user signin.");
        }

        try{
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if(!user){
            throw new Error("Invalid email or password.");
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if(!isPasswordValid){
            throw new Error("Invalid email or password.");
          }

          const token = jwt.sign({userId: user.id, email: user.email, name: user.name}, process.env.JWT_SECRET || "", { expiresIn: '7d' });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            accessToken: token
          };
        } catch (err) {
          console.error("[NextAuth] Credentials signIn failed:", (err as Error).message);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    // async signIn({ user, account})
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email || !user.name) return false;

        const parsedData = UserOAuthSigninSchema.safeParse({
          name: user.name ?? "",
          email: user.email ?? "",
        });
        if (!parsedData.success) {
          console.error("[NextAuth] Google signIn failed: Invalid user data from Google.");
          return false;
        }

        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                password: "",
              },
            });
          }

          // dbUser is now guaranteed to exist
          const token = jwt.sign({ userId: dbUser.id, email: user.email, name: user.name }, process.env.JWT_SECRET || "", { expiresIn: "7d" });

          user.accessToken = token;
          return true;
        } catch (err) {
          console.error("[NextAuth] Google signIn failed:", (err as Error).message);
          return false;
        }
      }

      return true; // ← Allow credentials provider through
    },

    async jwt({ token, user }) {

      if(user){
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {

      if(token){
        session.user = {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          accessToken: token.accessToken
        }
      }
      return session;
    },
  },
};
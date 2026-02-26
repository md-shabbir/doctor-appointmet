import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { doctor: true, patient: true },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = user.id;
      }

      if (trigger === "update" && session) {
        token.name = session.name;
      }

      // Fetch profile IDs if not present
      if (token.userId && !token.patientId && !token.doctorId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          include: { patient: true, doctor: true },
        });
        if (dbUser?.patient) token.patientId = dbUser.patient.id;
        if (dbUser?.doctor) token.doctorId = dbUser.doctor.id;
        if (dbUser) token.role = dbUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).patientId = token.patientId;
        (session.user as any).doctorId = token.doctorId;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Auto-create patient profile for Google sign-in
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { patient: true },
        });

        if (existingUser && !existingUser.patient) {
          await prisma.patient.create({
            data: { userId: existingUser.id },
          });
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create patient profile for new OAuth users
      await prisma.patient.create({
        data: { userId: user.id },
      });
    },
  },
};

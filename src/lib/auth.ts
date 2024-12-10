import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "@/lib/mongodb";
import bcrypt from 'bcryptjs';
import User from "@/models/User";
import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

interface ExtendedUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

interface ExtendedSession extends Session {
  user: {
    id?: string;
    role?: string;
    email?: string | null;
    name?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        try {
          await connectToDb()
          const user = await User.findOne({ email: credentials.email }).select('+password')
          
          if (!user) {
            throw new Error('Invalid credentials')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('Invalid credentials')
          }

          // Return only necessary user data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback - Input:', { token, user })
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      console.log('JWT Callback - Output:', token)
      return token
    },
    async session({ session, token }) {  // Remove user parameter, add token type
      console.log('Session Callback - Input:', { session, token })
      
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      
      console.log('Session Callback - Output:', session)
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Handle fully qualified URLs
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development'
}
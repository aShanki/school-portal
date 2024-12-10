import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "@/lib/mongodb";
import bcrypt from 'bcryptjs';
import User from "@/models/User";
import { NextAuthOptions } from "next-auth";


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
            console.log('User not found:', credentials.email)
            throw new Error('Invalid credentials')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email)
            throw new Error('Invalid credentials')
          }

          console.log('Login successful for:', user.email, 'with role:', user.role)
          
          // Ensure role is included in the returned object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'student' // Provide default role if missing
          }
        } catch (error) {
          console.error('Detailed auth error:', error)
          throw error // Propagate the original error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      
      return token
    },
    async session({ session, token }) {  // Remove user parameter, add token type
      
      
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      
      
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
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
        callbackUrl: '/dashboard'
      }

      const result = await signIn('credentials', credentials)

      if (!result?.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || "Failed to sign in"
        })
        return
      }

      // Redirect to dashboard (role-based routing is handled there)
      router.replace('/dashboard')

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form 
        onSubmit={handleSubmit} 
        method="POST"
        action="/api/auth/callback/credentials"
        noValidate
        className="space-y-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            placeholder="Password" 
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <Button 
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
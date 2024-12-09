'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // Log for debugging
      console.log('Session:', session)
      console.log('Role:', session.user.role)

      // Direct routing based on role
      switch (session.user.role) {
        case 'ADMIN':
          router.replace('/dashboard/admin')
          break
        case 'TEACHER':
          router.replace('/dashboard/teacher')
          break
        case 'STUDENT':
          router.replace('/dashboard/student')
          break
        case 'PARENT':
          router.replace('/dashboard/parent')
          break
        default:
          console.error('Unknown role:', session.user.role)
          router.replace('/auth/signin')
      }
    } else if (status === 'unauthenticated') {
      router.replace('/auth/signin')
    }
  }, [status, session, router])

  if (status === 'loading') return <LoadingSpinner />;
  return null;
}

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('=== TeacherLayout ===')
    console.log('Status:', status)
    console.log('Session:', JSON.stringify(session, null, 2))
    console.log('User role:', session?.user?.role)
    console.log('Is authenticated:', status === 'authenticated')
    
    if (status === 'authenticated') {
      if (!session?.user?.role) {
        console.log('No role found, redirecting to dashboard')
        router.push('/dashboard')
      } else if (session.user.role !== 'TEACHER') {
        console.log('Not a teacher, redirecting to dashboard')
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  if (status === 'loading') return <LoadingSpinner />
  if (status !== 'authenticated') return null
  if (!session?.user?.role) return null
  if (session.user.role !== 'TEACHER') return null

  return <>{children}</>
}

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
    if (status === 'authenticated') {
      if (!session?.user?.role) {
        router.push('/dashboard')
      } else if (session.user.role !== 'TEACHER') {
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

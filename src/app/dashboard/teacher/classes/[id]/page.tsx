import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { fetchData } from '@/lib/data-fetching'
import { GradesTable } from '@/components/dashboard/GradesTable'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailsPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession()
  
  if (!session?.user?.role !== 'teacher') {
    redirect('/auth/signin')
  }

  const classData = await fetchData(`/api/dashboard/teacher/classes/${id}`)

  return <GradesTable classData={classData} classId={id} />
}
import ClassDetailsClient from './ClassDetailsClient'

interface PageProps {
  params: Promise<{ id: string; classId: string }>
}

export default async function ClassPage({ params }: PageProps) {
  const { id, classId } = await params
  return <ClassDetailsClient studentId={id} classId={classId} />
}
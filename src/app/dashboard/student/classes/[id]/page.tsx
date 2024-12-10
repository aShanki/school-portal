import ClassDetailsContent from '@/components/dashboard/ClassDetailsContent'

interface PageProps {
  params: Promise<{
    id: string;
  }>
}

export default async function ClassDetailsPage({ params }: PageProps) {
  const { id } = await params
  return <ClassDetailsContent id={id} />
}
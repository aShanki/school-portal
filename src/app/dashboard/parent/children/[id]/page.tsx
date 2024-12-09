import ChildDetailsClient from './ChildDetailsClient'

interface PageProps {
  params: { id: string }
}

export default function ChildDetailsPage({ params }: PageProps) {
  return <ChildDetailsClient childId={params.id} />
}
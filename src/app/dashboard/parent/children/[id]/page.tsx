import ChildDetailsClient from './ChildDetailsClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChildDetailsPage(props: PageProps) {
  const params = await props.params;
  return <ChildDetailsClient childId={params.id} />
}
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { fetchData } from '@/lib/data-fetching'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ClassData {
  name: string;
  assignments?: Array<{
    _id: string;
    name: string;
    description: string;
    totalPoints: number;
  }>;
  grades?: Array<{
    assignmentId: string;
    points: number;
  }>;
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailsPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const classData = await fetchData<ClassData>(`/api/dashboard/student/classes/${id}`)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{classData?.name}</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classData?.assignments?.map((assignment) => {
            const grade = classData.grades?.find(
              (g) => g.assignmentId === assignment._id
            )
            return (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.name}</TableCell>
                <TableCell>{assignment.description}</TableCell>
                <TableCell className="text-right">
                  {grade ? `${grade.points}/${assignment.totalPoints}` : 'Not graded'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
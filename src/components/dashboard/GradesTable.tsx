'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Pencil, Check } from 'lucide-react'
import debounce from 'lodash/debounce'
import { CreateAssignmentDialog } from './CreateAssignmentDialog'

// Move your interfaces here
interface Assignment {
  _id: string
  name: string
  description: string
  totalPoints: number
  category: string
  status: string
}

interface Student {
  _id: string
  name: string
  email: string
}

interface Grade {
  _id: string
  studentId: string
  assignmentId: string
  points: number
  totalPoints: number
  grade: number
  updatedAt: string
}

const CATEGORY_WEIGHTS = {
  'Unit Test': 0.25,
  'Seatwork': 0.25,
  'Term Test': 0.25,
  'Homework': 0.10,
  'Research': 0.10,
  'Participation': 0.05
}

interface EditButtonProps {
  isEditing: boolean
  onClick: () => void
}

const EditButton = ({ isEditing, onClick }: EditButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="h-6 w-6 p-0 ml-2"
  >
    {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
  </Button>
)

interface GradesTableProps {
  classData: {
    name: string
    subject: string
    assignments: Assignment[]
    grades: Grade[]
    studentIds: Student[]
  }
  classId: string
}

export function GradesTable({ classData, classId }: GradesTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Add query key type
  type ClassQueryKey = ['class', string]
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [localGrades, setLocalGrades] = useState<Record<string, string>>({})
  const [editingGrades, setEditingGrades] = useState<Record<string, boolean>>({})

  // Initialize localGrades from server data when it loads
  useEffect(() => {
    if (classData?.grades) {
      console.log('Initializing grades:', classData.grades)
      const initialGrades: Record<string, string> = {}
      classData.grades.forEach((grade: Grade) => {
        console.log('Processing grade:', {
          studentId: grade.studentId,
          assignmentId: grade.assignmentId,
          points: grade.points
        })
        initialGrades[`${grade.studentId}-${grade.assignmentId}`] = grade.points.toString()
      })
      console.log('Initial grades state:', initialGrades)
      setLocalGrades(initialGrades)
    }
  }, [classData?.grades])

  // Add helper type for new grade
  type NewGrade = Omit<Grade, '_id' | 'updatedAt'> & {
    _id?: string;
    updatedAt?: string;
  }

  const gradeMutation = useMutation({
    mutationFn: async ({ studentId, assignmentId, points }: { 
      studentId: string
      assignmentId: string
      points: number 
    }) => {
      const res = await fetch(`/api/dashboard/teacher/classes/${classId}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          assignmentId,
          points
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update grade')
      }

      return res.json()
    },
    onMutate: async ({ studentId, assignmentId, points }) => {
      const queryKey: ClassQueryKey = ['class', classId]
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<typeof classData>(queryKey)

      // Create a new grade with required fields
      const newGrade: NewGrade = {
        studentId,
        assignmentId,
        points,
        totalPoints: previousData?.assignments.find(a => a._id === assignmentId)?.totalPoints || 0,
        grade: (points / (previousData?.assignments.find(a => a._id === assignmentId)?.totalPoints || 1)) * 100,
      }

      // Optimistically update
      queryClient.setQueryData<typeof classData>(queryKey, (old) => {
        if (!old) return old

        return {
          ...old,
          grades: old.grades.map((g: Grade) => 
            g.studentId === studentId && g.assignmentId === assignmentId
              ? { ...g, points }
              : g
          ) || [...old.grades, newGrade as Grade]
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      const queryKey: ClassQueryKey = ['class', classId]
      queryClient.setQueryData(queryKey, context?.previousData)
      toast({
        variant: "destructive",
        title: "Error updating grade",
        description: "Please try again"
      })
    },
    onSuccess: () => {
      const queryKey: ClassQueryKey = ['class', classId]
      queryClient.invalidateQueries({ queryKey })
      toast({
        title: "Grade updated successfully"
      })
    }
  })

  const debouncedGradeUpdate = useMutation({
    mutationFn: ({ studentId, assignmentId, value, maxPoints }: { 
      studentId: string
      assignmentId: string
      value: string
      maxPoints: number 
    }) => {
      const points = Number(value)
      if (points < 0 || points > maxPoints) {
        toast({
          variant: "destructive", 
          title: "Invalid grade",
          description: `Grade must be between 0 and ${maxPoints}`
        })
        return
      }
      gradeMutation.mutate({ studentId, assignmentId, points })
    }
  })

  const handleGradeChange = (
    studentId: string,
    assignmentId: string,
    value: string,
    maxPoints: number
  ) => {
    // Update local state immediately
    const gradeKey = `${studentId}-${assignmentId}`
    setLocalGrades(prev => ({
      ...prev,
      [gradeKey]: value
    }))

    // Don't update if value is empty
    if (value === '') return

    // Trigger debounced update
    debouncedGradeUpdate.mutate({ studentId, assignmentId, value, maxPoints })
  }

  const getGradeValue = (studentId: string, assignmentId: string) => {
    const localValue = localGrades[`${studentId}-${assignmentId}`]
    if (localValue !== undefined) {
      return Number(localValue)
    }
    const serverGrade = classData?.grades?.find(
      (g: Grade) => 
        g.studentId === studentId && 
        g.assignmentId === assignmentId
    )
    return serverGrade?.points || 0
  }

  const calculateCategoryGrade = (studentId: string, category: string) => {
    if (!classData?.assignments?.length) return 100 // Default to 100% if no assignments
    const categoryAssignments = classData.assignments.filter((a: Assignment) => a.category === category)
    if (!categoryAssignments.length) return 100 // Default to 100% if no assignments in category

    let totalPoints = 0
    let maxPoints = 0

    categoryAssignments.forEach(assignment => {
      const points = getGradeValue(studentId, assignment._id)
      // Only include assignments that have grades
      if (points !== undefined && points !== null) {
        totalPoints += points
        maxPoints += assignment.totalPoints
      }
    })
    
    // Return 100 if no grades entered yet, otherwise calculate percentage
    return maxPoints === 0 ? 100 : (totalPoints / maxPoints) * 100
  }

  const calculateFinalGrade = (studentId: string) => {
    const categoryGrades = Object.entries(CATEGORY_WEIGHTS).map(([category]) => {
      return calculateCategoryGrade(studentId, category)
    })

    const weightedSum = categoryGrades.reduce((sum, grade, index) => {
      return sum + (grade * Object.values(CATEGORY_WEIGHTS)[index])
    }, 0)

    return Math.round(weightedSum)
  }

  const toggleGradeEdit = (gradeKey: string) => {
    setEditingGrades(prev => {
      const newState = { ...prev }
      if (newState[gradeKey]) {
        // If we're currently editing, save the changes
        const [studentId, assignmentId] = gradeKey.split('-')
        const value = localGrades[gradeKey]
        if (value !== undefined) {
          const assignment = classData?.assignments?.find(a => a._id === assignmentId)
          const maxPoints = assignment?.totalPoints || 100
          debouncedGradeUpdate.mutate({ studentId, assignmentId, value, maxPoints })
        }
        delete newState[gradeKey]
      } else {
        newState[gradeKey] = true
      }
      return newState
    })
  }

  // Modify the grade input/display in the table
  const renderGradeCell = (student: Student, assignment: Assignment) => {
    const gradeKey = `${student._id}-${assignment._id}`
    const isEditing = editingGrades[gradeKey]
    const grade = classData?.grades?.find(
      (g: Grade) => 
        g.studentId === student._id && 
        g.assignmentId === assignment._id
    )
    const currentValue = localGrades[gradeKey] ?? grade?.points?.toString() ?? ''
    
    console.log('Rendering grade cell:', {
      studentId: student._id,
      assignmentId: assignment._id,
      gradeKey,
      grade,
      localValue: localGrades[gradeKey],
      currentValue
    })

    return (
      <div className="flex items-center">
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => handleGradeChange(
            student._id,
            assignment._id,
            e.target.value,
            assignment.totalPoints
          )}
          className="w-20"
          disabled={!isEditing}
          min={0}
          max={assignment.totalPoints}
          onKeyDown={(e) => {
            if (!/[\d\.]/.test(e.key) && 
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
              e.preventDefault()
            }
          }}
        />
        <EditButton 
          isEditing={isEditing}
          onClick={() => toggleGradeEdit(gradeKey)}
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{classData?.name}</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.back()}>Back</Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            Add Assignment
          </Button>
        </div>
      </div>

      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Subject:</strong> {classData?.subject}</p>
          <p><strong>Total Students:</strong> {classData?.studentIds?.length || 0}</p>
          <p><strong>Total Assignments:</strong> {classData?.assignments?.length || 0}</p>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0 relative">
          <div className="absolute inset-0 overflow-y-auto overflow-x-scroll">
            <div className="min-w-full inline-block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-40 before:absolute before:right-0 before:top-0 before:h-full before:w-4 before:shadow-[inset_-12px_0_8px_-12px_rgba(0,0,0,0.1)]">
                      Student
                    </TableHead>
                    {classData?.assignments?.map((assignment: Assignment) => (
                      <TableHead key={assignment._id} className="min-w-[120px] bg-background">
                        <div className="flex flex-col gap-1">
                          <span>{assignment.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({assignment.totalPoints} pts)
                          </span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="sticky right-0 bg-background z-40 before:absolute before:left-0 before:top-0 before:h-full before:w-4 before:shadow-[inset_12px_0_8px_-12px_rgba(0,0,0,0.1)]">
                      Final Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData?.studentIds?.map((student: Student) => (
                    <TableRow key={student._id}>
                      <TableCell className="sticky left-0 bg-background z-20 before:absolute before:right-0 before:top-0 before:h-full before:w-4 before:shadow-[inset_-12px_0_8px_-12px_rgba(0,0,0,0.1)] whitespace-nowrap">
                        {student.name}
                      </TableCell>
                      {classData?.assignments?.map((assignment: Assignment) => (
                        <TableCell key={assignment._id} className="min-w-[120px]">
                          {renderGradeCell(student, assignment)}
                        </TableCell>
                      ))}
                      <TableCell className="sticky right-0 bg-background z-20 before:absolute before:left-0 before:top-0 before:h-full before:w-4 before:shadow-[inset_12px_0_8px_-12px_rgba(0,0,0,0.1)]">
                        {calculateFinalGrade(student._id)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateAssignmentDialog
        classId={classId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
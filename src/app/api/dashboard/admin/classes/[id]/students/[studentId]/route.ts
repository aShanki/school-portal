import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'

interface RouteSegmentParams {
  params: {
    id: string
    studentId: string
  }
}

export async function DELETE(
  request: Request,
  context: RouteSegmentParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, studentId } = context.params

    await connectToDb()
    
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $pull: { studentIds: studentId } },
      { new: true }
    ).populate('studentIds', 'name email')

    return NextResponse.json(updatedClass)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

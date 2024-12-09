import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId } = await request.json()
    const { id } = await params

    await connectToDb()
    
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    )
    .populate('studentIds', 'name email')
    .populate('teacherId', 'name email')

    // Serialize the MongoDB document
    const serializedClass = JSON.parse(JSON.stringify(updatedClass))

    return NextResponse.json(serializedClass)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

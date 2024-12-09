import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id, studentId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id, studentId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()
    
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    ).populate('studentIds', 'name email')

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClass)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
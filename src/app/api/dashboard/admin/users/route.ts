import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import User from '@/models/User'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 403 })
  }

  const users = await User.find().select('-password')
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 403 })
  }

  const data = await req.json()
  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await User.create({
    ...data,
    password: hashedPassword
  })

  return NextResponse.json(user)
}

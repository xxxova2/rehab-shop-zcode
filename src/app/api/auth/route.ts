import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password, phone, role } = body

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const user = await db.user.create({
      data: {
        email,
        name,
        password,
        phone: phone || '',
        role: role || 'customer',
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (error) {
    console.error('Error registering:', error)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone })
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}

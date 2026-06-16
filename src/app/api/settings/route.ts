import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await db.settings.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s) => (map[s.key] = s.value))
    return NextResponse.json(map)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    for (const [key, value] of Object.entries(body)) {
      await db.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

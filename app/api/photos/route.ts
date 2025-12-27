import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPhotoSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().optional(),
  albumId: z.string().optional(),
})

// GET /api/photos - 사진 목록 조회
export async function GET() {
  try {
    await requireAuth() // 인증 필요

    const photos = await db.photo.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
        album: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

// POST /api/photos - 사진 업로드
export async function POST(req: NextRequest) {
  try {
    const member = await requireAuth()
    const body = await req.json()

    const validatedData = createPhotoSchema.parse(body)

    const photo = await db.photo.create({
      data: {
        imageUrl: validatedData.imageUrl,
        caption: validatedData.caption || null,
        albumId: validatedData.albumId || null,
        uploaderId: member.id,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ photo })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create photo error:', error)
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    )
  }
}

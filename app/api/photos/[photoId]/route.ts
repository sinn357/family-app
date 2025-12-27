import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma as db } from '@/lib/db'

// DELETE /api/photos/[photoId] - 사진 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const member = await requireAuth()
    const { photoId } = await params

    // 사진 조회
    const photo = await db.photo.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // 본인이 업로드한 사진만 삭제 가능
    if (photo.uploaderId !== member.id) {
      return NextResponse.json(
        { error: 'You can only delete your own photos' },
        { status: 403 }
      )
    }

    await db.photo.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}

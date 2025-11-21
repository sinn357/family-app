import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * DELETE /api/files/[id]
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const member = await requireAuth()
    const { id } = await params

    // Check if file exists and belongs to user (or is admin)
    const file = await prisma.file.findUnique({
      where: { id },
      select: { uploaderId: true, name: true },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.uploaderId !== member.id && member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.name, { resource_type: 'raw' })
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      // Continue to delete from DB even if Cloudinary delete fails
    }

    // Delete from database
    await prisma.file.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

'use client'

import { useState } from 'react'
import { useUploadPhoto } from '@/lib/hooks/use-photos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'

interface PhotoUploadProps {
  onSuccess: () => void
}

export function PhotoUpload({ onSuccess }: PhotoUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [caption, setCaption] = useState('')
  const uploadPhoto = useUploadPhoto()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!imageUrl) {
      toast.error('Please upload an image')
      return
    }

    try {
      await uploadPhoto.mutateAsync({
        imageUrl,
        caption: caption || undefined,
      })

      toast.success('Photo uploaded successfully!')
      setImageUrl('')
      setCaption('')
      onSuccess()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="image" className="text-sm font-medium mb-2 block">
          Photo Image *
        </Label>
        <ImageUpload
          value={imageUrl}
          onChange={(url) => setImageUrl(url || '')}
          disabled={uploadPhoto.isPending}
        />
      </div>

      <div>
        <Label htmlFor="caption" className="text-sm font-medium mb-2 block">
          Caption (Optional)
        </Label>
        <Textarea
          id="caption"
          placeholder="Add a caption to your photo..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploadPhoto.isPending}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={uploadPhoto.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={uploadPhoto.isPending || !imageUrl}>
          {uploadPhoto.isPending ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </div>
    </form>
  )
}

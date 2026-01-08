'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from './button'
import { ImagePlus, Loader2, X, Film, Cloud } from 'lucide-react'
import { toast } from 'sonner'

export interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface MediaUploadProps {
  value?: MediaItem[]
  onChange: (items: MediaItem[]) => void
  disabled?: boolean
  maxItems?: number
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: any) => void
      ) => { open: () => void }
    }
  }
}

export function MediaUpload({
  value = [],
  onChange,
  disabled,
  maxItems = 10,
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const widgetRef = useRef<{ open: () => void } | null>(null)
  const valueRef = useRef<MediaItem[]>(value)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const [isWidgetReady, setIsWidgetReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.cloudinary) {
      setIsWidgetReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    script.onload = () => setIsWidgetReady(true)
    script.onerror = () => {
      console.error('Failed to load Cloudinary widget')
    }
    document.body.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (value.length + files.length > maxItems) {
      toast.error(`최대 ${maxItems}개까지 첨부할 수 있습니다`)
      return
    }

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      if (!isImage && !isVideo) {
        toast.error('이미지 또는 동영상만 첨부할 수 있습니다')
        return false
      }

      const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(isVideo ? '동영상은 100MB 이하만 가능합니다' : '이미지는 5MB 이하만 가능합니다')
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress({ current: 0, total: validFiles.length })

    try {
      const uploaded: MediaItem[] = []
      for (let i = 0; i < validFiles.length; i += 1) {
        const file = validFiles[i]
        setUploadProgress({ current: i + 1, total: validFiles.length })

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await res.json()
        uploaded.push({ url: data.url, type: data.type })
      }

      onChange([...value, ...uploaded])
      toast.success('첨부 완료')
    } catch (error) {
      console.error('Media upload error:', error)
      toast.error(error instanceof Error ? error.message : '첨부 실패')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleOpenWidget = () => {
    if (!isWidgetReady || !window.cloudinary) {
      toast.error('Cloudinary 위젯 로딩 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary 설정이 필요합니다')
      return
    }

    if (value.length >= maxItems) {
      toast.error(`최대 ${maxItems}개까지 첨부할 수 있습니다`)
      return
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          multiple: true,
          maxFiles: maxItems - value.length,
          resourceType: 'auto',
          sources: ['local', 'camera'],
          folder: 'family-app',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi', 'webm'],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary widget error:', error)
            toast.error('업로드 중 오류가 발생했습니다')
            setIsUploading(false)
            setUploadProgress(null)
            return
          }

          if (result?.event === 'success') {
            const info = result.info
            const type = info.resource_type === 'video' ? 'video' : 'image'
            onChange([
              ...valueRef.current,
              {
                url: info.secure_url,
                type,
              },
            ])
          }

          if (result?.event === 'queues-end' || result?.event === 'close') {
            setIsUploading(false)
            setUploadProgress(null)
          }
        }
      )
    }

    setIsUploading(true)
    widgetRef.current.open()
  }

  const handleRemove = (index: number) => {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((item, index) => (
            <div key={`${item.url}-${index}`} className="relative rounded-lg overflow-hidden border border-border">
              {item.type === 'image' ? (
                <div className="relative aspect-video">
                  <Image
                    src={item.url}
                    alt="첨부 이미지"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <video
                  src={item.url}
                  controls
                  className="h-32 w-full object-cover"
                  preload="metadata"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleOpenWidget}
        disabled={disabled || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            업로드 중...
          </>
        ) : (
          <>
            <Cloud className="h-4 w-4 mr-2" />
            <span>Cloudinary로 업로드 (최대 {maxItems}개)</span>
            <Film className="h-4 w-4 ml-2 opacity-70" />
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="w-full"
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        <span>기기에서 선택</span>
      </Button>

      {uploadProgress && (
        <p className="text-xs text-muted-foreground">
          업로드 {uploadProgress.current}/{uploadProgress.total}
        </p>
      )}
    </div>
  )
}

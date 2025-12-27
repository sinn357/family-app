import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Photo {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
  uploader: {
    id: string
    name: string
  }
  album: {
    id: string
    name: string
  } | null
}

// 사진 목록 조회
export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const res = await fetch('/api/photos', {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Failed to fetch photos')
      }

      const data = await res.json()
      return data.photos as Photo[]
    },
  })
}

// 사진 업로드
export function useUploadPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { imageUrl: string; caption?: string }) => {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to upload photo')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

// 사진 삭제
export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete photo')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

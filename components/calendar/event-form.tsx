'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EventFormProps {
  initialData?: {
    id?: string
    title: string
    description?: string
    startAt: Date
    endAt?: Date
    location?: string
    color?: string
    isAllDay?: boolean
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startAt, setStartAt] = useState(
    initialData?.startAt
      ? new Date(initialData.startAt).toISOString().slice(0, 16)
      : ''
  )
  const [endAt, setEndAt] = useState(
    initialData?.endAt
      ? new Date(initialData.endAt).toISOString().slice(0, 16)
      : ''
  )
  const [location, setLocation] = useState(initialData?.location || '')
  const [color, setColor] = useState(initialData?.color || '#3b82f6')
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !startAt) {
      toast.error('제목과 시작 시간을 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const url = initialData?.id
        ? `/api/calendar/${initialData.id}`
        : '/api/calendar'
      const method = initialData?.id ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          startAt,
          endAt: endAt || null,
          location: location || null,
          color,
          isAllDay,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '저장 실패')
      }

      toast.success(initialData?.id ? '일정이 수정되었습니다' : '일정이 생성되었습니다')
      onSuccess?.()
    } catch (error) {
      console.error('Event form error:', error)
      toast.error(error instanceof Error ? error.message : '일정 저장 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="일정 설명 (선택사항)"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="isAllDay"
          checked={isAllDay}
          onChange={(e) => setIsAllDay(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isAllDay" className="text-sm font-medium">
          하루 종일
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">시작 시간 *</label>
          <input
            type={isAllDay ? 'date' : 'datetime-local'}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">종료 시간</label>
          <input
            type={isAllDay ? 'date' : 'datetime-local'}
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">장소</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소 (선택사항)"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">색상</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-20 border rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600">{color}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? '저장 중...' : initialData?.id ? '수정' : '생성'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  )
}

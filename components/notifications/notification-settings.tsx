'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface NotificationSettings {
  notifyOnComment: boolean
  notifyOnMention: boolean
  notifyOnSystem: boolean
  notifyOnTodo: boolean
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    notifyOnComment: true,
    notifyOnMention: true,
    notifyOnSystem: true,
    notifyOnTodo: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/notifications/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast.error('알림 설정을 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast.success('알림 설정이 저장되었습니다')
      } else {
        throw new Error('저장 실패')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('알림 설정 저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">알림 설정</h2>
        <p className="text-sm text-gray-600 mt-1">
          받고 싶은 알림 유형을 선택하세요
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifyOnComment"
            checked={settings.notifyOnComment}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, notifyOnComment: checked as boolean })
            }
          />
          <Label htmlFor="notifyOnComment" className="cursor-pointer">
            댓글 알림
            <p className="text-sm text-gray-500 font-normal">
              내 게시글에 댓글이 달리면 알림을 받습니다
            </p>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifyOnMention"
            checked={settings.notifyOnMention}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, notifyOnMention: checked as boolean })
            }
          />
          <Label htmlFor="notifyOnMention" className="cursor-pointer">
            멘션 알림
            <p className="text-sm text-gray-500 font-normal">
              누군가 나를 멘션하면 알림을 받습니다
            </p>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifyOnTodo"
            checked={settings.notifyOnTodo}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, notifyOnTodo: checked as boolean })
            }
          />
          <Label htmlFor="notifyOnTodo" className="cursor-pointer">
            할 일 알림
            <p className="text-sm text-gray-500 font-normal">
              새로운 할 일이 할당되면 알림을 받습니다
            </p>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifyOnSystem"
            checked={settings.notifyOnSystem}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, notifyOnSystem: checked as boolean })
            }
          />
          <Label htmlFor="notifyOnSystem" className="cursor-pointer">
            시스템 알림
            <p className="text-sm text-gray-500 font-normal">
              시스템 공지사항 알림을 받습니다
            </p>
          </Label>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? '저장 중...' : '저장'}
      </Button>
    </div>
  )
}

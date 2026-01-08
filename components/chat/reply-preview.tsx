import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReplyPreviewProps {
  message: {
    id: string
    content: string
    sender: {
      name: string
    }
  }
  onCancel: () => void
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  return (
    <div className="bg-muted/50 border-l-4 border-primary px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary mb-1">
          ↩️ {message.sender.name}에게 답장
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {message.content}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        className="flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

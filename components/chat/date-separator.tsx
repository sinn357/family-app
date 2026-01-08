import { format, isToday, isYesterday, isThisYear } from 'date-fns'
import { ko } from 'date-fns/locale'

interface DateSeparatorProps {
  date: string | Date
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  let displayText: string

  if (isToday(dateObj)) {
    displayText = '오늘'
  } else if (isYesterday(dateObj)) {
    displayText = '어제'
  } else if (isThisYear(dateObj)) {
    // 올해: "1월 8일 (수)"
    displayText = format(dateObj, 'M월 d일 (E)', { locale: ko })
  } else {
    // 작년 이전: "2025년 1월 8일"
    displayText = format(dateObj, 'yyyy년 M월 d일', { locale: ko })
  }

  return (
    <div className="flex items-center justify-center my-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground rounded-full border border-border/30 shadow-sm">
            {displayText}
          </span>
        </div>
      </div>
    </div>
  )
}

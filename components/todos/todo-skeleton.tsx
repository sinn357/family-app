import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TodoSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TodoListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <TodoSkeleton key={i} />
      ))}
    </div>
  )
}

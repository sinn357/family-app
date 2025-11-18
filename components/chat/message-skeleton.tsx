import { Skeleton } from '@/components/ui/skeleton'

export function MessageSkeleton({ isRight = false }: { isRight?: boolean }) {
  return (
    <div className={`flex ${isRight ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className={`h-16 ${isRight ? 'w-48' : 'w-56'} rounded-lg`} />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  )
}

export function MessageListSkeleton() {
  return (
    <div className="flex-1 p-4">
      <MessageSkeleton isRight={false} />
      <MessageSkeleton isRight={true} />
      <MessageSkeleton isRight={false} />
      <MessageSkeleton isRight={true} />
      <MessageSkeleton isRight={false} />
    </div>
  )
}

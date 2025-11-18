import Image from 'next/image'

interface MessageItemProps {
  message: {
    id: string
    content: string
    imageUrl?: string | null
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }
  isCurrentUser: boolean
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3 md:mb-4`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 md:py-2 ${
          isCurrentUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold mb-1">{message.sender.name}</p>
        )}

        {/* Image if present */}
        {message.imageUrl && (
          <div className="relative w-full mb-2 rounded-lg overflow-hidden">
            <Image
              src={message.imageUrl}
              alt="Attached image"
              width={300}
              height={200}
              className="object-cover rounded w-full h-auto"
            />
          </div>
        )}

        <p className="text-sm md:text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  )
}

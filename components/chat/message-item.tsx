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

  // Get first letter of sender name for avatar
  const avatarLetter = message.sender.name.charAt(0).toUpperCase()

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 md:mb-5 px-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isCurrentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {avatarLetter}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* Sender name for others */}
          {!isCurrentUser && (
            <p className="text-xs font-medium text-muted-foreground ml-2">{message.sender.name}</p>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 md:px-5 md:py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
              isCurrentUser
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                : 'bg-card/80 backdrop-blur-md text-card-foreground border border-border/50 rounded-bl-sm'
            }`}
          >
            {/* Image if present */}
            {message.imageUrl && (
              <div className="relative w-full mb-3 rounded-xl overflow-hidden">
                <Image
                  src={message.imageUrl}
                  alt="Attached image"
                  width={300}
                  height={200}
                  className="object-cover rounded-xl w-full h-auto"
                />
              </div>
            )}

            <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Timestamp */}
          <p
            className={`text-xs text-muted-foreground ${
              isCurrentUser ? 'text-right mr-2' : 'ml-2'
            }`}
          >
            {formattedTime}
          </p>
        </div>
      </div>
    </div>
  )
}

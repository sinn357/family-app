import { PostForm } from '@/components/posts/post-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewPostPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </div>
  )
}

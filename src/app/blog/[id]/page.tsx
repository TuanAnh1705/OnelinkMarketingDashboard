import { prisma } from "@/lib/prisma"

interface BlogDetailProps {
  params: { id: string }
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  try {
    const { id } = await params
    const postId = Number(id)

    if (isNaN(postId)) {
      return (
        <div className="max-w-3xl mx-auto px-6 py-12">
          Invalid post ID
        </div>
      )
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    })

    if (!post || !post.isPublishedOnNextjs) {
      return (
        <div className="max-w-3xl mx-auto px-6 py-12">
          Post not found
        </div>
      )
    }

    return (
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Cover Image trước */}
        {post.coverImage && (
          <div className="mb-6">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-80 object-cover rounded-xl shadow"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">{post.title}</h1>

        {/* Content giữ nguyên ảnh trong bài */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: post.contentHtml || "",
          }}
        />
      </article>
    )
  } catch (error) {
    console.error("Error fetching post:", error)
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        Server error: {String((error as Error).message)}
      </div>
    )
  }
}

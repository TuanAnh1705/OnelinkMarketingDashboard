"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Calendar, User, ImageIcon } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  slug: string
  coverImage: string | null
  author?: string
  wpCreatedAt?: string
}

interface Category {
  id: number
  name: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<"all" | number>("all")

  const perPage = 10

  const fetchPosts = async (category: "all" | number = "all") => {
    setLoading(true)
    try {
      let url = "/api/post?all=true"
      if (category !== "all") {
        url = `/api/post?categoryId=${category}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchPosts("all")
  }, [])

  useEffect(() => {
    fetchPosts(selectedCategory)
    setPage(1)
  }, [selectedCategory])

  const totalPages = Math.ceil(posts.length / perPage)
  const paginatedPosts = posts.slice((page - 1) * perPage, page * perPage)

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Our Blog</h1>

      {/* Filter categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded border ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded border ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-lg font-medium text-slate-700">
            No posts found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {paginatedPosts.map((post) => (
            <Link
              href={`/blog/${post.id}`}
              key={post.id}
              className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="h-48 bg-slate-100 relative">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg text-slate-900 line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {post.wpCreatedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(post.wpCreatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

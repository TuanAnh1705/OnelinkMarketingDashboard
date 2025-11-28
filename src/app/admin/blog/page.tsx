// File: app/admin/review/page.tsx (DASHBOARD)
// (Đây là trang ReviewPage của bạn)
"use client"

import { useEffect, useState } from "react"
import axios from "axios" // Admin UI dùng axios nội bộ
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  RefreshCw, CheckCircle2, Loader2,
  ImageIcon, Eye, Calendar, User, ChevronLeft, ChevronRight, Edit3, Trash2,
  Undo2,
  ArrowUpDown
} from "lucide-react"
import { useRouter } from "next/navigation"

import CategoriesDialog from "./components/CategoryDialog"
import EditCategoriesDialog from "./components/edit-categories-dialog"
import ReapproveDialog from "./components/delete-category-dialog"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"

import { ContentLayout } from "@/app/components/admin-panel/content-layout"
import DeletePostDialog from "./components/DeletePostDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import OrderDialog from "./components/orderDialog"

interface BlogPost {
  id: number
  title: string
  coverImage: string | null
  wpStatus: string
  isPublishedOnNextjs: boolean
  displayOrder?: number | null
  createdAt?: string
  wpCreatedAt?: string
  author?: string
}

export default function ReviewPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPosts = async (pageNum: number = 1) => {
    setLoading(true)
    try {
      // Gọi API admin (đã tạo)
      const res = await axios.get(`/api/admin/post?page=${pageNum}&per_page=10`)
      setPosts(res.data.posts || [])
      setPage(pageNum)
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const syncFromWP = async () => {
    setSyncing(true)
    try {
      // Gọi API sync (đã tạo)
      await axios.get(`/api/wp-sync?full=true`)
      await fetchPosts(page) // Tải lại trang sau khi sync
    } catch (err) {
      console.error("Error syncing WP:", err)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
  }, [])

  return (
    <ContentLayout title="All Posts">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Review Posts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="min-h-screen">
        {/* Header */}
        <div className="top-0 left-0 right-0 z-10">
          <div className="w-full px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">All Post From WordPress</h1>
            </div>
            <Button
              onClick={syncFromWP}
              disabled={syncing}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {syncing ? "Syncing..." : "Sync from WP"}
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-lg font-medium text-slate-700">No posts found</p>
              <Button onClick={() => fetchPosts(1)} className="mt-4">Reload</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    refreshPosts={() => fetchPosts(page)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-10">
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>

                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => fetchPosts(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => fetchPosts(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </ContentLayout>
  )
}

// PostCard Component
// app/admin/review/page.tsx - Cập nhật PostCard
function PostCard({ post, refreshPosts }: { post: BlogPost; refreshPosts: () => void }) {
  const [imageError, setImageError] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openRestore, setOpenRestore] = useState(false)
  const [openHardDelete, setOpenHardDelete] = useState(false)
  const [openOrder, setOpenOrder] = useState(false) // ✅ THÊM STATE MỚI
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const router = useRouter()

  return (
    <Card className="group overflow-hidden border shadow-sm hover:shadow-lg transition rounded-xl">
      <div className="relative h-36">
        {post.coverImage && !imageError ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={post.wpStatus} />
        </div>
        {/* ✅ Hiển thị order number nếu có */}
        {post.displayOrder && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
              #{post.displayOrder}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-2 text-xs">
          {post.wpCreatedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(post.wpCreatedAt).toLocaleDateString()}</span>
            </div>
          )}
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{post.author}</span>
            </div>
          )}
        </div>

        <TooltipProvider>
          <div className="space-y-2 pt-2">
            {!post.isPublishedOnNextjs && (
              <Button
                onClick={() => setOpenApprove(true)}
                className="w-full h-9 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
            )}

            {/* Hàng 1: Preview + Edit + Order */}
            <div className="flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => router.push(`/admin/preview/${post.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setOpenEdit(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              {/* ✅ NÚT ORDER MỚI */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setOpenOrder(true)}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set Order</TooltipContent>
              </Tooltip>
            </div>

            {/* Hàng 2: Restore + Delete */}
            <div className="flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setOpenRestore(true)}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setOpenHardDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Dialogs */}
      <CategoriesDialog open={openApprove} onOpenChange={setOpenApprove} postId={post.id} onSuccess={refreshPosts} />
      <EditCategoriesDialog open={openEdit} onOpenChange={setOpenEdit} postId={post.id} onSuccess={refreshPosts} />
      <ReapproveDialog
        open={openRestore}
        onOpenChange={setOpenRestore}
        postId={post.id}
        categoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onSuccess={refreshPosts}
      />
      <DeletePostDialog
        open={openHardDelete}
        onOpenChange={setOpenHardDelete}
        postId={post.id}
        postTitle={post.title}
        onSuccess={refreshPosts}
      />
      {/* ✅ DIALOG ORDER MỚI */}
      <OrderDialog
        open={openOrder}
        onOpenChange={setOpenOrder}
        postId={post.id}
        postTitle={post.title}
        currentOrder={post.displayOrder}
        onSuccess={refreshPosts}
      />
    </Card>
  )
}

// StatusBadge Component
function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  if (normalized === "publish" || normalized === "published")
    return <span className="px-2 py-1 text-xs font-bold bg-emerald-500 text-white rounded-full">Published</span>
  if (normalized === "draft")
    return <span className="px-2 py-1 text-xs font-bold bg-slate-500 text-white rounded-full">Draft</span>
  if (normalized === "pending")
    return <span className="px-2 py-1 text-xs font-bold bg-amber-500 text-white rounded-full">Pending</span>
  return <span className="px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">{status}</span>
}
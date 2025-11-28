// File: app/admin/review/components/DeletePostDialog.tsx (DASHBOARD)
"use client"

import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface DeletePostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    postId: number | null
    postTitle: string
    onSuccess: () => void
}

export default function DeletePostDialog({
    open,
    onOpenChange,
    postId,
    postTitle,
    onSuccess
}: DeletePostDialogProps) {

    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!postId) return
        setLoading(true)
        try {
            // Gọi API DELETE admin (mới tạo)
            await axios.delete(`/api/admin/post/${postId}`)
            toast.success("Post deleted permanently")
            onSuccess() // Tải lại danh sách
            onOpenChange(false) // Đóng dialog
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to delete post")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Post Permanently?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete this post??
                        <br />
                        <strong className="text-red-600">&quot;{postTitle}&quot;</strong>
                        <br />
                        All related images and categories will be deleted.
                        <br />
                        <strong className="uppercase">This action cannot be undone.</strong>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        {loading ? "Deleting..." : "Yes, Delete Permanently"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
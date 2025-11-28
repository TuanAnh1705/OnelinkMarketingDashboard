// app/admin/review/components/delete-category-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle } from "lucide-react";

interface ReapproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number | null;
  categoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onSuccess: () => void;
}

interface Category {
  id: number;
  name: string;
}

interface Author {
  id: number;
  name: string;
}

export default function ReapproveDialog({
  open,
  onOpenChange,
  postId,
  categoryId,
  onSelectCategory,
  onSuccess,
}: ReapproveDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open && postId) {
      setLoadingData(true);
      setSelectedCategories([]);
      setSelectedAuthors([]);

      axios
        .get(`/api/admin/post/${postId}/categories`)
        .then((res) => {
          // Lấy categories đã được gán cho post
          const selectedCats = res.data.allCategories.filter((c: any) =>
            res.data.selectedIds.includes(c.id)
          );
          setCategories(selectedCats);

          // Lấy authors đã được gán cho post
          const selectedAuths = res.data.selectedAuthorIds || [];
          // Cần lấy thông tin chi tiết authors
          if (selectedAuths.length > 0) {
            axios.get(`/api/admin/authors`).then((authRes) => {
              const postAuthors = authRes.data.authors.filter((a: any) =>
                selectedAuths.includes(a.id)
              );
              setAuthors(postAuthors);
            });
          }
        })
        .catch(() => toast.error("Failed to load data"))
        .finally(() => setLoadingData(false));
    }
  }, [open, postId]);

  const handleReapprove = async () => {
    if (!postId) return;

    if (selectedCategories.length === 0 && selectedAuthors.length === 0) {
      toast.error("Please select at least one category or author to remove");
      return;
    }

    setLoading(true);
    try {
      // Xóa từng category và author đã chọn
      const promises = [];

      for (const catId of selectedCategories) {
        promises.push(
          axios.post(`/api/admin/post/${postId}/reapprove`, {
            categoryId: catId,
          })
        );
      }

      for (const authId of selectedAuthors) {
        promises.push(
          axios.post(`/api/admin/post/${postId}/reapprove`, {
            authorId: authId,
          })
        );
      }

      await Promise.all(promises);

      toast.success("Post unpublished and relations removed successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error in reapprove:", err);
      toast.error(err.response?.data?.error || "Failed to unpublish post");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const toggleAuthor = (id: number) => {
    setSelectedAuthors((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Unpublish Post
          </DialogTitle>
          <DialogDescription>
            Select categories and/or authors to remove, then unpublish this post.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-6">
              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Remove Categories
                  </Label>
                  <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded transition"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors Section */}
              {authors.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Remove Authors
                  </Label>
                  <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                    {authors.map((author) => (
                      <label
                        key={author.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded transition"
                      >
                        <Checkbox
                          checked={selectedAuthors.includes(author.id)}
                          onCheckedChange={() => toggleAuthor(author.id)}
                        />
                        <span className="text-sm">{author.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {categories.length === 0 && authors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No categories or authors assigned to this post
                </p>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReapprove}
            disabled={
              loading ||
              loadingData ||
              (selectedCategories.length === 0 && selectedAuthors.length === 0)
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Unpublish Post"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
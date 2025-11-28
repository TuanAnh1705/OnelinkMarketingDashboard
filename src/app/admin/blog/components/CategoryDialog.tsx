// app/admin/review/components/CategoryDialog.tsx
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface CategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number | null;
  onSuccess: () => void;
}

interface Category {
  id: number;
  name: string;
}

interface Author {
  id: number;
  name: string;
  _count?: {
    posts: number;
  };
}

export default function CategoriesDialog({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: CategoriesDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open && postId) {
      setLoadingData(true);

      Promise.all([
        axios.get(`/api/admin/post/${postId}/categories`),
        axios.get(`/api/admin/authors`),
      ])
        .then(([postDataRes, authorsRes]) => {
          setCategories(postDataRes.data.allCategories || []);
          setSelectedCategories(postDataRes.data.selectedIds || []);
          setSelectedAuthors(postDataRes.data.selectedAuthorIds || []);
          setAuthors(authorsRes.data.authors || []);
        })
        .catch(() => toast.error("Failed to load data"))
        .finally(() => setLoadingData(false));
    }
  }, [open, postId]);

  const handleSave = async () => {
    if (!postId) return;

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/approve-post`, {
        id: postId,
        categoryIds: selectedCategories,
        authorIds: selectedAuthors,
      });

      toast.success("Post approved successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error approving post:", error);
      toast.error(error.response?.data?.error || "Failed to approve post");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Assign Categories & Authors</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Authors Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Authors (Optional)
                </Label>
                <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                  {authors.length > 0 ? (
                    authors.map((author) => (
                      <label
                        key={author.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded transition"
                      >
                        <Checkbox
                          checked={selectedAuthors.includes(author.id)}
                          onCheckedChange={() => toggleAuthor(author.id)}
                        />
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-sm font-medium">
                            {author.name}
                          </span>
                          {author._count && (
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              {author._count.posts} posts
                            </span>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No authors available. Create authors first.
                    </p>
                  )}
                </div>
                {selectedAuthors.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedAuthors.length} author(s)
                  </p>
                )}
              </div>

              {/* Categories Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Categories *
                </Label>
                <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded transition"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-xs text-destructive">
                    * Please select at least one category
                  </p>
                )}
              </div>
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
            onClick={handleSave}
            disabled={loading || loadingData || selectedCategories.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Approve"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
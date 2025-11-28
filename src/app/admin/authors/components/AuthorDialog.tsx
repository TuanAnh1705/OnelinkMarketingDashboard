// app/admin/authors/components/AuthorDialog.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: any | null;
  onSuccess: () => void;
}

export default function AuthorDialog({
  open,
  onOpenChange,
  author,
  onSuccess,
}: AuthorDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (author) {
      setName(author.name || "");
    } else {
      setName("");
    }
  }, [author, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Author name is required");
      return;
    }

    setLoading(true);
    try {
      if (author) {
        await axios.put(`/api/admin/authors/${author.id}`, { name: name.trim() });
        toast.success("Author updated successfully");
      } else {
        await axios.post("/api/admin/authors", { name: name.trim() });
        toast.success("Author created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {author ? "Edit Author" : "Create New Author"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Author Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter author name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : author ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
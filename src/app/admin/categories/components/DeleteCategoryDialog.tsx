"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface DeleteCategoryDialogProps {
  categoryId: number;
  categoryName: string;
  onSuccess: () => void;
}

export default function DeleteCategoryDialog({
  categoryId,
  categoryName,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/categories/${categoryId}`);
      toast.success(`Deleted "${categoryName}" successfully!`);
      onSuccess();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category!");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold">{categoryName}</span>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

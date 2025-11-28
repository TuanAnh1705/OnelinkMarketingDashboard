"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface CategoryDialogProps {
  editingCategory?: { id: number; name: string } | null;
  onSuccess: () => void;
}

export default function CategoryDialog({ editingCategory, onSuccess }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setForm({ name: editingCategory.name });
      setOpen(true);
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, form);
        toast.success("Category updated successfully!");
      } else {
        await axios.post("/api/categories", form);
        toast.success("Category created successfully!");
      }
      onSuccess();
      setForm({ name: "" });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editingCategory && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setForm({ name: "" });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// app/admin/review/components/OrderDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pin, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  postTitle: string;
  currentOrder?: number | null;
  onSuccess: () => void;
}

export default function OrderDialog({
  open,
  onOpenChange,
  postId,
  postTitle,
  currentOrder,
  onSuccess,
}: OrderDialogProps) {
  const [displayOrder, setDisplayOrder] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayOrder(currentOrder?.toString() || "");
    }
  }, [open, currentOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderNum = parseInt(displayOrder);
    if (isNaN(orderNum) || orderNum < 1) {
      toast.error("Please enter a valid position (minimum 1)");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Setting position...");

    try {
      await axios.post(`/api/admin/post/${postId}/order`, {
        displayOrder: orderNum,
      });

      toast.success(
        `Post set to position ${orderNum}!`,
        { id: toastId }
      );
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error(
        error.response?.data?.error || "Failed to set position",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearOrder = async () => {
    if (!currentOrder) {
      toast.error("Post has no position set");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Clearing position...");

    try {
      await axios.post(`/api/admin/post/${postId}/order`, {
        displayOrder: null,
      });

      toast.success("Position cleared successfully!", { id: toastId });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error clearing order:", error);
      toast.error(
        error.response?.data?.error || "Failed to clear position",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Set Display Position
          </DialogTitle>
          <DialogDescription>
            Set position for <strong>{postTitle}</strong>
            {currentOrder && (
              <span className="block text-xs text-green-600 mt-1 font-medium">
                ✓ Currently at position {currentOrder}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayOrder">Position Number</Label>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                placeholder="1 = top, 2 = second, 3 = third..."
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {currentOrder && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearOrder}
                disabled={loading}
                className="mr-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Position
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pin className="mr-2 h-4 w-4" />
                  Set Position
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
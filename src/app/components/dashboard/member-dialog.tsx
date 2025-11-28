"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/lib/uploadthing";
import toast from "react-hot-toast"; // 👈 import toast

export default function MemberDialog({ editData, onSuccess }: { editData?: any; onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [position, setPosition] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const isEdit = !!editData;

    useEffect(() => {
        if (editData) {
            setName(editData.name);
            setPosition(editData.position);
            setImageUrl(editData.imageUrl);
        } else {
            setName("");
            setPosition("");
            setImageUrl(null);
        }
    }, [editData, open]);

    const handleSave = async () => {
        if (!name || !position || !imageUrl) {
            toast.error("Please enter complete information!");
            return;
        }

        const payload = { name, position, imageUrl };

        try {
            const toastId = toast.loading("Saving...");
            if (isEdit) {
                await axios.put(`/api/representatives/${editData.id}`, payload);
                toast.success("Update Member Successfully!", { id: toastId });
            } else {
                await axios.post("/api/representatives", payload);
                toast.success("Add New Member Successfully!", { id: toastId });
            }
            onSuccess?.();
            setOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Save Failed!");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={isEdit ? "secondary" : "default"}>
                    {isEdit ? "Edit" : "+ Add Member"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Member" : "Add New Member"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <Input placeholder="Name Of Member" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Position Of Member" value={position} onChange={(e) => setPosition(e.target.value)} />

                    <div className="flex flex-col items-center gap-2">
                        {!imageUrl ? (
                            <UploadButton
                                endpoint="memberImage"
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]?.url) {
                                        setImageUrl(res[0].url);
                                        toast.success("Upload Successfully!");
                                    }
                                }}
                                onUploadError={(err) => {
                                    toast.error(`Upload Error: ${err.message}`);
                                }}

                                // 👇 THÊM PHẦN NÀY
                                appearance={{
                                    // Áp dụng class của shadcn/ui cho nút
                                    button: buttonVariants({ variant: "default" }),

                                }}

                                // 👇 VÀ THÊM PHẦN NÀY ĐỂ ĐỔI CHỮ
                                content={{
                                    button: "Upload Image", // Text hiển thị trên nút
                                }}
                            />
                        ) : (
                            <div className="relative w-24 h-24">
                                <Image src={imageUrl} alt="preview" fill className="object-cover rounded-full border" />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 rounded-full text-xs px-2 py-0"
                                    onClick={() => setImageUrl(null)}
                                >
                                    ✕
                                </Button>
                            </div>
                        )}
                    </div>

                    <Button onClick={handleSave} className="w-full">
                        {isEdit ? "Save Change" : "Save This Member"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

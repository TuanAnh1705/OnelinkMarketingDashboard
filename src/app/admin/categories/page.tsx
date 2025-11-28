"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";


import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { ContentLayout } from "@/app/components/admin-panel/content-layout";
import CategoryDialog from "./components/CategoryDialog";
import DeleteCategoryDialog from "./components/DeleteCategoryDialog";

interface Category {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/categories");
            setCategories(res.data.categories || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            toast.error("Failed to load categories!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <ContentLayout title="Categories">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Categories</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
                <div className="flex justify-between items-start ">
                    <h1 className="text-3xl font-bold">Manage Categories</h1>
                    <CategoryDialog editingCategory={null} onSuccess={fetchCategories} />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                ) : categories.length === 0 ? (
                    <p className="text-slate-600 text-center">No categories found.</p>
                ) : (
                    <div className="space-y-3">
                        {categories.map((cat) => (
                            <Card key={cat.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{cat.name}</h3>
                                    <p className="text-sm text-slate-500">{cat.slug}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingCategory(cat)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <DeleteCategoryDialog
                                        categoryId={cat.id}
                                        categoryName={cat.name}
                                        onSuccess={fetchCategories}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Dialog cho edit */}
                {editingCategory && (
                    <CategoryDialog
                        editingCategory={editingCategory}
                        onSuccess={() => {
                            fetchCategories();
                            setEditingCategory(null);
                        }}
                    />
                )}
            </div>
        </ContentLayout>
    );
}

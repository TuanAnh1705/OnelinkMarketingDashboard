"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";


import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import MemberDialog from "@/app/components/dashboard/member-dialog";
import DeleteDialog from "@/app/components/dashboard/delete-dialog";
import { ContentLayout } from "@/app/components/admin-panel/content-layout";

interface Member {
  id: number;
  name: string;
  position: string;
  imageUrl: string;
}

export default function AboutUsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/representatives");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      toast.error("Failed to load members!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <ContentLayout title="About Us">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>About Us</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between my-8">
        <h1 className="text-3xl font-bold">Members List</h1>
        <MemberDialog onSuccess={fetchMembers} />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : members.length === 0 ? (
        // Empty state
        <p className="text-slate-600 text-center">No members found.</p>
      ) : (
        // Members grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="border rounded-xl p-4 text-center shadow-sm"
            >
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  className="object-cover rounded-full border"
                />
              </div>
              <h3 className="font-semibold mt-3">{member.name}</h3>
              <p className="text-gray-500 text-sm">{member.position}</p>

              <div className="flex justify-center gap-2 mt-4">
                <MemberDialog editData={member} onSuccess={fetchMembers} />
                <DeleteDialog id={member.id} onSuccess={fetchMembers} />
              </div>
            </div>
          ))}
        </div>
      )}
    </ContentLayout>
  );
}

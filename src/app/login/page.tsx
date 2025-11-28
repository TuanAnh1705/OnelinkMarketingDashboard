"use client";

import api from "@/lib/axios";
import { useState } from "react";
// import { useRouter } from "next/navigation"; // Bị xoá do lỗi biên dịch
import toast from "react-hot-toast";
// Giả sử tệp lib nằm ở app/lib/axios.ts


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    // const router = useRouter(); // Bị xoá do lỗi biên dịch

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/api/login", { email, password });

            // Nếu API trả về status 200
            if (res.status === 200) {
                toast.success("Login Successfully");

                // --- SỬA LỖI ---
                // Do `useRouter` từ `next/navigation` gây ra lỗi biên dịch,
                // chúng ta sẽ sử dụng điều hướng "cứng" của trình duyệt.
                // Điều này sẽ buộc tải lại trang đầy đủ, gửi cookie mới
                // và giải quyết được vấn đề middleware.

                // router.refresh(); // Bị xoá

                setTimeout(() => {
                    // 2. Sử dụng window.location.href để thực hiện điều hướng "cứng"
                    window.location.href = "/admin";
                    // router.push("/dashboard"); // Bị xoá
                }, 800);
            }
        } catch (error: any) {
            const msg =
                error.response?.data?.error || "Login Failed. Please Try Again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="max-w-md w-full bg-white p-6 rounded-xl shadow-md border"
            >
                {/* ... existing code ... */}
                <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

                <label className="block mb-3">
                    {/* ... existing code ... */}
                    <span className="text-sm font-medium">Email</span>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your email"
                    />
                </label>

                <label className="block mb-5">
                    {/* ... existing code ... */}
                    <span className="text-sm font-medium">Password </span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {/* ... existing code ... */}
                    {loading ? "Please Wait..." : "Login"}
                </button>
            </form>
        </div>
    );
}


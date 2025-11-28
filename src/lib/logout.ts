'use client';

import toast from 'react-hot-toast';

export const handleLogout = async () => {
  // Tạo loading toast
  const toastId = toast.loading('Đang đăng xuất...');

  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Xóa token khỏi localStorage nếu có
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.clear();
      }

      // Hiển thị success toast
      toast.success('Logout Successfully!', {
        id: toastId,
      });

      // Delay một chút để user thấy toast trước khi redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } else {
      const data = await response.json();
      console.error('Logout failed:', data.message);
      
      // Hiển thị error toast
      toast.error(data.message || 'Logout failed. Please try again!', {
        id: toastId,
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
    
    // Hiển thị error toast
    toast.error('Error to logout!', {
      id: toastId,
    });
  }
};
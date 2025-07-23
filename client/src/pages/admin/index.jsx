import { useEffect } from 'react';
export default function AdminIndex() {
  useEffect(() => {
    window.location.href = '/admin/login';
  }, []);
  return null;
} 
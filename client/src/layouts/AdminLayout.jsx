import React from 'react';
import { AdminSidebar } from "../components/admin/sidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
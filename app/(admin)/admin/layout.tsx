import { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { AdminSWRProvider } from "@/providers/SWRProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSWRProvider>
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminSWRProvider>
  );
}

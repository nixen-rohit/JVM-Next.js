import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {" "}
      <div className="relative z-10 bg-white mb-[100vh] shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </div>
      <Footer />
    </>
  );
}

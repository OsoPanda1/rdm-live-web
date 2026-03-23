import { ReactNode } from "react";
import NavBar from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";
import { RealitoOrb } from "@/components/RealitoOrb";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="min-h-screen">
        {children}
      </main>
      <FooterSection />
      <RealitoOrb />
    </div>
  );
}

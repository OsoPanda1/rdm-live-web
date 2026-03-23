// @ts-nocheck
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

export default function GraciasDonativo() {
  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 pt-28 pb-20">
        <section className="max-w-2xl mx-auto glass-surface p-8 space-y-4 text-center">
          <h1 className="text-3xl font-bold">Gracias por tu donativo</h1>
          <p className="text-muted-foreground">
            Tu apoyo ayuda a que Real del Monte siga brillando en su gemelo digital vivo.
          </p>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}

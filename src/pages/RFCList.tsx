import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RFC_SECTIONS, RFC_COLORS, type RFCStatus } from "@/data/rfc-system";

const statusLabels: Record<RFCStatus, string> = {
  draft: "Borrador",
  review: "Revisión",
  ratified: "Ratificado",
  superseded: "Sustituido",
};

export default function RFCList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ScrollText className="h-8 w-8 text-gold" />
              RFC — Request for Comments
            </h1>
            <p className="text-muted-foreground mt-1">
              Documentos de especificación y consenso del ecosistema soberano TAMV
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
            {RFC_SECTIONS.reduce((a, s) => a + s.rfcs.length, 0)} RFCs totales
          </Badge>
          <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
            {RFC_SECTIONS.length} secciones
          </Badge>
        </div>

        {RFC_SECTIONS.map((section) => (
          <section key={section.id}>
            <h2 className="text-xl font-semibold mb-4 text-gold">{section.title}</h2>
            <div className="grid gap-4">
              {section.rfcs.map((rfc) => (
                <Card
                  key={rfc.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-gold/50 glass-gold"
                  onClick={() => navigate(`/rfc/${rfc.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-electric" />
                        <span className="text-sm font-mono text-muted-foreground">{rfc.id}</span>
                      </div>
                      <Badge className={RFC_COLORS[rfc.status]}>
                        {statusLabels[rfc.status]}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{rfc.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {rfc.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{rfc.author}</span>
                      <span>Actualizado: {rfc.updated}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

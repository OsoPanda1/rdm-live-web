import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRFCById, RFC_COLORS, getAllRFCs, type RFCStatus } from "@/data/rfc-system";

const statusLabels: Record<RFCStatus, string> = {
  draft: "Borrador",
  review: "Revisión",
  ratified: "Ratificado",
  superseded: "Sustituido",
};

export default function RFCDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rfc = id ? getRFCById(id) : undefined;
  const allRfcs = getAllRFCs();

  if (!rfc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">RFC no encontrado</h1>
          <p className="text-muted-foreground">No existe un RFC con ID {id}</p>
          <Button variant="outline" onClick={() => navigate("/rfcs")}>
            Volver a RFCs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rfcs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-muted-foreground">{rfc.id}</span>
              <Badge className={RFC_COLORS[rfc.status]}>
                {statusLabels[rfc.status]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{rfc.title}</h1>
          </div>
        </div>

        <Card className="glass-gold">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-electric" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{rfc.summary}</p>
          </CardContent>
        </Card>

        {rfc.content && (
          <Card className="glass-gold">
            <CardHeader>
              <CardTitle className="text-lg">Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{rfc.content}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/20">
          <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Autor</p>
              <p className="font-medium">{rfc.author}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creado</p>
              <p className="font-medium">{rfc.created}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última actualización</p>
              <p className="font-medium">{rfc.updated}</p>
            </div>
            {rfc.superseded_by && (
              <div>
                <p className="text-sm text-muted-foreground">Sustituido por</p>
                <p className="font-medium text-electric">{rfc.superseded_by}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-gold">
          <CardHeader>
            <CardTitle className="text-base">Otros RFCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {allRfcs
                .filter((r) => r.id !== rfc.id)
                .slice(0, 5)
                .map((r) => (
                  <Button
                    key={r.id}
                    variant="ghost"
                    className="justify-start h-auto py-2 text-left"
                    onClick={() => navigate(`/rfc/${r.id}`)}
                  >
                    <span className="font-mono text-xs text-muted-foreground mr-2">{r.id}</span>
                    <span className="text-sm">{r.title}</span>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

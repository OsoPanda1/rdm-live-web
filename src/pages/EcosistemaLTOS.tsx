import { Suspense } from "react";
import platforms from "@/data/imported/ltos-platforms.json";
import repos from "@/data/imported/osopanda-repos.json";
import { RDMPageShell } from "@/components/rdm/RDMPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EcosistemaLTOS() {
  return (
    <RDMPageShell
      eyebrow="Ecosistema LTOS"
      title="Plataformas y Repositorios"
      description={`Arquitecto: ${platforms.architect}. Repo paraguas: ${platforms.umbrella_repo}. ORCID ${platforms.credentials?.orcid} · DOI ${platforms.credentials?.doi}.`}
    >
      <Tabs defaultValue="platforms" className="w-full">
        <TabsList>
          <TabsTrigger value="platforms">Plataformas ({platforms.platforms?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="repos">Repositorios ({repos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="platforms" className="grid gap-4 md:grid-cols-2 mt-4">
          {platforms.platforms?.map((p: any) => (
            <Card key={p.slug}>
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription>{p.role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {p.federation && <Badge variant="secondary">{p.federation}</Badge>}
                  {p.files != null && <Badge variant="outline">{p.files} archivos</Badge>}
                  {p.pages != null && <Badge variant="outline">{p.pages} páginas</Badge>}
                  {p.migrations != null && <Badge variant="outline">{p.migrations} migraciones</Badge>}
                </div>
                {p.highlights && (
                  <div className="flex flex-wrap gap-1">
                    {p.highlights.map((h: string) => (
                      <span key={h} className="text-xs px-2 py-0.5 rounded bg-muted">{h}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="repos" className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {repos.map((r: any) => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:border-primary transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{r.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{r.description || "—"}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{r.language}</Badge>
                  <span>★ {r.stars}</span>
                  <span>· {r.updated}</span>
                </CardContent>
              </Card>
            </a>
          ))}
        </TabsContent>
      </Tabs>
    </RDMPageShell>
  );
}

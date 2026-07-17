import { useMemo } from 'react';
import type { UserContribution, TerritorialHeatPoint } from '@/core/territorial/types';

interface ContributionMapLayerProps {
  contributions: UserContribution[];
  heatMap?: TerritorialHeatPoint[];
  onContributionClick?: (contribution: UserContribution) => void;
  maxVisible?: number;
}

const TYPE_COLORS: Record<string, string> = {
  checkin: '#22C55E',
  review: '#3B82F6',
  photo: '#F59E0B',
  rating: '#8B5CF6',
  tip: '#EC4899',
  event_report: '#F97316',
  route_trace: '#06B6D4',
  poi_suggestion: '#14B8A6',
};

const TYPE_LABELS: Record<string, string> = {
  checkin: 'Check-in',
  review: 'Resena',
  photo: 'Foto',
  rating: 'Calificacion',
  tip: 'Consejo',
  event_report: 'Reporte',
  route_trace: 'Ruta',
  poi_suggestion: 'Sugerencia',
};

export function ContributionMapLayer({ contributions, heatMap, onContributionClick, maxVisible = 50 }: ContributionMapLayerProps) {
  const visibleContributions = useMemo(
    () => contributions.slice(0, maxVisible),
    [contributions, maxVisible]
  );

  if (contributions.length === 0 && (!heatMap || heatMap.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <div className="text-center p-6">
          <p className="font-display text-lg mb-2">Aun no hay contribuciones</p>
          <p className="text-xs">Se el primero en dejar tu huella en el mapa vivo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {heatMap && heatMap.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Mapa de Calor Territorial ({heatMap.length} puntos)
          </p>
          <div className="grid gap-1.5">
            {heatMap.slice(0, 10).map((point, idx) => (
              <div
                key={`heat-${idx}`}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-2"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: TYPE_COLORS[point.type] ?? '#6366F1',
                    opacity: 0.4 + point.intensity * 0.6,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    {point.coords.lat.toFixed(4)}, {point.coords.lng.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {point.count} {point.count === 1 ? 'interaccion' : 'interacciones'} · Ultima: {formatRelativeTime(point.lastActivity)}
                  </p>
                </div>
                <div className="text-xs font-mono text-foreground/60">
                  {(point.intensity * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleContributions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Contribuciones Recientes ({contributions.length})
          </p>
          <div className="grid gap-1.5">
            {visibleContributions.map((contribution) => (
              <button
                key={contribution.id}
                onClick={() => onContributionClick?.(contribution)}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-2.5 text-left w-full hover:border-rdm-amber/40 hover:bg-muted/30 transition-all"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[contribution.type] ?? '#6366F1' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {TYPE_LABELS[contribution.type] ?? contribution.type}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      contribution.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : contribution.status === 'flagged'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {contribution.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {summarizePayload(contribution)}
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground flex-shrink-0">
                  {formatRelativeTime(contribution.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function summarizePayload(contribution: UserContribution): string {
  const p = contribution.payload;
  switch (p.type) {
    case 'checkin': return p.poiName;
    case 'review': return p.text.slice(0, 60) + (p.text.length > 60 ? '...' : '');
    case 'rating': return `${p.category}: ${p.score}/5`;
    case 'tip': return p.text.slice(0, 60) + (p.text.length > 60 ? '...' : '');
    case 'photo': return p.caption ?? 'Foto sin descripcion';
    case 'event_report': return p.eventName;
    case 'route_trace': return `${p.waypoints.length} puntos · ${p.transportMode}`;
    case 'poi_suggestion': return p.suggestedName;
    default: return 'Contribucion';
  }
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

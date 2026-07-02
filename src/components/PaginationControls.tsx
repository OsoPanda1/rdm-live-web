import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/hooks/usePaginated";

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ meta, onPageChange }: PaginationControlsProps) => {
  if (meta.totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 7;
  let start = Math.max(1, meta.page - Math.floor(maxVisible / 2));
  const end = Math.min(meta.totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <motion.nav
      aria-label="Paginación"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-2xl border border-cyan-100/10 bg-slate-950/45 p-3 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs tracking-[0.16em] uppercase text-cyan-100/60">
          Página {meta.page} de {meta.totalPages} · {meta.totalItems} registros
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <PagerButton label="Primera" onClick={() => onPageChange(1)} disabled={meta.page <= 1} icon={<ChevronsLeft className="h-3.5 w-3.5" />} />
          <PagerButton label="Anterior" onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1} icon={<ChevronLeft className="h-3.5 w-3.5" />} />

          {start > 1 && <GapMarker />}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-all ${
                page === meta.page
                  ? "bg-cyan-400/25 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.45)]"
                  : "bg-white/0 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}

          {end < meta.totalPages && <GapMarker />}

          <PagerButton label="Siguiente" onClick={() => onPageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages} icon={<ChevronRight className="h-3.5 w-3.5" />} iconRight />
          <PagerButton label="Última" onClick={() => onPageChange(meta.totalPages)} disabled={meta.page >= meta.totalPages} icon={<ChevronsRight className="h-3.5 w-3.5" />} iconRight />
        </div>
      </div>
    </motion.nav>
  );
};

const GapMarker = () => <span className="px-2 text-sm text-slate-500">…</span>;

function PagerButton({
  label,
  onClick,
  disabled,
  icon,
  iconRight,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
  iconRight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs uppercase tracking-[0.14em] text-slate-200 transition-all hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </button>
  );
}

export default PaginationControls;

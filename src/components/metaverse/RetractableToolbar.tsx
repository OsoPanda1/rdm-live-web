import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FEDERATION_COLORS as NOTIFICATION_COLORS } from "@/lib/federation";

export type ToolbarPosition = "top" | "left" | "right" | "bottom";
export type NotificationType = keyof typeof NOTIFICATION_COLORS;

interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
  children?: ToolbarItem[];
}

interface RetractableToolbarProps {
  position: ToolbarPosition;
  items: ToolbarItem[];
  notificationType?: NotificationType;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

const RetractableToolbar: React.FC<RetractableToolbarProps> = ({
  position,
  items,
  notificationType,
  className,
  onItemClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    if (notificationType) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationType]);

  const getPositionStyles = () => {
    const base =
      "fixed z-40 overflow-hidden rounded-[1.5rem] border border-slate-500/50 backdrop-blur-2xl shadow-[0_18px_50px_rgba(15,23,42,0.98),0_0_45px_rgba(56,189,248,0.35)]";
    const glass =
      "bg-slate-950/80 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.24),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(192,132,252,0.24),transparent_55%)]";

    switch (position) {
      case "top":
        return {
          container: cn(base, glass, "top-3 left-1/2 -translate-x-1/2 px-3"),
          collapsed: "h-11 min-w-[220px]",
          expanded: "h-auto max-h-[40vh]",
          layout: "flex-row",
        };
      case "bottom":
        return {
          container: cn(base, glass, "bottom-3 left-1/2 -translate-x-1/2 px-3"),
          collapsed: "h-11 min-w-[220px]",
          expanded: "h-auto max-h-[40vh]",
          layout: "flex-row",
        };
      case "left":
        return {
          container: cn(base, glass, "left-3 top-1/2 -translate-y-1/2 py-3"),
          collapsed: "w-11 min-h-[220px]",
          expanded: "w-64",
          layout: "flex-col",
        };
      case "right":
        return {
          container: cn(base, glass, "right-3 top-1/2 -translate-y-1/2 py-3"),
          collapsed: "w-11 min-h-[220px]",
          expanded: "w-64",
          layout: "flex-col",
        };
    }
  };

  const styles = getPositionStyles();
  const notificationColor = notificationType
    ? NOTIFICATION_COLORS[notificationType]
    : undefined;

  const handleItemClick = (item: ToolbarItem) => {
    if (item.children && item.children.length > 0) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else {
      item.onClick?.();
      onItemClick?.(item.id);
    }
  };

  return (
    <motion.div
      className={cn(
        styles.container,
        isExpanded ? styles.expanded : styles.collapsed,
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setActiveSubmenu(null);
      }}
      style={{
        boxShadow:
          isPulsing && notificationColor
            ? `0 0 26px ${notificationColor}, 0 0 60px ${notificationColor}66`
            : undefined,
      }}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* halo iridiscente interno */}
      <div className="pointer-events-none absolute inset-[1px] rounded-[1.4rem] border border-transparent bg-[conic-gradient(from_150deg,rgba(59,245,255,0.4),rgba(192,132,252,0.45),rgba(59,245,255,0.4))] opacity-40 mix-blend-soft-light" />

      {/* ruido cuántico */}
      <div className="pointer-events-none absolute inset-0 opacity-45 mix-blend-soft-light bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%221.6%22%20numOctaves=%223%22%20stitchTiles=%22noStitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22%20opacity=%220.28%22/%3E%3C/svg%3E')]" />

      {/* pulso de notificación */}
      <AnimatePresence>
        {isPulsing && notificationColor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="pointer-events-none absolute inset-0 rounded-[1.5rem]"
            style={{
              background:
                position === "top"
                  ? `linear-gradient(to bottom, ${notificationColor}33, transparent)`
                  : position === "bottom"
                  ? `linear-gradient(to top, ${notificationColor}33, transparent)`
                  : position === "left"
                  ? `linear-gradient(to right, ${notificationColor}33, transparent)`
                  : `linear-gradient(to left, ${notificationColor}33, transparent)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* contenido principal */}
      <div
        className={cn(
          "relative z-10 flex h-full w-full",
          styles.layout === "flex-col"
            ? "flex-col items-stretch justify-between px-2 py-2"
            : "flex-row items-center justify-between px-2 py-1.5"
        )}
      >
        {/* items */}
        <div
          className={cn(
            "flex gap-1",
            styles.layout === "flex-col"
              ? "flex-col items-stretch"
              : "flex-row items-center"
          )}
        >
          {items.map((item) => (
            <div key={item.id} className="relative">
              <motion.button
                whileHover={{ y: -1, scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "relative flex items-center gap-2 rounded-[0.9rem] px-2 py-1.5",
                  "text-[11px] text-slate-200 transition-all duration-200",
                  "bg-slate-900/40 hover:bg-slate-800/60",
                  "border border-slate-500/40 hover:border-cyan-300/50",
                  activeSubmenu === item.id &&
                    "bg-slate-900/70 border-cyan-300/60 shadow-[0_0_18px_rgba(59,245,255,0.7)]"
                )}
              >
                <span className="relative flex items-center justify-center text-cyan-200 drop-shadow-[0_0_8px_rgba(59,245,255,0.6)]">
                  {item.icon}
                </span>

                {/* label solo en expandido */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[11px] font-medium tracking-[0.16em] uppercase whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
                      "flex items-center justify-center rounded-full",
                      "bg-rose-500 text-white text-[10px] font-semibold shadow-[0_0_10px_rgba(248,113,113,0.9)]"
                    )}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </motion.button>

              {/* submenu HUD */}
              <AnimatePresence>
                {activeSubmenu === item.id && item.children && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={cn(
                      "absolute z-50 min-w-[190px] rounded-xl border border-slate-500/60 bg-slate-950/95 backdrop-blur-2xl p-2 shadow-[0_18px_40px_rgba(15,23,42,0.98)]",
                      position === "top"
                        ? "top-full mt-2 left-0"
                        : position === "bottom"
                        ? "bottom-full mb-2 left-0"
                        : position === "left"
                        ? "left-full ml-2 top-0"
                        : "right-full mr-2 top-0"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-[1px] rounded-[0.9rem] border border-transparent bg-[conic-gradient(from_150deg,rgba(59,245,255,0.35),rgba(192,132,252,0.35),rgba(59,245,255,0.35))] opacity-40 mix-blend-soft-light" />

                    <div className="relative z-10 flex flex-col gap-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            child.onClick?.();
                            onItemClick?.(child.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800/70 transition-colors"
                        >
                          <span className="text-cyan-200">{child.icon}</span>
                          <span>{child.label}</span>
                          {child.badge !== undefined && child.badge > 0 && (
                            <span className="ml-auto rounded-full bg-cyan-400/15 px-1.5 py-0.5 text-[10px] text-cyan-200">
                              {child.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* indicador de expansión tipo “chevron cuántico” */}
        <motion.div
          className={cn(
            "flex items-center justify-center",
            styles.layout === "flex-col"
              ? "mt-2 pt-2 border-t border-slate-700/40"
              : "ml-2 pl-2 border-l border-slate-700/40"
          )}
        >
          <motion.div
            animate={{
              rotate:
                position === "top"
                  ? isExpanded
                    ? 180
                    : 0
                  : position === "bottom"
                  ? isExpanded
                    ? 0
                    : 180
                  : position === "left"
                  ? isExpanded
                    ? 90
                    : -90
                  : isExpanded
                  ? -90
                  : 90,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex h-5 w-5 items-center justify-center text-cyan-200"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M9 18l6-6-6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RetractableToolbar;

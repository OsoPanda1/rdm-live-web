// @ts-nocheck
import { useState } from "react";
import { useMusicPlayer } from "@/modules/music/hooks/useMusicPlayer";

interface DonationOption {
  amount: number;
  label: string;
}

const DONATION_OPTIONS: DonationOption[] = [
  { amount: 25, label: "$25 MXN" },
  { amount: 50, label: "$50 MXN" },
  { amount: 100, label: "$100 MXN" },
  { amount: 200, label: "$200 MXN" },
  { amount: 500, label: "$500 MXN" },
  { amount: 1000, label: "$1000 MXN" },
];

export const ArchivoSonoro: React.FC = () => {
  const { tracks, currentTrack, isPlaying, play, togglePlay } = useMusicPlayer();
  const [customAmount, setCustomAmount] = useState<string>("");

  const handleDonate = async (amount: number) => {
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          currency: "mxn",
          message: "Donación desde Archivo Sonoro",
        }),
      });

      if (!res.ok) {
        console.error("Error iniciando donación");
        return;
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error("Error en donación", err);
    }
  };

  const handleCustomDonation = () => {
    const value = Number(customAmount);
    if (!Number.isFinite(value) || value < 25) {
      alert("El monto mínimo es 25 MXN.");
      return;
    }
    void handleDonate(value);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-[0.25em] text-zinc-100 uppercase">
          Archivo Sonoro · Real del Monte
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          Conservemos viva la memoria de Real del Monte. Cada canción forma parte
          de un esfuerzo independiente para preservar, documentar y difundir la
          identidad cultural de nuestro pueblo.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {tracks.map((track, idx) => {
              const isActive = currentTrack?.slug === track.slug;
              return (
                <button
                  key={track.slug}
                  onClick={() => { if (isActive) { togglePlay(); } else { play(); } }}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition
                    ${
                      isActive
                        ? "border-emerald-500 bg-emerald-950/20"
                        : "border-zinc-700 bg-zinc-900/60 hover:border-zinc-500"
                    }`}
                >
                  <img
                    src={track.cover_url ?? ""}
                    alt={track.title}
                    className="w-14 h-14 rounded-md object-cover border border-zinc-700"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-50 font-semibold">
                      {track.title}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {track.artist}
                    </span>
                    {isActive && (
                      <span className="mt-1 text-[10px] text-emerald-300 font-mono uppercase tracking-[0.18em]">
                        {isPlaying ? "Reproduciendo…" : "Pausado"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {tracks.length === 0 && (
            <p className="text-sm text-zinc-500 mt-4">
              Pronto encontrarás aquí las primeras piezas del archivo sonoro.
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/70">
            <h2 className="text-sm font-semibold text-zinc-100">
              Conservemos viva la memoria de Real del Monte
            </h2>
            <p className="mt-2 text-[12px] text-zinc-400">
              RDM Digital es financiado actualmente por su fundador y equipo de
              desarrollo. Tu aportación nos ayuda a cubrir:
            </p>
            <ul className="mt-2 text-[12px] text-zinc-400 list-disc list-inside space-y-1">
              <li>Infraestructura tecnológica y servidores.</li>
              <li>Almacenamiento multimedia y archivo histórico.</li>
              <li>Desarrollo de nuevas funciones.</li>
              <li>Digitalización del patrimonio local.</li>
              <li>Expansión futura de servicios comunitarios.</li>
            </ul>
            <p className="mt-2 text-[12px] text-zinc-400">
              Si este proyecto te inspira, considera apoyar su crecimiento.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-emerald-600/60 bg-emerald-950/20">
            <h3 className="text-sm font-semibold text-emerald-300">
              Donar al Archivo Sonoro
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DONATION_OPTIONS.map((opt) => (
                <button
                  key={opt.amount}
                  onClick={() => void handleDonate(opt.amount)}
                  className="text-xs px-2 py-2 rounded-md bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-[11px] text-zinc-300 mb-1">
                Otra cantidad (mínimo $25 MXN)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={25}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 px-2 py-1 rounded-md border border-zinc-600 bg-zinc-900 text-sm text-zinc-100"
                />
                <button
                  onClick={handleCustomDonation}
                  className="px-3 py-1 rounded-md bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
                >
                  Donar
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ArchivoSonoro;
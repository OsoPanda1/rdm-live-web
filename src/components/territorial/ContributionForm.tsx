import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Camera, MessageSquare, Route, Lightbulb, AlertTriangle, Send, X, CheckCircle2 } from 'lucide-react';
import type { ContributionType, ContributionPayload } from '@/core/territorial/types';

interface ContributionFormProps {
  userId: string;
  coords: { lat: number; lng: number };
  poiId?: string;
  poiName?: string;
  onSubmit: (type: ContributionType, payload: ContributionPayload) => Promise<void>;
  onClose: () => void;
}

type FormStep = 'select_type' | 'fill_data' | 'confirm';

const CONTRIBUTION_TYPES: { type: ContributionType; icon: typeof MapPin; label: string; description: string; color: string }[] = [
  { type: 'checkin', icon: MapPin, label: 'Check-in', description: 'Marca tu visita a un lugar', color: '#22C55E' },
  { type: 'review', icon: MessageSquare, label: 'Resena', description: 'Comparte tu experiencia', color: '#3B82F6' },
  { type: 'rating', icon: Star, label: 'Calificacion', description: 'Valora este lugar', color: '#8B5CF6' },
  { type: 'photo', icon: Camera, label: 'Foto', description: 'Sube una imagen del lugar', color: '#F59E0B' },
  { type: 'tip', icon: Lightbulb, label: 'Consejo', description: 'Comparte conocimiento local', color: '#EC4899' },
  { type: 'route_trace', icon: Route, label: 'Ruta', description: 'Registra tu recorrido', color: '#06B6D4' },
];

export function ContributionForm({ userId, coords, poiId, poiName, onSubmit, onClose }: ContributionFormProps) {
  const [step, setStep] = useState<FormStep>('select_type');
  const [selectedType, setSelectedType] = useState<ContributionType | null>(null);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTypeSelect = useCallback((type: ContributionType) => {
    setSelectedType(type);
    setStep('fill_data');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedType) return;
    setIsSubmitting(true);

    try {
      let payload: ContributionPayload;

      switch (selectedType) {
        case 'checkin':
          payload = { type: 'checkin', poiName: poiName ?? 'Lugar en Real del Monte' };
          break;
        case 'review':
          payload = { type: 'review', text, rating, language: 'es', categories: [category] };
          break;
        case 'rating':
          payload = { type: 'rating', score: rating, category };
          break;
        case 'tip':
          payload = { type: 'tip', text, category: 'local_knowledge', helpful: 0 };
          break;
        case 'photo':
          payload = { type: 'photo', caption: text, tags: [category], imageUrl: undefined };
          break;
        case 'route_trace':
          payload = { type: 'route_trace', waypoints: [{ lat: coords.lat, lng: coords.lng, timestamp: new Date() }], distanceKm: 0, durationMinutes: 0, transportMode: 'walking' };
          break;
        default:
          payload = { type: 'checkin', poiName: poiName ?? 'Real del Monte' };
      }

      await onSubmit(selectedType, payload);
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedType, text, rating, category, poiName, coords, onSubmit, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="rdm-glass rounded-2xl border border-border/40 p-5 max-w-md w-full"
      >
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-display text-lg text-foreground">Contribucion enviada</p>
            <p className="text-sm text-muted-foreground mt-1">Isabella agradece tu aporte al territorio</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">
                {step === 'select_type' ? 'Contribuir al Mapa Vivo' : 'Detalles de tu contribucion'}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/30 rounded-lg p-2">
              <MapPin className="w-3 h-3 text-rdm-amber" />
              <span>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
              {poiName && <span className="text-rdm-amber">· {poiName}</span>}
            </div>

            {step === 'select_type' && (
              <div className="grid grid-cols-2 gap-2">
                {CONTRIBUTION_TYPES.map(({ type, icon: Icon, label, description, color }) => (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/50 p-3 hover:border-rdm-amber/40 hover:bg-muted/30 transition-all text-center"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 'fill_data' && selectedType && (
              <div className="space-y-4">
                {(selectedType === 'review' || selectedType === 'tip') && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {selectedType === 'review' ? 'Tu resena' : 'Tu consejo'}
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={selectedType === 'review' ? 'Comparte tu experiencia...' : 'Un dato util para otros viajeros...'}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-24"
                    />
                  </div>
                )}

                {(selectedType === 'rating' || selectedType === 'review') && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Calificacion</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= rating ? 'text-rdm-amber fill-rdm-amber' : 'text-muted-foreground'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedType === 'photo' && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Descripcion de la foto</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Describe la imagen..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep('select_type')}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Atras
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (selectedType !== 'rating' && selectedType !== 'checkin' && !text.trim())}
                    className="flex-1 rounded-xl bg-rdm-amber px-3 py-2 text-sm font-medium text-white hover:bg-rdm-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Enviando...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Enviar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Tus contribuciones son verificadas por Isabella y la comunidad
            </p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

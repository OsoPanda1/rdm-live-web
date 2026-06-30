import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, CheckCircle, AlertCircle, Info, AlertTriangle,
  MapPin, Calendar, Utensils, MessageSquare, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationType = "success" | "error" | "warning" | "info" | "event" | "food" | "place" | "message";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: React.ElementType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = crypto.randomUUID().slice(0, 8);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 5));
    
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, [removeNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
      {/* Notifications rendered inline, no separate component with ref issues */}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-32px)]">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  event: Calendar,
  food: Utensils,
  place: MapPin,
  message: MessageSquare,
};

const notificationColors: Record<NotificationType, string> = {
  success: "from-emerald-500 to-emerald-600",
  error: "from-red-500 to-red-600",
  warning: "from-amber-500 to-amber-600",
  info: "from-electric to-electric-light",
  event: "from-purple-500 to-purple-600",
  food: "from-gold to-gold-dark",
  place: "from-terracotta to-copper",
  message: "from-primary to-navy-light",
};

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: () => void;
}) {
  const Icon = notification.icon || notificationIcons[notification.type];
  const gradientClass = notificationColors[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="glass-dark rounded-2xl overflow-hidden shadow-elevated"
      style={{ border: "1px solid hsla(210,100%,55%,0.15)" }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shrink-0 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm" style={{ color: "hsl(0,0%,95%)" }}>{notification.title}</h4>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "hsl(210,20%,60%)" }}>{notification.message}</p>
          {notification.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs border-electric/30 text-electric hover:bg-electric/10"
              onClick={() => {
                notification.action?.onClick();
                onRemove();
              }}
            >
              {notification.action.label}
            </Button>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" style={{ color: "hsl(210,20%,50%)" }} />
        </button>
      </div>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
        className={`h-[2px] bg-gradient-to-r ${gradientClass} opacity-60`}
      />
    </motion.div>
  );
}

// Predefined notifications for common scenarios
export const predefinedNotifications = {
  welcome: () => ({
    type: "info" as NotificationType,
    title: "¡Bienvenido a Real del Monte!",
    message: "Descubre la magia de este Pueblo Mágico único en el mundo.",
    icon: Heart,
  }),
  festivalReminder: (festivalName: string, date: string) => ({
    type: "event" as NotificationType,
    title: "Próximo Festival",
    message: `${festivalName} se aproxima. Marca en tu calendario: ${date}`,
    icon: Calendar,
  }),
  routeCompleted: (routeName: string) => ({
    type: "success" as NotificationType,
    title: "¡Ruta Completada!",
    message: `Has terminado la ${routeName}. Esperamos que hayas disfrutado la experiencia.`,
  }),
  newPlaceNearby: (placeName: string) => ({
    type: "place" as NotificationType,
    title: "Lugar Cercano",
    message: `Estás cerca de ${placeName}. ¿Te gustaría visitarlo?`,
    icon: MapPin,
  }),
  foodRecommendation: (dishName: string) => ({
    type: "food" as NotificationType,
    title: "Recomendación Gastronómica",
    message: `No te vayas sin probar ${dishName}, un platillo único de Real del Monte.`,
  }),
  weatherAlert: (condition: string) => ({
    type: "warning" as NotificationType,
    title: "Alerta Climática",
    message: `Se espera ${condition} en las próximas horas. Toma precauciones.`,
  }),
  messageReceived: (from: string) => ({
    type: "message" as NotificationType,
    title: "Nuevo Mensaje",
    message: `Has recibido un mensaje de ${from}`,
  }),
};

export function useNotificationHelpers() {
  const { addNotification } = useNotifications();
  
  return {
    notifyWelcome: () => addNotification(predefinedNotifications.welcome()),
    notifyFestival: (name: string, date: string) => addNotification(predefinedNotifications.festivalReminder(name, date)),
    notifyRouteCompleted: (name: string) => addNotification(predefinedNotifications.routeCompleted(name)),
    notifyNearbyPlace: (name: string) => addNotification(predefinedNotifications.newPlaceNearby(name)),
    notifyFood: (name: string) => addNotification(predefinedNotifications.foodRecommendation(name)),
    notifyWeather: (condition: string) => addNotification(predefinedNotifications.weatherAlert(condition)),
    notifyMessage: (from: string) => addNotification(predefinedNotifications.messageReceived(from)),
    notifySuccess: (title: string, message: string) => addNotification({ type: "success", title, message }),
    notifyError: (title: string, message: string) => addNotification({ type: "error", title, message }),
    notifyInfo: (title: string, message: string) => addNotification({ type: "info", title, message }),
    notifyWarning: (title: string, message: string) => addNotification({ type: "warning", title, message }),
  };
}

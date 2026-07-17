/**
 * Isabella Orb - Portal flotante para chat con Isabella AI
 * Orbe 3D que se transforma en ventana de chat
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsabella } from '@/hooks/useIsabella';

const IsabellaOrb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, sendMessage, error } = useIsabella();

  // Dibujar orbe animado
  useEffect(() => {
    if (isOpen) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 120;
    canvas.height = 120;

    let time = 0;
    let animationId: number;

    const drawOrb = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 40;

      // Anillos pulsantes
      for (let i = 0; i < 3; i++) {
        const pulseRadius = baseRadius + 10 + Math.sin(time * 0.02 + i * 0.5) * 8;
        const alpha = 0.3 - i * 0.1;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius + i * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Gradiente central
      const gradient = ctx.createRadialGradient(
        centerX - 10, centerY - 10, 5,
        centerX, centerY, baseRadius
      );
      gradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 80, 200, 0.5)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Partículas orbitando
      for (let i = 0; i < 6; i++) {
        const angle = (time * 0.03) + (i * Math.PI / 3);
        const orbitRadius = 35 + Math.sin(time * 0.02 + i) * 5;
        const px = centerX + Math.cos(angle) * orbitRadius;
        const py = centerY + Math.sin(angle) * orbitRadius;
        
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(155, 135, 245, 0.8)';
        ctx.fill();
      }

      // Core brillante
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();

      time++;
      animationId = requestAnimationFrame(drawOrb);
    };

    drawOrb();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isOpen]);

  // Auto scroll a nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Orbe flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-6 right-6 z-50 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <canvas ref={canvasRef} className="w-[120px] h-[120px]" />
            
            {/* Label */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs whitespace-nowrap">
                Habla con Isabella
              </div>
            </div>

            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-cyan-500/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Isabella Villaseñor AI</h3>
                  <p className="text-xs text-muted-foreground">Triple Federado Activo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="h-8 w-8"
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-80 p-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Hola, soy Isabella. ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[85%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs">Isabella está escribiendo...</span>
                </div>
              )}
              
              {error && (
                <div className="text-center py-2">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-background/50 border-border/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IsabellaOrb;

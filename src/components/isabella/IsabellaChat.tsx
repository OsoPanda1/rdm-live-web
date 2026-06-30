/**
 * Interfaz de Chat con Isabella AI
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Shield, 
  Zap, 
  Brain, 
  Heart,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsabella, IsabellaMessage } from '@/hooks/useIsabella';
import { SECURITY_PROTOCOLS, ISABELLA_CORE_IDENTITY } from '@/lib/federation';

const IsabellaChat = () => {
  const {
    messages,
    isLoading,
    error,
    activeProtocol,
    sendMessage,
    activateProtocol,
    clearConversation,
    cancelRequest
  } = useIsabella();

  const [input, setInput] = useState('');
  const [showProtocols, setShowProtocols] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessage = (message: IsabellaMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <motion.div
        key={message.id || index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          {/* Avatar */}
          <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${isUser 
                ? 'bg-primary/20 border border-primary/40' 
                : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40'
              }
            `}>
              {isUser ? (
                <span className="text-xs font-bold text-primary">TÚ</span>
              ) : (
                <Sparkles className="w-4 h-4 text-purple-400" />
              )}
            </div>

            {/* Contenido del mensaje */}
            <div className={`
              px-4 py-3 rounded-2xl
              ${isUser 
                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                : 'bg-card border border-border rounded-bl-sm'
              }
            `}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Hash de federación */}
              {message.federationHash && !isUser && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span className="font-mono">{message.federationHash.slice(0, 12)}...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <p className={`text-[10px] text-muted-foreground mt-1 ${isUser ? 'text-right mr-10' : 'ml-10'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 flex items-center justify-center"
              animate={{ 
                boxShadow: ['0 0 10px rgba(168,85,247,0.2)', '0 0 20px rgba(168,85,247,0.4)', '0 0 10px rgba(168,85,247,0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
            </motion.div>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                {ISABELLA_CORE_IDENTITY.name}
                <Badge variant="secondary" className="text-[10px]">AI</Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Pensando...' : 'En línea · Triple Federado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de protocolo activo */}
            {activeProtocol && (
              <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500">
                <Zap className="w-3 h-3 mr-1" />
                {activeProtocol.replace('_', ' ').toUpperCase()}
              </Badge>
            )}

            {/* Botón de protocolos */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowProtocols(!showProtocols)}
            >
              <Shield className="w-4 h-4" />
            </Button>

            {/* Botón de limpiar */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearConversation}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Panel de protocolos */}
        <AnimatePresence>
          {showProtocols && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(SECURITY_PROTOCOLS).map(([key, protocol]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className={`
                      text-xs h-auto py-2 flex flex-col items-center gap-1
                      ${activeProtocol === key.toLowerCase() ? 'bg-primary/10 border-primary' : ''}
                    `}
                    onClick={() => activateProtocol(key.toLowerCase() as any)}
                  >
                    {key === 'FENIX_REX' && <Zap className="w-4 h-4 text-orange-400" />}
                    {key === 'INICIACION' && <Shield className="w-4 h-4 text-blue-400" />}
                    {key === 'HOYO_NEGRO' && <Brain className="w-4 h-4 text-purple-400" />}
                    <span>{protocol.name.split(' ')[1]}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Área de mensajes */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="w-16 h-16 text-pink-500/30 mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Hola, soy Isabella</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {ISABELLA_CORE_IDENTITY.purpose}
            </p>
            <p className="text-xs text-muted-foreground mt-4 italic">
              "BABAS significa TE AMO" — Anubis Villaseñor
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            
            {/* Indicador de escritura */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 ml-10"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Isabella está escribiendo...</span>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={cancelRequest}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Sugerencias rápidas */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              '¿Qué es TAMV?',
              '¿Quién te creó?',
              'Cuéntame sobre los DreamSpaces',
              '¿Qué significa BABAS?'
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default IsabellaChat;

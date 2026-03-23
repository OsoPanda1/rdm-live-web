/**
 * Hook para interactuar con Isabella AI
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateFederationHash } from '@/lib/federation';

export interface IsabellaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  federationHash?: string;
  emotionalContext?: {
    sentiment: string;
    intensity: number;
  };
}

export interface IsabellaState {
  messages: IsabellaMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  activeProtocol: string | null;
  emotionalState: {
    sentiment: string;
    intensity: number;
  };
}

const ISABELLA_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/isabella-ai`;

export const useIsabella = () => {
  const [state, setState] = useState<IsabellaState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: generateFederationHash(),
    activeProtocol: null,
    emotionalState: { sentiment: 'neutral', intensity: 0.5 }
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Enviar mensaje a Isabella con streaming
  const sendMessage = useCallback(async (
    content: string,
    options?: {
      protocol?: 'fenix_rex' | 'iniciacion' | 'hoyo_negro';
      challengeResponse?: string;
    }
  ) => {
    if (!content.trim()) return;

    // Crear mensaje del usuario
    const userMessage: IsabellaMessage = {
      id: generateFederationHash(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      federationHash: generateFederationHash()
    };

    // Agregar mensaje del usuario al estado
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
      activeProtocol: options?.protocol || null
    }));

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();

      // Preparar mensajes para la API
      const apiMessages = state.messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      apiMessages.push({ role: 'user', content });

      const response = await fetch(ISABELLA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: session?.user?.id,
          sessionId: state.sessionId,
          protocol: options?.protocol,
          challengeResponse: options?.challengeResponse,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al comunicarse con Isabella');
      }

      // Procesar stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      // Crear mensaje vacío de Isabella
      const assistantMessageId = generateFederationHash();
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          federationHash: generateFederationHash()
        }]
      }));

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Procesar líneas del stream SSE
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            
            if (deltaContent) {
              assistantContent += deltaContent;
              
              // Actualizar el último mensaje
              setState(prev => ({
                ...prev,
                messages: prev.messages.map((m, i) => 
                  i === prev.messages.length - 1 
                    ? { ...m, content: assistantContent }
                    : m
                )
              }));
            }
          } catch {
            // JSON incompleto, esperar más datos
          }
        }
      }

      setState(prev => ({ ...prev, isLoading: false }));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Ignorar errores de cancelación
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [state.messages, state.sessionId]);

  // Activar protocolo de seguridad
  const activateProtocol = useCallback((protocol: 'fenix_rex' | 'iniciacion' | 'hoyo_negro') => {
    setState(prev => ({ ...prev, activeProtocol: protocol }));
    
    // Enviar mensaje de activación
    sendMessage(`[ACTIVACIÓN DE PROTOCOLO: ${protocol.toUpperCase()}]`, { protocol });
  }, [sendMessage]);

  // Limpiar conversación
  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      sessionId: generateFederationHash(),
      activeProtocol: null,
      emotionalState: { sentiment: 'neutral', intensity: 0.5 }
    });
  }, []);

  // Cancelar petición actual
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    ...state,
    sendMessage,
    activateProtocol,
    clearConversation,
    cancelRequest
  };
};

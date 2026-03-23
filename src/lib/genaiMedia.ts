import { GoogleGenAI, Modality } from '@google/genai';

export interface VideoBlock {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  script: string;
  voice: 'Zephyr' | 'Kore' | string;
}

export const VIDEO_BLOCKS: VideoBlock[] = [
  {
    id: 'block1',
    title: 'El Escenario',
    subtitle: 'El Gemelo Digital y RDM Digital',
    prompt:
      'Cinematic drone shot of Real del Monte, Mexico, transitioning from a traditional misty mountain town into a glowing, translucent digital twin mesh. Hyper-realistic, 8k, futuristic UI overlays with floating holographic data points showing real-time geolocation. Minimalist luxury aesthetic, sleek metallic textures, neon amber and deep cobalt blue color palette. Smooth camera glide, high-end architectural visualization style.',
    script: 'Bienvenidos a la evolución. RDM Digital: El primer Gemelo Digital de un Pueblo Mágico.',
    voice: 'Zephyr',
  },
  {
    id: 'block2',
    title: 'La Experiencia',
    subtitle: 'Turista y Comerciante',
    prompt:
      "Split-screen sequence. Left: A tourist interacting with a sophisticated floating holographic interface (Realito AI) that glows softly in the mist. Right: A local merchant viewing a high-end, zero-commission digital dashboard with complex data visualizations. Futuristic 'Golden Hour' lighting, soft bokeh, ultra-detailed textures. Atmosphere of efficiency, prosperity, and digital sovereignty.",
    script:
      'Bajo el modelo de las 7 Federaciones, conectamos al turista con Realito AI y protegemos al comerciante local con soberanía financiera total y cero comisiones.',
    voice: 'Kore',
  },
  {
    id: 'block3',
    title: 'El Visionario',
    subtitle: 'Reconocimiento del CEO',
    prompt:
      "Macro shot of a high-tech laboratory environment. A silhouette of a visionary leader (Edwin Oswaldo Castillo Trejo) looking at a world map of technological nodes. Background features subtle, elegant logos of OpenAI, AVIXA, and WEF appearing as prestigious digital seals of approval. Lighting is dramatic, 'Chiaroscuro' style, emphasizing authority and wisdom. Text in elegant, thin typography: 'Global Visionary'.",
    script:
      'Una obra de ingeniería liderada por Edwin Oswaldo Castillo Trejo, orgulloso realmontense y visionario validado por OpenAI, AVIXA y el Foro Económico Mundial.',
    voice: 'Zephyr',
  },
  {
    id: 'block4',
    title: 'El Cierre',
    subtitle: 'Referente Nacional',
    prompt:
      "Final epic shot: The town of Real del Monte at night, fully illuminated by golden digital ley-lines connecting every building. The RDM Digital logo emerges in a minimalist, liquid-metal effect. Text overlay: 'Pionero Nacional'. Style: Apple-event clean aesthetic, high-frame rate, sophisticated motion blur, deep cinematic shadows.",
    script: 'Real del Monte: El primer destino de México 100% digitalizado. El futuro es hoy.',
    voice: 'Kore',
  },
];

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set VITE_API_KEY or VITE_GEMINI_API_KEY in your environment.');
  }

  return apiKey;
}

export async function generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio,
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed');
  }

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch generated video: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function generateAudio(text: string, voiceName = 'Zephyr') {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

  if (!audioData) {
    throw new Error('Audio generation failed');
  }

  const binary = atob(audioData);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

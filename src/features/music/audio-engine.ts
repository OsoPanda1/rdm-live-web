/**
 * RDM Ecos Música — Spatial Audio Engine
 * Web Audio API with 3D spatial profiles
 *
 * Three modes:
 * - Archivo: Pure lossless playback, no processing
 * - Espacio: Simulated acoustics of RDM locations
 * - Metaverso: Full spatial with XR effects
 */

import type { SpatialMode, SpatialProfile, MusicTrack, NowPlaying } from './types';

// ============================================================================
// AUDIO CONTEXT SINGLETON
// ============================================================================

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let convolverNode: ConvolverNode | null = null;
let pannerNode: PannerNode | null = null;
let analyserNode: AnalyserNode | null = null;
let eqFilters: BiquadFilterNode[] = [];

const audioElement = new Audio();
audioElement.crossOrigin = 'anonymous';

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;

    // Create EQ filters (3-band)
    const low = audioContext.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 200;
    const mid = audioContext.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 0.5;
    const high = audioContext.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 3000;
    eqFilters = [low, mid, high];

    // Chain: source → EQ → convolver → panner → master → analyser → destination
    masterGain.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
  }
  return audioContext;
}

// ============================================================================
// SPATIAL PROFILE APPLICATION
// ============================================================================

/**
 * Applies a spatial profile to the audio chain.
 */
export function applySpatialProfile(profile: SpatialProfile, mode: SpatialMode): void {
  const ctx = getAudioContext();

  // Disconnect previous nodes
  disconnectSpatial();

  if (mode === 'archivo') {
    // Pure playback — no spatial processing
    return;
  }

  // Create convolver for reverb
  convolverNode = ctx.createConvolver();
  const reverbLength = ctx.sampleRate * (profile.reverb * 3);
  const impulse = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < reverbLength; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2.5);
    }
  }
  convolverNode.buffer = impulse;

  // Create panner for 3D positioning
  if (profile.panorama) {
    pannerNode = ctx.createPanner();
    pannerNode.panningModel = profile.hrtf ? 'HRTF' : 'equalpower';
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 100;
    pannerNode.rolloffFactor = 1;
    // Start centered
    pannerNode.positionX.setValueAtTime(0, ctx.currentTime);
    pannerNode.positionY.setValueAtTime(0, ctx.currentTime);
    pannerNode.positionZ.setValueAtTime(mode === 'metaverso' ? -2 : -1, ctx.currentTime);
  }

  // Connect chain
  if (sourceNode) {
    sourceNode.disconnect();
    if (eqFilters.length > 0) {
      sourceNode.connect(eqFilters[0]);
      eqFilters[0].connect(eqFilters[1]);
      eqFilters[1].connect(eqFilters[2]);
      eqFilters[2].connect(convolverNode);
    } else {
      sourceNode.connect(convolverNode);
    }
  }

  if (pannerNode) {
    convolverNode.connect(pannerNode);
    pannerNode.connect(masterGain!);
  } else {
    convolverNode.connect(masterGain!);
  }

  // Metaverso effects
  if (mode === 'metaverso' && profile.effects) {
    for (const effect of profile.effects) {
      applyMetaversoEffect(effect);
    }
  }
}

function applyMetaversoEffect(effect: string): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  switch (effect) {
    case 'chorus': {
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.03;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 1.5;
      lfoGain.gain.value = 0.005;
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start();
      if (pannerNode) {
        pannerNode.connect(delay);
        delay.connect(masterGain!);
      }
      break;
    }
    case 'echo': {
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.4;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      delay.connect(feedback);
      feedback.connect(delay);
      if (pannerNode) {
        pannerNode.connect(delay);
        delay.connect(masterGain!);
      }
      break;
    }
    case 'rain':
    case 'wind':
    case 'dripping':
    case 'mine_echo':
    case 'mountain_echo':
    case 'procession':
    case 'church_bells':
    case 'ambient_crowd':
    case 'festive':
    case 'spatial_walk':
    case 'reverb_plaza':
      // These would be implemented with sample-based effects
      // For now, just increase reverb
      break;
  }
}

function disconnectSpatial(): void {
  try {
    sourceNode?.disconnect();
    convolverNode?.disconnect();
    pannerNode?.disconnect();
  } catch {
    // Ignore disconnect errors
  }
  pannerNode = null;
  convolverNode = null;
}

// ============================================================================
// PLAYBACK CONTROLS
// ============================================================================

export function playTrack(track: MusicTrack, mode: SpatialMode = 'archivo'): void {
  const ctx = getAudioContext();

  // Resume context if suspended
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // Create source if needed
  if (!sourceNode) {
    sourceNode = ctx.createMediaElementSource(audioElement);
  }

  // Set audio source (use MP3 for now, FLAC when available)
  const src = track.file_mp3_320 || track.file_mp3_128 || track.file_flac || '';
  if (src && audioElement.src !== src) {
    audioElement.src = src;
  }

  // Apply spatial profile
  const profile = track.spatial_profiles?.[mode] || { reverb: 0.1 };
  applySpatialProfile(profile, mode);

  audioElement.play();
}

export function pauseTrack(): void {
  audioElement.pause();
}

export function resumeTrack(): void {
  audioElement.play();
}

export function seekTo(timeMs: number): void {
  audioElement.currentTime = timeMs / 1000;
}

export function setVolume(volume: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}

export function getCurrentTime(): number {
  return audioElement.currentTime * 1000;
}

export function getDuration(): number {
  return audioElement.duration * 1000 || 0;
}

export function isPlaying(): boolean {
  return !audioElement.paused;
}

// ============================================================================
// ANALYSER DATA (for visualizer)
// ============================================================================

export function getFrequencyData(): Uint8Array {
  if (!analyserNode) return new Uint8Array(0);
  const data = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(data);
  return data;
}

export function getTimeDomainData(): Uint8Array {
  if (!analyserNode) return new Uint8Array(0);
  const data = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteTimeDomainData(data);
  return data;
}

export function getAverageFrequency(): number {
  const data = getFrequencyData();
  if (data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum / data.length / 255;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

export function onTrackEnd(callback: () => void): void {
  audioElement.addEventListener('ended', callback);
}

export function onTimeUpdate(callback: (timeMs: number) => void): void {
  audioElement.addEventListener('timeupdate', () => {
    callback(audioElement.currentTime * 1000);
  });
}

export function onError(callback: (error: string) => void): void {
  audioElement.addEventListener('error', () => {
    callback(audioElement.error?.message || 'Unknown error');
  });
}

// Clean up
export function destroy(): void {
  audioElement.pause();
  audioElement.src = '';
  disconnectSpatial();
  audioContext?.close();
  audioContext = null;
  masterGain = null;
  sourceNode = null;
  analyserNode = null;
}

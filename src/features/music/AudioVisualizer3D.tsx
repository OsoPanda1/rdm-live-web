import { useRef, useEffect, useCallback } from "react";
import { getFrequencyData, getAverageFrequency } from "./audio-engine";

interface VisualizerProps {
  width?: number;
  height?: number;
  className?: string;
  mode?: "waves" | "particles" | "terrain";
}

/**
 * 3D Audio Visualizer using WebGL (no Three.js dependency).
 * Renders reactive geometry driven by Web Audio API frequency data.
 */
export function AudioVisualizer3D({
  width = 600,
  height = 300,
  className = "",
  mode = "waves",
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const intensityRef = useRef(0);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return false;

    glRef.current = gl;

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      attribute float a_frequency;
      uniform float u_time;
      uniform float u_intensity;
      uniform vec2 u_resolution;
      varying float v_frequency;
      varying float v_x;
      varying float v_y;

      void main() {
        v_frequency = a_frequency;
        v_x = a_position.x;
        v_y = a_position.y;

        vec2 pos = a_position;

        // Displace Y based on frequency and time
        pos.y += sin(pos.x * 3.14159 + u_time * 0.5) * a_frequency * 0.15 * u_intensity;
        pos.y += cos(pos.x * 6.28 + u_time * 0.3) * a_frequency * 0.05 * u_intensity;

        // Convert to clip space
        gl_Position = vec4(pos, 0.0, 1.0);
        gl_PointSize = 2.0 + a_frequency * 4.0 * u_intensity;
      }
    `;

    // Fragment shader
    const fsSource = `
      precision mediump float;
      varying float v_frequency;
      varying float v_x;
      varying float v_y;
      uniform float u_time;
      uniform float u_intensity;

      void main() {
        // Color based on frequency and position
        float r = 0.17 + v_frequency * 0.33 + sin(u_time * 0.2 + v_x * 2.0) * 0.1;
        float g = 0.31 + v_frequency * 0.15;
        float b = 0.21 + v_frequency * 0.55 + cos(u_time * 0.3 + v_x * 3.0) * 0.1;
        float a = 0.3 + v_frequency * 0.7 * u_intensity;

        // Glow effect
        float glow = smoothstep(0.0, 0.3, v_frequency) * 0.3;

        gl_FragColor = vec4(r + glow, g + glow * 0.5, b + glow, a);
      }
    `;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    programRef.current = program;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    timeRef.current += 0.016;
    const freqData = getFrequencyData();
    const avgFreq = getAverageFrequency();
    intensityRef.current += (avgFreq - intensityRef.current) * 0.1;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Generate geometry based on mode
    const segments = Math.min(freqData.length, 128);
    const vertices: number[] = [];
    const frequencies: number[] = [];

    for (let i = 0; i < segments; i++) {
      const x = (i / (segments - 1)) * 2 - 1; // -1 to 1
      const y = 0;
      const freq = freqData[i] ? freqData[i] / 255 : 0;

      if (mode === "waves") {
        vertices.push(x, y);
        frequencies.push(freq);
      } else if (mode === "particles") {
        // Scatter particles
        const angle = (i / segments) * Math.PI * 2 + timeRef.current * 0.2;
        const radius = 0.3 + freq * 0.4;
        vertices.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
        );
        frequencies.push(freq);
      } else if (mode === "terrain") {
        // Terrain-like visualization
        const row = Math.floor(i / 32);
        const col = i % 32;
        const x = (col / 31) * 2 - 1;
        const y = (row / 3) * 0.4 - 0.2;
        vertices.push(x, y);
        frequencies.push(freq);
      }
    }

    // Upload position attribute
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Upload frequency attribute
    const freqBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, freqBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(frequencies), gl.DYNAMIC_DRAW);
    const freqLoc = gl.getAttribLocation(program, "a_frequency");
    gl.enableVertexAttribArray(freqLoc);
    gl.vertexAttribPointer(freqLoc, 1, gl.FLOAT, false, 0, 0);

    // Set uniforms
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), timeRef.current);
    gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), 0.3 + intensityRef.current * 0.7);
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);

    // Draw
    const drawMode = mode === "particles" ? gl.POINTS : gl.LINE_STRIP;
    gl.drawArrays(drawMode, 0, segments);

    // Cleanup buffers
    gl.deleteBuffer(posBuffer);
    gl.deleteBuffer(freqBuffer);

    animFrameRef.current = requestAnimationFrame(render);
  }, [width, height, mode]);

  useEffect(() => {
    initGL();
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initGL, render]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}

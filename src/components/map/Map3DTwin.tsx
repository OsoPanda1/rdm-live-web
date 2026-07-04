import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { PlaneGeometry, ShaderMaterial, FogExp2 } from "three";
import type { MapMarkerData, MapViewportState } from "@/features/places/mapTypes";
import { LoadingFallback } from "@/components/LoadingFallback";

const GEO_LNG_OFFSET = 98.6732;
const GEO_LAT_OFFSET = 20.1374;
const GEO_COORD_SCALE = 160;

interface Map3DTwinProps {
  viewport: MapViewportState;
  markers: MapMarkerData[];
  onViewportChange: (next: Partial<MapViewportState>) => void;
}

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;

  const canvas = document.createElement("canvas");
  const contexts = ["webgl2", "webgl", "experimental-webgl"] as const;
  return contexts.some((contextName) => {
    try {
      return Boolean(canvas.getContext(contextName));
    } catch {
      return false;
    }
  });
}

function FoggyTerrain({ points }: { points: MapMarkerData[] }) {
  const geom = useMemo(() => {
    const geometry = new PlaneGeometry(18, 18, 120, 120);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const wave = Math.sin(x * 0.75) * 0.25 + Math.cos(y * 0.9) * 0.18;
      const noise = Math.sin((x + y) * 1.8) * 0.12;
      positions.setZ(i, wave + noise);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group rotation-x={-Math.PI / 2.8}>
      <mesh geometry={geom} receiveShadow castShadow>
        <meshStandardMaterial
          color="#1b2539"
          metalness={0.15}
          roughness={0.95}
          emissive="#1f2f4d"
          emissiveIntensity={0.1}
        />
      </mesh>
      {points.map((point) => (
        <mesh
          key={point.id}
          position={[(point.lng + GEO_LNG_OFFSET) * GEO_COORD_SCALE, 0.18, -(point.lat - GEO_LAT_OFFSET) * GEO_COORD_SCALE]}
          castShadow
        >
          <sphereGeometry args={[point.isPremium ? 0.18 : 0.13, 24, 24]} />
          <meshStandardMaterial
            color={point.isPremium ? "#f59e0b" : point.type === "place" ? "#60a5fa" : "#34d399"}
            emissive={point.isPremium ? "#f59e0b" : "#6ea8ff"}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}


function FogPlane() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float wave = sin((vUv.x * 9.0) + uTime * 0.28) * 0.08;
            float band = smoothstep(0.25 + wave, 0.82 + wave, vUv.y);
            float alpha = (1.0 - band) * 0.22;
            gl_FragColor = vec4(0.74, 0.8, 0.92, alpha);
          }
        `,
      }),
    [],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 1.25, 0]} rotation-x={-Math.PI / 2} material={material}>
      <planeGeometry args={[18, 18, 1, 1]} />
    </mesh>
  );
}

function Atmosphere() {
  const { scene } = useThree();
  const fogRef = useRef(new FogExp2("#0b1323", 0.055));

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.45} color="#d6ddf0" />
      <spotLight
        position={[6, 12, 8]}
        intensity={1.05}
        angle={0.4}
        penumbra={0.55}
        color="#a6c2ff"
        castShadow
      />
      <spotLight position={[-8, 10, -6]} intensity={0.6} angle={0.52} color="#f7d6a0" />
      <pointLight position={[0, 8, 0]} intensity={0.25} color="#f59e0b" distance={20} />
      <Stars radius={80} depth={35} count={1500} factor={2.5} fade speed={0.3} />
    </>
  );
}

export function Map3DTwin({ viewport, markers, onViewportChange }: Map3DTwinProps) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    onViewportChange({ pitch: 55 });
    setWebglReady(isWebGLAvailable());
  }, [onViewportChange]);

  if (!webglReady) {
    return (
      <div className="relative flex h-[420px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1222] via-[#101a2f] to-[#0a0f1f] p-5 md:h-[640px]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-silver-500">Modo híbrido degradado</p>
          <h3 className="mt-2 text-xl font-semibold text-silver-100">Visualización 3D no disponible en este entorno</h3>
          <p className="mt-2 max-w-2xl text-sm text-silver-400">Se mantiene un mapa de nodos para Lovable/WebView y equipos sin WebGL habilitado.</p>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {markers.slice(0, 6).map((marker) => (
            <div key={marker.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-silver-300">
              <p className="font-medium text-silver-100">{marker.name}</p>
              <p className="text-xs text-silver-400">{marker.category} · {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070b14] md:h-[640px]">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,.12),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(245,158,11,.18),transparent_40%)]" />
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 48 }} dpr={[1, 1.5]}>
        <Suspense fallback={<LoadingFallback />}>
          <Atmosphere />
          <FoggyTerrain points={markers} />
          <FogPlane />
          <OrbitControls
            enablePan={false}
            maxDistance={16}
            minDistance={5}
            maxPolarAngle={Math.PI / 2.12}
            minPolarAngle={Math.PI / 3.4}
            autoRotate
            autoRotateSpeed={0.22}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-3 left-3 z-20 rounded-lg border border-white/15 bg-night-900/75 px-3 py-2 text-xs text-silver-300 backdrop-blur-sm">
        Gemelo Digital sincronizado · {viewport.lat.toFixed(4)}, {viewport.lng.toFixed(4)}
      </div>
    </div>
  );
}

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { Shield, AlertTriangle, CheckCircle2, Skull } from 'lucide-react';

// ─── Revolver Cylinder 3D Mesh ───────────────────────────────────────────────
function RevolverCylinderMesh({
  isSpinning,
  isResolved,
  chamberNumber,
  bulletChamber,
}: {
  isSpinning: boolean;
  isResolved: boolean;
  chamberNumber?: number;
  bulletChamber?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const spinSpeedRef = useRef(18);

  // 6 chambers arranged radially
  const chambers = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 6;
      const r = 1.12;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        index: i + 1,
        isBullet: bulletChamber !== undefined ? i + 1 === bulletChamber : i === 0,
      };
    });
  }, [bulletChamber]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    if (isSpinning) {
      groupRef.current.rotation.y += spinSpeedRef.current * delta;
      spinSpeedRef.current = Math.max(1.0, spinSpeedRef.current - delta * 7);
    } else if (isResolved && chamberNumber) {
      const target = ((chamberNumber - 1) * Math.PI * 2) / 6 + Math.PI * 4;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        target,
        delta * 5
      );
    } else {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── Cylinder outer body — warm gunmetal ── */}
      <Cylinder args={[1.65, 1.65, 2.3, 40]}>
        <meshStandardMaterial color="#3a3f44" metalness={0.75} roughness={0.35} />
      </Cylinder>

      {/* ── Central axis pin ── */}
      <Cylinder args={[0.28, 0.28, 2.5, 20]}>
        <meshStandardMaterial color="#5a6068" metalness={0.8} roughness={0.25} />
      </Cylinder>

      {/* ── 6 chamber bores ── */}
      {chambers.map((ch) => (
        <group key={ch.index} position={[ch.x, 0, ch.z]}>
          {/* Bore (dark tunnel effect) */}
          <Cylinder args={[0.40, 0.40, 2.35, 18]}>
            <meshStandardMaterial color="#111214" metalness={0.5} roughness={0.8} />
          </Cylinder>

          {/* Chamfer / rim ring around each bore */}
          <Cylinder args={[0.47, 0.47, 0.14, 18]} position={[0, 1.1, 0]}>
            <meshStandardMaterial color="#4a5058" metalness={0.9} roughness={0.2} />
          </Cylinder>
          <Cylinder args={[0.47, 0.47, 0.14, 18]} position={[0, -1.1, 0]}>
            <meshStandardMaterial color="#4a5058" metalness={0.9} roughness={0.2} />
          </Cylinder>

          {/* ── Brass bullet (visible only when chamber is resolved) ── */}
          {ch.isBullet && (
            <group>
              {/* Brass casing */}
              <Cylinder args={[0.33, 0.33, 1.5, 18]} position={[0, 0.2, 0]}>
                <meshStandardMaterial
                  color="#c8a84b"
                  metalness={0.85}
                  roughness={0.18}
                  emissive="#7a5c10"
                  emissiveIntensity={0.25}
                />
              </Cylinder>
              {/* Bullet tip — copper/lead */}
              <Sphere args={[0.34, 16, 16]} position={[0, 1.0, 0]}>
                <meshStandardMaterial
                  color="#b5651d"
                  metalness={0.9}
                  roughness={0.15}
                  emissive="#5a2a00"
                  emissiveIntensity={0.2}
                />
              </Sphere>
              {/* Primer center dot */}
              <Cylinder args={[0.08, 0.08, 0.05, 12]} position={[0, -0.56, 0]}>
                <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
              </Cylinder>
            </group>
          )}
        </group>
      ))}

      {/* ── Fluted ridges between chambers ── */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI * 2) / 6 + Math.PI / 6;
        return (
          <Cylinder
            key={`flute-${i}`}
            args={[0.2, 0.2, 2.15, 14]}
            position={[Math.cos(a) * 1.58, 0, Math.sin(a) * 1.58]}
          >
            <meshStandardMaterial color="#22262b" metalness={0.8} roughness={0.4} />
          </Cylinder>
        );
      })}

      {/* ── Front & rear plates ── */}
      <Cylinder args={[1.72, 1.72, 0.10, 40]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#2c3035" metalness={0.85} roughness={0.3} />
      </Cylinder>
      <Cylinder args={[1.72, 1.72, 0.10, 40]} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#2c3035" metalness={0.85} roughness={0.3} />
      </Cylinder>
    </group>
  );
}

// ─── Scene wrapper with lights & environment ─────────────────────────────────
function RouletteScene({
  isSpinning,
  isResolved,
  isEliminated,
  chamberNumber,
  bulletChamber,
}: {
  isSpinning: boolean;
  isResolved: boolean;
  isEliminated: boolean;
  chamberNumber?: number;
  bulletChamber?: number;
}) {
  return (
    <>
      {/* Environment map — gives the metallic surfaces reflections */}
      <Environment preset="night" />

      {/* Key light from above-right */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={3.5}
        color={isEliminated ? '#ff6060' : '#f5e8c8'}
        castShadow={false}
      />
      {/* Fill light from left */}
      <directionalLight position={[-4, 2, -2]} intensity={1.5} color="#a0c8ff" />
      {/* Warm under-rim bounce */}
      <pointLight position={[0, -3, 2]} intensity={2.0} color="#c9a24b" distance={8} />
      {/* Ambient base */}
      <ambientLight intensity={0.9} />
      {/* Red dramatic side light during elimination */}
      {isEliminated && (
        <pointLight position={[3, 0, 3]} intensity={6} color="#E5484D" distance={12} />
      )}

      <RevolverCylinderMesh
        isSpinning={isSpinning}
        isResolved={isResolved}
        chamberNumber={chamberNumber}
        bulletChamber={bulletChamber}
      />
    </>
  );
}

// ─── Main exported modal ─────────────────────────────────────────────────────
export const RouletteModal: React.FC = () => {
  const {
    rouletteActive,
    rouletteTargetPlayer,
    rouletteResolved,
    rouletteChamberSpinning,
    closeRouletteScene,
  } = useGameStore();

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!rouletteResolved) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          closeRouletteScene();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rouletteResolved, closeRouletteScene]);

  if (!rouletteActive || !rouletteTargetPlayer) return null;

  const isResolved  = Boolean(rouletteResolved);
  const isEliminated = rouletteResolved?.isEliminated  ?? false;
  const isShieldUsed = rouletteResolved?.shieldUsed    ?? false;
  const isSafe       = isResolved && !isEliminated && !isShieldUsed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 backdrop-blur-md">
      {/* Atmospheric vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: isEliminated
            ? 'radial-gradient(circle at 50% 45%, rgba(229,72,77,0.45) 0%, rgba(10,8,6,0.97) 70%)'
            : isSafe
            ? 'radial-gradient(circle at 50% 45%, rgba(78,158,107,0.18) 0%, rgba(10,8,6,0.97) 70%)'
            : 'radial-gradient(circle at 50% 45%, rgba(229,72,77,0.12) 0%, rgba(10,8,6,0.98) 70%)',
        }}
      />

      <div
        className={`relative w-full max-w-xl mx-4 rounded-2xl flex flex-col items-center overflow-hidden shadow-2xl border-2 transition-colors duration-700 ${
          isEliminated
            ? 'bg-neutral-950/98 border-danger-red'
            : isShieldUsed
            ? 'bg-neutral-950/98 border-emerald-500/70'
            : isSafe
            ? 'bg-neutral-950/98 border-state-safe/60'
            : 'bg-neutral-950/98 border-danger-red/40'
        }`}
      >
        {/* ── Header ── */}
        <div className="text-center px-6 pt-5 pb-2 space-y-1.5 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger-red/15 border border-danger-red/50 text-danger-glow text-[11px] uppercase tracking-widest font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Russian Roulette — 1 in 6 Chamber
          </div>
          <h2 className="font-serif text-2xl font-bold text-text-primary tracking-wide">
            {rouletteTargetPlayer.name}
          </h2>
          <p className="text-xs text-text-muted">
            {rouletteTargetPlayer.shieldActive ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5" /> Aegis Shield is primed to intercept
              </span>
            ) : (
              'Placed lowest this round. Facing elimination.'
            )}
          </p>
        </div>

        {/* ── 3D R3F Canvas ── */}
        <div className="w-full relative" style={{ height: '240px' }}>
          <Canvas
            camera={{ position: [0, 1.8, 5.0], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <RouletteScene
              isSpinning={rouletteChamberSpinning}
              isResolved={isResolved}
              isEliminated={isEliminated}
              chamberNumber={rouletteResolved?.chamberNumber}
              bulletChamber={rouletteResolved?.bulletChamber}
            />
          </Canvas>

          {/* Muzzle flash on elimination */}
          {isEliminated && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 rounded-full bg-danger-glow/60 blur-3xl animate-ping" />
            </div>
          )}
          {/* Safe glow */}
          {isSafe && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-state-safe/30 blur-2xl animate-pulse" />
            </div>
          )}
        </div>

        {/* ── Resolution Banner ── */}
        <div className="w-full px-6 pb-5 pt-1 text-center space-y-2">
          {!isResolved ? (
            <div className="flex flex-col items-center gap-1.5 py-2">
              <div className="flex items-center gap-2 text-accent-gold text-sm font-semibold">
                <div className="w-2 h-2 rounded-full bg-accent-gold animate-ping" />
                Cylinder spinning… hammer cocking…
              </div>
              <p className="text-[11px] text-text-muted">Holding breath for resolution</p>
            </div>
          ) : isEliminated ? (
            <div className="p-3.5 rounded-xl bg-danger-red/25 border border-danger-red/70 text-danger-glow space-y-1">
              <div className="flex items-center justify-center gap-2 font-serif text-xl font-bold">
                <Skull className="w-5 h-5 text-danger-red" />
                BANG! — FATAL CHAMBER — ELIMINATED
              </div>
              <p className="text-xs text-text-primary">
                Chamber #{rouletteResolved?.chamberNumber} was loaded.{' '}
                {rouletteTargetPlayer.name} has been eliminated.
              </p>
            </div>
          ) : isShieldUsed ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/60 text-emerald-400 space-y-1">
              <div className="flex items-center justify-center gap-2 font-serif text-xl font-bold">
                <Shield className="w-5 h-5 animate-pulse" />
                CLANG! — SHIELD ABSORBED THE BULLET
              </div>
              <p className="text-xs text-text-primary">
                {rouletteTargetPlayer.name}'s Aegis Shield deflected the fatal shot!
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-state-safe/15 border border-state-safe/50 text-state-safe space-y-1">
              <div className="flex items-center justify-center gap-2 font-serif text-xl font-bold">
                <CheckCircle2 className="w-5 h-5" />
                *CLICK* — EMPTY CHAMBER — SURVIVED
              </div>
              <p className="text-xs text-text-primary">
                Chamber #{rouletteResolved?.chamberNumber} was empty.{' '}
                {rouletteTargetPlayer.name} lives to fight another round.
              </p>
            </div>
          )}

          {isResolved && (
            <p className="text-[11px] text-text-muted">Continuing in {countdown}s…</p>
          )}
        </div>
      </div>
    </div>
  );
};

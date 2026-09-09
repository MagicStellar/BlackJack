import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Cylinder, Torus, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { Shield, AlertTriangle, CheckCircle2, Skull } from 'lucide-react';

const CHAMBER_COUNT = 6;
const RING_RADIUS = 1.3;

function UprightLabel({
  groupRef,
  children,
  position,
  fontSize,
  color,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  children: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
}) {
  const textRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!textRef.current || !groupRef.current) return;
    textRef.current.rotation.z = -groupRef.current.rotation.z;
  });
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.012}
      outlineColor="#1a1c1f"
    >
      {children}
    </Text>
  );
}

// ─── Revolver Cylinder 3D Mesh — front-facing "clock face" layout ───────────
function RevolverCylinderMesh({
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
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(5.5);
  const landingFromRef = useRef(0);
  const landingTargetRef = useRef<number | null>(null);
  const landingElapsedRef = useRef(0);
  const [hasSettled, setHasSettled] = useState(false);

  // 6 chambers arranged in a ring facing the camera, chamber 1 at 12 o'clock
  const chambers = useMemo(() => {
    return Array.from({ length: CHAMBER_COUNT }, (_, i) => {
      const angle = (i / CHAMBER_COUNT) * Math.PI * 2;
      return {
        index: i + 1,
        angle,
        x: Math.sin(angle) * RING_RADIUS,
        y: Math.cos(angle) * RING_RADIUS,
        // Only render the bullet after the cylinder has stopped on the
        // resolved chamber — never while it is still spinning.
        isBullet: hasSettled && bulletChamber === i + 1,
      };
    });
  }, [bulletChamber, hasSettled]);

  useEffect(() => {
    if (isSpinning) {
      velocityRef.current = 5.5;
      landingTargetRef.current = null;
      landingElapsedRef.current = 0;
      setHasSettled(false);
    }
  }, [isSpinning]);

  useEffect(() => {
    if (!isResolved || !chamberNumber || !groupRef.current) return;
    if (landingTargetRef.current != null) return;

    const TWO_PI = Math.PI * 2;
    const baseAngle = ((chamberNumber - 1) / CHAMBER_COUNT) * TWO_PI;
    const current = groupRef.current.rotation.z;

    // Always land by continuing forward — never lerp backward past the
    // current angle. Pick the next time this chamber sits under the pointer.
    let target = baseAngle;
    while (target <= current) {
      target += TWO_PI;
    }
    if (target - current < Math.PI) {
      target += TWO_PI;
    }

    landingFromRef.current = current;
    landingTargetRef.current = target;
    landingElapsedRef.current = 0;
  }, [isResolved, chamberNumber]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const dt = Math.min(delta, 0.05);

    if (landingTargetRef.current != null) {
      const LAND_DURATION = 1.35;
      landingElapsedRef.current += dt;
      const t = Math.min(1, landingElapsedRef.current / LAND_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      g.rotation.z =
        landingFromRef.current +
        (landingTargetRef.current - landingFromRef.current) * eased;

      if (t >= 1 && !hasSettled) {
        g.rotation.z = landingTargetRef.current;
        setHasSettled(true);
      }
      return;
    }

    if (isSpinning) {
      g.rotation.z += velocityRef.current * dt;
      velocityRef.current = Math.max(2.8, velocityRef.current - dt * 0.7);
    }
  });

  const pointerColor = !hasSettled
    ? '#e8ecef'
    : isEliminated
      ? '#ff5a5f'
      : '#4ade80';

  return (
    <group>
      {/* Static backing disc — gives the cylinder depth and a dark backdrop
          to read against, independent of the spin */}
      <Cylinder
        args={[1.78, 1.78, 0.3, 48]}
        position={[0, 0, -0.32]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#16181b" metalness={0.5} roughness={0.7} />
      </Cylinder>

      <group ref={groupRef}>
        {/* Cylinder body — light brushed steel, facing the camera */}
        <Cylinder args={[1.65, 1.65, 0.6, 48]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#8a939c" metalness={0.85} roughness={0.25} />
        </Cylinder>
        <Cylinder args={[0.3, 0.3, 0.65, 24]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#5a6068" metalness={0.85} roughness={0.2} />
        </Cylinder>

        {chambers.map((ch) => (
          <group key={ch.index} position={[ch.x, ch.y, 0.31]}>
            {/* Bore — near-black, high contrast against the light body */}
            <Cylinder args={[0.36, 0.36, 0.16, 28]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#0a0a0b" metalness={0.15} roughness={0.9} />
            </Cylinder>
            {/* Bright rim so every chamber reads as a distinct circle */}
            <Torus args={[0.36, 0.045, 12, 28]}>
              <meshStandardMaterial color="#eef1f3" metalness={0.9} roughness={0.15} />
            </Torus>
            {/* Chamber number stays screen-upright while the cylinder spins */}
            <UprightLabel
              groupRef={groupRef}
              position={[0, 0, 0.12]}
              fontSize={0.22}
              color={ch.isBullet ? '#ffd166' : '#9aa0a6'}
            >
              {String(ch.index)}
            </UprightLabel>
            {/* Loaded round — bright brass, only exists post-reveal */}
            {ch.isBullet && (
              <group>
                <Cylinder
                  args={[0.2, 0.2, 0.3, 22]}
                  position={[0, 0, 0.03]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <meshStandardMaterial
                    color="#e8b83c"
                    metalness={0.9}
                    roughness={0.15}
                    emissive="#c8850f"
                    emissiveIntensity={0.8}
                  />
                </Cylinder>
                <pointLight color="#ffb84d" intensity={2.5} distance={2} position={[0, 0, 0.4]} />
              </group>
            )}
          </group>
        ))}
      </group>

      {/* Fixed pointer at 12 o'clock — marks the chamber under the hammer.
          This does NOT spin with the cylinder, so it's always the one
          thing the player's eye should be tracking. */}
      <group position={[0, 2.05, 0.15]} rotation={[0, 0, Math.PI]}>
        <mesh>
          <coneGeometry args={[0.16, 0.32, 3]} />
          <meshStandardMaterial
            color={pointerColor}
            emissive={pointerColor}
            emissiveIntensity={hasSettled ? 0.9 : 0.1}
          />
        </mesh>
      </group>
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
      <Environment preset="studio" />

      {/* Even front lighting so the whole face of the cylinder is legible,
          not just whichever edge happens to catch a side light */}
      <directionalLight position={[0, 3, 6]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-3, 1, 4]} intensity={1.0} color="#c8d8ff" />
      <ambientLight intensity={0.75} />
      {isEliminated && (
        <pointLight position={[0, 0, 3]} intensity={5} color="#E5484D" distance={10} />
      )}

      <RevolverCylinderMesh
        isSpinning={isSpinning}
        isResolved={isResolved}
        isEliminated={isEliminated}
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

  const isResolved = Boolean(rouletteResolved);
  const isEliminated = rouletteResolved?.isEliminated ?? false;
  const isShieldUsed = rouletteResolved?.shieldUsed ?? false;
  const isSafe = isResolved && !isEliminated && !isShieldUsed;

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
        className={`relative w-full max-w-xl mx-4 rounded-2xl flex flex-col items-center overflow-hidden shadow-2xl border-2 transition-colors duration-700 ${isEliminated
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
              `${rouletteTargetPlayer.name} is facing the revolver`
            )}
          </p>
        </div>

        {/* ── 3D R3F Canvas ── */}
        <div className="w-full relative" style={{ height: '260px' }}>
          <Canvas
            camera={{ position: [0, 0, 6.4], fov: 38 }}
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
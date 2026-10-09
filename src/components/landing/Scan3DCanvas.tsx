import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function ReportSheet() {
  const scanLineRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime ?? state.clock.getElapsedTime?.() ?? 0

    if (scanLineRef.current) {
      scanLineRef.current.position.y = Math.sin(t * 1.4) * 1.85
    }

    if (groupRef.current) {
      const targetRotY = state.pointer.x * 0.25 + 0.15
      const targetRotX = -state.pointer.y * 0.2 - 0.12
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 3D Medical Report Sheet */}
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <planeGeometry args={[3.2, 4.4, 32, 32]} />
          <meshPhysicalMaterial
            color="#0a0f1d"
            roughness={0.15}
            metalness={0.1}
            transmission={0.65}
            thickness={0.8}
            transparent={true}
            opacity={0.92}
            reflectivity={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Outer glowing sheet border */}
        <lineSegments position={[0, 0, 0.01]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.2, 4.4)]} />
          <lineBasicMaterial color="#6366f1" transparent opacity={0.4} />
        </lineSegments>

        {/* Text lines printed on document */}
        <group position={[0, 0, 0.02]}>
          {/* Header line */}
          <mesh position={[-0.4, 1.7, 0]}>
            <planeGeometry args={[1.8, 0.12]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-0.7, 1.45, 0]}>
            <planeGeometry args={[1.2, 0.06]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
          </mesh>

          {/* Table divider */}
          <mesh position={[0, 1.25, 0]}>
            <planeGeometry args={[2.7, 0.02]} />
            <meshBasicMaterial color="#334155" transparent opacity={0.7} />
          </mesh>

          {/* Body simulated rows */}
          {[-0.8, -0.4, 0.0, 0.4, 0.8].map((yOffset, i) => (
            <group key={i} position={[0, 1.0 - i * 0.45, 0]}>
              <mesh position={[-0.8, yOffset * 0.1, 0]}>
                <planeGeometry args={[1.0, 0.05]} />
                <meshBasicMaterial color="#e2e8f0" transparent opacity={0.35} />
              </mesh>
              <mesh position={[0.2, yOffset * 0.1, 0]}>
                <planeGeometry args={[0.5, 0.05]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.45} />
              </mesh>
              <mesh position={[0.9, yOffset * 0.1, 0]}>
                <planeGeometry args={[0.6, 0.04]} />
                <meshBasicMaterial color="#64748b" transparent opacity={0.3} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Glowing Scan Line Beam */}
        <mesh ref={scanLineRef} position={[0, 0, 0.04]}>
          <planeGeometry args={[3.25, 0.08]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
        </mesh>
      </Float>
    </group>
  )
}

/** Overlay cards rendered as pure DOM — avoids Html portal / React 19 race condition */
function OverlayCards() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
      {/* Hemoglobin card – top right */}
      <div className="absolute top-[12%] right-[4%] w-52 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-500/40 shadow-xl shadow-amber-500/10 text-left animate-float-slow">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold text-amber-300">Hemoglobin (Hb)</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
            10.2 g/dL
          </span>
        </div>
        <div className="text-[10px] text-slate-300 leading-tight">
          Slightly below standard (12.0 – 15.5 g/dL)
        </div>
        <div className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
          [Synthetic example]
        </div>
      </div>

      {/* Fasting Glucose card – middle left */}
      <div className="absolute top-[42%] left-[3%] w-52 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-teal-500/40 shadow-xl shadow-teal-500/10 text-left animate-float-medium">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold text-teal-300">Fasting Glucose</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
            92 mg/dL
          </span>
        </div>
        <div className="text-[10px] text-slate-300 leading-tight">
          Optimal fasting range (70 – 99 mg/dL)
        </div>
        <div className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
          [Synthetic example]
        </div>
      </div>

      {/* Platelet card – bottom right */}
      <div className="absolute bottom-[14%] right-[5%] w-48 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 shadow-xl shadow-indigo-500/10 text-left animate-float-slow">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold text-indigo-300">Platelet Count</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            240K /µL
          </span>
        </div>
        <div className="text-[10px] text-slate-300 leading-tight">
          Normal range (150K – 450K /µL)
        </div>
        <div className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
          [Synthetic example]
        </div>
      </div>
    </div>
  )
}

export function Scan3DCanvas() {
  return (
    <div className="w-full h-[520px] sm:h-[600px] relative" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop="always"
      >
        {/* Soft Indigo / Teal / Amber lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 5]} intensity={1.2} color="#f59e0b" />
        <pointLight position={[-4, 3, 3]} intensity={2.5} color="#6366f1" distance={12} />
        <pointLight position={[4, -3, 3]} intensity={2.0} color="#14b8a6" distance={10} />
        <pointLight position={[0, 0, 4]} intensity={1.0} color="#a855f7" distance={8} />

        <ReportSheet />
      </Canvas>

      {/* DOM overlay cards — no portal, no React 19 conflict */}
      <OverlayCards />
    </div>
  )
}

export default Scan3DCanvas

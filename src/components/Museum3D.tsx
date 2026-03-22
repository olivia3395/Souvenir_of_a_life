import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  ScrollControls, 
  Scroll, 
  Image as ThreeImage, 
  Text, 
  Float, 
  Environment, 
  SpotLight, 
  MeshReflectorMaterial,
  useScroll
} from '@react-three/drei';
import * as THREE from 'three';
import { format } from 'date-fns';

interface Souvenir {
  id: string;
  title: string;
  subtitle: string;
  place: string;
  imageUrl?: string;
  createdAt: any;
}

function ExhibitFrame({ souvenir, position, index, onSelect }: { 
  souvenir: Souvenir; 
  position: [number, number, number]; 
  index: number;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const isEven = index % 2 === 0;
  const xOffset = isEven ? -2.5 : 2.5;
  
  return (
    <group position={[xOffset, position[1], position[2]]} ref={meshRef}>
      {/* Spotlight for this specific item */}
      <SpotLight
        position={[isEven ? 2 : -2, 3, 2]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        color="#c5a87a"
        target-position={[0, 0, 0]}
      />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group 
          onClick={() => onSelect(souvenir.id)} 
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {/* Frame */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[3.2, 2.2, 0.1]} />
            <meshStandardMaterial color="#1c1816" roughness={0.5} />
          </mesh>

          {/* Image */}
          {souvenir.imageUrl ? (
            <ThreeImage
              url={souvenir.imageUrl}
              scale={[3, 2]}
              transparent
              opacity={0.9}
            />
          ) : (
            <mesh>
              <planeGeometry args={[3, 2]} />
              <meshStandardMaterial color="#2a2421" />
            </mesh>
          )}

          {/* Label Tag (3D) */}
          <group position={[0, -1.5, 0.1]}>
            <Text
              font="https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpHtK.woff"
              fontSize={0.15}
              color="#e8dcc4"
              anchorX="center"
              anchorY="middle"
              maxWidth={2.5}
              textAlign="center"
            >
              {souvenir.title}
            </Text>
            <Text
              position={[0, -0.25, 0]}
              fontSize={0.08}
              color="#c5a87a"
              fillOpacity={0.6}
              anchorX="center"
              anchorY="middle"
            >
              {`${souvenir.place.toUpperCase()} • ${souvenir.createdAt?.toDate ? format(souvenir.createdAt.toDate(), 'MMM yyyy') : ''}`}
            </Text>
          </group>
        </group>
      </Float>
    </group>
  );
}

function Corridor({ souvenirs, onSelect }: { souvenirs: Souvenir[]; onSelect: (id: string) => void }) {
  const scroll = useScroll();
  const { viewport } = useThree();
  
  // Create a long corridor
  const corridorLength = souvenirs.length * 8;
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -corridorLength / 2 + 5]}>
        <planeGeometry args={[20, corridorLength + 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, -corridorLength / 2 + 5]}>
        <planeGeometry args={[20, corridorLength + 20]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Walls */}
      <mesh position={[-5, 1, -corridorLength / 2 + 5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength + 20, 10]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[5, 1, -corridorLength / 2 + 5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength + 20, 10]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Exhibits */}
      {souvenirs.map((souvenir, i) => (
        <ExhibitFrame
          key={souvenir.id}
          souvenir={souvenir}
          position={[0, 0, -i * 8]}
          index={i}
          onSelect={onSelect}
        />
      ))}

      {/* Ambient Lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 4, -10]} intensity={0.5} color="#c5a87a" />
    </group>
  );
}

export function Museum3D({ souvenirs, onSelect }: { souvenirs: Souvenir[]; onSelect: (id: string) => void }) {
  return (
    <div className="w-full h-screen bg-[#14110f]">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 5, 25]} />
        
        <ScrollControls pages={souvenirs.length * 1.5} damping={0.3}>
          <Scroll>
            <Corridor souvenirs={souvenirs} onSelect={onSelect} />
          </Scroll>
          
          <Scroll html style={{ width: '100%' }}>
            <div className="pointer-events-none w-full">
              <div className="h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="font-serif text-6xl md:text-8xl font-light tracking-[0.3em] text-[var(--color-museum-text)] mb-8 opacity-80">
                  THE VOID
                </h1>
                <p className="text-[var(--color-museum-muted)] font-serif italic text-xl tracking-widest animate-pulse">
                  Scroll to walk through your unlived lives
                </p>
              </div>
              
              {/* Spacing for scroll */}
              <div style={{ height: `${souvenirs.length * 150}vh` }} />
              
              <div className="h-screen flex flex-col items-center justify-center text-center px-6">
                <p className="text-[var(--color-museum-muted)]/40 text-[10px] tracking-[0.5em] uppercase">
                  End of Corridor
                </p>
              </div>
            </div>
          </Scroll>
        </ScrollControls>
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

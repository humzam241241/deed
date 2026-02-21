import React, {
  useRef, useMemo, useState, useLayoutEffect, useEffect, Suspense,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Decal } from '@react-three/drei';
import * as THREE from 'three';

// ─── Preload all GLBs ─────────────────────────────────────────────────────────
useGLTF.preload('/t-shirt.glb');
useGLTF.preload('/polo.glb');
useGLTF.preload('/hoodie.glb');
useGLTF.preload('/hat.glb');

const GREY = '#c0c0c0'; // neutral mockup grey

// ─── Auto-normalise: centre + scale any GLB to fit targetSize ─────────────────
function useAutoNormalize(outerRef, targetSize = 3.6) {
  const [info, setInfo] = useState({ frontZ: 2.0, topY: 1.8, halfW: 1.1, halfH: 0.9 });

  useLayoutEffect(() => {
    if (!outerRef.current) return;
    const box = new THREE.Box3().setFromObject(outerRef.current);
    if (box.isEmpty()) return;

    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = targetSize / maxDim;

    outerRef.current.scale.setScalar(scale);
    outerRef.current.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    );

    // Re-measure after scaling
    const box2 = new THREE.Box3().setFromObject(outerRef.current);
    const sz2  = new THREE.Vector3();
    box2.getSize(sz2);

    setInfo({
      frontZ: box2.max.z + 0.06,
      topY:   box2.max.y,
      halfW:  sz2.x * 0.36,
      halfH:  sz2.y * 0.27,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return info;
}

// ─── Idle sway ────────────────────────────────────────────────────────────────
function useIdleSway(ref, speed = 0.4, amplitude = 0.06) {
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * speed) * amplitude;
  });
}

// ─── Apply garment color to all meshes (skip by keyword) ─────────────────────
function applyColor(scene, color, skipKeywords = []) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    const skip = skipKeywords.some(k => node.name.toLowerCase().includes(k));
    if (skip) return;
    node.castShadow     = true;
    node.receiveShadow  = true;
    node.material       = node.material.clone();
    node.material.color.set(color);
    node.material.roughness   = 0.88;
    node.material.metalness   = 0.02;
    node.material.needsUpdate = true;
  });
}

// ─── Design overlay plane (always renders on top of the garment) ──────────────
function DesignOverlay({ frontZ, halfW, halfH, texture, sizeMultiplier = 1 }) {
  const w = (halfW ?? 1.1) * 2 * sizeMultiplier;
  const h = (halfH ?? 0.9) * 2 * sizeMultiplier;
  return (
    <mesh position={[0, 0.05, frontZ]} renderOrder={1}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.04}
        depthTest={false}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
      />
    </mesh>
  );
}

// ─── T-SHIRT ──────────────────────────────────────────────────────────────────
function TShirt3D({ color, designTexture }) {
  const outerRef = useRef();
  const swayRef  = useRef();
  useIdleSway(swayRef);
  const info = useAutoNormalize(outerRef);

  const { scene } = useGLTF('/t-shirt.glb');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => applyColor(cloned, color), [cloned, color]);

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        <primitive object={cloned} />
      </group>
      {designTexture && <DesignOverlay {...info} texture={designTexture} sizeMultiplier={0.92} />}
    </group>
  );
}

// ─── POLO ─────────────────────────────────────────────────────────────────────
function Polo3D({ color, designTexture }) {
  const outerRef = useRef();
  const swayRef  = useRef();
  useIdleSway(swayRef);
  const info = useAutoNormalize(outerRef);

  const { scene } = useGLTF('/polo.glb');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => applyColor(cloned, color), [cloned, color]);

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        <primitive object={cloned} />
      </group>
      {designTexture && (
        <mesh position={[-info.halfW * 0.3, 0.08, info.frontZ]} renderOrder={1}>
          <planeGeometry args={[info.halfW * 1.0, info.halfH * 1.0]} />
          <meshBasicMaterial map={designTexture} transparent alphaTest={0.04} depthTest={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── HOODIE ───────────────────────────────────────────────────────────────────
function Hoodie3D({ color, designTexture }) {
  const outerRef = useRef();
  const swayRef  = useRef();
  useIdleSway(swayRef);
  const info = useAutoNormalize(outerRef);

  const { scene } = useGLTF('/hoodie.glb');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => applyColor(cloned, color, ['stitches']), [cloned, color]);

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        <primitive object={cloned} />
      </group>
      {designTexture && <DesignOverlay {...info} texture={designTexture} sizeMultiplier={0.88} />}
    </group>
  );
}

// ─── HAT ──────────────────────────────────────────────────────────────────────
function Hat3D({ color, designTexture }) {
  const outerRef = useRef();
  const swayRef  = useRef();
  useIdleSway(swayRef, 0.35, 0.05);
  const info = useAutoNormalize(outerRef);

  const { scene } = useGLTF('/hat.glb');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => applyColor(cloned, color), [cloned, color]);

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        <group rotation={[-Math.PI / 2, 0, Math.PI]}>
          <primitive object={cloned} />
        </group>
      </group>
      {designTexture && (
        <mesh position={[0, 0, info.frontZ]} renderOrder={1}>
          <planeGeometry args={[info.halfW * 1.6, info.halfH * 1.6]} />
          <meshBasicMaterial map={designTexture} transparent alphaTest={0.04} depthTest={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── BANNER (custom geometry — no GLB) ───────────────────────────────────────
function Banner3D({ color, designTexture }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.55) * 0.022;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.038;
  });

  const bannerShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, -2.2); s.lineTo(1.6, -2.2);
    s.lineTo(1.6, 2.2); s.lineTo(-1.6, 2.2); s.lineTo(-1.6, -2.2);
    return s;
  }, []);
  const bannerGeo = useMemo(() => new THREE.ExtrudeGeometry(bannerShape, {
    depth: 0.055, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 2,
  }), [bannerShape]);

  return (
    <group ref={group}>
      <mesh geometry={bannerGeo} castShadow receiveShadow position={[0, 0, -0.028]}>
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      {[-1.72, 1.72].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 5.5, 18]} />
            <meshStandardMaterial color="#7a7a7a" roughness={0.25} metalness={0.85} />
          </mesh>
          <mesh position={[x, 2.78, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#999" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 3.5, 14]} />
        <meshStandardMaterial color="#888" roughness={0.25} metalness={0.85} />
      </mesh>
      {[-1.4, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 2.05, 0.06]}>
          <torusGeometry args={[0.1, 0.032, 8, 18]} />
          <meshStandardMaterial color="#aaa" roughness={0.18} metalness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.9, 4.05]} />
        {designTexture ? (
          <meshBasicMaterial map={designTexture} transparent alphaTest={0.04} />
        ) : (
          <meshStandardMaterial
            color={new THREE.Color(color).offsetHSL(0, 0.06, 0.09).getStyle()}
            roughness={0.9} transparent opacity={0.3}
          />
        )}
      </mesh>
    </group>
  );
}

// ─── Product registry ─────────────────────────────────────────────────────────
const PRODUCT_MAP = {
  tshirt: TShirt3D,
  polo:   Polo3D,
  hoodie: Hoodie3D,
  hat:    Hat3D,
  banner: Banner3D,
};

// ─── Scene — with texture ─────────────────────────────────────────────────────
function SceneWithTexture({ product, color, designImage, customRotation, greyMode }) {
  const texture = useTexture(designImage);
  const Comp    = PRODUCT_MAP[product] || TShirt3D;
  const resolvedColor = greyMode ? GREY : color;
  return (
    <group rotation={[0, (customRotation * Math.PI) / 180, 0]}>
      <Comp color={resolvedColor} designTexture={texture} />
    </group>
  );
}

// ─── Scene — no texture ───────────────────────────────────────────────────────
function SceneNoTexture({ product, color, customRotation, greyMode }) {
  const Comp = PRODUCT_MAP[product] || TShirt3D;
  const resolvedColor = greyMode ? GREY : color;
  return (
    <group rotation={[0, (customRotation * Math.PI) / 180, 0]}>
      <Comp color={resolvedColor} designTexture={null} />
    </group>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────
export default function Product3DViewer({
  product        = 'tshirt',
  designImage    = null,
  garmentColor   = '#ffffff',
  rotation: customRotation = 0,
  greyMode       = false,        // ← grey garment + design overlay (mockup mode)
}) {
  const camZ = product === 'banner' ? 11 : product === 'hat' ? 7 : 8;

  return (
    <div
      className="w-full relative rounded-xl overflow-hidden bg-gray-100"
      style={{ minHeight: 480 }}
    >
      {/* Grey mode badge */}
      {greyMode && (
        <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
          Mockup Mode
        </div>
      )}

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, camZ], fov: 46 }}
        style={{ width: '100%', height: 480 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[4, 8, 6]} intensity={1.3}
          castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 3, -3]} intensity={0.4} />
        <directionalLight position={[0, -2, -5]} intensity={0.18} />

        <Suspense fallback={null}>
          {designImage ? (
            <SceneWithTexture
              product={product}
              color={garmentColor}
              designImage={designImage}
              customRotation={customRotation}
              greyMode={greyMode}
            />
          ) : (
            <SceneNoTexture
              product={product}
              color={garmentColor}
              customRotation={customRotation}
              greyMode={greyMode}
            />
          )}
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI * 0.88}
        />
      </Canvas>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-1.5 rounded-full pointer-events-none select-none">
        🖱 Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}

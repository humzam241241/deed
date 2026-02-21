import React, {
  useRef, useMemo, useEffect, useLayoutEffect, Suspense,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Decal } from '@react-three/drei';
import * as THREE from 'three';

// ─── Draco decoder — required for Draco-compressed GLBs ──────────────────────
// drei's useGLTF handles Draco automatically; point it at Google's stable CDN.
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

// ─── Preload — absolute root paths (served from client/public/ via Vite) ─────
useGLTF.preload('/t-shirt.glb');
useGLTF.preload('/polo.glb');
useGLTF.preload('/hoodie.glb');
useGLTF.preload('/hat.glb');

const GREY = '#c0c0c0';

// ─── Auto-normalise: scale + centre any group to fit targetSize units ─────────
function useAutoNormalize(ref, targetSize = 3.6) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    if (box.isEmpty()) return;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = targetSize / Math.max(size.x, size.y, size.z);
    ref.current.scale.setScalar(s);
    ref.current.position.set(-center.x * s, -center.y * s, -center.z * s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─── Idle sway ────────────────────────────────────────────────────────────────
function useIdleSway(ref, speed = 0.4, amp = 0.06) {
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * speed) * amp;
  });
}

// ─── Stable MeshStandardMaterial that updates when color changes ──────────────
// Returns the same THREE.Material instance; avoids recreating every render.
function useGarmentMat(color) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.86, metalness: 0.02 }),
    [],
  );
  useEffect(() => {
    mat.color.set(color);
    mat.map = null;           // remove original texture so our color wins
    mat.needsUpdate = true;
  }, [color, mat]);
  return mat;
}

// ─── Compute Decal position/scale from a buffer geometry's AABB ───────────────
function geoDecal(geometry, opts = {}) {
  const {
    xOff = 0, yOff = 0.08,
    zMult = 0.93,
    wFrac = 0.55, hFrac = 0.38,
  } = opts;

  const fallback = { pos: [0, 0.2, 1.0], scale: [1.0, 0.8, 0.5] };
  if (!geometry?.attributes?.position) return fallback;

  try {
    const box = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    const c = new THREE.Vector3();
    const s = new THREE.Vector3();
    box.getCenter(c);
    box.getSize(s);
    if (!s.x || !s.y || !s.z) return fallback;
    return {
      pos:   [c.x + s.x * xOff, c.y + s.y * yOff, box.max.z * zMult],
      scale: [s.x * wFrac, s.y * hFrac, s.z * 0.6],
    };
  } catch {
    return fallback;
  }
}

// ─── T-SHIRT ──────────────────────────────────────────────────────────────────
const TSHIRT_NODES = ['Object_2', 'Object_3', 'Object_4', 'Object_5'];

function TShirt3D({ color, designTexture }) {
  const { nodes } = useGLTF('/t-shirt.glb');
  const outerRef = useRef();
  const swayRef  = useRef();
  useIdleSway(swayRef);
  useAutoNormalize(outerRef);
  const mat   = useGarmentMat(color);
  const decal = useMemo(
    () => geoDecal(nodes?.Object_2?.geometry, { yOff: 0.1, wFrac: 0.55, hFrac: 0.38 }),
    [nodes],
  );

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        {TSHIRT_NODES.map((name) => {
          const geo = nodes?.[name]?.geometry;
          if (!geo) return null;
          return (
            <mesh key={name} geometry={geo} material={mat} castShadow receiveShadow>
              {designTexture && name === 'Object_2' && (
                <Decal
                  position={decal.pos}
                  scale={decal.scale}
                  map={designTexture}
                  depthTest={false}
                  polygonOffsetFactor={-10}
                />
              )}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ─── POLO ─────────────────────────────────────────────────────────────────────
const POLO_NODES = [
  'Object_5','Object_6','Object_7','Object_8',
  'Object_9','Object_10','Object_11','Object_12',
];

function Polo3D({ color, designTexture }) {
  const { nodes } = useGLTF('/polo.glb');
  const outerRef = useRef();
  const swayRef  = useRef();
  useIdleSway(swayRef);
  useAutoNormalize(outerRef);
  const mat   = useGarmentMat(color);
  // Left-chest: smaller logo, upper-left area (classic polo placement)
  const decal = useMemo(
    () => geoDecal(nodes?.Object_5?.geometry, {
      xOff: -0.14, yOff: 0.22, zMult: 0.92, wFrac: 0.28, hFrac: 0.20,
    }),
    [nodes],
  );

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        {POLO_NODES.map((name) => {
          const geo = nodes?.[name]?.geometry;
          if (!geo) return null;
          return (
            <mesh key={name} geometry={geo} material={mat} castShadow receiveShadow>
              {designTexture && name === 'Object_5' && (
                <Decal
                  position={decal.pos}
                  scale={decal.scale}
                  map={designTexture}
                  depthTest={false}
                  polygonOffsetFactor={-10}
                />
              )}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ─── HOODIE ───────────────────────────────────────────────────────────────────
const HOODIE_BODY = 'hoodie_Sweat_Rib_1X1_319gsm_hoodie_0';
const HOODIE_MAIN = [
  'hoodie_Rib_2X2_468gsm_hoodie_end_0',
  HOODIE_BODY,
  'hoodie_Sweat_hood_Rib_1X1_319gsm_hood_0',
];

function Hoodie3D({ color, designTexture }) {
  const { nodes, scene } = useGLTF('/hoodie.glb');
  const outerRef  = useRef();
  const swayRef   = useRef();
  useIdleSway(swayRef);
  useAutoNormalize(outerRef);
  const mat        = useGarmentMat(color);
  const stitchMat  = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }),
    [],
  );
  const decal = useMemo(
    () => geoDecal(nodes?.[HOODIE_BODY]?.geometry, { yOff: 0.08, wFrac: 0.55, hFrac: 0.38 }),
    [nodes],
  );

  // Clone scene for stitches; hide the main meshes that we render explicitly
  const stitchClone = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      if (HOODIE_MAIN.includes(node.name)) { node.visible = false; return; }
      node.material = stitchMat;
    });
    return clone;
  }, [scene, stitchMat]);

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        {HOODIE_MAIN.map((name) => {
          const geo = nodes?.[name]?.geometry;
          if (!geo) return null;
          return (
            <mesh key={name} geometry={geo} material={mat} castShadow receiveShadow>
              {designTexture && name === HOODIE_BODY && (
                <Decal
                  position={decal.pos}
                  scale={decal.scale}
                  map={designTexture}
                  depthTest={false}
                  polygonOffsetFactor={-10}
                />
              )}
            </mesh>
          );
        })}
        <primitive object={stitchClone} />
      </group>
    </group>
  );
}

// ─── HAT — 29 meshes, too complex for Decal; use floating front panel ─────────
function Hat3D({ color, designTexture }) {
  const { scene } = useGLTF('/hat.glb');
  const outerRef  = useRef();
  const swayRef   = useRef();
  useIdleSway(swayRef, 0.35, 0.05);
  useAutoNormalize(outerRef);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02 }),
    [],
  );
  useEffect(() => { mat.color.set(color); mat.map = null; mat.needsUpdate = true; }, [color, mat]);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.material   = mat;
    });
    return clone;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <group ref={swayRef}>
      <group ref={outerRef}>
        <group rotation={[-Math.PI / 2, 0, Math.PI]}>
          <primitive object={cloned} />
        </group>
      </group>
      {/* Front-panel design — placed after auto-normalize, so must use world-space estimate */}
      {designTexture && (
        <mesh position={[0, 0.1, 1.9]} renderOrder={2}>
          <planeGeometry args={[0.85, 0.52]} />
          <meshBasicMaterial
            map={designTexture}
            transparent alphaTest={0.04}
            depthTest={false} depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── BANNER — custom geometry (no GLB) ────────────────────────────────────────
function makeBannerShape() {
  const s = new THREE.Shape();
  s.moveTo(-1.6, -2.2); s.lineTo(1.6, -2.2);
  s.lineTo(1.6, 2.2); s.lineTo(-1.6, 2.2); s.lineTo(-1.6, -2.2);
  return s;
}

function Banner3D({ color, designTexture }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.55) * 0.022;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.038;
  });
  const bannerGeo = useMemo(() => new THREE.ExtrudeGeometry(makeBannerShape(), {
    depth: 0.055, bevelEnabled: true,
    bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 2,
  }), []);

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
        {designTexture
          ? <meshBasicMaterial map={designTexture} transparent alphaTest={0.04} />
          : <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0.06, 0.09).getStyle()} roughness={0.9} transparent opacity={0.3} />
        }
      </mesh>
    </group>
  );
}

// ─── Scene contents ───────────────────────────────────────────────────────────
const PRODUCT_MAP = {
  tshirt: TShirt3D,
  polo:   Polo3D,
  hoodie: Hoodie3D,
  hat:    Hat3D,
  banner: Banner3D,
};

function SceneWithTexture({ product, color, designImage, customRotation, greyMode }) {
  const texture = useTexture(designImage);
  const Comp    = PRODUCT_MAP[product] || TShirt3D;
  return (
    <group rotation={[0, (customRotation * Math.PI) / 180, 0]}>
      <Comp color={greyMode ? GREY : color} designTexture={texture} />
    </group>
  );
}

function SceneNoTexture({ product, color, customRotation, greyMode }) {
  const Comp = PRODUCT_MAP[product] || TShirt3D;
  return (
    <group rotation={[0, (customRotation * Math.PI) / 180, 0]}>
      <Comp color={greyMode ? GREY : color} designTexture={null} />
    </group>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────
export default function Product3DViewer({
  product        = 'tshirt',
  designImage    = null,
  garmentColor   = '#ffffff',
  rotation: customRotation = 0,
  greyMode       = false,
}) {
  const camZ = product === 'banner' ? 11 : product === 'hat' ? 7 : 8;

  return (
    <div className="w-full relative rounded-xl overflow-hidden bg-gray-100" style={{ minHeight: 480 }}>
      {greyMode && (
        <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
          Mockup Mode
        </div>
      )}

      <Canvas
        shadows dpr={[1, 2]}
        camera={{ position: [0, 0.4, camZ], fov: 46 }}
        style={{ width: '100%', height: 480 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 8, 6]} intensity={1.3} castShadow
          shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-5, 3, -3]} intensity={0.4} />
        <directionalLight position={[0, -2, -5]} intensity={0.18} />

        <Suspense fallback={null}>
          {designImage
            ? <SceneWithTexture product={product} color={garmentColor} designImage={designImage} customRotation={customRotation} greyMode={greyMode} />
            : <SceneNoTexture   product={product} color={garmentColor} customRotation={customRotation} greyMode={greyMode} />
          }
        </Suspense>

        <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={20} maxPolarAngle={Math.PI * 0.88} />
      </Canvas>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-1.5 rounded-full pointer-events-none select-none">
        🖱 Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}

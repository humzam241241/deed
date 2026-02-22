import React, {
  useRef, useMemo, useEffect, useLayoutEffect, Suspense, Component, useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Decal } from '@react-three/drei';
import * as THREE from 'three';

// ─── Error boundary ───────────────────────────────────────────────────────────
class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(err) { console.warn('[Product3DViewer] Canvas error:', err.message); }
  render() {
    if (this.state.crashed) {
      return (
        <div className="w-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm"
          style={{ height: 480 }}>
          3D preview unavailable — try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Draco ───────────────────────────────────────────────────────────────────
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
useGLTF.preload('/t-shirt.glb');
useGLTF.preload('/polo.glb');
useGLTF.preload('/hoodie.glb');
useGLTF.preload('/hat.glb');

const GREY = '#c0c0c0';

// ─── Auto-normalise: fit any GLB into targetSize world-units ─────────────────
function useAutoNormalize(ref, targetSize = 3.6) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    if (box.isEmpty()) return;
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = targetSize / Math.max(size.x, size.y, size.z);
    ref.current.scale.setScalar(s);
    ref.current.position.set(-center.x * s, -center.y * s, -center.z * s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─── Stable garment material (color-only, no original texture) ────────────────
function useGarmentMat(color) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.86, metalness: 0.02 }),
    [],
  );
  useEffect(() => {
    mat.color.set(color);
    mat.map = null;
    mat.needsUpdate = true;
  }, [color, mat]);
  return mat;
}

// ─── Build decal props from geometry + print location ────────────────────────
// Returns { pos, scale, rot } all in the mesh's local geometry space.
// Negative scale.x flips texture horizontally — fixes the mirror artefact that
// appears because the Decal projector's local-X opposes the viewer's screen-X.
function buildDecal(geo, location, designSize, designRotationDeg) {
  if (!geo?.attributes?.position) return null;

  const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position);
  const c   = box.getCenter(new THREE.Vector3());
  const s   = box.getSize(new THREE.Vector3());
  const rotZ = (designRotationDeg * Math.PI) / 180;

  // Negate W to un-mirror; multiply by designSize to honour the slider
  const W = -(s.x * 0.50 * designSize);   // negative = horizontal flip = correct
  const H =   s.y * 0.34 * designSize;
  const D =   s.z * 0.80;

  switch (location) {
    case 'front-left':
      return {
        pos:   [c.x - s.x * 0.16, c.y + s.y * 0.21, box.max.z * 0.91],
        scale: [W * 0.52, H * 0.52, D],
        rot:   [0, 0, rotZ],
      };

    case 'back-center':
      // Project from BEHIND the shirt — flip projection with [0,π,0].
      // -W cancels the mirror-flip because the projection is already reversed.
      return {
        pos:   [c.x, c.y + s.y * 0.08, box.min.z * 0.91],
        scale: [-W, H, D],
        rot:   [0, Math.PI, rotZ],
      };

    case 'sleeve':
      return {
        pos:   [c.x - s.x * 0.39, c.y - s.y * 0.04, box.max.z * 0.3],
        scale: [W * 0.44, H * 0.44, D * 0.5],
        rot:   [0, -Math.PI / 4, rotZ],
      };

    // Hat-specific locations
    case 'side':
      return {
        pos:   [c.x - s.x * 0.28, c.y + s.y * 0.10, box.max.z * 0.86],
        scale: [W * 0.46, H * 0.46, D],
        rot:   [0, -Math.PI / 5, rotZ],
      };
    case 'back':
      return {
        pos:   [c.x, c.y + s.y * 0.05, box.min.z * 0.86],
        scale: [-W * 0.46, H * 0.46, D],
        rot:   [0, Math.PI, rotZ],
      };

    default: // front-center
      return {
        pos:   [c.x, c.y + s.y * 0.09, box.max.z * 0.91],
        scale: [W, H, D],
        rot:   [0, 0, rotZ],
      };
  }
}

// ─── Tracks camera Z to tell whether we're looking at Front or Back ───────────
function FacingTracker({ onFacing }) {
  const { camera } = useThree();
  const prev = useRef('FRONT');
  useFrame(() => {
    const f = camera.position.z >= 0 ? 'FRONT' : 'BACK';
    if (f !== prev.current) { prev.current = f; onFacing(f); }
  });
  return null;
}

// ─── Repositions camera when the user picks back-center / back ────────────────
function CameraReset({ location, camZ }) {
  const { camera } = useThree();
  useEffect(() => {
    const back = location === 'back-center' || location === 'back';
    camera.position.set(0, 0.4, back ? -camZ : camZ);
    camera.lookAt(0, 0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  return null;
}

// ─── Shared Decal renderer ────────────────────────────────────────────────────
function DesignDecal({ geo, designTexture, printLocation, designSize, designRotation }) {
  const d = useMemo(
    () => buildDecal(geo, printLocation, designSize, designRotation),
    [geo, printLocation, designSize, designRotation],
  );
  if (!d || !designTexture) return null;
  return (
    <Decal
      position={d.pos}
      rotation={d.rot}
      scale={d.scale}
      map={designTexture}
      depthTest           // renders correctly behind other faces
      polygonOffset
      polygonOffsetFactor={-4}   // lifts decal off surface to avoid z-fighting
    />
  );
}

// ─── T-SHIRT ──────────────────────────────────────────────────────────────────
const TSHIRT_NODES = ['Object_2', 'Object_3', 'Object_4', 'Object_5'];

function TShirt3D({ color, designTexture, printLocation, designSize, designRotation }) {
  const { nodes } = useGLTF('/t-shirt.glb');
  const ref = useRef();
  useAutoNormalize(ref);
  const mat = useGarmentMat(color);

  return (
    <group ref={ref}>
      {TSHIRT_NODES.map((name) => {
        const geo = nodes?.[name]?.geometry;
        if (!geo) return null;
        return (
          <mesh key={name} geometry={geo} material={mat} castShadow receiveShadow>
            {/* Decal only on the body panel */}
            {name === 'Object_2' && (
              <DesignDecal
                geo={geo}
                designTexture={designTexture}
                printLocation={printLocation}
                designSize={designSize}
                designRotation={designRotation}
              />
            )}
          </mesh>
        );
      })}
    </group>
  );
}

// ─── POLO ─────────────────────────────────────────────────────────────────────
const POLO_NODES = [
  'Object_5','Object_6','Object_7','Object_8',
  'Object_9','Object_10','Object_11','Object_12',
];

function Polo3D({ color, designTexture, printLocation, designSize, designRotation }) {
  const { nodes } = useGLTF('/polo.glb');
  const ref = useRef();
  useAutoNormalize(ref);
  const mat = useGarmentMat(color);

  return (
    <group ref={ref}>
      {POLO_NODES.map((name) => {
        const geo = nodes?.[name]?.geometry;
        if (!geo) return null;
        return (
          <mesh key={name} geometry={geo} material={mat} castShadow receiveShadow>
            {name === 'Object_5' && (
              <DesignDecal
                geo={geo}
                designTexture={designTexture}
                printLocation={printLocation}
                designSize={designSize}
                designRotation={designRotation}
              />
            )}
          </mesh>
        );
      })}
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

function Hoodie3D({ color, designTexture, printLocation, designSize, designRotation }) {
  const { nodes, scene } = useGLTF('/hoodie.glb');
  const ref       = useRef();
  useAutoNormalize(ref);
  const mat       = useGarmentMat(color);
  const stitchMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }),
    [],
  );

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
    <group ref={ref}>
      {HOODIE_MAIN.map((name) => {
        const geo = nodes?.[name]?.geometry;
        if (!geo) return null;
        return (
          <mesh key={name} geometry={geo} material={mat} castShadow receiveShadow>
            {name === HOODIE_BODY && (
              <DesignDecal
                geo={geo}
                designTexture={designTexture}
                printLocation={printLocation}
                designSize={designSize}
                designRotation={designRotation}
              />
            )}
          </mesh>
        );
      })}
      <primitive object={stitchClone} />
    </group>
  );
}

// ─── HAT ──────────────────────────────────────────────────────────────────────
// Hat uses a positioned plane for the design (complex multi-mesh, no single body node)
function Hat3D({ color, designTexture, printLocation, designSize, designRotation }) {
  const { scene } = useGLTF('/hat.glb');
  const ref  = useRef();
  useAutoNormalize(ref);
  const mat  = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02 }),
    [],
  );
  useEffect(() => { mat.color.set(color); mat.map = null; mat.needsUpdate = true; }, [color, mat]);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.material = mat; } });
    return clone;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // Plane position per location — in world space (after auto-normalize)
  const rotZ = (designRotation * Math.PI) / 180;
  const planeProps = useMemo(() => {
    const sz = designSize;
    switch (printLocation) {
      case 'side': return { pos: [-1.0, 0.18, 1.55], size: [0.70 * sz, 0.44 * sz], rotY: -0.55 };
      case 'back': return { pos: [ 0,   0.12, -1.6],  size: [0.70 * sz, 0.44 * sz], rotY: Math.PI };
      default:     return { pos: [ 0,   0.18,  1.80], size: [0.85 * sz, 0.52 * sz], rotY: 0 };
    }
  }, [printLocation, designSize]);

  return (
    <group ref={ref}>
      <group rotation={[-Math.PI / 2, 0, Math.PI]}>
        <primitive object={cloned} />
      </group>
      {designTexture && (
        <mesh
          position={planeProps.pos}
          rotation={[0, planeProps.rotY, rotZ]}
          renderOrder={2}
        >
          <planeGeometry args={planeProps.size} />
          <meshBasicMaterial
            map={designTexture}
            transparent
            alphaTest={0.04}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── BANNER ───────────────────────────────────────────────────────────────────
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

// ─── Product map ──────────────────────────────────────────────────────────────
const PRODUCT_MAP = {
  tshirt: TShirt3D,
  polo:   Polo3D,
  hoodie: Hoodie3D,
  hat:    Hat3D,
  banner: Banner3D,
};

// ─── Scene with texture ───────────────────────────────────────────────────────
function SceneWithTexture({ product, color, designImage, printLocation, designSize, designRotation, greyMode }) {
  const texture = useTexture(designImage);

  // Fix mirroring: flip the texture's U axis
  useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
    texture.needsUpdate = true;
  }, [texture]);

  const Comp = PRODUCT_MAP[product] || TShirt3D;
  return (
    <Comp
      color={greyMode ? GREY : color}
      designTexture={texture}
      printLocation={printLocation}
      designSize={designSize}
      designRotation={designRotation}
    />
  );
}

function SceneNoTexture({ product, color, printLocation, greyMode }) {
  const Comp = PRODUCT_MAP[product] || TShirt3D;
  return (
    <Comp
      color={greyMode ? GREY : color}
      designTexture={null}
      printLocation={printLocation}
      designSize={1}
      designRotation={0}
    />
  );
}

// ─── Public component ──────────────────────────────────────────────────────────
export default function Product3DViewer({
  product        = 'tshirt',
  designImage    = null,
  garmentColor   = '#ffffff',
  printLocation  = 'front-center',
  designSize     = 0.8,           // 0.2 – 1.5, controls decal scale
  designRotation = 0,             // degrees, rotates the decal around Z
  greyMode       = false,
}) {
  const camZ = product === 'banner' ? 11 : product === 'hat' ? 7 : 8;
  const [facing, setFacing] = useState('FRONT');

  return (
    <CanvasErrorBoundary>
      <div className="w-full relative rounded-xl overflow-hidden bg-gray-100" style={{ minHeight: 480 }}>

        {/* Facing badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
            ${facing === 'FRONT' ? 'bg-primary text-white shadow' : 'bg-black/40 text-white/70'}`}>
            ▶ FRONT
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
            ${facing === 'BACK' ? 'bg-primary text-white shadow' : 'bg-black/40 text-white/70'}`}>
            BACK ◀
          </span>
        </div>

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
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 8, 6]}  intensity={1.3} castShadow
            shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[-5, 3, -3]} intensity={0.4} />
          <directionalLight position={[0, -2, -5]} intensity={0.18} />

          <Suspense fallback={null}>
            {designImage
              ? <SceneWithTexture
                  product={product}
                  color={garmentColor}
                  designImage={designImage}
                  printLocation={printLocation}
                  designSize={designSize}
                  designRotation={designRotation}
                  greyMode={greyMode}
                />
              : <SceneNoTexture
                  product={product}
                  color={garmentColor}
                  printLocation={printLocation}
                  greyMode={greyMode}
                />
            }
          </Suspense>

          {/* Smooth orbit — no pan, bounded polar angle, damped deceleration */}
          <OrbitControls
            enablePan={false}
            enableZoom
            enableDamping
            dampingFactor={0.06}
            minDistance={4}
            maxDistance={14}
            minPolarAngle={Math.PI * 0.12}
            maxPolarAngle={Math.PI * 0.85}
          />

          {/* Track camera to update FRONT/BACK badge */}
          <FacingTracker onFacing={setFacing} />

          {/* Auto-reposition camera when location changes to back */}
          <CameraReset location={printLocation} camZ={camZ} />
        </Canvas>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-1.5 rounded-full pointer-events-none select-none">
          🖱 Drag to rotate · Scroll to zoom
        </div>
      </div>
    </CanvasErrorBoundary>
  );
}

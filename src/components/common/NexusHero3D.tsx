import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export const NexusHero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xff7700, 1.5);
    warmKeyLight.position.set(12, 16, 14);
    scene.add(warmKeyLight);

    const coolFillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    coolFillLight.position.set(-14, -10, -8);
    scene.add(coolFillLight);

    // Dynamic point light that follows cursor (soft and atmospheric)
    const cursorLight = new THREE.PointLight(0xf97316, 1.8, 25);
    cursorLight.position.set(0, 0, 8);
    scene.add(cursorLight);

    // --- Main Composite 3D Hierarchy (Nexus Veritas Quality Matrix) ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Faceted Core (Icosahedron - The Certified Quality Core)
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: themeRef.current === 'light' ? 0xffffff : 0x0f172a,
      emissive: 0xea580c,
      emissiveIntensity: themeRef.current === 'light' ? 0.15 : 0.3,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      wireframe: false,
      flatShading: true,
      transparent: true,
      opacity: themeRef.current === 'light' ? 0.22 : 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 2. Wireframe Cage Lattice (ISO Standards Compliance Frame)
    const cageGeo = new THREE.IcosahedronGeometry(2.7, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: themeRef.current === 'light' ? 0.18 : 0.28,
      roughness: 0.4,
      metalness: 0.7,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    mainGroup.add(cageMesh);

    // 3. Technical Orbital Rings (Auditing & Surveillance Cycles: ISO 9001, 14001, 45001, 27001)
    const ringGroup = new THREE.Group();
    mainGroup.add(ringGroup);

    const ringRadii = [3.8, 4.7, 5.6];
    const ringTubes = [0.035, 0.04, 0.045];
    const rings: THREE.Mesh[] = [];

    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.TorusGeometry(radius, ringTubes[i], 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xf97316 : i === 1 ? 0xfbbf24 : 0x38bdf8,
        emissive: i === 0 ? 0xea580c : i === 1 ? 0xd97706 : 0x0284c7,
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.75,
        transparent: true,
        opacity: 0.32,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * (0.2 + i * 0.25);
      ring.rotation.y = Math.PI * (0.15 + i * 0.2);
      ringGroup.add(ring);
      rings.push(ring);
    });

    // 4. Floating Nodes / Constellation (Certified Suppliers, Lead Auditors, Traceability Beacons)
    const nodeCount = 42;
    const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf97316,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.4,
    });

    const nodesMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const nodePositions: THREE.Vector3[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 4.2 + (i % 3) * 1.4;

      const pos = new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );
      nodePositions.push(pos);

      dummy.position.copy(pos);
      dummy.scale.setScalar(0.7 + (i % 5) * 0.2);
      dummy.updateMatrix();
      nodesMesh.setMatrixAt(i, dummy.matrix);
    }
    nodesMesh.instanceMatrix.needsUpdate = true;
    mainGroup.add(nodesMesh);

    // 5. Connective Spline Lines / Cryptographic Integrity Links (SHA-256 Mesh)
    const lineCoords: number[] = [];
    for (let i = 0; i < nodePositions.length; i += 2) {
      const p1 = nodePositions[i];
      const p2 = nodePositions[(i + 3) % nodePositions.length];
      lineCoords.push(p1.x, p1.y, p1.z);
      lineCoords.push(p2.x, p2.y, p2.z);
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: themeRef.current === 'light' ? 0.08 : 0.16,
    });
    const networkLines = new THREE.LineSegments(linesGeo, linesMat);
    mainGroup.add(networkLines);

    // Position group slightly toward the right in desktop for balanced editorial hierarchy
    mainGroup.position.set(1.5, 0.2, 0);

    // --- Interactive Mouse Physics & Damping ---
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handlePointerMove = (e: MouseEvent) => {
      // Normalize mouse to -1..1
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouse.targetX = x;
      mouse.targetY = y;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      // Adjust group position based on viewport width
      if (w < 768) {
        mainGroup.position.set(0, 0, -2);
        mainGroup.scale.setScalar(0.72);
      } else if (w < 1200) {
        mainGroup.position.set(0.8, 0, 0);
        mainGroup.scale.setScalar(0.88);
      } else {
        mainGroup.position.set(1.8, 0.2, 0);
        mainGroup.scale.setScalar(1.0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Exponential damping for silky smooth motion
      mouse.x = THREE.MathUtils.damp(mouse.x, mouse.targetX, 4, delta);
      mouse.y = THREE.MathUtils.damp(mouse.y, mouse.targetY, 4, delta);

      // Rotate central components autonomously + mouse reaction
      coreMesh.rotation.y = time * 0.15 + mouse.x * 0.4;
      coreMesh.rotation.x = time * 0.1 + mouse.y * 0.3;

      cageMesh.rotation.y = -time * 0.12 + mouse.x * 0.5;
      cageMesh.rotation.z = time * 0.08;

      // Rotate individual orbital rings
      rings.forEach((ring, idx) => {
        const speed = (idx + 1) * 0.18;
        ring.rotation.z = time * speed * (idx % 2 === 0 ? 1 : -1) + mouse.x * 0.3;
        ring.rotation.x += Math.sin(time * 0.5 + idx) * 0.001;
      });

      // Overall group tilt responding to cursor with 3D depth
      mainGroup.rotation.y = mouse.x * 0.65;
      mainGroup.rotation.x = -mouse.y * 0.55;

      // Update cursor point light in 3D space
      cursorLight.position.x = mouse.x * 8;
      cursorLight.position.y = mouse.y * 6;
      cursorLight.position.z = 6 + Math.sin(time) * 1.5;

      // Dynamic theme adaptation (ultra soft & transparent)
      const isLight = themeRef.current === 'light';
      coreMat.color.setHex(isLight ? 0xffffff : 0x0f172a);
      coreMat.opacity = isLight ? 0.2 : 0.35;
      coreMat.emissiveIntensity = isLight ? 0.15 : 0.3;
      cageMat.opacity = isLight ? 0.16 : 0.28;
      linesMat.opacity = isLight ? 0.08 : 0.16;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      // Geometries
      coreGeo.dispose();
      cageGeo.dispose();
      rings.forEach((r) => r.geometry.dispose());
      nodeGeo.dispose();
      linesGeo.dispose();

      // Materials
      coreMat.dispose();
      cageMat.dispose();
      rings.forEach((r) => (r.material as THREE.Material).dispose());
      nodeMat.dispose();
      linesMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-40 sm:opacity-50 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
};

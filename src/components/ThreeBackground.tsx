import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Skip on mobile — saves battery and eliminates jank
    if (window.innerWidth < 768) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // antialias: false — significant perf win on non-retina screens
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

    renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap at 1x on low-end devices to halve fill rate cost
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    containerRef.current.appendChild(renderer.domElement);

    const palette = [
      [0.51, 0.55, 0.98],
      [0.51, 0.55, 0.98],
      [0.13, 0.83, 0.93],
      [0.13, 0.83, 0.93],
      [0.65, 0.54, 0.98],
    ];

    const particlesGeometry = new THREE.BufferGeometry();
    // Reduced from 1200 → 600 particles: same visual, half the vertex work
    const count = 600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const icoGeo = new THREE.IcosahedronGeometry(14, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.07, wireframe: true });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(20, -5, -12);
    scene.add(ico);

    const torusGeo = new THREE.TorusGeometry(8, 2.5, 12, 40);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.05, wireframe: true });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-18, 8, -15);
    scene.add(torus);

    camera.position.z = 30;

    let mouseOffsetX = 0;
    let mouseOffsetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseOffsetX = (e.clientX / window.innerWidth - 0.5) * 0.25;
      mouseOffsetY = (e.clientY / window.innerHeight - 0.5) * 0.15;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Cap to ~30 fps — imperceptible for a background, halves GPU load
    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 30;
    let rafId: number;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      if (now - lastTime < FPS_INTERVAL) return;
      lastTime = now;

      const t = now * 0.0003;
      particles.rotation.y = t * 0.06 + mouseOffsetX;
      particles.rotation.x = t * 0.025 + mouseOffsetY;
      ico.rotation.x = t * 0.12;
      ico.rotation.y = t * 0.18;
      torus.rotation.x = t * 0.2;
      torus.rotation.z = t * 0.1;

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    // Pause when tab is hidden — stops wasting GPU in background
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

export default ThreeBackground;

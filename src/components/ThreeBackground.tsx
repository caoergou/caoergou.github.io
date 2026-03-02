import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Aurora palette: indigo / cyan / purple
    const palette = [
      [0.51, 0.55, 0.98],  // #818cf8 indigo
      [0.51, 0.55, 0.98],  // weighted
      [0.13, 0.83, 0.93],  // #22d3ee cyan
      [0.13, 0.83, 0.93],  // weighted
      [0.65, 0.54, 0.98],  // #a78bfa purple
    ];

    // Multi-color particle field
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 1200;
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

    // Cyan wireframe icosahedron — right side, far back
    const icoGeo = new THREE.IcosahedronGeometry(14, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.07,
      wireframe: true,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(20, -5, -12);
    scene.add(ico);

    // Purple wireframe torus — left side
    const torusGeo = new THREE.TorusGeometry(8, 2.5, 12, 40);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.05,
      wireframe: true,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-18, 8, -15);
    scene.add(torus);

    camera.position.z = 30;

    // Subtle mouse parallax
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseOffsetX = (e.clientX / window.innerWidth - 0.5) * 0.25;
      mouseOffsetY = (e.clientY / window.innerHeight - 0.5) * 0.15;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!prefersReduced) {
        const t = Date.now() * 0.0003;
        particles.rotation.y = t * 0.06 + mouseOffsetX;
        particles.rotation.x = t * 0.025 + mouseOffsetY;
        ico.rotation.x = t * 0.12;
        ico.rotation.y = t * 0.18;
        torus.rotation.x = t * 0.2;
        torus.rotation.z = t * 0.1;
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeBackground;

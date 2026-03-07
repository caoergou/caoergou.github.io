import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PixelBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // Pixel style - no antialiasing
      powerPreference: 'low-power'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    containerRef.current.appendChild(renderer.domElement);

    // Zelda-inspired palette: Gold / Green / Blue / Purple
    const palette = [
      [1.0, 0.85, 0.24],    // #ffd93d Gold - treasure
      [1.0, 0.85, 0.24],
      [0.42, 0.8, 0.47],    // #6bcb77 Green - nature
      [0.42, 0.8, 0.47],
      [0.3, 0.59, 1.0],     // #4d96ff Blue - magic
      [0.79, 0.69, 1.0],    // #c9b1ff Purple - mystery
    ];

    // Pixel cube particles - fewer on mobile
    const count = isMobile ? 400 : 800;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];

      // Random sizes for pixel effect
      sizes[i] = Math.random() * 0.5 + 0.2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader for pixel cubes
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Gentle floating motion
          float floatY = sin(uTime * 0.5 + position.x * 0.1) * 0.5;
          float floatX = cos(uTime * 0.3 + position.z * 0.1) * 0.3;
          mvPosition.y += floatY;
          mvPosition.x += floatX;

          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Pixel cube effect - square shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = max(abs(center.x), abs(center.y));

          if (dist > 0.4) discard;

          // Pixel border effect
          float border = step(0.35, dist);
          vec3 finalColor = mix(vColor, vColor * 0.7, border);

          gl_FragColor = vec4(finalColor, 1.0 - border * 0.5);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Low-poly pixel-style mountain silhouettes (wireframe tetrahedrons)
    const createPixelMountain = (x: number, y: number, z: number, scale: number, color: number) => {
      const geometry = new THREE.TetrahedronGeometry(8 * scale, 0);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.z = Math.PI;
      return mesh;
    };

    // Add distant mountains
    if (!isMobile) {
      const mountains = [
        createPixelMountain(25, -10, -30, 2, 0x6bcb77),  // Green mountain
        createPixelMountain(-30, -8, -35, 2.5, 0x4d96ff), // Blue mountain
        createPixelMountain(0, -12, -40, 3, 0xc9b1ff),    // Purple mountain
      ];
      mountains.forEach(m => scene.add(m));
    }

    // Floating pixel crystal (pixelated dodecahedron)
    const crystalGeo = new THREE.DodecahedronGeometry(6, 0);
    const crystalMat = new THREE.MeshBasicMaterial({
      color: 0xffd93d,
      transparent: true,
      opacity: 0.06,
      wireframe: true,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(isMobile ? 15 : 25, 5, -20);
    scene.add(crystal);

    camera.position.z = 35;

    // Subtle mouse parallax
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseOffsetX = (e.clientX / window.innerWidth - 0.5) * 0.2;
      mouseOffsetY = (e.clientY / window.innerHeight - 0.5) * 0.1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Touch support for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseOffsetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.1;
        mouseOffsetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.05;
      }
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!prefersReduced) {
        const t = Date.now() * 0.0003;

        // Update shader time
        particlesMaterial.uniforms.uTime.value = t;

        particles.rotation.y = t * 0.05 + mouseOffsetX;
        particles.rotation.x = t * 0.02 + mouseOffsetY;

        if (!isMobile) {
          crystal.rotation.x = t * 0.15;
          crystal.rotation.y = t * 0.2;
          crystal.position.y = 5 + Math.sin(t * 2) * 2;
        }
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
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
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

export default PixelBackground;

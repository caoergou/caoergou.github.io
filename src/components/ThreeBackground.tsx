import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MinecraftBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'low-power'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    containerRef.current.appendChild(renderer.domElement);

    // Minecraft-inspired palette: Grass Green / Diamond Blue / Gold / Redstone / Nether Purple
    const palette = [
      [0.36, 0.81, 0.18],    // #5DCE2E Grass block green
      [0.36, 0.81, 0.18],
      [0.23, 0.54, 1.0],     // #3B8AFF Diamond blue
      [1.0, 0.67, 0.0],      // #FFAA00 Gold ingot
      [0.77, 0.12, 0.23],    // #C41E3A Redstone red
      [0.5, 0.25, 0.75],     // #7F3FBF Nether portal purple
      [0.0, 0.75, 0.8],      // #00BFCB Diamond ore cyan
    ];

    // Block particles - fewer on mobile
    const count = isMobile ? 200 : 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];

      // Random sizes for block effect
      sizes[i] = Math.random() * 0.8 + 0.3;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader for Minecraft-style block particles
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

          // Floating motion like floating items
          float floatY = sin(uTime * 0.4 + position.x * 0.08) * 0.8;
          float floatX = cos(uTime * 0.25 + position.z * 0.08) * 0.5;
          float floatZ = sin(uTime * 0.3 + position.y * 0.05) * 0.3;
          mvPosition.y += floatY;
          mvPosition.x += floatX;
          mvPosition.z += floatZ;

          gl_PointSize = size * uPixelRatio * (280.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Minecraft block effect - square shape with 3D look
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = max(abs(center.x), abs(center.y));

          if (dist > 0.42) discard;

          // 3D block shading effect
          float topLight = 1.0 - center.y * 0.3;
          float sideDark = 1.0 + center.x * 0.15;

          // Border highlight for block edge
          float border = step(0.35, dist);
          vec3 borderColor = vColor * 0.5;
          vec3 faceColor = vColor * topLight * sideDark;

          vec3 finalColor = mix(faceColor, borderColor, border);

          // Slight glow effect
          float glow = 1.0 - dist * 1.5;

          gl_FragColor = vec4(finalColor, 0.85 * glow);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Floating ores - wireframe cubes (diamond/gold ore)
    const createFloatingOre = (x: number, y: number, z: number, size: number, color: number) => {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.06,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      return mesh;
    };

    // Add floating ores
    if (!isMobile) {
      const ores = [
        createFloatingOre(30, 10, -35, 4, 0x3B8AFF),   // Diamond ore
        createFloatingOre(-25, -5, -40, 5, 0xFFAA00),  // Gold ore
        createFloatingOre(0, 15, -45, 6, 0x7F3FBF),    // Nether portal
        createFloatingOre(-35, 8, -30, 3.5, 0x5DCE2E), // Emerald
      ];
      ores.forEach(ore => scene.add(ore));
    }

    // Central floating diamond
    const diamondGeo = new THREE.OctahedronGeometry(5, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0x3B8AFF,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.set(isMobile ? 12 : 20, 8, -25);
    scene.add(diamond);

    camera.position.z = 40;

    // Mouse parallax
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseOffsetX = (e.clientX / window.innerWidth - 0.5) * 0.15;
      mouseOffsetY = (e.clientY / window.innerHeight - 0.5) * 0.08;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseOffsetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.08;
        mouseOffsetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.04;
      }
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!prefersReduced) {
        const t = Date.now() * 0.00025;

        particlesMaterial.uniforms.uTime.value = t;

        particles.rotation.y = t * 0.03 + mouseOffsetX;
        particles.rotation.x = t * 0.015 + mouseOffsetY;

        if (!isMobile) {
          // Rotate floating ores
          scene.children.forEach((child, i) => {
            if (child instanceof THREE.Mesh && child.geometry.type === 'BoxGeometry') {
              child.rotation.x = t * 0.1 + i;
              child.rotation.y = t * 0.15 + i;
              child.position.y += Math.sin(t * 1.5 + i * 0.5) * 0.01;
            }
          });

          // Rotate central diamond
          diamond.rotation.x = t * 0.2;
          diamond.rotation.y = t * 0.25;
          diamond.position.y = 8 + Math.sin(t * 1.5) * 3;
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

export default MinecraftBackground;

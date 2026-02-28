import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x667eea, 1, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x764ba2, 1, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create geometric shapes
    const geometry1 = new THREE.TorusGeometry(10, 3, 16, 100);
    const material1 = new THREE.MeshPhongMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const torus1 = new THREE.Mesh(geometry1, material1);
    scene.add(torus1);

    const geometry2 = new THREE.IcosahedronGeometry(8, 0);
    const material2 = new THREE.MeshPhongMaterial({
      color: 0x764ba2,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    const icosahedron = new THREE.Mesh(geometry2, material2);
    scene.add(icosahedron);

    const geometry3 = new THREE.OctahedronGeometry(6, 0);
    const material3 = new THREE.MeshPhongMaterial({
      color: 0x20c997,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const octahedron = new THREE.Mesh(geometry3, material3);
    scene.add(octahedron);

    camera.position.z = 30;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate shapes
      torus1.rotation.x += 0.002;
      torus1.rotation.y += 0.005;

      icosahedron.rotation.x -= 0.003;
      icosahedron.rotation.y -= 0.004;

      octahedron.rotation.x += 0.001;
      octahedron.rotation.y -= 0.002;

      // Rotate particles
      particlesMesh.rotation.y += 0.0005;

      // Float effect
      const time = Date.now() * 0.001;
      torus1.position.y = Math.sin(time * 0.5) * 2;
      icosahedron.position.y = Math.cos(time * 0.7) * 1.5;
      octahedron.position.y = Math.sin(time * 0.3) * 2.5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
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
        opacity: 0.6,
      }}
    />
  );
};

export default ThreeBackground;

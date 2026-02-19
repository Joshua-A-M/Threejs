import { useEffect, useRef } from "react";
import raindropTexture from "../assets/textures/particles/raindrop-3t.png";
import * as THREE from "three";

export function RainTexture() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const pointsRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    // --------------------------------------------------------
    // SCENE SETUP (only once)
    // --------------------------------------------------------
    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.Fog(0x000000, 5, 25);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        100,
      );
      camera.position.set(-3, 2, 8);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      sceneRef.current = { scene, camera, renderer };
    }

    const { scene, camera, renderer } = sceneRef.current;

    // --------------------------------------------------------
    // PARTICLE SYSTEM (BufferGeometry)
    // --------------------------------------------------------
    if (!pointsRef.current) {
      const count = 25000; // total raindrops
      const range = 20; // size of rain volume

      // ----------------------------------------------------
      // WHY BUFFERGEOMETRY?
      // ----------------------------------------------------
      // Instead of creating 25,000 Mesh objects (slow),
      // we create ONE geometry containing 25,000 vertices.
      //
      // This results in:
      // - 1 draw call
      // - 1 object
      // - Very high performance
      //
      // The GPU processes all vertices in parallel.
      // ----------------------------------------------------

      // Each particle needs:
      // x, y, z position → 3 values per particle
      const positions = new Float32Array(count * 3);

      // Each particle also has velocity:
      // vx, vy → 2 values per particle
      const velocities = new Float32Array(count * 2);

      // ----------------------------------------------------
      // Fill the buffers
      // ----------------------------------------------------
      for (let i = 0; i < count; i++) {
        // Position layout in memory:
        // [x0, y0, z0,  x1, y1, z1,  x2, y2, z2, ...]
        positions[i * 3] = Math.random() * range - range / 2; // x
        positions[i * 3 + 1] = Math.random() * range - range / 2; // y
        positions[i * 3 + 2] = Math.random() * range - range / 2; // z

        // Velocity layout in memory:
        // [vx0, vy0,  vx1, vy1,  vx2, vy2, ...]
        velocities[i * 2] = ((Math.random() - 0.5) / 5) * 0.01; // horizontal drift
        velocities[i * 2 + 1] = Math.random() * 0.05 + 0.01; // falling speed
      }

      // ----------------------------------------------------
      // Create BufferGeometry
      // ----------------------------------------------------
      const geometry = new THREE.BufferGeometry();

      // The "3" means:
      // Every 3 consecutive numbers form ONE vertex
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      // Custom attribute we update manually
      // "2" means every 2 numbers form one velocity entry
      geometry.setAttribute(
        "velocity",
        new THREE.BufferAttribute(velocities, 2),
      );

      // ----------------------------------------------------
      // Load texture
      // ----------------------------------------------------
      const loader = new THREE.TextureLoader();
      loader.load(raindropTexture, (texture) => {
        texture.needsUpdate = true;

        const material = new THREE.PointsMaterial({
          size: 0.1,
          color: 0xffffff,
          map: texture,
          transparent: true,
          opacity: 0.8,
          alphaTest: 0.01,
          depthWrite: false,
        });

        // THREE.Points renders each vertex as a billboard sprite
        // So each vertex becomes one raindrop
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        pointsRef.current = { points, geometry, material };

        // ----------------------------------------------------
        // ANIMATION LOOP
        // ----------------------------------------------------
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);

          // Direct access to the raw memory buffers
          const pos = geometry.attributes.position.array;
          const vel = geometry.attributes.velocity.array;

          for (let i = 0; i < count; i++) {
            // Position indexing:
            // pos[i * 3]     → x
            // pos[i * 3 + 1] → y
            // pos[i * 3 + 2] → z

            // Velocity indexing:
            // vel[i * 2]     → vx
            // vel[i * 2 + 1] → vy

            // Apply horizontal movement
            pos[i * 3] += vel[i * 2];

            // Apply downward movement
            pos[i * 3 + 1] -= vel[i * 2 + 1];

            // Wrap around if particle exits bounds
            if (pos[i * 3] < -range / 2) pos[i * 3] = range / 2;
            if (pos[i * 3] > range / 2) pos[i * 3] = -range / 2;

            if (pos[i * 3 + 1] < -range / 2) pos[i * 3 + 1] = range / 2;
          }

          // VERY IMPORTANT:
          // This tells Three.js to re-upload the updated
          // position buffer to the GPU this frame.
          geometry.attributes.position.needsUpdate = true;

          renderer.render(scene, camera);
        };

        animate();
      });
    }

    // --------------------------------------------------------
    // Resize handling
    // --------------------------------------------------------
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}

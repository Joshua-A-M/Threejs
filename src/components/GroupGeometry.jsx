import { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function GroupGeometry() {
  // Reference to the DOM element where Three.js will mount
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;

    /* -----------------------------------------------------------
       SCENE SETUP
    ----------------------------------------------------------- */

    // Create main scene
    const scene = new THREE.Scene();

    // Set background color (black)
    scene.background = new THREE.Color(0x000000);

    /* -----------------------------------------------------------
       CAMERA
    ----------------------------------------------------------- */

    // Perspective camera:
    // 75 = FOV
    // aspect ratio = window width / height
    // 0.1 = near clipping plane
    // 1000 = far clipping plane
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // Move camera back so we are not inside the cubes
    camera.position.set(0, 0, 40);

    /* -----------------------------------------------------------
       RENDERER
    ----------------------------------------------------------- */

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Match renderer size to window
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Enable soft shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add renderer canvas to DOM
    container.appendChild(renderer.domElement);

    /* -----------------------------------------------------------
       ORBIT CONTROLS
    ----------------------------------------------------------- */

    // Allows mouse interaction (rotate / zoom / pan)
    const controls = new OrbitControls(camera, renderer.domElement);

    // Set orbit target to center of scene
    controls.target.set(0, 0, 0);
    controls.update();

    /* -----------------------------------------------------------
       PERFORMANCE STATS
    ----------------------------------------------------------- */

    // FPS monitor
    const stats = new Stats();
    container.appendChild(stats.dom);

    /* -----------------------------------------------------------
       LIGHTING
    ----------------------------------------------------------- */

    // Soft directional light
    const extraLight = new THREE.DirectionalLight(0xffffff, 0.2);
    extraLight.position.set(-5, 1, 0);
    scene.add(extraLight);

    /* -----------------------------------------------------------
       FLOOR
    ----------------------------------------------------------- */

    // Create a flat plane
    const floorGeometry = new THREE.PlaneGeometry(8, 8);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      side: THREE.DoubleSide,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    // Rotate plane so it lies flat
    floor.rotation.x = Math.PI / 2;

    // Move floor down slightly
    floor.position.y = -3;

    scene.add(floor);

    /* -----------------------------------------------------------
       GROUP OF 5000 GEOMETRIES
    ----------------------------------------------------------- */

    const size = 1; // size of each cube
    const amount = 5000; // number of cubes
    const range = 20; // spread range in 3D space

    // Create a THREE.Group to hold all cubes
    // This allows us to rotate / scale them together
    const group = new THREE.Group();

    // Shared material (important for performance)
    const mat = new THREE.MeshNormalMaterial();
    mat.blending = THREE.NormalBlending;
    mat.opacity = 0.1;
    mat.transparent = true;

    // Create 5000 cubes
    for (let i = 0; i < amount; i++) {
      // Random position within defined range
      const x = Math.random() * range - range / 2;
      const y = Math.random() * range - range / 2;
      const z = Math.random() * range - range / 2;

      // Create cube geometry
      const g = new THREE.BoxGeometry(size, size, size);

      // Create mesh from geometry + shared material
      const m = new THREE.Mesh(g, mat);

      // Set random position
      m.position.set(x, y, z);

      // Add cube to group
      group.add(m);
    }

    // Add entire group to scene
    scene.add(group);

    /* -----------------------------------------------------------
       GUI CONTROLS (lil-gui)
    ----------------------------------------------------------- */

    const gui = new GUI();
    const folder = gui.addFolder("Group controls");

    // Rotation controls
    folder.add(group.rotation, "x", 0, Math.PI * 2);
    folder.add(group.rotation, "y", 0, Math.PI * 2);
    folder.add(group.rotation, "z", 0, Math.PI * 2);

    // Scale controls
    folder.add(group.scale, "x", 0.1, 5);
    folder.add(group.scale, "y", 0.1, 5);
    folder.add(group.scale, "z", 0.1, 5);

    folder.open();

    /* -----------------------------------------------------------
       ANIMATION LOOP
    ----------------------------------------------------------- */

    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Render scene
      renderer.render(scene, camera);

      // Update controls (needed for damping if enabled)
      controls.update();

      // Update FPS stats
      stats.update();
    };

    animate();

    /* -----------------------------------------------------------
       RESIZE HANDLING
    ----------------------------------------------------------- */

    const handleResize = () => {
      // Update camera aspect ratio
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    /* -----------------------------------------------------------
       CLEANUP (VERY IMPORTANT IN REACT)
    ----------------------------------------------------------- */

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      controls.dispose();
      gui.destroy();

      // Dispose all geometries inside group
      group.children.forEach((child) => {
        child.geometry.dispose();
      });

      mat.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();

      renderer.dispose();

      container.removeChild(renderer.domElement);
      stats.dom.remove();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}

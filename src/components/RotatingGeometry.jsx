import { useEffect, useRef } from "react";
import * as THREE from "three";
import classes from "./CubeGeometry.module.css";

export function RotatingGeometry() {
  const mountRef = useRef(null);

  // Store references so button can access them
  const cubeRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  // Target rotation
  const targetRotation = useRef(0);
  useEffect(() => {
    const container = mountRef.current;
    //  Scene, Camera, Renderer, Lights, Mesh
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    //  FOV, aspect, near, far
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // Move camera further back so cube fits
    camera.position.set(20, 20, 20); // x, y, z
    camera.lookAt(0, 0, 0); // center of the scene
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(5, 10, 5);
    scene.add(light);

    //  x, y, z
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    // Six materials, one per face
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff0000 }), // right
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }), // left
      new THREE.MeshStandardMaterial({ color: 0x0000ff }), // top
      new THREE.MeshStandardMaterial({ color: 0xffff00 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0xff00ff }), // front
      new THREE.MeshStandardMaterial({ color: 0x00ffff }), // back
    ];
    const mesh = new THREE.Mesh(geometry, materials);
    scene.add(mesh);
    cubeRef.current = mesh;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", resize);

    const animate = () => {
      requestAnimationFrame(animate);
      if (cubeRef.current) {
        cubeRef.current.rotation.y = THREE.MathUtils.lerp(
          cubeRef.current.rotation.y,
          targetRotation.current,
          0.08,
        );
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      materials.forEach((m) => m.dispose());
      // ✅ Safe removal
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);
  // Button click handler
  const rotateCube = () => {
    targetRotation.current += Math.PI / 2; // rotate 90°
  };

  return (
    <div className={classes.container}>
      <div ref={mountRef} className={classes.threeCanvas}></div>

      <button
        onClick={rotateCube}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
        }}
      >
        Rotate Cube
      </button>
    </div>
  );
}

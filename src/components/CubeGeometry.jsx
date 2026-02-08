import { useEffect, useRef } from "react";
import * as THREE from "three";
import classes from "./CubeGeometry.module.css";

export function CubeGeometry() {
  //  Need a Camera, a Light, a Mesh, and a Renderer

  const mountRef = useRef(null);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    //  Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 20;

    //  Rendere
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    //  Mesh
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    //  Lights
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(5, 10, 5);
    scene.add(light);

    //  resize
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    //  Observe the container
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    //  render loop
    const animate = () => {
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);
  return (
    <div className={classes.container}>
      <div ref={mountRef} className={classes.threeCanvas}></div>
    </div>
  );
}

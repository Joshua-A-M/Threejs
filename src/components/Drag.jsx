import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

export function Drag() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ==============================
    // SCENE
    // ==============================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // ==============================
    // CAMERA (use container size)
    // ==============================
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(-3, 2, 8);

    // ==============================
    // RENDERER
    // ==============================
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ==============================
    // LIGHTING
    // ==============================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // ==============================
    // FLOOR
    // ==============================
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.2 }),
    );

    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ==============================
    // CUBES
    // ==============================
    const group = new THREE.Group();
    const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        for (let k = 0; k < 10; k++) {
          const material = new THREE.MeshPhongMaterial({
            color: 0x3333ff * Math.random(),
            transparent: true,
            opacity: 0.9,
          });

          const cube = new THREE.Mesh(boxGeometry, material);

          cube.position.set(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
          );

          cube.castShadow = true;
          cube.receiveShadow = true;

          group.add(cube);
        }
      }
    }

    scene.add(group);

    // ==============================
    // ORBIT CONTROLS
    // ==============================
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    // ==============================
    // DRAG CONTROLS
    // ==============================
    const dragControls = new DragControls(
      group.children,
      camera,
      renderer.domElement,
    );

    dragControls.addEventListener("dragstart", (event) => {
      orbitControls.enabled = false;
      event.object.material.emissive?.set(0x333333);
    });

    dragControls.addEventListener("dragend", (event) => {
      orbitControls.enabled = true;
      event.object.material.emissive?.set(0x000000);
    });

    // ==============================
    // ANIMATION LOOP
    // ==============================
    let animationId;

    const animate = () => {
      orbitControls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // ==============================
    // RESIZE HANDLER
    // ==============================
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // ==============================
    // CLEANUP
    // ==============================
    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener("resize", handleResize);

      dragControls.dispose();
      orbitControls.dispose();

      boxGeometry.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}

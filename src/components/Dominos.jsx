import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import RAPIER from "@dimforge/rapier3d-compat";

export function Dominos() {
  const mountRef = useRef(null);

  // Ref to store animation and world to cancel/clean on reset
  const animationRef = useRef(null);
  const worldRef = useRef(null);

  // Trigger for resetting the scene
  const [resetFlag, setResetFlag] = useState(0);

  const initScene = useCallback(async () => {
    // --- Cancel previous animation ---
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // --- Dispose previous world ---
    if (worldRef.current) worldRef.current = null;

    let scene, camera, renderer;
    let world;
    let dominosGroup;

    const gravity = { x: 0, y: -9.81, z: 0 };

    await RAPIER.init();
    world = new RAPIER.World(gravity);
    worldRef.current = world;

    // --- Scene ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    // --- Camera ---
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(-1.5, 4, -4);

    // --- Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear old canvas
    if (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // --- Lights ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);

    // --- Controls ---
    new OrbitControls(camera, renderer.domElement);

    // --- GUI ---
    const gui = new GUI();
    const gravityFolder = gui.addFolder("Gravity");
    gravityFolder.add(gravity, "x", -10, 10, 0.1);
    gravityFolder.add(gravity, "y", -20, 0, 0.1);
    gravityFolder.add(gravity, "z", -10, 10, 0.1);
    gravityFolder.open();

    // --- Arena ---
    const arena = createArena();
    scene.add(arena);
    arena.children.forEach((mesh) => createFloor(mesh, world));

    // --- Dominos ---
    dominosGroup = createDominos();
    scene.add(dominosGroup);
    dominosGroup.children.forEach((mesh, idx) =>
      createDomino(mesh, idx === 0, world, dominosGroup.children[idx + 1])
    );

    // --- Animate ---
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      world.step();

      dominosGroup.children.forEach((domino) => {
        const body = domino.userData.rigidBody;
        const pos = body.translation();
        const rot = body.rotation();
        domino.position.set(pos.x, pos.y, pos.z);
        domino.quaternion.set(rot.x, rot.y, rot.z, rot.w);
      });

      renderer.render(scene, camera);
    };
    animate();

    // --- Window resize ---
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }, [resetFlag]);

  // Init scene on mount or reset
  useEffect(() => {
    initScene();
  }, [initScene]);

  return (
    <div>
      <button
        onClick={() => setResetFlag((f) => f + 1)}
        style={{ position: "absolute", zIndex: 10, top: 20, left: 20 }}
      >
        Reset
      </button>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
}

// --- Helper functions ---
function createArena() {
  const mat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(
      "/assets/textures/wood/floor-parquet-pattern-172292.jpg"
    ),
  });

  const arena = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 6), mat);
  ground.castShadow = true;
  ground.receiveShadow = true;
  arena.add(ground);

  const walls = [
    new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 6), mat),
    new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 6), mat),
    new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.3, 0.2), mat),
    new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.3, 0.2), mat),
  ];

  walls[0].position.set(-3.1, 0.2, 0);
  walls[1].position.set(3.1, 0.2, 0);
  walls[2].position.set(0, 0.2, 3);
  walls[3].position.set(0, 0.22, -3);

  walls.forEach((w) => {
    w.castShadow = true;
    w.receiveShadow = true;
    arena.add(w);
  });

  return arena;
}

function createDominos() {
  const group = new THREE.Group();
  const r = 2.8;
  const points = [];
  let circleOffset = 0;

  for (let i = 0; i < 1200; i += 6 + circleOffset) {
    circleOffset = 1.5 * (i / 360);
    const x = (r / 1440) * (1440 - i) * Math.cos((i * Math.PI) / 180);
    const z = (r / 1440) * (1440 - i) * Math.sin((i * Math.PI) / 180);
    points.push(new THREE.Vector3(x, 0, z));
  }

  points.forEach((p, idx) => {
    const geom = new THREE.BoxGeometry(0.05, 0.5, 0.2);
    const mesh = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x66ff00 : 0x6600ff,
        transparent: true,
        opacity: 0.8,
      })
    );
    mesh.position.copy(p);
    mesh.lookAt(0, 0, 0);
    mesh.position.y = 0.35;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  return group;
}

function createFloor(mesh, world) {
  const pos = mesh.position;
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z)
  );
  const { width, height, depth } = mesh.geometry.parameters;
  const collider = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2);
  world.createCollider(collider, body);
  mesh.userData.rigidBody = body;
}

function createDomino(mesh, isFirst, world, nextDomino) {
  const pos = mesh.position;
  const quat = new THREE.Quaternion().setFromEuler(mesh.rotation);

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(pos.x, pos.y, pos.z)
    .setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w })
    .setGravityScale(1)
    .setCanSleep(false)
    .setCcdEnabled(true);

  const body = world.createRigidBody(bodyDesc);
  const { width, height, depth } = mesh.geometry.parameters;
  const collider = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2);
  world.createCollider(collider, body);
  mesh.userData.rigidBody = body;

  // Tip first domino
  if (isFirst && nextDomino) {
    const tangent = new THREE.Vector3()
      .subVectors(nextDomino.position, pos)
      .normalize();
    body.applyImpulse({ x: tangent.x * 0.03, y: 0, z: tangent.z * 0.03 }, true);
  }
}

export function GettingStarted() {
  const mountRef = useRef(null);
  const initialized = useRef(false); // ⬅️ flag
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (initialized.current) return; // already ran
    initialized.current = true;
    const container = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.25, 10),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    );
    scene.add(floor);

    const updateCameraForScreen = () => {
      const width = container.clientWidth;

      if (width < 600) {
        camera.position.set(0, 6, 11);
      } else if (width < 900) {
        camera.position.set(0, 5, 9);
      } else {
        camera.position.set(0, 5, 8);
      }

      camera.lookAt(0, 0, 0);
    };
    // Render loop
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateCameraForScreen();
    };
    updateCameraForScreen();
    // 🔥 Observe the container, not the window
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  const addCube = () => {
    const scene = sceneRef.current;

    if (!scene) return;

    // const color = randomColor();
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    // const pos = randomVector({
    //   xRange: { fromX: -4, toX: 4 },
    //   yRangge: { fromY: -3, toY: 3 },
    //   zRange: { fromZ: -4, toZ: 4 },
    // });

    // const rotation = randomVector({
    //   xRange: { fromX: 0, toX: Math.PI * 2 },
    //   yRange: { fromY: 0, toY: Math.PI * 2 },
    //   zRange: { fromZ: 0, toZ: Math.PI * 2 },
    // });

    const pos = new THREE.Vector3(
      Math.random() * 8 - 4,
      Math.random() * 4,
      Math.random() * 8 - 4,
    );
    const rotation = new THREE.Vector3(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    );

    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cube = new THREE.Mesh(geometry, cubeMaterial);
    cube.position.copy(pos);
    cube.rotation.setFromVector3(rotation);
    cube.castShadow = true;
    scene.add(cube);
  };

  const removeCube = () => {
    const scene = sceneRef.current;

    scene.children.pop();
  };

  return (
    <div className={classes.container}>
      <button onClick={addCube}>Add Cube</button>
      <button onClick={removeCube}>Remove Cube</button>
      <div ref={mountRef} className={classes.threeCanvas} />
    </div>
  );
}

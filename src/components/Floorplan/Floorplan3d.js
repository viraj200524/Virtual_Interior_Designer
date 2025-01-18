import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import "./Floorplan3d.css";
import FurnitureGrid from "./FurnitureGrid.js";
import ModelGrid from "./ModelGrid.js";
import PaintGrid from './PaintGrid.js';
import ModelRenderer from './ModelItem';
import Cart from './Cart.js'

const FloorPlan3D = () => {
  const mountRef = useRef(null);
  const location = useLocation();
  const [sceneObjects, setSceneObjects] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [activeTab, setActiveTab] = useState("MODELS");
  const controlsRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [floorplanBounds, setFloorplanBounds] = useState({
    minX: -Infinity,
    maxX: Infinity,
    minZ: -Infinity,
    maxZ: Infinity,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedPaint, setSelectedPaint] = useState(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const wallMeshesRef = useRef([]);

  const[cartItems,handleCartItems] = useState([]);
  const[cartPrice,SetCartPrice] = useState(0);

  // Handle paint selection
  const handlePaintSelect = (paint) => {
    console.log("Selected Paint:", paint);
    setSelectedPaint(paint);
    setIsPaintMode(true);
    mountRef.current.classList.add('painting');
  };

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(response => response.json())
      .then(data => {
        setFurnitureItems(data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const walls = location.state?.layout || [];
    if (!walls.length) {
      console.warn("No walls data received");
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      1,
      10000
    );
    camera.position.set(-500, 800, 1000);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);

    // Initialize floor
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.5,
      metalness: 0.1,
    });

    // Calculate floor dimensions
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    walls.forEach((wall) => {
      [wall.points[0], wall.points[2]].forEach((x) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      });
      [wall.points[1], wall.points[3]].forEach((y) => {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Create walls
    const wallHeight = 250;
    const wallThickness = 10;
    const wallMeshes = [];

    walls.forEach((wall) => {
      const [x1, y1, x2, y2] = wall.points;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const centerWallX = (x1 + x2) / 2 - centerX;
      const centerWallY = (y1 + y2) / 2 - centerY;
    
      const wallGeometry = new THREE.BoxGeometry(
        length,
        wallHeight,
        wallThickness
      );
    
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      });
    
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(centerWallX, wallHeight / 2, centerWallY);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      wallMesh.rotation.y = -angle;
    
      scene.add(wallMesh);
      wallMeshes.push(wallMesh);
      wallMeshesRef.current.push(wallMesh);
    });

    // Handle wall painting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleWallClick = (event) => {
      if (!isPaintMode || !selectedPaint) return;
    
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(wallMeshesRef.current);
    
      if (intersects.length > 0) {
        const wallMesh = intersects[0].object;
        if (wallMesh.material) {
          wallMesh.material.dispose();
        }
        const newMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(selectedPaint.color),
          roughness: 0.2,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });
        wallMesh.material = newMaterial;
        wallMesh.material.needsUpdate = true;
        wallMesh.geometry.computeBoundingSphere();
        scene.needsUpdate = true;
        requestAnimationFrame(() => {
          renderer.render(scene, camera);
        });
      }
    };

    renderer.domElement.addEventListener('click', handleWallClick);

    // Create floor
    const floorWidth = maxX - minX;
    const floorDepth = maxY - minY;
    const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // Set floorplan bounds
    setFloorplanBounds({
      minX: -floorWidth / 2,
      maxX: floorWidth / 2,
      minZ: -floorDepth / 2,
      maxZ: floorDepth / 2,
    });

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(500, 1000, 500);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-500, 1000, -500);
    scene.add(directionalLight2);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 500;
    controls.maxDistance = 3000;
    controls.target.set(0, wallHeight / 2, 0);
    controls.enabled = true; // Make sure it's enabled by default
    controls.enableRotate = true;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.panSpeed = 0.5;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    setSceneObjects({ scene, camera, renderer, floor });

    // Handle window resize
    const handleResize = () => {
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      renderer.domElement.removeEventListener('click', handleWallClick);
    };
  }, [location, selectedPaint, isPaintMode]);

  return (
    <div className="decora-container">
      <div className="main-content">
        <div className="layout-container">
          <div ref={mountRef} className="threejs-container" />
          {sceneObjects && (
            <ModelRenderer
            scene={sceneObjects.scene}
            camera={sceneObjects.camera}
            renderer={sceneObjects.renderer}
            selectedModel={selectedModel}
            walls={location.state?.layout || []}
            floorBounds={floorplanBounds}
            onError={setError}
            onLoadingChange={setIsLoading}
            orbitControls={controlsRef.current} // Pass the OrbitControls instance
          />
          )}
          {isLoading && <div className="loading-indicator">Loading...</div>}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="furniture-section">
          <div className="furniture-header">
            <button
              className={`header-button ${activeTab === "MODELS" ? "active" : ""}`}
              onClick={() => setActiveTab("MODELS")}
            >
              MODELS
            </button>
            <button
              className={`header-button ${activeTab === "FURNITURE" ? "active" : ""}`}
              onClick={() => setActiveTab("FURNITURE")}
            >
              FURNITURE
            </button>
            <button
              className={`header-button ${activeTab === "PAINT" ? "active" : ""}`}
              onClick={() => setActiveTab("PAINT")}
            >
              PAINT
            </button>
            <button
              className={`header-button ${activeTab === "CART" ? "active" : ""}`}
              onClick={() => setActiveTab("CART")}
            >
              CART
            </button>
          </div>

          <div className="furniture-grid">
            {activeTab === "FURNITURE" && <FurnitureGrid products={furnitureItems} items={cartItems} handleCartItems={handleCartItems} cartPrice={cartPrice} handleCartPrice={SetCartPrice} />}
            {activeTab === "MODELS" && (
              <ModelGrid
                apiKey="your_sketchfab_api"
                onModelSelect={setSelectedModel}
              />
            )}
            {activeTab === 'PAINT' && <PaintGrid onPaintSelect={handlePaintSelect} />}
            {activeTab === "CART" && <Cart items={cartItems} handleCartItems={handleCartItems} cartPrice={cartPrice} handleCartPrice={SetCartPrice}/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan3D;
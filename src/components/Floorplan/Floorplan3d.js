import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls, DragControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./Floorplan3d.css";
import FurnitureGrid from "./FurnitureGrid.js";
import ModelGrid from "./ModelGrid.js";
import PaintGrid from './PaintGrid.js';

const FloorPlan3D = () => {
  const mountRef = useRef(null);
  const location = useLocation();
  const [sceneObjects, setSceneObjects] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [activeTab, setActiveTab] = useState("MODELS");
  const controlsRef = useRef(null); // For floorplan controls
  const [selectedModel, setSelectedModel] = useState(null);
  const currentModelRef = useRef(null);
  const dragControlsRef = useRef(null); // For furniture dragging
  const [floorplanBounds, setFloorplanBounds] = useState({
    minX: -Infinity,
    maxX: Infinity,
    minZ: -Infinity,
    maxZ: Infinity,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
  const [isRotatingEnabled, setIsRotatingEnabled] = useState(false);

  const [selectedPaint, setSelectedPaint] = useState(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const wallMeshesRef = useRef([]);

  // Handle paint selection
  const handlePaintSelect = (paint) => {
    console.log("Selected Paint:", paint); // Debugging
    setSelectedPaint(paint);
    setIsPaintMode(true);
    mountRef.current.classList.add('painting');
  };

  // Prevent default right-click behavior
  useEffect(() => {
    const preventContextMenu = (event) => {
      if (event.button === 2) {
        event.preventDefault(); // Prevent the context menu
      }
    };

    const rendererDom = sceneObjects?.renderer?.domElement;
    if (rendererDom) {
      rendererDom.addEventListener("contextmenu", preventContextMenu);
    }

    return () => {
      if (rendererDom) {
        rendererDom.removeEventListener("contextmenu", preventContextMenu);
      }
    };
  }, [sceneObjects]);

  // Load and render the selected model
  useEffect(() => {
    if (selectedModel && sceneObjects) {
      const fetchModelDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const apiKey = "9d2379512bd84812beb65f0ffe608310"; // Use environment variable
          const downloadResponse = await fetch(
            `https://api.sketchfab.com/v3/models/${selectedModel}/download`,
            {
              headers: {
                Authorization: `Token ${apiKey}`,
              },
            }
          );
          const downloadData = await downloadResponse.json();
          const glbUrl = downloadData.glb.url; // Get the GLB URL

          if (glbUrl) {
            loadModel(glbUrl); // Load the model using the GLB URL
          } else {
            setError("GLB URL not found in model download information");
          }
        } catch (error) {
          setError("Error fetching model download information");
          console.error("Error fetching model download information:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchModelDetails();
    }
  }, [selectedModel, sceneObjects]);

  const loadModel = useCallback(
    (url) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          // Group all parts of the model under a single parent
          const modelGroup = new THREE.Group();
          modelGroup.add(model);
          sceneObjects.scene.add(modelGroup);

          // Remove previous model if it exists
          if (currentModelRef.current) {
            sceneObjects.scene.remove(currentModelRef.current);
          }

          // Calculate bounding box
          const box = new THREE.Box3().setFromObject(modelGroup);
          const size = box.getSize(new THREE.Vector3());

          // Scale model to reasonable size
          const scale = 100 / size.y;
          modelGroup.scale.set(scale, scale, scale);

          // Position model at center of floor
          modelGroup.position.set(0, 0, 0);

          // Update the current model reference
          currentModelRef.current = modelGroup;

          // Make the entire model draggable
          if (dragControlsRef.current) {
            dragControlsRef.current.dispose(); // Clean up previous drag controls
          }
          dragControlsRef.current = new DragControls(
            [modelGroup], // Apply DragControls to the group, not individual parts
            sceneObjects.camera,
            sceneObjects.renderer.domElement
          );

          // Disable floorplan controls while dragging
          dragControlsRef.current.addEventListener("dragstart", () => {
            if (controlsRef.current) {
              controlsRef.current.enabled = false;
            }
          });

          dragControlsRef.current.addEventListener("dragend", () => {
            if (controlsRef.current) {
              controlsRef.current.enabled = true;
            }
          });

          // Enable/disable dragging based on state
          dragControlsRef.current.addEventListener("drag", (event) => {
            if (isDraggingEnabled) {
              const model = event.object;
              model.position.x = Math.max(
                floorplanBounds.minX,
                Math.min(floorplanBounds.maxX, model.position.x)
              );
              model.position.z = Math.max(
                floorplanBounds.minZ,
                Math.min(floorplanBounds.maxZ, model.position.z)
              );
            }
          });

          // Enable rotation on right-click and disable dragging
          sceneObjects.renderer.domElement.addEventListener("mousedown", (event) => {
            if (event.button === 2) {
              // Right-click
              setIsRotatingEnabled(true);
              setIsDraggingEnabled(false);

              const onMouseMove = (e) => {
                if (isRotatingEnabled) {
                  const deltaX = e.movementX;
                  modelGroup.rotation.y += deltaX * 0.02; // Adjust rotation speed as needed
                }
              };

              const onMouseUp = () => {
                setIsRotatingEnabled(false);
                setIsDraggingEnabled(true);
                sceneObjects.renderer.domElement.removeEventListener("mousemove", onMouseMove);
                sceneObjects.renderer.domElement.removeEventListener("mouseup", onMouseUp);
              };

              sceneObjects.renderer.domElement.addEventListener("mousemove", onMouseMove);
              sceneObjects.renderer.domElement.addEventListener("mouseup", onMouseUp);
            }
          });

          // Enable dragging on left-click and disable rotation
          sceneObjects.renderer.domElement.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
              // Left-click
              setIsDraggingEnabled(true);
              setIsRotatingEnabled(false);
            }
          });
        },
        undefined,
        (error) => {
          setError("Error loading model");
          console.error("Error loading model:", error);
        }
      );
    },
    [sceneObjects, floorplanBounds, isDraggingEnabled, isRotatingEnabled]
  );

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

    // Updated settings for newer Three.js versions
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Remove gammaFactor and gammaOutput as they're no longer needed in newer versions

    mountRef.current.appendChild(renderer.domElement);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.5,
      metalness: 0.1,
    });

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
    
      // Create a unique material for each wall
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide  // Add this line
      });
    
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    
      wallMesh.position.set(centerWallX, wallHeight / 2, centerWallY);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      wallMesh.rotation.y = -angle;
    
      scene.add(wallMesh);
      wallMeshes.push(wallMesh);
      wallMeshesRef.current.push(wallMesh);
    });

    console.log("Wall Meshes:", wallMeshesRef.current); // Debugging

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleWallClick = (event) => {
      
      if (!isPaintMode || !selectedPaint) return;

      console.log("Wall Clicked"); // Debugging
      console.log("Is Paint Mode:", isPaintMode); // Debugging
      console.log("Selected Paint:", selectedPaint); // Debugging
    
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      console.log("Mouse Coordinates:", mouse.x, mouse.y); // Debugging
    
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(wallMeshesRef.current);
    
      console.log("Intersects:", intersects); // Debugging
    
      if (intersects.length > 0) {
        const wallMesh = intersects[0].object;
        console.log("Wall Mesh to Paint:", wallMesh); // Debugging
        if (wallMesh.material) {
          wallMesh.material.dispose();
        }
        const newMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(selectedPaint.color),
          roughness: 0.2,
          metalness: 0.1,
          side: THREE.DoubleSide,  // Ensure both sides of walls are visible
        });
        wallMesh.material = newMaterial;
        wallMesh.material.needsUpdate = true;
        wallMesh.geometry.computeBoundingSphere();
        sceneObjects.scene.needsUpdate = true;
        console.log("New Material:", wallMesh.material);
        console.log("New Material Color:", wallMesh.material.color);
        requestAnimationFrame(() => {
          sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
        });
      } else {
        console.log("No intersection detected"); // Debugging
      }
    };

    renderer.domElement.addEventListener('click', handleWallClick);
    console.log("Wall Click Listener Attached"); // Debugging

    const floorWidth = maxX - minX;
    const floorDepth = maxY - minY;
    const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // Set floorplan bounds for model movement
    setFloorplanBounds({
      minX: -floorWidth / 2,
      maxX: floorWidth / 2,
      minZ: -floorDepth / 2,
      maxZ: floorDepth / 2,
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(500, 1000, 500);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-500, 1000, -500);
    scene.add(directionalLight2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 500;
    controls.maxDistance = 3000;
    controls.target.set(0, wallHeight / 2, 0);
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    setSceneObjects({ scene, camera, renderer, floor });

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

      // Cleanup drag and rotation event listeners
      if (dragControlsRef.current) {
        dragControlsRef.current.dispose();
      }
      renderer.domElement.removeEventListener('click', handleWallClick);
    };
  }, [location, selectedPaint, isPaintMode]);

  return (
    <div className="decora-container">
      <div className="main-content">
        <div className="layout-container">
          <div ref={mountRef} className="threejs-container" />
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
          </div>

          <div className="furniture-grid">
            {activeTab === "FURNITURE" && <FurnitureGrid products={furnitureItems} />}
            {activeTab === "MODELS" && (
              <ModelGrid
                apiKey="9d2379512bd84812beb65f0ffe608310"
                query="sofa"
                onModelSelect={setSelectedModel}
              />
            )}
            {activeTab === 'PAINT' && <PaintGrid onPaintSelect={handlePaintSelect} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan3D;
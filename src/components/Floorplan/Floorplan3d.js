import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import Sofa from "../Furniture/Sofa.js";
import { GLTFLoader } from "three-stdlib";
import "./Floorplan3d.css";


const FloorPlan3D = () => {
  const mountRef = useRef(null);
  const location = useLocation();
  const [sceneObjects, setSceneObjects] = useState(null);
  const [sofaModel, setSofaModel] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [activeTab, setActiveTab] = useState("MODELS");
  const controlsRef = useRef(null);

  useEffect(() => {
    const dummyFurniture = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Furniture Item ${i + 1}`,
      price: 299.99 + i * 100,
      image: "/api/placeholder/200/200",
      amazonLink: "https://amazon.com",
    }));
    setFurnitureItems(dummyFurniture);
  }, []);

  useEffect(() => {
    const walls = location.state?.layout || [];
    if (!walls.length) {
      console.warn("No walls data received");
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      1,
      10000
    );
    camera.position.set(-500, 800, 1000);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 1,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.5,
      metalness: 0.1,
    });

    // Find layout bounds
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
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

      wallMesh.position.set(centerWallX, wallHeight / 2, centerWallY);

      const angle = Math.atan2(y2 - y1, x2 - x1);
      wallMesh.rotation.y = -angle;

      scene.add(wallMesh);
      wallMeshes.push(wallMesh);
    });

    // Create floor
    const floorWidth = maxX - minX;
    const floorDepth = maxY - minY;
    const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(500, 1000, 500);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-500, 1000, -500);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 500;
    controls.maxDistance = 3000;
    controls.target.set(0, wallHeight / 2, 0);
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Store references
    setSceneObjects({
      scene,
      camera,
      renderer,
      floor,
    });

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
    };
  }, [location]);

  return (
    
    <div className="decora-container">
      <div className="main-content">
        <div className="layout-container">
          <div ref={mountRef} className="threejs-container" />
        </div>

        <div className="furniture-section">
          <div className="furniture-header">
            <button
              className={`header-button ${
                activeTab === "MODELS" ? "active" : ""
              }`}
              onClick={() => setActiveTab("MODELS")}
            >
              MODELS
            </button>
            <button
              className={`header-button ${
                activeTab === "FURNITURE" ? "active" : ""
              }`}
              onClick={() => setActiveTab("FURNITURE")}
            >
              FURNITURE
            </button>
            <button
              className={`header-button ${
                activeTab === "PAINT" ? "active" : ""
              }`}
              onClick={() => setActiveTab("PAINT")}
            >
              PAINT
            </button>
           
          </div>

          <div className="furniture-grid">
            {furnitureItems.map((item) => (
              <div key={item.id} className="furniture-card">
                <img src={item.image} alt={item.name} />
                <div className="card-content">
                  <h3>{item.name}</h3>
                  <p className="price">${item.price}</p>
                  <a
                    href={item.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Amazon
                  </a>
                  <button className="add-button">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan3D;

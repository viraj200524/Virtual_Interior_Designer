import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from 'three-stdlib';
import { Search } from "lucide-react";

const ThreeDView = () => {
  const mountRef = useRef(null);
  const location = useLocation();
  
  // Furniture panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Furniture search function
  const searchFurniture = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?query=${encodeURIComponent(query)}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to fetch products');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchFurniture(searchQuery);
    }
  };

  // Three.js setup
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
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.set(-500, 800, 1000);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1
    });
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.5,
      metalness: 0.1
    });

    // Find layout bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    walls.forEach(wall => {
      [wall.points[0], wall.points[2]].forEach(x => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      });
      [wall.points[1], wall.points[3]].forEach(y => {
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

    walls.forEach(wall => {
      const [x1, y1, x2, y2] = wall.points;
      
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const centerWallX = (x1 + x2) / 2 - centerX;
      const centerWallY = (y1 + y2) / 2 - centerY;
      
      const wallGeometry = new THREE.BoxGeometry(length, wallHeight, wallThickness);
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

    // Wall facing camera check
    const isWallFacingCamera = (wallMesh) => {
      const cameraDirection = new THREE.Vector3().subVectors(camera.position, wallMesh.position).normalize();
      const wallNormal = new THREE.Vector3(0, 0, 1);
      const rotationMatrix = new THREE.Matrix4().identity();
      rotationMatrix.makeRotationFromEuler(wallMesh.rotation);
      wallNormal.applyMatrix4(rotationMatrix);

      const angle = wallNormal.dot(cameraDirection);
      const threshold = 0.5;
      return angle < -threshold;
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      wallMeshes.forEach(wallMesh => {
        if (isWallFacingCamera(wallMesh)) {
          wallMesh.material.transparent = true;
          wallMesh.material.opacity = 0;
        } else {
          wallMesh.material.transparent = false;
          wallMesh.material.opacity = 1;
        }
      });

      floor.material.transparent = false;
      floor.material.opacity = 1;

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, [location]);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Placeholder for 3D View */}
      <div ref={mountRef} className="w-full h-full flex items-center justify-center text-gray-400">
      </div>

      {/* Furniture Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md hover:bg-gray-50 transition-colors"
      >
        Furniture
      </button>

      {/* Sliding Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Search Bar */}
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search furniture..."
              className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="container my-3">
  {isLoading ? (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  ) : error ? (
    <div className="text-red-500 text-center py-4">
      {error}
    </div>
  ) : (
    <div className="row">
      {searchResults.map((item) => (
        <div key={item.id} className="col-md-3 my-4">
          <div className="card">
            <img
              src={item.image}
              className="card-img-top"
              alt={item.name}
              style={{ width: '170px', height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              <p className="card-text">{item.price}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                View on Amazon
              </a>
            </div>
          </div>
        </div>
      ))}
      {searchResults.length === 0 && !isLoading && !error && searchQuery && (
        <div className="text-gray-500 text-center py-4">
          No products found. Try different search terms.
        </div>
      )}
    </div>
  )}
</div>

        
      </div>
    </div>
  );
};

export default ThreeDView;
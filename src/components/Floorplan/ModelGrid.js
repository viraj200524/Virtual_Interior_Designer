import React, { useState, useEffect } from "react";

const ModelGrid = ({ apiKey, onModelSelect }) => {
  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // For input field
  const [query, setQuery] = useState("FURNITURE"); // Default query

  // Function to fetch models from Sketchfab API
  const fetchModels = async () => {
    try {
      const response = await fetch(
        `https://api.sketchfab.com/v3/search?type=models&q=${query}&downloadable=true`,
        {
          headers: {
            Authorization: `Token ${apiKey}`,
          },
        }
      );
      const data = await response.json();
      setModels(data.results || []);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  // Fetch models when the component mounts or query changes
  useEffect(() => {
    fetchModels();
  }, [query]);

  // Handle model selection
  const handleModelSelect = (model) => {
    onModelSelect(model.uid);
  };

  // Handle search button click
  const handleSearch = () => {
    setQuery(searchQuery);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Search bar at the top */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search for 3D models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "0.5rem",
            fontSize: "1rem",
            borderRadius: "4px",
            border: "1px solid #ddd",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Model grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          flexGrow: 1,
        }}
      >
        {models.map((model) => (
          <div
            key={model.uid}
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => handleModelSelect(model)}
          >
            <img
              src={model.thumbnails.images[0].url}
              alt={model.name}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <div style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
              {model.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelGrid;

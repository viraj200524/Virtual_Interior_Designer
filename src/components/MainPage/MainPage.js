import React, { useState } from "react";
import { Search, User, Plus } from "lucide-react";
import "./MainPage.css";
import { useNavigate, Link } from "react-router-dom";
import RoomCard from "./RoomCard";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../Login-in/LogoutButton";
import RoomQuiz from "../RoomQuiz/RoomQuiz";

// NavLink Component
function NavLink({ children, to }) {
  return (
    <Link to={to} className="nav-link">
      {children}
    </Link>
  );
}

// Navigation Component
function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="nav-left">
          <h1 className="logo">Decora</h1>
          <div className="nav-links">
            <NavLink to="/">Design</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/room-quiz">RoomQuiz</NavLink>
          </div>
        </div>
        <div className="nav-right">
          <div className="search-container">
            <input type="text" placeholder="Search" className="search-input" />
            <Search className="search-icon" />
          </div>
          <button className="profile-button">
            <User className="profile-icon" />
          </button>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

// AddRoomModal Component
function AddRoomModal({ isOpen, onClose, onAdd }) {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      onAdd(roomName);
      setRoomName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Room</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="submit" className="modal-button">
              Add
            </button>
            <button type="button" className="modal-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Page Component
function MainPage() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(["Living Room", "Bedroom", "Kitchen"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddRoom = (roomName) => {
    if (roomName) {
      setRooms((prevRooms) => [...prevRooms, roomName]);
    }
  };

  const handleDeleteRoom = (roomName) => {
    setRooms(rooms.filter((room) => room !== roomName));
  };

  return (
    <div className="container">
      <Navigation />

      <main className="main">
        <div className="welcome-section">
          <h2 className="welcome-title">Hello {user?.name || "Guest"}</h2>
          <p className="welcome-text">Let's start building your dream space</p>
        </div>

        <div className="home-section">
          <h3 className="section-title" style={{ color: "#8B4513" }}>
            My Projects
          </h3>
          <div className="rooms-container">
            <RoomCard isAdd={true} onAdd={() => setIsModalOpen(true)} />
            {rooms.map((room) => (
              <RoomCard key={room} title={room} onDelete={handleDeleteRoom} />
            ))}
          </div>
        </div>
      </main>

      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddRoom}
      />
    </div>
  );
}

export default MainPage;

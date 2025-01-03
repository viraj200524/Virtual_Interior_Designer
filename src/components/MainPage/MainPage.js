import React, { useState } from 'react';
import { Search, User, Plus } from 'lucide-react';
import './MainPage.css';

// NavLink Component
function NavLink({ children }) {
  return (
    <a href="#" className="nav-link">
      {children}
    </a>
  );
}

// RoomCard Component
function RoomCard({ title, isAdd = false, onAdd, onDelete }) {
  return (
    <div className={`room-card ${isAdd ? 'room-card-add' : ''}`}>
      {isAdd ? (
        <>
          <Plus className="icon" onClick={onAdd} />
          <span className="add-text">Add New Room</span>
        </>
      ) : (
        <>
          <div className="room-image"></div>
          <span className="room-title">{title}</span>
          {onDelete && (
            <button className="delete-btn" onClick={() => onDelete(title)}>
              Delete
            </button>
          )}
        </>
      )}
    </div>
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
            <NavLink>Design</NavLink>
            <NavLink>Products</NavLink>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              className="search-input"
            />
            <Search className="search-icon" />
          </div>
          <button className="profile-button">
            <User className="profile-icon" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// AddRoomModal Component
function AddRoomModal({ isOpen, onClose, onAdd }) {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = () => {
    if (roomName.trim()) {
      onAdd(roomName);
      setRoomName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Room</h2>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
function MainPage() {
  const [rooms, setRooms] = useState(['Living Room', 'Bedroom', 'Kitchen']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddRoom = (roomName) => {
    setRooms([...rooms, roomName]);
  };

  const handleDeleteRoom = (roomName) => {
    setRooms(rooms.filter(room => room !== roomName));
  };

  return (
    <div className="container">
      <Navigation />
      
      <main className="main">
        <div className="welcome-section">
          <h2 className="welcome-title">Hello User_Name!</h2>
          <p className="welcome-text">Let's start building your dream space</p>
        </div>

        <div className="home-section">
          <h3 className="section-title">MY HOME</h3>
          <div className="rooms-container">
            <RoomCard 
              isAdd={true} 
              onAdd={() => setIsModalOpen(true)} 
            />
            {rooms.map((room) => (
              <RoomCard 
                key={room}
                title={room}
                onDelete={handleDeleteRoom}
              />
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

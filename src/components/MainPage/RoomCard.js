import React from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RoomCard({ title, isAdd = false, onAdd, onDelete }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAdd && title) {
      navigate(`/room/${title.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  return (
    <div 
      className={`room-card ${isAdd ? 'room-card-add' : ''}`}
      onClick={isAdd ? onAdd : handleClick}
    >
      {isAdd ? (
        <>
          <Plus className="icon" />
          <span className="add-text">Add New Room</span>
        </>
      ) : (
        <>
          <button 
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(title);
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="room-image"></div>
          <span className="room-title">{title}</span>
        </>
      )}
    </div>
  );
}
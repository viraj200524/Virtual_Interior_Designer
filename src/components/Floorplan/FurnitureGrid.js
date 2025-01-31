import React from 'react';
import FurnitureItem from './FurnitureItem';
import { useState } from 'react';

const FurnitureGrid = ({ products, items, handleCartItems, cartPrice, handleCartPrice }) => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className='container-fluid'>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for 3D models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
        >
          Search
        </button>
      </div>
      <div className="row row-cols-1 row-cols-sm-2 g-4"> {/* Responsive layout */}
        {products.map((element, index) => (
          <div className="col" key={element.url || index}>
            <div className="card shadow-sm h-100"> {/* Full-height cards */}
              <FurnitureItem 
                name={element.name} 
                mrp={element.mrp} 
                url={element.url} 
                image_url={element.image_url}
                cart_items={items}
                product={element}
                handleCartItems={handleCartItems}
                cartPrice={cartPrice}
                handleCartPrice={handleCartPrice}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FurnitureGrid;

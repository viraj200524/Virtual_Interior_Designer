import React from 'react';
import CartItem from './CartItems';
import { useState } from 'react';

const Cart = ({ items, handleCartItems, cartPrice, handleCartPrice }) => {
    const[price,SetPrice] = useState(0)
    
  return (
    <div className='container-fluid'>
        <div>
            <h2>Price : {cartPrice}</h2>
        </div>
      <div className="row row-cols-1 row-cols-sm-2 g-4"> {/* Responsive layout */}
        {items.map((element, index) => (
          <div className="col" key={element.url || index}>
            <div className="card shadow-sm h-100"> {/* Full-height cards */}
              <CartItem 
                name={element.name} 
                mrp={element.mrp} 
                url={element.url} 
                image_url={element.image_url}
                handleCartItems={handleCartItems}
                handlePrice={SetPrice}
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

export default Cart;

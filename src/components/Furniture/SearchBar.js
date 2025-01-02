import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css'

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/scrape', {
                params: { query }
            });
            setResults(response.data.amazon);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search for furniture"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            <div className="results">
                {results.map((item, index) => (
                    <div key={index} className="result-item">
                        <img src={item.image} alt={item.title} />
                        <h3>{item.title}</h3>
                        <p>₹{item.price}</p>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            View on Amazon
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchBar;

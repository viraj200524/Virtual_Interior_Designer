// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000' // Only allow requests from frontend
}));
app.use(express.json());

// Utility function to format price
const formatPrice = (priceText) => {
  if (!priceText) return '$0.00';
  const price = priceText.trim().replace(/[^\d.,]/g, '');
  return `$${price}`;
};

// Utility function to format title
const formatTitle = (title) => {
  return title
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
};

// Main scraping function
async function scrapeAmazon(searchQuery) {
  try {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery + ' furniture')}`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
    };

    const response = await axios.get(searchUrl, { headers, timeout: 5000 });
    const $ = cheerio.load(response.data);
    const products = [];

    $('.s-result-item[data-component-type="s-search-result"]').each((i, element) => {
      if (products.length >= 8) return false; // Limit to 8 products

      try {
        const productElement = $(element);
        
        const title = formatTitle(productElement.find('h2 span').text());
        const priceElement = productElement.find('.a-price-whole').first();
        const priceDecimal = productElement.find('.a-price-fraction').first();
        const imageUrl = productElement.find('img.s-image').attr('src');
        const productUrl = 'https://amazon.com' + productElement.find('a.a-link-normal').first().attr('href');

        if (title && priceElement.length && imageUrl) {
          const price = `$${priceElement.text()}${priceDecimal.length ? '.' + priceDecimal.text() : '.00'}`;
          
          products.push({
            id: products.length + 1,
            name: title,
            price: price,
            image: imageUrl,
            link: productUrl
          });
        }
      } catch (err) {
        console.error('Error parsing product:', err);
      }
    });

    return products;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to fetch products');
  }
}

// Rate limiting - 100 requests per 15 minutes
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const products = await scrapeAmazon(query);
    
    if (products.length === 0) {
      return res.status(404).json({ 
        error: 'No products found',
        message: 'Try different search terms'
      });
    }

    res.json(products);
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch products. Please try again later.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server error',
    message: 'Something went wrong. Please try again later.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
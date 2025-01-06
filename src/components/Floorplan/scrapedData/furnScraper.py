from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import random
import time
from fake_useragent import UserAgent
import json

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React app

# Scraper Class
class PepperfryScraper:
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()

    def get_random_headers(self):
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'DNT': '1'
        }

    def fetch_page(self, url, retries=3):
        for attempt in range(retries):
            try:
                time.sleep(random.uniform(2, 5))
                response = self.session.get(
                    url,
                    headers=self.get_random_headers(),
                    timeout=30
                )
                if response.status_code == 200:
                    return response
                time.sleep(random.uniform(5, 10))
            except Exception as e:
                print(f"Error on attempt {attempt + 1}: {str(e)}")
                if attempt < retries - 1:
                    time.sleep(random.uniform(5, 10))
        return None

    def extract_product_data(self, card):
        try:
            data = {
                'name': card.select_one("h2.product-name").text.strip() if card.select_one("h2.product-name") else "N/A",
                'price': card.select_one("span.product-offer-price").text.strip() if card.select_one("span.product-offer-price") else "N/A",
                'image_url': card.select_one("img")['src'].strip() if card.select_one("img") else "N/A",
                'mrp': card.select_one("span.product-mrp-price").text.strip() if card.select_one("span.product-mrp-price") else "N/A",
                'discount': card.select_one("span.product-discount").text.strip() if card.select_one("span.product-discount") else "N/A",
                'emi': card.select_one("div.product-emi").text.strip() if card.select_one("div.product-emi") else "N/A"
            }
            return data
        except Exception as e:
            print(f"Error extracting product data: {str(e)}")
            return None

    def scrape_products(self, base_url, max_products=500):
        all_products = []
        page = 1
        while len(all_products) < max_products:
            url = f"{base_url}&page={page}"
            print(f"Scraping page {page}...")

            response = self.fetch_page(url)
            if not response:
                break

            soup = BeautifulSoup(response.text, 'html.parser')
            product_cards = soup.select(".product-card-container")

            if not product_cards:
                break

            for card in product_cards:
                product_data = self.extract_product_data(card)
                if product_data:
                    all_products.append(product_data)
                if len(all_products) >= max_products:
                    break

            print(f"Products found so far: {len(all_products)}")
            page += 1

        return all_products


@app.route('/scrape', methods=['POST'])
def scrape_data():
    base_url = request.json.get('base_url', "https://www.pepperfry.com/site_product/search?q=furniture")
    scraper = PepperfryScraper()
    max_products = 500
    products = scraper.scrape_products(base_url, max_products)
    with open('./products.json', 'w') as f:
        json.dump(products, f, indent=4)
    return jsonify({'message': 'Data scraped successfully!', 'product_count': len(products)})


@app.route('/products', methods=['GET'])
def get_products():
    try:
        with open('./products.json', 'r') as f:
            products = json.load(f)
        return jsonify(products)
    except FileNotFoundError:
        return jsonify({'error': 'No data found. Please scrape first using /scrape endpoint.'}), 404


if __name__ == '__main__':
    app.run(debug=True)

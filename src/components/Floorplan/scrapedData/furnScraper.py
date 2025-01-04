import requests
from bs4 import BeautifulSoup

# URL of the Pepperfry webpage
url = "https://www.pepperfry.com/site_product/search?q=furniture&requestPlatform=web&sort_field=sorting_score&sort_by=desc&as=0&src=furniture&autoSuggest=1&page=2"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

response = requests.get(url, headers=headers)


# Check if the request was successful
if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')

    # Select the main div containing all product cards
    main_div = soup.select_one("pf.clip-product-listing")

    if main_div:
        # Extract all sub-divs (each representing a product card)
        product_cards = main_div.find_all("div", recursive=False)

        # Extract data for each card
        for card in product_cards:
            # Extract product name
            name_tag = card.select_one("h2.product-name")
            name = name_tag.text.strip() if name_tag else "N/A"

            # Extract discounted price
            price_tag = card.select_one("span.product-offer-price")
            price = price_tag.text.strip() if price_tag else "N/A"

            # Extract product image URL
            image_tag = card.select_one("img")
            image_url = image_tag['src'].strip() if image_tag else "N/A"

            # Extract MRP
            mrp_tag = card.select_one("span.product-mrp-price")
            mrp = mrp_tag.text.strip() if mrp_tag else "N/A"

            # Extract discount percentage
            discount_tag = card.select_one("span.product-discount")
            discount = discount_tag.text.strip() if discount_tag else "N/A"

            # Extract EMI option
            emi_tag = card.select_one("div.product-emi")
            emi = emi_tag.text.strip() if emi_tag else "N/A"

            # Print the extracted information
            print(f"Product Name: {name}")
            print(f"Price: {price}")
            print(f"Image URL: {image_url}")
            print(f"MRP: {mrp}")
            print(f"Discount: {discount}")
            print(f"EMI Option: {emi}")
            print("-" * 40)
    else:
        print("Failed to find the main div containing product cards.")
else:
    print(f"Failed to fetch the webpage. Status code: {response.status_code}")

from pathlib import Path
import requests

def fetch_and_save(url, path):
    try:
        # Fetch content from the URL
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        # Use pathlib to handle the path
        file_path = Path(path)
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Write the content to the file
        file_path.write_text(response.text, encoding="utf-8")
        
        print(f"Content saved successfully to {file_path}")
    
    except requests.RequestException as e:
        print(f"Failed to fetch URL: {e}")
    except OSError as e:
        print(f"Failed to save file: {e}")

# Usage
url = "https://www.furlenco.com/buy"
fetch_and_save(url, "src/components/Floorplan/scrapedData/furlenco.html")

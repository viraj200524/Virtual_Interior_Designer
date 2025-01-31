from flask import Flask, request, jsonify
from flask_cors import CORS
import h5py
import numpy as np

app = Flask(__name__)
from flask_cors import CORS

app = Flask(__name__)
CORS(app,resources={r"/api/*": {"origins": "http://localhost:3000"}})  # Enable CORS for all routes

# Load the model parameters from h5 file
def load_model_params():
    with h5py.File('./model.h5', 'r') as f:
        model_params = f['model_parameters']
        coefficients = model_params['coefficients'][:]
        intercept = model_params['intercept'][()]
    return coefficients, intercept

# Load the model parameters
coefficients, intercept = load_model_params()

@app.route('/api/predict-budget', methods=['POST'])
def predict_budget():
    try:
        # Get the data from the POST request
        data = request.get_json()
        print("Received data:", data)  # Debugging: Log the received data

        # Preprocess string inputs into numerical values
        locality_map = {'Urban': 1, 'Rural': 0}
        renovation_map = {'Necessity': 0, 'Moderate': 1, 'Luxury': 2}
        quality_map = {'Low': 0, 'Medium': 1, 'High': 2}

        features = [
            int(data.get('bedrooms', 0)),       # Number of bedrooms
            float(data.get('sqft', 0)),         # Square footage
            float(data.get('price', 0)),        # Price per square foot
            int(data.get('toilets', 0)),        # Number of bathrooms
            locality_map.get(data.get('locality', 'Urban'), 1),  # Locality (encoded)
            renovation_map.get(data.get('renovation', 'Necessity'), 0),  # Renovation (encoded)
            int(data.get('age', 0)),            # Age of the house
            quality_map.get(data.get('quality', 'Low'), 0)  # Material quality (encoded)
        ]

        # Convert to numpy array
        features_array = np.array(features).reshape(1, -1)

        # Make prediction using the loaded coefficients and intercept
        prediction = np.dot(features_array, coefficients) + intercept
        print("Prediction:", prediction)  # Debugging: Log the prediction

        # Return the prediction as JSON
        return jsonify({'estimatedBudget': float(prediction[0])})

    except Exception as e:
        print("Error:", e)  # Debugging: Log any errors
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        print("Error:", e)  # Debugging: Log any errors
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
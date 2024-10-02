from flask import Flask, render_template, request, jsonify
import requests
from dotenv import load_dotenv
import os

load_dotenv()
CHATON_API_KEY = os.getenv('CHATON_API_KEY')
CHATON_API_URL = os.getenv('CHATON_API_URL')  # Add this to your .env file

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.json['query']
    
    # Make a request to the ChatOn API
    headers = {
        'Authorization': f'Bearer {CHATON_API_KEY}',
        'Content-Type': 'application/json'
    }
    data = {
        'prompt': query,
        # Add any other parameters required by ChatOn API
    }
    
    response = requests.post(CHATON_API_URL, json=data, headers=headers)
    
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to get response from ChatOn'}), 500

if __name__ == '__main__':
    app.run(debug=True)
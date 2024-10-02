from flask import Flask, render_template, request, jsonify
import requests
from dotenv import load_dotenv
import os

load_dotenv()
CHATON_API_KEY = os.getenv('CHATON_API_KEY')
CHATON_API_URL = os.getenv('CHATON_API_URL')

app = Flask(__name__)

# List of top 12 popular genres
GENRES = [
    "Fiction", "Non-fiction", "Mystery", "Thriller", "Romance", "Science Fiction",
    "Fantasy", "Horror", "Biography", "History", "Self-help", "Children's"
]

@app.route('/')
def index():
    return render_template('index.html', genres=GENRES)

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query', '')
    author = data.get('author', '')
    title = data.get('title', '')
    genres = data.get('genres', [])

    # Construct a more detailed prompt for ChatOn
    prompt = f"Search for books with the following criteria:\n"
    prompt += f"General query: {query}\n" if query else ""
    prompt += f"Author: {author}\n" if author else ""
    prompt += f"Title contains: {title}\n" if title else ""
    prompt += f"Genres: {', '.join(genres)}\n" if genres else ""

    # Make a request to the ChatOn API
    headers = {
        'Authorization': f'Bearer {CHATON_API_KEY}',
        'Content-Type': 'application/json'
    }
    api_data = {
        'prompt': prompt,
        # Add any other parameters required by ChatOn API
    }
    
    response = requests.post(CHATON_API_URL, json=api_data, headers=headers)
    
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to get response from ChatOn'}), 500

if __name__ == '__main__':
    app.run(debug=True)
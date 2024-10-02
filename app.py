import os
from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Get API key from environment variable
GOOGLE_BOOKS_API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'

# Check if API key is set
if not GOOGLE_BOOKS_API_KEY:
    raise ValueError("GOOGLE_BOOKS_API_KEY is not set in the environment variables")

@app.route('/')
def index():
    current_year = datetime.now().year
    genres = ["Fiction", "Non-fiction", "Science Fiction", "Mystery", "Romance", "Biography", "History", "Self-help", "Thriller", "Fantasy"]  # Add or modify genres as needed
    return render_template('index.html', current_year=current_year, genres=genres)

@app.route('/search', methods=['POST'])
def search():
    start_year = request.form.get('start_year', '1950')
    end_year = request.form.get('end_year', str(datetime.now().year))
    author = request.form.get('author', '')
    title = request.form.get('title', '')
    genres = request.form.getlist('genres')

    query_parts = []
    if title:
        query_parts.append(f'intitle:{title}')
    if author:
        query_parts.append(f'inauthor:{author}')
    if genres:
        query_parts.extend(f'subject:{genre}' for genre in genres)

    query = ' '.join(query_parts)

    params = {
        'q': query,
        'key': GOOGLE_BOOKS_API_KEY,
        'maxResults': 40,  # Increased from 10 to get more results
        'langRestrict': 'en'  # Restrict to English books
    }

    response = requests.get(GOOGLE_BOOKS_API_URL, params=params)
    
    if response.status_code == 200:
        books_data = response.json().get('items', [])
        books = []
        for book in books_data:
            volume_info = book.get('volumeInfo', {})
            published_date = volume_info.get('publishedDate', '')[:4]  # Get just the year
            if start_year <= published_date <= end_year:
                books.append({
                    'title': volume_info.get('title', 'Unknown Title'),
                    'authors': volume_info.get('authors', ['Unknown Author']),
                    'publishedDate': published_date,
                    'description': volume_info.get('description', 'No description available'),
                    'imageLinks': volume_info.get('imageLinks', {})
                })
        return jsonify(books)
    else:
        return jsonify({'error': 'Failed to fetch books from Google Books API'}), 500
    
if __name__ == '__main__':
    app.run(debug=False)  # Set to False for production
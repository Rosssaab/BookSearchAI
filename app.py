import os
from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Get API key from environment variable
GOOGLE_BOOKS_API_KEY = os.environ.get('GOOGLE_BOOKS_API_KEY')
GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'

# Check if API key is set
if not GOOGLE_BOOKS_API_KEY:
    print("Warning: GOOGLE_BOOKS_API_KEY is not set in the environment variables")

# Visitor counter function
def get_visitor_count():
    count_file = 'visitor_count.txt'
    if not os.path.exists(count_file):
        with open(count_file, 'w') as f:
            f.write('100')
        return 100
    with open(count_file, 'r+') as f:
        count = int(f.read() or '100')
        count += 1
        f.seek(0)
        f.write(str(count))
        f.truncate()
    return count

@app.route('/')
def index():
    current_year = datetime.now().year
    genres = ["Fiction", "Non-fiction", "Science Fiction", "Mystery", "Romance", "Biography", "History", "Self-help", "Thriller", "Fantasy"]
    visitor_count = get_visitor_count()
    return render_template('index.html', current_year=current_year, genres=genres, visitor_count=visitor_count)

@app.route('/search', methods=['GET'])
def search():
    start_year = request.args.get('start_year', '1950')
    end_year = request.args.get('end_year', str(datetime.now().year))
    author = request.args.get('author', '')
    title = request.args.get('title', '')
    subject = request.args.get('subject', '')
    genres = request.args.getlist('genres')

    query_parts = []
    if title:
        query_parts.append(f'intitle:{title}')
    if author:
        query_parts.append(f'inauthor:{author}')
    if subject:
        query_parts.append(f'subject:{subject}')
    if genres:
        query_parts.extend(f'subject:{genre}' for genre in genres)

    query = ' '.join(query_parts)

    params = {
        'q': query,
        'key': GOOGLE_BOOKS_API_KEY,
        'maxResults': 40,
        'langRestrict': 'en'
    }

    response = requests.get(GOOGLE_BOOKS_API_URL, params=params)
    
    if response.status_code == 200:
        books_data = response.json().get('items', [])
        books = []
        for book in books_data:
            volume_info = book.get('volumeInfo', {})
            published_date = volume_info.get('publishedDate', '')[:4]
            if start_year <= published_date <= end_year:
                isbn = 'No ISBN'
                for identifier in volume_info.get('industryIdentifiers', []):
                    if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                        isbn = identifier.get('identifier')
                        break
                books.append({
                    'title': volume_info.get('title', 'Unknown Title'),
                    'authors': volume_info.get('authors', ['Unknown Author']),
                    'publishedDate': published_date,
                    'description': volume_info.get('description', 'No description available'),
                    'imageLinks': volume_info.get('imageLinks', {}),
                    'isbn': isbn
                })
        return jsonify(books)
    else:
        return jsonify({'error': 'Failed to fetch books from Google Books API'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
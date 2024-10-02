// script.js

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const resultsDiv = document.getElementById('results');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const searchData = {
            query: formData.get('query'),
            author: formData.get('author'),
            title: formData.get('title'),
            genres: $('#genreDropdown').val() // This gets all selected genres
        };

        // Show loading indicator
        resultsDiv.innerHTML = '<p>Searching...</p>';

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch((error) => {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
        });
    });

    function displayResults(data) {
        // Clear previous results
        resultsDiv.innerHTML = '';

        if (data.error) {
            resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            return;
        }

        // Assuming the API returns an array of book objects
        // Adjust this based on the actual structure of your API response
        if (Array.isArray(data.books)) {
            const bookList = document.createElement('ul');
            data.books.forEach(book => {
                const bookItem = document.createElement('li');
                bookItem.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Genre: ${book.genre}</p>
                    <p>${book.description}</p>
                `;
                bookList.appendChild(bookItem);
            });
            resultsDiv.appendChild(bookList);
        } else {
            // If the response structure is different, display it as formatted JSON
            resultsDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    }
});
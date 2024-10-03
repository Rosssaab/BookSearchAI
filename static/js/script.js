let allBooks = [];
let currentIndex = 0;
const booksPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const resultsDiv = document.getElementById('results');
    const searchButton = document.getElementById('searchButton');
    const searchingModal = document.getElementById('searchingModal');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const buyButton = document.getElementById('buyButton');
    const searchArea = document.getElementById('searchArea');
    const expandButton = document.getElementById('expandButton');
    const themeSelector = document.getElementById('themeSelector');

    function truncateText(text, limit) {
        const words = text.split(' ');
        if (words.length > limit) {
            return words.slice(0, limit).join(' ') + '...';
        }
        return text;
    }

    function displayResults(books) {
        resultsDiv.innerHTML = '';
        books.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-item mb-4';
            bookDiv.innerHTML = `
                <div class="card">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${book.imageLinks.thumbnail || 'placeholder.jpg'}" alt="${book.title}" class="img-fluid book-image" data-full-image="${book.imageLinks.small || book.imageLinks.thumbnail || 'placeholder.jpg'}">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${book.title}</h5>
                                <p class="card-text">Author: ${book.authors.join(', ')}</p>
                                <p class="card-text">Published: ${book.publishedDate}</p>
                                <p class="card-text">${truncateText(book.description, 30)}</p>
                                <p class="card-text"><small class="text-muted">ISBN: ${book.isbn}</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsDiv.appendChild(bookDiv);
        });

        if (currentIndex + booksPerPage < allBooks.length) {
            const moreButton = document.createElement('button');
            moreButton.id = 'moreButton';
            moreButton.className = 'btn btn-primary mt-3';
            moreButton.textContent = 'Load More';
            moreButton.addEventListener('click', loadMoreResults);
            resultsDiv.appendChild(moreButton);
        }

        document.querySelectorAll('.book-image').forEach(img => {
            img.addEventListener('click', function() {
                modalImage.src = this.dataset.fullImage;
                imageModal.style.display = 'block';
                buyButton.href = `https://www.amazon.com/s?k=${encodeURIComponent(this.alt)}`;
            });
        });
    }

    function loadMoreResults() {
        currentIndex += booksPerPage;
        displayResults(allBooks.slice(currentIndex, currentIndex + booksPerPage));
    }

    function shrinkSearchArea() {
        searchArea.classList.add('shrink');
        expandButton.style.display = 'block';
    }

    function expandSearchArea() {
        searchArea.classList.remove('shrink');
        expandButton.style.display = 'none';
        resultsDiv.innerHTML = '';
        const moreButton = document.getElementById('moreButton');
        if (moreButton) moreButton.style.display = 'none';
        resetSearch();
    }

    function resetSearch() {
        searchButton.textContent = 'Search';
        searchButton.classList.remove('btn-secondary');
        searchButton.classList.add('btn-primary');
        allBooks = [];
        currentIndex = 0;
        searchForm.reset();
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const searchParams = new URLSearchParams(formData);
        searchingModal.style.display = 'block';

        fetch('/search?' + searchParams.toString(), {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            searchingModal.style.display = 'none';
            if (data.error) {
                throw new Error(data.error);
            }
            if (data.length > 0) {
                allBooks = data;
                displayResults(allBooks.slice(0, booksPerPage));
                shrinkSearchArea();
            } else {
                resultsDiv.innerHTML = '<p>No books found. Please try a different search.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            searchingModal.style.display = 'none';
            resultsDiv.innerHTML = `<p>An error occurred while fetching results: ${error.message}</p>`;
        });
    });

    expandButton.addEventListener('click', expandSearchArea);

    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target === modalImage) {
            imageModal.style.display = 'none';
        }
    });

    buyButton.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Theme selector
    themeSelector.addEventListener('change', function() {
        document.body.className = this.value === 'dark' ? 'dark-theme' : '';
    });
});
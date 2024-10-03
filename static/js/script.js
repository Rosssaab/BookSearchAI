// script.js

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

    function truncateText(text, limit) {
        const words = text.split(' ');
        if (words.length > limit) {
            return words.slice(0, limit).join(' ') + '...';
        }
        return text;
    }

    function displayResults(books, append = false) {
        if (!append) {
            resultsDiv.innerHTML = '';
            currentIndex = 0;
        }

        const fragment = document.createDocumentFragment();
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'card mb-3';
            const truncatedDescription = truncateText(book.description, 50);
            const amazonSearchParam = book.isbn ? book.isbn : encodeURIComponent(book.title);
            const largeImageUrl = book.imageLinks?.large || book.imageLinks?.thumbnail || 'placeholder.jpg';
            bookElement.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${book.imageLinks?.thumbnail || 'placeholder.jpg'}" class="img-fluid rounded-start book-image" alt="${book.title}" data-full-image="${largeImageUrl}" data-amazon-link="https://www.amazon.co.uk/s?k=${amazonSearchParam}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text">Author(s): ${book.authors.join(', ')}</p>
                            <p class="card-text">Published: ${book.publishedDate}</p>
                            <p class="card-text description">${truncatedDescription}</p>
                            ${book.description.split(' ').length > 50 ? '<a href="#" class="read-more">Read more</a>' : ''}
                        </div>
                    </div>
                </div>
            `;
            fragment.appendChild(bookElement);

            const readMoreLink = bookElement.querySelector('.read-more');
            if (readMoreLink) {
                readMoreLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const descriptionElement = bookElement.querySelector('.description');
                    descriptionElement.textContent = book.description;
                    this.style.display = 'none';
                });
            }

            const bookImage = bookElement.querySelector('.book-image');
            bookImage.addEventListener('click', function() {
                modalImage.src = this.dataset.fullImage;
                buyButton.href = this.dataset.amazonLink;
                imageModal.style.display = 'block';
            });
        });

        resultsDiv.appendChild(fragment);
        currentIndex += books.length;

        // Add or update "More results" button
        let moreButton = document.getElementById('moreButton');
        if (!moreButton) {
            moreButton = document.createElement('button');
            moreButton.id = 'moreButton';
            moreButton.className = 'btn btn-primary mt-3';
            moreButton.textContent = 'More results';
            moreButton.addEventListener('click', loadMoreResults);
            resultsDiv.after(moreButton);
        }
        moreButton.style.display = currentIndex < allBooks.length ? 'block' : 'none';

        searchButton.textContent = 'New Search';
        searchButton.classList.remove('btn-primary');
        searchButton.classList.add('btn-secondary');
    }

    function loadMoreResults() {
        const nextBooks = allBooks.slice(currentIndex, currentIndex + booksPerPage);
        displayResults(nextBooks, true);
    }

    function resetSearch() {
        resultsDiv.innerHTML = '';
        searchButton.textContent = 'Search';
        searchButton.classList.remove('btn-secondary');
        searchButton.classList.add('btn-primary');
        const moreButton = document.getElementById('moreButton');
        if (moreButton) moreButton.style.display = 'none';
        allBooks = [];
        currentIndex = 0;
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (searchButton.textContent === 'New Search') {
            resetSearch();
        } else {
            const formData = new FormData(this);
            const searchParams = new URLSearchParams(formData);
            searchingModal.style.display = 'block';

            fetch('/search?' + searchParams.toString(), {
                method: 'GET'
            })
            .then(response => response.json())
            .then(books => {
                searchingModal.style.display = 'none';
                allBooks = books;
                displayResults(allBooks.slice(0, booksPerPage));
            })
            .catch(error => {
                console.error('Error:', error);
                searchingModal.style.display = 'none';
                resultsDiv.innerHTML = '<p>An error occurred while fetching results.</p>';
            });
        }
    });

    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target === modalImage) {
            imageModal.style.display = 'none';
        }
    });

    buyButton.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
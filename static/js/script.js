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
    const themeLink = document.getElementById('theme-css');

    function truncateText(text, limit) {
        const words = text.split(' ');
        if (words.length > limit) {
            return words.slice(0, limit).join(' ') + '...';
        }
        return text;
    }

    function displayResults(books) {
        resultsDiv.innerHTML = '<table class="table table-hover"><tbody></tbody></table>';
        const tableBody = resultsDiv.querySelector('tbody');
        
        books.forEach(book => {
            const row = document.createElement('tr');
            const truncatedDescription = truncateText(book.description, 30);
            const isTextTruncated = truncatedDescription !== book.description;
            
            row.innerHTML = `
                <td class="col-md-2">
                    <img src="${book.imageLinks.thumbnail || 'placeholder.jpg'}" alt="${book.title}" class="img-fluid book-image" data-full-image="${book.imageLinks.small || book.imageLinks.thumbnail || 'placeholder.jpg'}" data-isbn="${book.isbn}">
                </td>
                <td class="col-md-10">
                    <h5>${book.title}</h5>
                    <p>Author: ${book.authors.join(', ')}</p>
                    <p>Published: ${book.publishedDate}</p>
                    <p class="book-description">${truncatedDescription}</p>
                    ${isTextTruncated ? '<button class="btn btn-link read-more-less">Read more</button>' : ''}
                    <p><small class="text-muted">ISBN: ${book.isbn}</small></p>
                </td>
            `;
            tableBody.appendChild(row);
            
            if (isTextTruncated) {
                const readMoreLessBtn = row.querySelector('.read-more-less');
                const descriptionP = row.querySelector('.book-description');
                readMoreLessBtn.addEventListener('click', function() {
                    if (this.textContent === 'Read more') {
                        descriptionP.textContent = book.description;
                        this.textContent = 'Read less';
                    } else {
                        descriptionP.textContent = truncatedDescription;
                        this.textContent = 'Read more';
                    }
                });
            }
        });

        document.querySelectorAll('.book-image').forEach(img => {
            img.addEventListener('click', function() {
                modalImage.src = this.dataset.fullImage;
                imageModal.style.display = 'block';
                buyButton.href = `https://www.amazon.co.uk/s?k=${encodeURIComponent(this.dataset.isbn)}`;
            });
        });
    }

    function loadMoreResults() {
        currentIndex += booksPerPage;
        displayResults(allBooks.slice(currentIndex, currentIndex + booksPerPage));
    }

    function shrinkSearchArea() {
        document.getElementById('searchAreaWrapper').style.display = 'none';
        expandButton.style.display = 'block';
    }

    function expandSearchArea() {
        document.getElementById('searchAreaWrapper').style.display = 'flex';
        expandButton.style.display = 'none';
        resultsDiv.innerHTML = '';
        resetSearch();
        window.scrollTo(0, 0);
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
                shrinkSearchArea();
                displayResults(allBooks.slice(0, booksPerPage));
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

    function applyTheme(theme) {
        if (theme === 'default') {
            themeLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
        } else {
            themeLink.href = `https://bootswatch.com/5/${theme}/bootstrap.min.css`;
        }
    }

    themeSelector.addEventListener('change', function() {
        const selectedTheme = this.value;
        applyTheme(selectedTheme);
        localStorage.setItem('selectedTheme', selectedTheme);
    });

    // Load saved theme or set to darkly if no theme is saved
    const savedTheme = localStorage.getItem('selectedTheme') || 'darkly';
    themeSelector.value = savedTheme;
    applyTheme(savedTheme);
});
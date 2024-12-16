document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const chatMessages = document.getElementById('chatMessages');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Constants
    const TENOR_API_KEY = 'AIzaSyCkJ44bhL93TkK7MeyBUpfEo53FngnI1lU';
    const TENOR_API_URL = 'https://tenor.googleapis.com/v2';

    // State
    let searchTimeout = null;
    let isSearching = false;

    // Utility Functions
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
        isSearching = true;
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
        isSearching = false;
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        searchResults.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // GIF Search
    async function searchGifs(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        try {
            showLoading();
            const response = await fetch(
                `${TENOR_API_URL}/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch GIFs');
            }

            const data = await response.json();
            displaySearchResults(data.results);
        } catch (error) {
            console.error('Search error:', error);
            showError('Failed to load GIFs. Please try again.');
            searchResults.innerHTML = '';
        } finally {
            hideLoading();
        }
    }

    function displaySearchResults(gifs) {
        searchResults.innerHTML = '';
        gifs.forEach(gif => {
            const gifElement = document.createElement('div');
            gifElement.className = 'gif-item';

            const img = document.createElement('img');
            img.src = gif.media_formats.tinygif.url;
            img.alt = gif.content_description;
            img.loading = 'lazy';

            gifElement.appendChild(img);
            gifElement.addEventListener('click', () => sendGif(gif));
            searchResults.appendChild(gifElement);
        });
    }

    // Message Handling
    function sendGif(gif) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        const img = document.createElement('img');
        img.src = gif.media_formats.gif.url;
        img.alt = gif.content_description;

        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();

        messageInfo.appendChild(timestamp);
        messageElement.appendChild(img);
        messageElement.appendChild(messageInfo);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        searchInput.value = '';
        searchResults.innerHTML = '';
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            searchGifs(e.target.value);
        }, 300);
    });

    // Initial setup
    searchInput.focus();
});
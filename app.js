// Configuration
const TENOR_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key in production
const API_BASE_URL = 'https://tenor.googleapis.com/v2';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const gifResults = document.getElementById('gifResults');
const chatContainer = document.getElementById('chatContainer');

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search GIFs
async function searchGifs(query) {
    if (!query) {
        gifResults.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20`
        );
        const data = await response.json();
        
        gifResults.innerHTML = '';
        data.results.forEach(gif => {
            const gifElement = document.createElement('div');
            gifElement.className = 'gif-item';
            
            const img = document.createElement('img');
            img.src = gif.media_formats.tinygif.url;
            img.alt = gif.content_description;
            
            gifElement.appendChild(img);
            gifElement.addEventListener('click', () => sendGif(gif));
            
            gifResults.appendChild(gifElement);
        });
    } catch (error) {
        console.error('Error fetching GIFs:', error);
    }
}

// Send GIF to chat
function sendGif(gif) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const img = document.createElement('img');
    img.src = gif.media_formats.gif.url;
    img.alt = gif.content_description;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(img);
    messageDiv.appendChild(timestamp);
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Event Listeners
searchInput.addEventListener('input', debounce((e) => {
    searchGifs(e.target.value);
}, 300));
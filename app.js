// Configuration
const TENOR_API_KEY = 'AIzaSyCkJ44bhL93TkK7MeyBUpfEo53FngnI1lU'; // Replace with actual API key in production
const API_BASE_URL = 'https://tenor.googleapis.com/v2';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const gifResults = document.getElementById('gifResults');
const chatContainer = document.getElementById('chatContainer');

// Message store for tracking threads
const messages = new Map();
let replyingTo = null;

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

// Generate unique message ID
function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

// Create message element
function createMessageElement(gif, messageId, parentId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = messageId;
    
    const img = document.createElement('img');
    img.src = gif.media_formats.gif.url;
    img.alt = gif.content_description;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    const replyButton = document.createElement('button');
    replyButton.className = 'reply-button';
    replyButton.textContent = 'Reply';
    replyButton.addEventListener('click', () => startReply(messageId));
    
    actions.appendChild(replyButton);
    
    messageDiv.appendChild(img);
    messageDiv.appendChild(timestamp);
    messageDiv.appendChild(actions);
    
    return messageDiv;
}

// Start reply to a message
function startReply(messageId) {
    replyingTo = messageId;
    searchInput.placeholder = 'Search for a GIF to reply...';
    searchInput.focus();
}

// Cancel reply
function cancelReply() {
    replyingTo = null;
    searchInput.placeholder = 'Search for a GIF...';
}

// Send GIF to chat
function sendGif(gif) {
    const messageId = generateMessageId();
    const messageData = {
        id: messageId,
        parentId: replyingTo,
        gif: gif,
        timestamp: new Date(),
        replies: []
    };
    
    messages.set(messageId, messageData);
    
    if (replyingTo) {
        // Add to parent's replies
        const parentMessage = messages.get(replyingTo);
        parentMessage.replies.push(messageId);
        
        // Find parent element and add reply
        const parentElement = document.querySelector(`[data-message-id="${replyingTo}"]`);
        let threadContainer = parentElement.querySelector('.thread');
        
        if (!threadContainer) {
            threadContainer = document.createElement('div');
            threadContainer.className = 'thread';
            parentElement.appendChild(threadContainer);
            
            const toggleButton = document.createElement('button');
            toggleButton.className = 'thread-toggle';
            toggleButton.textContent = 'Show replies';
            toggleButton.addEventListener('click', () => toggleThread(parentElement));
            parentElement.insertBefore(toggleButton, threadContainer);
        }
        
        threadContainer.appendChild(createMessageElement(gif, messageId, replyingTo));
        updateThreadCount(replyingTo);
        cancelReply();
    } else {
        // Add as new message
        chatContainer.appendChild(createMessageElement(gif, messageId));
    }
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Toggle thread visibility
function toggleThread(messageElement) {
    const threadContainer = messageElement.querySelector('.thread');
    const toggleButton = messageElement.querySelector('.thread-toggle');
    
    messageElement.classList.toggle('thread-collapsed');
    toggleButton.textContent = messageElement.classList.contains('thread-collapsed') ? 
        'Show replies' : 'Hide replies';
}

// Update thread reply count
function updateThreadCount(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    const message = messages.get(messageId);
    const replyCount = message.replies.length;
    
    let countElement = messageElement.querySelector('.thread-count');
    if (!countElement) {
        countElement = document.createElement('span');
        countElement.className = 'thread-count';
        messageElement.querySelector('.actions').appendChild(countElement);
    }
    
    countElement.textContent = `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`;
}

// Event Listeners
searchInput.addEventListener('input', debounce((e) => {
    searchGifs(e.target.value);
}, 300));

// Initialize chat container
chatContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('thread-toggle')) {
        const messageElement = e.target.closest('.message');
        toggleThread(messageElement);
    }
});

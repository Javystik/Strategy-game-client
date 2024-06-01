async function initializePage() {
    try {
        const gameId = getGameIdFromURL();
        const token = getToken();
        const response = await fetch(`https://strategygame-server-strategygame.azuremicroservices.io/messages/${gameId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        const messages = await response.json();

        displayMessages(messages);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function updateMessages() {
    try {
        const gameId = getGameIdFromURL();
        const token = getToken();
        const response = await fetch(`https://strategygame-server-strategygame.azuremicroservices.io/messages/${gameId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function createMessage(messageText, userId, gameId) {
    try {
        const token = getToken();

        const response = await fetch(`https://strategygame-server-strategygame.azuremicroservices.io/messages?text=${encodeURIComponent(messageText)}&userId=${userId}&gameId=${gameId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            updateMessages();
        } else {
            throw new Error('Failed to create message');
        }
    } catch (error) {
        console.error('Error:', error.message);
        alert('Failed to create message. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await initializePage();

    const inputForm = document.getElementById('input-container');

    inputForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();
        const userId = getUserIdFromURL();
        const gameId = getGameIdFromURL();
        
        if (messageText !== '') {
            createMessage(messageText, userId, gameId);
            messageInput.value = '';
        }
    });
});
function displayMessages(messages) {
    const messageArea = document.getElementById('message-area');
    messageArea.innerHTML = '';
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = formatMessage(message);
        messageArea.appendChild(messageDiv);
    });
}
function formatMessage(message) {
    const { username, clanTag } = message;
    const tagText = clanTag && clanTag !== 'null' ? `[${clanTag}]` : '';
    return `${username}${tagText ? '[' + clanTag + ']' : ''}: ${message.text}`;
}


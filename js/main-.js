function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
}
document.addEventListener("DOMContentLoaded", async function() {
    const words = document.querySelectorAll('.word');
    let currentUser = null;

    words.forEach((word, index) => {
        word.addEventListener('click', function() {
            const activeWord = document.querySelector('.word.active');
            if (activeWord) {
                activeWord.classList.remove('active');
            }
            this.classList.add('active');
        });

        word.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            }
        });

        word.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });

    const token = getToken();
    const gamesContainer = document.getElementById('gamesContainer');

    try {
        const response = await fetch('https://strategygame-server-strategygame.azuremicroservices.io/auth/info-for-me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }
        currentUser = await response.json();

        const gamesResponse = await fetch('https://strategygame-server-strategygame.azuremicroservices.io/games', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (gamesResponse.status === 204) {
            return;
        }
        const gamesData = await gamesResponse.json();

        gamesData.forEach(game => {
            const gameElement = document.createElement('a');
            gameElement.classList.add('game');
            const clanTag = currentUser ? currentUser.clanTag : '';
            gameElement.href = `../html/game-page.html?id=${game.id}&userId=${currentUser ? currentUser.id : ''}&username=${currentUser.username}&clanTag=${clanTag}`;
        
            const gameInfo = document.createElement('div');
            gameInfo.classList.add('game-info');
        
            const gameImage = document.createElement('img');
            if (!game.active || game.currentPlayers === game.maxPlayers) {
                gameImage.src = '../images/game_icon-non-active-game.jpg';
            } else {
                gameImage.src = '../images/game_icon-active-game.jpg';
            }
            gameImage.alt = game.name;
        
            const gameId = document.createElement('span');
            gameId.classList.add('game-id');
            gameId.textContent = `ID: ${game.id}`;
        
            const gamePlayers = document.createElement('span');
            gamePlayers.classList.add('game-players');
            gamePlayers.textContent = `${game.currentPlayers}/${game.maxPlayers}`;
        
            const gameName = document.createElement('span');
            gameName.classList.add('game-name');
            gameName.textContent = game.name;
        
            gameInfo.appendChild(gameImage);
            gameInfo.appendChild(gameName);
            gameInfo.appendChild(gameId);
            gameInfo.appendChild(gamePlayers);
        
            if (game.currentPlayers === game.maxPlayers) {
                gameElement.classList.add('grayed-out');
            }
        
            gameElement.appendChild(gameInfo);
            
            gamesContainer.appendChild(gameElement);

            gameElement.addEventListener('click', function(event) {
                event.preventDefault();
                const userId = currentUser ? currentUser.id : '';
                const gameId = game.id;
                joinGame(userId, gameId, currentUser.username, currentUser.clanTag);
            });
        });               
    } catch (error) {
        console.error('Error:', error.message);
    }
});

async function joinGame(userId, gameId, username, clanTag) {
    try {
        const response = await fetch(`https://strategygame-server-strategygame.azuremicroservices.io/games/${userId}/${gameId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (response.ok) {
            alert('Успішно приєднано до гри!');
            window.location.href = `../html/game-page.html?id=${gameId}&userId=${userId ? userId : ''}&username=${username}&clanTag=${clanTag}`;
        } else {
            window.location.href = `../html/game-page.html?id=${gameId}&userId=${userId ? userId : ''}&username=${username}&clanTag=${clanTag}`;
        }
    } catch (error) {
        console.error('Error:', error.message);
        alert('Помилка при приєднанні до гри. Спробуйте ще раз.');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const createNewsButton = document.getElementById('createNews');
    const createGamesModal = document.getElementById('createGamesModal');
    const closeButton = document.getElementById('settings-close');
    const body = document.querySelector("body");

    createNewsButton.addEventListener('click', function() {
        createGamesModal.style.display = 'block';
        body.classList.add("modal-open");
    });

    closeButton.addEventListener('click', function() {
        createGamesModal.style.display = 'none';
        body.classList.remove("modal-open");
    });

    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('gamesNameInput');
        const maxPlayers = parseInt(formData.get('maxGamePlayersInput'));

        if (isNaN(maxPlayers) || maxPlayers <= 1 || maxPlayers > 20) {
            alert('Будь ласка, введіть коректне значення для максимальної кількості гравців (від 2 до 20).');
            return;
        }

        fetch(`https://strategygame-server-strategygame.azuremicroservices.io/games?name=${encodeURIComponent(name)}&maxPlayers=${maxPlayers}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Гра успішно створена!');
                createGamesModal.style.display = 'none';
                body.classList.remove("modal-open");
                form.reset();
                window.location.reload();
            } else if (response.status === 400) {
                alert('Ця назва гри вже використовується. Будь ласка, виберіть іншу назву.');
            } else {
                alert('Помилка при створенні гри. Будь ласка, спробуйте ще раз.');
            }
        })
    });
});
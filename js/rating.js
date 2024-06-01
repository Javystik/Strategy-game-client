function generateRatingTable(pageNo, pageSize) {
  // Перевірка, чи є значення pageNo і pageSize числами
  if (isNaN(parseInt(pageNo)) || isNaN(parseInt(pageSize))) {
    pageNo = 0;
    pageSize = 10;
  }

  const token = getToken();
  if (!token) {
    console.error('Не знайдено токен авторизації!');
    return;
  }

  const playerName = document.getElementById('playerName').value;
  const playerEmail = document.getElementById('playerEmail').value;
  const minWins = document.getElementById('minWins').value;
  const maxWins = document.getElementById('maxWins').value;
  const playerId = document.getElementById('playerId').value;

  const searchData = {
    id: playerId,
    username: playerName,
    email: playerEmail,
    statisticSearch: {
      winGames: {
        from: minWins,
        to: maxWins
      }
    }
  };

  const url = `https://strategygame-server-strategygame.azuremicroservices.io/users/by-specification?pageNo=${pageNo}&pageSize=${pageSize}`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchData)
  })
    .then(response => response.json())
    .then(data => {
      const ratingTableBody = document.querySelector('#ratingTable tbody');
      ratingTableBody.innerHTML = '';

      data.content.forEach(player => {
        const playerRow = document.createElement('tr');
        playerRow.innerHTML = `
          <td>${player.id}</td>
          <td>${player.username}</td>
          <td>${player.statisticDto.winGames}</td>
      `;
        ratingTableBody.appendChild(playerRow);
      });

      const currentPageElement = document.getElementById('currentPage');
      currentPageElement.textContent = `Page ${data.number + 1}`;
    })
    .catch(error => {
      console.log("Не має результатів");
    });
}

window.onload = function() {
  generateRatingTable(0, 10);
};

function previousPage() {
  const currentPage = parseInt(document.getElementById('currentPage').textContent.split(' ')[1]);
  if (currentPage > 1) {
    generateRatingTable(currentPage - 2, 10);
  }
}

function nextPage() {
  const currentPage = parseInt(document.getElementById('currentPage').textContent.split(' ')[1]);
  generateRatingTable(currentPage, 10);
}

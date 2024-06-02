function fetchWithToken(url, options) {
  const token = getToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  return fetch(url, { ...options, headers });
}

function fetchClanDataAndDisplay(pageNo = 0, pageSize = 10) {
  const token = getToken();
  if (!token) {
    console.error('Не знайдено токен авторизації!');
    return;
  }

  const playerName = document.getElementById('playerName').value;
  const playerId = parseInt(document.getElementById('playerId').value, 10) || undefined;
  
  const url = `https://strategygame-server-strategygame.azuremicroservices.io/alliances/by-specification?pageNo=${pageNo}&pageSize=${pageSize}`;

  fetchWithToken(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: playerName,
      id: playerId
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .then(data => {
      const clans = data.content;
      displayInitialClans(clans, pageNo + 1);
      updatePagination(pageNo + 1);
    })
    .catch(() => {
      displayInitialClans(null, pageNo + 1);
      updatePagination(1);
      return null;
    });
}


function displayInitialClans(clans, currentPage) {
  const tableBody = document.querySelector("#clansTable tbody");
  tableBody.innerHTML = "";

  if (!clans) {
    return;
  }

  clans.forEach(clan => {
    const avatarSrc = clan.avatarBytes ? `data:image/png;base64,${clan.avatarBytes}` : '../images/clan-avatar.png';
    
    const row = `
      <tr onclick="redirectToClanProfile(${clan.id})">
        <td>${clan.id}</td>
        <td>${clan.name}</td>
        <td><img src="${avatarSrc}" style="height: 80px"></td>
        <td>${clan.tag}</td>
        <td>${clan.membersCount}</td>
        <td>${clan.totalWins}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });

  document.getElementById('currentPage').innerText = `Page ${currentPage}`;
}

function updatePagination(currentPage) {
  const prevButton = document.getElementById('prevPage');

  prevButton.disabled = currentPage === 1;
}

function previousPage() {
  const currentPage = parseInt(document.getElementById('currentPage').textContent.split(' ')[1]);
  if (currentPage > 1) {
    fetchClanDataAndDisplay(currentPage - 2, 10);
  }
}

function nextPage() {
  const currentPage = parseInt(document.getElementById('currentPage').textContent.split(' ')[1]);
  fetchClanDataAndDisplay(currentPage, 10);
}


function generateAllianceTable() {
  fetchClanDataAndDisplay();
}

window.onload = function() {
  fetchClanDataAndDisplay();
};

function getToken() {
  const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
  const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
  return tokenCookie ? tokenCookie[1] : '';
}

function redirectToClanProfile(clanId) {
  window.location.href = `../html/clan-profile.html?id=${clanId}`;
}

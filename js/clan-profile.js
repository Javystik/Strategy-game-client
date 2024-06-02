window.addEventListener('DOMContentLoaded', (event) => {
  const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
  const avatarImg = document.getElementById('clan-avatar');
  
  uploadAvatarBtn.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = function(e) {
        const base64Image = e.target.result.split(',')[1];
        changeClanAvatar(base64Image);
      };
  
      reader.readAsDataURL(file);
    };
    input.click();
  });

  function changeClanAvatar(base64Image) {
    const urlParams = new URLSearchParams(window.location.search);
    const clanId = urlParams.get('id');
  
    const updateClanAvatarDto = {
      clanId: clanId,
      base64Image: base64Image
    };
  
    fetch('https://strategygame-server-strategygame.azuremicroservices.io/alliances', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify(updateClanAvatarDto)
    })
      .then(response => {
        if (response.ok) {
          console.log('Зображення клану успішно змінено!');
          avatarImg.src = `data:image/jpeg;base64,${base64Image}`;
          alert('Успішна зміна зображення клану.');
        } else if (response.status === 403) {
          alert('Змінювати картинку може тільки лідер.');
        } else {
          console.error('Помилка зміни зображення клану:', response.status);
        }
      })
      .catch();
  }


  const urlParams = new URLSearchParams(window.location.search);
  const clanId = urlParams.get('id');

  const fetchClanData = (clanId) => {
    const token = getToken();
    if (!token) {
      console.error('Не знайдено токен авторизації!');
      return;
    }

    fetch(`https://strategygame-server-strategygame.azuremicroservices.io/alliances/${clanId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setClanDetails(data);
        setClanStats(data);
        setClanAvatar(data.avatarBytes);
        setClanMembers(clanId, data.leader.id);
      })
      .catch(error => {
        console.error('Помилка отримання даних про клан:', error);
      });
  };

      if (clanId) {
        fetchClanData(clanId);
    } else {
        console.error('Не вдалося отримати ідентифікатор клану з URL.');
    }

  const setClanDetails = (clanData) => {
    const clanName = document.querySelector('.clan-details h2');
    const clanIdElement = document.querySelector('.clan-details p:nth-child(2)');
    const membersCount = document.querySelector('.clan-details p:nth-child(3)');
    
    clanName.textContent = "[" + clanData.tag + "] " + clanData.name;
    clanIdElement.textContent = `ID: ${clanData.id}`;
    membersCount.textContent = `Учасників: ${clanData.membersCount}`;
};


const setClanAvatar = (avatarBase64) => {
  avatarImg.src = `data:image/jpeg;base64,${avatarBase64}`;
};

  const setClanStats = (clanStats) => {
    const statsSummary = document.querySelector('.stats-summary');
    statsSummary.querySelector('#gamesWon').textContent = clanStats.totalWins;
  };
  const setClanMembers = (clanId, leaderId) => {
    const token = getToken();
    if (!token) {
      console.error('Не знайдено токен авторизації!');
      return;
    }

    fetch(`https://strategygame-server-strategygame.azuremicroservices.io/users/alliance/${clanId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setClanMembersTable(data, leaderId);
      })
      .catch(error => {
        console.error('Помилка отримання даних про учасників клану:', error);
      });
  };

  const setClanMembersTable = (clanMembers, leaderId) => {
    const avatarBytes = member.avatarBytes;
    const imageUrl = avatarBytes ? `data:image/jpeg;base64,${avatarBytes}` : '../images/user-avatar.jpg';
    
    const tableBody = document.querySelector('#ratingTable tbody');
    tableBody.innerHTML = '';
    clanMembers.forEach(member => {
        const row = document.createElement('tr');
        const role = member.id === leaderId ? 'Лідер' : 'Учасник';
        row.innerHTML = `
            <td>${member.id}</td>
            <td><img src="${imageUrl}" alt="Avatar"></td>
            <td>${member.username}</td>
            <td>${role}</td>
            <td>${member.statisticDto.winGames}</td>
        `;
        tableBody.appendChild(row);
    });
};
});

window.addEventListener('DOMContentLoaded', (event) => {
  const joinClanBtn = document.getElementById('joinClan');

  joinClanBtn.addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const clanId = urlParams.get('id');

    const token = getToken();

    if (!token) {
      console.error('Не знайдено токен авторизації!');
      return;
    }

    fetch(`https://strategygame-server-strategygame.azuremicroservices.io/users/alliance/join/${clanId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        alert('Успішний вступ в клан.');
        window.location.reload();
      } else if (response.status === 400) {
        alert('Ви вже є учасником іншого клану. Спочатку вийдіть з нього, щоб приєднатися до нового.');
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .catch(error => {
      if (error.message !== 'Network response was not ok') {
        console.error('Помилка під час приєднання до клану:', error);
      }
    });
  });
});



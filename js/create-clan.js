const createClanModal = document.getElementById('createClanModal');
const clanNameInput = document.getElementById('clanName');
const clanTagInput = document.getElementById('clanTag');
const createAllianseButton = document.getElementById('createAllianseButton');
const settingsClose = document.getElementById('settingsClose');
const createClanBtn = document.getElementById('createClanBtn');

function openModal() {
  createClanModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  body.classList.add("modal-open");
}

function createAlliance() {
  const name = clanNameInput.value.trim();
  const tag = clanTagInput.value.trim();

  if (!name || !tag) {
    alert('Введіть ім\'я та тег альянсу!');
    return;
  }

  const token = getToken();
  const url = 'https://strategygame-server-strategygame.azuremicroservices.io/alliances';

  const body = {
    name,
    tag
  };

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  .then(response => {
    if (response.ok) {
      window.location.reload();
    } else if (response.status === 400) {
      alert('Такий нік або токен вже зайнятий. Спробуйте інший.');
    } else {
      throw new Error('Network response was not ok');
    }
  })
  .catch({});
}


createAllianseButton.addEventListener('click', openModal);

createClanBtn.addEventListener('click', createAlliance);

function getToken() {
  const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
  const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
  return tokenCookie ? tokenCookie[1] : '';
}

settingsClose.onclick = closeModal;

function closeModal() {
  createClanModal.style.display = "none";
  document.body.style.overflow = 'auto';
  body.classList.remove("modal-open");
}

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && createClanModal.style.display === 'block') {
    closeModal();
    body.classList.remove("modal-open");
  }
});

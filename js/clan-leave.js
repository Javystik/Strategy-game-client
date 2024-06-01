const leaveClanModal = document.getElementById('leaveClanModal');
const leaveAllianceButton = document.getElementById('leaveAllianceButton');
const settingsCloseLeaveClan = document.getElementById('settingsClose2');
const leaveClan = document.getElementById('leaveClanBtn');

function openLeaveClanModal() {
  leaveClanModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  body.classList.add("modal-open");
}

function closeLeaveClanModal() {
  leaveClanModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  body.classList.remove("modal-open");
}

leaveAllianceButton.addEventListener('click', openLeaveClanModal);

settingsCloseLeaveClan.addEventListener('click', closeLeaveClanModal);

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && leaveClanModal.style.display === 'block') {
    closeLeaveClanModal();
    body.classList.remove("modal-open");
  }
});

function leaveClanFunc() {
  fetch('https://strategygame-server-strategygame.azuremicroservices.io/users/alliance/leave', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    }
  })
  .then(response => {
    if (response.ok) {
      alert('Успішний вихід з клану.');
      closeLeaveClanModal();
      window.location.reload();
    } else if (response.status === 400) {
      alert('Ви ще не вступили в клан, щоб виходити з нього.');
    } 
  })
  .catch(error => {
    console.error('Помилка при виконанні запиту:', error);
    alert('Сталася помилка. Спробуйте ще раз пізніше.');
  });
}



leaveClan.addEventListener('click', leaveClanFunc);

function getToken() {
  const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
  const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
  return tokenCookie ? tokenCookie[1] : '';
}
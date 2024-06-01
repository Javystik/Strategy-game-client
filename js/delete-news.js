const deleteNewsModal = document.getElementById('deleteNewsModal');
const deleteNewsBtn = document.getElementById('deleteNews');
const deleteNewsCloseModal = document.querySelector('#deleteNews-close');
const newsTitleToDeleteInput = document.getElementById('newsTitleToDeleteInput');
const deleteNewsSubmitBtn = document.getElementById('deleteNewsSubmitBtn');

deleteNewsBtn.onclick = function() {
  deleteNewsModal.style.display = 'block';
  body.classList.add('modal-open');
};

deleteNewsCloseModal.onclick = function() {
  deleteNewsModal.style.display = 'none';
  body.classList.remove('modal-open');
};

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && deleteNewsModal.style.display === 'block') {
    deleteNewsModal.style.display = 'none';
    body.classList.remove('modal-open');
  }
});

deleteNewsSubmitBtn.onclick = function(event) {
  event.preventDefault();

  const newsTitleToDelete = newsTitleToDeleteInput.value;
  if (!newsTitleToDelete) {
    alert('Будь ласка, введіть назву новини для видалення.');
    return;
  }

  const token = getToken();

  fetch(`https://strategygame-server-strategygame.azuremicroservices.io/articles/${newsTitleToDelete}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.status === 200) {
      alert('Новину успішно видалено.');
      newsTitleToDeleteInput.value = '';
      deleteNewsModal.style.display = 'none';
      body.classList.remove('modal-open');
      window.location.reload();
    } else if (response.status === 403) {
      alert('У вас немає прав для видалення новини.');
    } else {
      alert('Помилка при видаленні новини. Спробуйте пізніше.');
    }
  })
  .catch(error => {
    alert('Помилка відправлення запиту на видалення. Спробуйте пізніше.');
  });
};

function getToken() {
  const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
  const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
  return tokenCookie ? tokenCookie[1] : '';
}

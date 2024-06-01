const editNewsModal = document.getElementById('editNewsModal');
const editNewsCloseModal = document.querySelector('#editNews-close');
const editNewsSubmitBtn = document.getElementById('editNewsSubmitBtn');
const editNewsTitleInput = document.getElementById('editNewsTitleInput');
const editNewsImageInput = document.getElementById('editNewsImageInput');
const editNewsDescriptionInput = document.getElementById('editNewsDescriptionInput');

const editNews = document.getElementById('editNews');
editNews.onclick = function() {
  editNewsModal.style.display = 'block';
  const modalBody = document.querySelector('body');
  modalBody.classList.add('modal-open');
};

editNewsCloseModal.onclick = function() {
  editNewsModal.style.display = 'none';
  body.classList.remove('modal-open');
};

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && editNewsModal.style.display === 'block') {
    editNewsModal.style.display = 'none';
    body.classList.remove('modal-open');
  }
});

editNewsSubmitBtn.onclick = function(event) {
  event.preventDefault();

  const editNewsTitle = editNewsTitleInput.value;
  const editNewsDescription = editNewsDescriptionInput.value;
  const editNewsImage = editNewsImageInput.files[0];

  if (editNewsTitle && editNewsDescription) {
    if (editNewsImage) {
      const reader = new FileReader();

      reader.onload = function(e) {
        const base64Image = e.target.result.split(',')[1];

        fetch('https://strategygame-server-strategygame.azuremicroservices.io/articles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            name: editNewsTitle,
            imageBytes: base64Image,
            description: editNewsDescription
          })
        })
        .then(response => {
          if (response.ok) {
            alert('Статтю успішно оновлено!');
            editNewsTitleInput.value = '';
            editNewsImageInput.value = '';
            editNewsDescriptionInput.value = '';
            editNewsModal.style.display = 'none';
            body.classList.remove('modal-open');
            location.reload();
          } else if (response.status === 403) {
            alert('У вас немає прав для користування цією функцією.');
          } else {
            alert('Помилка оновлення. Перевірте правильність введених даних або спробуйте пізніше.');
          }
        })
        .catch(error => {
          alert('Помилка оновлення. Спробуйте пізніше.');
        });
      };

      reader.readAsDataURL(editNewsImage);
    } else {
      alert('Будь ласка, виберіть зображення для статті.');
    }
  } else {
    alert('Будь ласка, введіть назву та опис статті.');
  }
};


function getToken() {
  const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
  const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
  return tokenCookie ? tokenCookie[1] : '';
}
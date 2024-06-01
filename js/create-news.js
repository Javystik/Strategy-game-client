const createNewsModal = document.getElementById('createNewsModal');
const createNewsBtn = document.getElementById('createNews');
const createNewsCloseModal = document.querySelector('#createNews-close');
const newsTitleInput = document.getElementById('newsTitleInput');
const newsImageInput = document.getElementById('newsImageInput');
const newsDescriptionInput = document.getElementById('newsDescriptionInput');
const createNewsSubmitBtn = document.getElementById('createNewsSubmitBtn');

createNewsBtn.onclick = function() {
  createNewsModal.style.display = 'block';
  body.classList.add('modal-open');
};

createNewsCloseModal.onclick = function() {
  closeModal();
};

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && createNewsModal.style.display === 'block') {
    closeModal();
  }
});

createNewsSubmitBtn.onclick = function(event) {
  event.preventDefault();

  const newsTitle = newsTitleInput.value;
  const newsImage = newsImageInput.files[0];
  const newsDescription = newsDescriptionInput.value;

  if (newsTitle && newsImage && newsDescription) {
    const reader = new FileReader();
    reader.readAsDataURL(newsImage);

    reader.onload = function(e) {
      const base64Image = e.target.result.split(',')[1];
      submitNewsData(newsTitle, base64Image, newsDescription);
    };
  } else {
    alert('Будь ласка введіть вся поля: title, image, and description.');
  }
};

function submitNewsData(newsTitle, imageBytes, newsDescription) {
  const token = getToken();

  const articleDto = { name: newsTitle, imageBytes: imageBytes, description: newsDescription };

  fetch('https://strategygame-server-strategygame.azuremicroservices.io/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(articleDto)
  })
  .then(response => {
    if (response.status === 200) {
      alert('Новина успішно створена!!');
      closeModal();
      window.location.reload();
    } else if (response.status === 403) {
      alert('Ви ввели імя що вже використовується, або у вас немає прав для користування цією функцією.');
    } else {
      console.error('Несподівана відповідь сервера:', response.status);
    }
  })
  .catch(error => {
    alert('Сталася помилка під час подання новини. Будь ласка, спробуйте ще раз пізніше.');
  });
}  

function closeModal() {
  createNewsModal.style.display = 'none';
  body.classList.remove('modal-open');
}

function getToken() {
  const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
  const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
  return tokenCookie ? tokenCookie[1] : '';
}

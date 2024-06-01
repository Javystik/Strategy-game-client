document.addEventListener("DOMContentLoaded", function() {

  function fetchArticles() {
    const token = getToken();
    if (!token) {
      console.error('Не знайдено токен авторизації!');
      return;
    }

    return fetch('https://strategygame-server-strategygame.azuremicroservices.io/articles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.status === 204) {
        return [];
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      return Promise.reject(error);
    });
  }

  function createNewsArticle(article) {
    const newsContainer = document.createElement('div');
    newsContainer.classList.add('container', 'news-article');

    const newsTitle = document.createElement('h2');
    newsTitle.classList.add('news-title');
    newsTitle.textContent = article.name;

    const divider1 = document.createElement('div');
    divider1.classList.add('divider');

    const divider2 = document.createElement('div');
    divider2.classList.add('divider');

    const newsDescription = document.createElement('p');
    newsDescription.classList.add('news-description');
    newsDescription.textContent = article.description;

    newsContainer.appendChild(newsTitle);
    newsContainer.appendChild(divider1);

    if (article.imageBytes) {
      const newsImage = document.createElement('img');
      newsImage.classList.add('news-image');
      newsImage.src = `data:image/jpeg;base64,${article.imageBytes}`;
      newsContainer.appendChild(newsImage);
    }

    newsContainer.appendChild(divider2);
    newsContainer.appendChild(newsDescription);

    document.body.appendChild(newsContainer);
  }

  fetchArticles()
    .then(articles => {
      if (articles.length > 0) {
        articles.forEach(article => {
          createNewsArticle(article);
        });
      } else {

      }
    })
    .catch(error => {
      console.error('Помилка отримання новин:', error);
    });
  
  function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
  }
});

var settingsModal = document.getElementById("settingsModal");
var settingsImg = document.querySelector("#header-icons img[src='../images/settings.png']");
const updateProfileBtn = document.getElementById("updateProfileBtn");
var body = document.querySelector("body");

settingsImg.onclick = function() {
  settingsModal.style.display = "block";
  body.classList.add("modal-open");
};

document.getElementById("settings-close").onclick = function() {
  settingsModal.style.display = "none";
  body.classList.remove("modal-open");
};

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.onclick = function() {
    deleteAllCookies();
    window.location.reload();

  settingsModal.style.display = "none";
  body.classList.remove("modal-open");
};

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && settingsModal.style.display === 'block') {
    settingsModal.style.display = 'none';
    body.classList.remove("modal-open");
  }
});

function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
}

updateProfileBtn.addEventListener("click", function() {
    const password = document.getElementById("passwordInput").value;
    const email = document.getElementById("emailInput").value;

    if (password.trim() !== '' || email.trim() !== '') {
        updateUserProfile(password, email);
    } else {
        alert("Будь ласка, заповніть хоча б одне поле для оновлення профілю.");
    }
});

function updateUserProfile(password, email) {
    const updateData = {
        password: password,
        email: email
    };

    const token = getToken();

    if (!token) {
        console.error('Токен не знайдено. Користувач не авторизований.');
        return;
    }

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/users', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Помилка при оновленні даних профілю.');
        }
        window.location.reload();
    })
    .catch(error => {
        console.error('Помилка:', error);
    });
}
document.getElementById("generateFakeUsersBtn").onclick = function() {
    var count = document.getElementById("fakeUsersCount").value;
    generateFakeUsers(count);
};

function generateFakeUsers(count) {
    const token = getToken();

    if (!token) {
        console.error('Токен не знайдено. Користувач не авторизований.');
        return;
    }

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/users/generate-fake?count=' + count, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    })
    .then(response => {
        if (response.ok) {
            alert(`Було успішно додано ${count} фейкових користувачів!`);
            settingsModal.style.display = 'none';
            body.classList.remove("modal-open");
            window.location.reload();
        } else if (response.status === 403) {
            alert('У вас немає прав для користування цією функцією.');
        } else {
            throw new Error('Помилка при генерації фейк користувачів');
        }
    })
    .catch(error => {
        console.error('Помилка:', error);
    });
}


function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
  }
  const verificationButton = document.getElementById("verificationButton");

  verificationButton.addEventListener("click", function() {
      const codeInputs = document.querySelectorAll(".verification-input");
      let code = "";
  
      codeInputs.forEach(input => {
          code += input.value.trim();
      });
  
      console.log(code);
      verifyRegistration(code);
  });
  
  function verifyRegistration(code) {
      const token = getToken();
  
      fetch('https://strategygame-server-strategygame.azuremicroservices.io/verify/registration?code=' + code, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      })
      .then(response => {
          if (response.ok) {
              alert('Верифікація успішна');
          } else {
              if (response.status === 400) {
                  alert('Помилка при верифікації. Неправильний код, або час життя коду пройшов!');
              } else {
                  alert('Помилка при верифікації');
              }
          }
      })
      .catch(error => {
          console.error('Помилка:', error);
      });
  }

const newVerificationCodeButton = document.getElementById('newVerificationCodeButton');

newVerificationCodeButton.addEventListener('click', () => {
    const token = getToken();

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/verify/send-code', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Лист з повторним кодом відправлено');
        } else {
            if (response.status === 400) {
                alert('Помилка в надсиланні листа. Перевірте вашу пошту');
            } else {
                alert('Помилка відправлення листа');
            }
        }
    })
    .catch(error => {
        console.error('Помилка:', error);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('username').addEventListener('input', checkInput);
    document.getElementById('password').addEventListener('input', checkInput);
    document.getElementById('email').addEventListener('input', checkInput);
});

function checkInput() {
    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    var emailInput = document.getElementById('email');

    if (usernameInput.value !== '') {
        document.getElementById('loginLabel').classList.add('active');
    } else {
        document.getElementById('loginLabel').classList.remove('active');
    }

    if (passwordInput.value !== '') {
        document.getElementById('passwordLabel').classList.add('active');
    } else {
        document.getElementById('passwordLabel').classList.remove('active');
    }

    if (emailInput.value !== '') {
        document.getElementById('emailLabel').classList.add('active');
    } else {
        document.getElementById('emailLabel').classList.remove('active');
    }
}

function register() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var email = document.getElementById('email').value;

    if (!username || !password || !email) {
        alert('Будь ласка, заповніть усі поля');
        return;
    }

    var authData = {
        username: username,
        password: password,
        email: email
    };

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else if (response.status === 400) {
            alert('Введений логін або пароль вже використовуються!');
            return;
        } else {
            throw new Error('Registration failed');
        }
    })
    .then(token => {
        document.cookie = `token=${token}`;
        alert('Registration successful!');
        window.location.href = '../html/main-page.html';
    })
}


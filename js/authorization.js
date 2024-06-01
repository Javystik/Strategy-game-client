document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var authData = {
        username: username,
        password: password
    };

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Login failed');
        }
    })
    .then(token => {
        document.cookie = `token=${token}`;
        alert('Login successful!');
        window.location.href = '../html/main-page.html';
    })
    .catch(error => {
        console.error('Error logging in:', error);
        alert('Login failed. Please try again.');
    });
});

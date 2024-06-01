fetch('https://strategygame-server-strategygame.azuremicroservices.io/auth/check-authentication', {
    headers: {
        'Authorization': `Bearer ${getToken()}`
    }
})
.then(response => {
    if (response.ok) {

    } else {
        window.location.href = '../html/authorization-page.html';
    }
})
.catch(error => {
    console.error('Error checking authentication:', error);
});

function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
}

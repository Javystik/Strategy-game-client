document.addEventListener('DOMContentLoaded', function () {
    const token = getToken();

    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/auth/info-for-me', requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(userData => {
            var userDetailsH2 = document.querySelector('.user-details h2');
            var clanText = "";
            var isVerifiedText = "";

            if (userData.isVerified) {
                isVerifiedText = "<img src='../images/verifed.png' alt='Verified' width='25' height='25' /> ";
            }

            if (userData.clanTag !== null) {
                clanText += "[" + userData.clanTag + "] ";
            }

            userDetailsH2.innerHTML = clanText + userData.username + isVerifiedText;


            document.querySelector('.user-details p:nth-of-type(1)').textContent = "ID: " + userData.id;
            const userRegisteredDate = new Date(userData.createdAt);
            const formattedUserRegisteredDate = userRegisteredDate.toLocaleString('uk-UA');
            document.querySelector('.user-details p:nth-of-type(2)').textContent = "Дата реєстрації: " + formattedUserRegisteredDate;

            const base64Image = userData.avatarBytes;
            const imageUrl = 'data:image/png;base64,' + base64Image;

            document.getElementById('user-avatar').src = imageUrl;

            document.getElementById('gamesPlayed').textContent = userData.statisticDto.playerGames;
            document.getElementById('gamesWon').textContent = userData.statisticDto.winGames;
            document.getElementById('enemiesKilled').textContent = userData.statisticDto.enemyUnitsKilled;
            document.getElementById('territoriesCaptured').textContent = userData.statisticDto.territoriesCaptured;

            const kdRatio = calculateKDRatio(userData.statisticDto.enemyUnitsKilled, userData.statisticDto.unitsDeaths);
            document.getElementById('kdRatio').textContent = kdRatio.toFixed(2);


            const ctx = document.getElementById('killsDeathsRatioChart').getContext('2d');

            const killsDeathsRatioData = {
                datasets: [{
                    data: [userData.statisticDto.enemyUnitsKilled, userData.statisticDto.unitsDeaths],
                    backgroundColor: [
                        'rgb(0, 39, 168)',
                        'rgb(158, 11, 0)'
                    ],
                    borderWidth: 0
                }]
            };

            const killsDeathsRatioOptions = {
                responsive: false,
                cutoutPercentage: 70,
                plugins: {
                    datalabels: {
                        color: 'white',
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex];
                        }
                    }
                }
            };

            new Chart(ctx, {
                type: 'doughnut',
                data: killsDeathsRatioData,
                options: killsDeathsRatioOptions
            });

            const uploadBtn = document.querySelector('.upload-btn');
            uploadBtn.addEventListener('click', function () {
                uploadNewAvatar(userData.id);
            });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
});
function calculateKDRatio(enemyKills, deaths) {
    if (deaths === 0) {
        return enemyKills;
    } else {
        return enemyKills / deaths;
    }
}
function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
}


function uploadNewAvatar(userId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', function (event) {
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const base64Image = e.target.result.split(',')[1];
                const userAvatar = document.getElementById('user-avatar');

                userAvatar.src = 'data:image/jpeg;base64,' + base64Image;

                if (base64Image) {
                    updateAvatar(userId, base64Image);
                } else {
                    console.error('Error reading file data. Unable to upload.');
                }
            };

            reader.readAsDataURL(file);
        }
    });

    fileInput.click();
}

function updateAvatar(userId, base64Image) {
    const token = getToken();
    const requestData = {
        userId: userId,
        base64Image: base64Image
    };
    const requestOptions = {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    };

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/users/update-avatar', requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            console.log('Avatar updated successfully:', data);
        })
        .catch(error => {
            console.error('Error updating avatar:', error);
    });
}
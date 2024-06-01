var maxScale = 2;
var minScale = 0.5;

var startX, startY, isDragging = false;
var isLPressed = false;
var squaresCollection = [];

function dragStart(event) {
    startX = event.clientX;
    startY = event.clientY;
    isDragging = true;
}

function drag(event) {
    if (isDragging) {
        var deltaX = event.clientX - startX;
        var deltaY = event.clientY - startY;
        window.scrollBy(-deltaX, -deltaY);
        startX = event.clientX;
        startY = event.clientY;
    }
}

function dragEnd() {
    isDragging = false;
}

document.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

document.body.style.overflow = 'hidden';

document.addEventListener('keydown', function(event) {
    if (event.key === 'l' || event.key === 'L' || event.key === 'д' || event.key === 'Д') {
        isLPressed = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'l' || event.key === 'L' || event.key === 'д' || event.key === 'Д') {
        isLPressed = false;
    }
});

document.addEventListener('click', function(event) {
    if (!event.target.closest('#icon-container')) {
        if (event.button === 0 && isLPressed) {
            var grid = document.getElementById('grid');
            if (grid) {
                var gridRect = grid.getBoundingClientRect();
                var offsetX = gridRect.left;
                var offsetY = gridRect.top;
                if (!isNaN(offsetX) && !isNaN(offsetY)) {
                    var squareSize = 50;
                    var centerX = event.clientX - offsetX - (squareSize / 2);
                    var centerY = event.clientY - offsetY - (squareSize / 2);
                    createSquareOnMouse(centerX, centerY);
                } else {
                    console.error('Invalid grid offset:', offsetX, offsetY);
                }
            } else {
                console.error('Grid element not found.');
            }
        } else if (event.button === 0 && !isLPressed) {
            var clickedSquare = findClickedSquare(event.clientX, event.clientY);
            if (!clickedSquare) {
                clearSelection();
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        initializeGame();
    } catch (error) {
        console.error('Error:', error.message);
    }
});

async function initializeGame() {
    await loadUnits();
    startBatchUpdateTimer();
}

function getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
}

var units;

async function loadUnits() {
    const gameId = getGameIdFromURL();
    const token = getToken();
    const response = await fetch(`https://strategygame-server-strategygame.azuremicroservices.io/units/${gameId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch units');
    }

    units = await response.json();
    
    const aliveUnits = units.filter(unit => unit.alive);

    updateMiniMap(aliveUnits);
    updateUnits(aliveUnits);
}

let queenUnitId = null;

function updateUnits(units) {
    const grid = document.getElementById('grid');
    const currentUserId = getUserIdFromURL().toString();

    if (grid) {
        units.forEach(unit => {
            if (manualUpdateInProgress.has(unit.id)) {
                return;
            }
            const existingSquare = document.getElementById(unit.id);
            if (existingSquare) {
                existingSquare.style.left = unit.x + 'px';
                existingSquare.style.top = unit.y + 'px';
            } else {
                createSquareOnLoad(unit.id, unit.x, unit.y, unit.unitTemplateDto.unitType.size, unit.unitTemplateDto.id, unit.userId
                    , unit.unitTemplateDto.speed, unit.unitTemplateDto.range, unit.unitTemplateDto.reload
                    ,  unit.unitTemplateDto.damage, unit.currentHealthPoints, unit.userName, unit.unitTemplateDto.name);
            }

            const unitName = unit.unitTemplateDto.name.normalize('NFC');
            const expectedName = 'Королева'.normalize('NFC');
            const userIdStr = unit.userId.toString();

            if (unitName === expectedName && userIdStr === currentUserId) {
                queenUnitId = unit.id;
            }
        });
    }
}
function updateUnitPosition(updatedUnit) {
    const unitElement = document.getElementById(updatedUnit.id);
    if (unitElement) {
        unitElement.style.left = updatedUnit.x + 'px';
        unitElement.style.top = updatedUnit.y + 'px';

        updatedUnit.x = parseInt(unitElement.style.left, 10);
        updatedUnit.y = parseInt(unitElement.style.top, 10);

        const unitIndex = units.findIndex(unit => unit.id === updatedUnit.id);
        if (unitIndex !== -1) {
            units[unitIndex].x = updatedUnit.x;
            units[unitIndex].y = updatedUnit.y;
        } else {
            units.push(updatedUnit);
        }
        
        updateMiniMap(units);
    } else {
        createSquareOnLoad(updatedUnit.id, updatedUnit.x, updatedUnit.y, 
            updatedUnit.unitTemplateDto.unitType.size, updatedUnit.unitTemplateDto.id, updatedUnit.userId
            , updatedUnit.unitTemplateDto.speed, updatedUnit.unitTemplateDto.range, updatedUnit.unitTemplateDto.reload
            , updatedUnit.unitTemplateDto.damage, updatedUnit.currentHealthPoints, updatedUnit.userName, updatedUnit.unitTemplateDto.name);
        units.push(updatedUnit);
        updateMiniMap(units);
    }
}


function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.split('='));
    const tokenCookie = cookies.find(cookie => cookie[0].trim() === 'token');
    return tokenCookie ? tokenCookie[1] : '';
}

function createSquareOnLoad(id, x, y, size, unitTemplateDtoId, createdByUserId, speed, range, reload, damage, currentHealthPoints, username, unitType) {
    var square = createSquare(id, x, y, size, createdByUserId, unitTemplateDtoId, speed, range, reload, damage, currentHealthPoints, username, unitType);
    document.getElementById('grid').appendChild(square);
}


function createSquareOnMouse(x, y) {
    console.log("Кубик створено його координати: ");
    console.log(x);
    console.log(y);
    var square = createSquare(99, x, y, 50, 1, null, 15, 5, 5, 100, 4);
    document.getElementById('grid').appendChild(square);
}

function createSquare(id, x, y, size, createdByUserId, unitTemplateDtoId, speed, range, reload, damage, currentHealthPoints, username, unitType) {
    var square = document.createElement('div');
    square.id = id;
    square.classList.add('gameSquare');

    square.style.width = size + 'px';
    square.style.height = size + 'px';
    square.style.setProperty('--size', size);

    var urlParams = new URLSearchParams(window.location.search);
    var userId = urlParams.get('userId');

    var color = createdByUserId && createdByUserId.toString() === userId ? 'blue' : 'red';
    square.style.backgroundColor = color;

    square.style.position = 'absolute';
    square.style.left = x + 'px';
    square.style.top = y + 'px';

    square.dataset.userId = createdByUserId;
    square.dataset.currentHealthPoints = currentHealthPoints;
    square.unitTemplateDto = { id: unitTemplateDtoId, speed: speed , range: range, reload: reload, damage: damage};

    var userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('userInfo');
    userInfoDiv.innerHTML = `${username}<br>
                             ${unitType}<br>
                             HP: ${currentHealthPoints}`;
    square.appendChild(userInfoDiv);

    return square;
}


document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    if (event.button === 2) {
        var clickedSquare = findClickedSquare(event.clientX, event.clientY);
        if (clickedSquare) {
            toggleSquareSelection(clickedSquare);
        }
    }
});

function findClickedSquare(x, y) {
    var grid = document.getElementById('grid');
    if (grid) {
        return Array.from(grid.children).find(function(square) {
            var squareRect = square.getBoundingClientRect();
            var squareX = squareRect.left;
            var squareY = squareRect.top;
            var squareSize = squareRect.width;
            return x >= squareX && x <= squareX + squareSize && y >= squareY && y <= squareY + squareSize;
        });
    } else {
        console.error('Grid element not found.');
        return null;
    }
}

function toggleSquareSelection(square) {
    var urlParams = new URLSearchParams(window.location.search);
    var userId = urlParams.get('userId');
    var squareUserId = square.dataset.userId;

    if (userId && squareUserId && userId.toString() === squareUserId.toString()) {
        var index = squaresCollection.indexOf(square);
        if (index !== -1) {
            squaresCollection.splice(index, 1);
            square.classList.remove('selected');
        } else {
            squaresCollection.push(square);
            square.classList.add('selected');
        }
        updateIconContainerVisibility();
    }
}

document.addEventListener('click', function(event) {
    if (event.button === 0 && !isLPressed && !event.target.closest('#icon-container')) {
        var clickedSquare = findClickedSquare(event.clientX, event.clientY);
        if (!clickedSquare) {
            clearSelection();
            clearHighlightedIcons();
        }
    }
});

function clearSelection() {
    squaresCollection.forEach(function(square) {
        square.classList.remove('selected');
    });
    squaresCollection = [];
    updateIconContainerVisibility();
}

function updateIconContainerVisibility() {
    var iconContainer = document.getElementById('icon-container');
    if (squaresCollection.length > 0) {
        iconContainer.style.display = 'flex';
        startMovementListener();
    } else {
        iconContainer.style.display = 'none';
        stopMovementListener();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateIconContainerVisibility();

    document.getElementById('icon-attack').addEventListener('click', function(event) {
        event.stopPropagation();
        highlightIcon('icon-attack');
        attackFunction();
    });

    document.getElementById('icon-movement').addEventListener('click', function(event) {
        event.stopPropagation();
        highlightIcon('icon-movement');
        movementFunction();
    });
});

function moveSquaresTo(clickX, clickY) {
    const grid = document.getElementById('grid');
    const gridRect = grid.getBoundingClientRect();
    const targetX = clickX - gridRect.left;
    const targetY = clickY - gridRect.top;

    squaresCollection.forEach(square => {
        const size = parseInt(square.style.width, 10);
        const halfSize = size / 2;
        stopSquareAnimation(square);
        moveSquareTo(square, targetX - halfSize, targetY - halfSize, square.unitTemplateDto.speed, square.username, square.unitTemplateDto.name);
    });
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}


let manualUpdateInProgress = new Set();

function moveSquareTo(square, targetX, targetY, speed, username, squareName) {
    const grid = document.getElementById('grid');
    const gridRect = grid.getBoundingClientRect();

    if (targetX < 0) {
        targetX = 0;
    } else if (targetX > gridRect.width - square.offsetWidth) {
        targetX = gridRect.width - square.offsetWidth;
    }

    if (targetY < 0) {
        targetY = 0;
    } else if (targetY > gridRect.height - square.offsetHeight) {
        targetY = gridRect.height - square.offsetHeight;
    }

    const startX = parseInt(square.style.left, 10);
    const startY = parseInt(square.style.top, 10);
    const distanceX = targetX - startX;
    const distanceY = targetY - startY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const steps = Math.ceil(distance / speed);

    let currentStep = 0;
    manualUpdateInProgress.add(square.id);

    function animate() {
        const progress = currentStep / steps;
        const currentX = startX + progress * distanceX;
        const currentY = startY + progress * distanceY;

        square.style.left = currentX + 'px';
        square.style.top = currentY + 'px';

        sendSquarePosition(square.id, currentX, currentY, username, squareName);

        currentStep++;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            square.style.left = targetX + 'px';
            square.style.top = targetY + 'px';

            sendSquarePosition(square.id, targetX, targetY, username, squareName);

            const unitIndex = units.findIndex(unit => unit.id === square.id);
            if (unitIndex !== -1) {
                units[unitIndex].x = targetX;
                units[unitIndex].y = targetY;
            }

            manualUpdateInProgress.delete(square.id);
        }
    }

    animate();
}

function sendSquarePosition(squareId, newX, newY, newHealthPoints, username, squareName) {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id'); 

    console.log("newX: " + newX);
    console.log("newY: " + newY);
    console.log("squareId: " + squareId);
    
    const data = {
        id: squareId,
        x: newX,
        y: newY,
        username: username,
        unitTemplateDto: {
            name: squareName
        },
        gameId: gameId
    };
    
    
    if (newHealthPoints !== null && newHealthPoints !== undefined) {
        data.healthPoints = newHealthPoints;
    }

    const token = getToken();
    fetch('https://strategygame-server-strategygame.azuremicroservices.io/units/send-movement', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send square position');
        }
        console.log('Square position sent successfully');
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}

var movementListenerAttached = false;

function startMovementListener() {
    if (!movementListenerAttached) {
        document.addEventListener('mousedown', movementFunction);
        movementListenerAttached = true;
    }
}

function stopMovementListener() {
    if (movementListenerAttached) {
        document.removeEventListener('mousedown', movementFunction);
        movementListenerAttached = false;
    }
}
function stopSquareAnimation(square) {
    if (square.animationFrame) {
        cancelAnimationFrame(square.animationFrame);
        square.animationFrame = null;
    }
}
async function movementFunction(event) {
    if (event.button === 2) {
        event.preventDefault();

        console.log("Movement function triggered");

        var clickX = event.clientX;
        var clickY = event.clientY;

        console.log(`Позиція натискання: X=${clickX}, Y=${clickY}`);

        moveSquaresTo(clickX, clickY);
    }
}
//ICONS MOVE AND ATTACK

function highlightIcon(iconId) {
    var icons = document.querySelectorAll('#icon-container img');
    icons.forEach(function(icon) {
        icon.classList.remove('highlighted');
    });

    document.getElementById(iconId).classList.add('highlighted');
}

function clearHighlightedIcons() {
    var icons = document.querySelectorAll('#icon-container img');
    icons.forEach(function(icon) {
        icon.classList.remove('highlighted');
    });
}

//WEB SOCKETS

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');
var stompClient;
const debouncedLoadUnits = debounce(loadUnits, 15);

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const token = getToken();
        initializeWebSocket(token);
    } catch (error) {
        console.error('Error:', error.message);
    }
});

function initializeWebSocket(token) {
    if (stompClient !== null) {
        disconnectWebSocket();
    }

    const socket = new SockJS('https://strategygame-server-strategygame.azuremicroservices.io/web-socket');
    stompClient = Stomp.over(socket);

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    stompClient.connect(headers, function(frame) {
        console.log("WebSocket connected");

        stompClient.subscribe('/topic/game/' + gameId, function(response) {
            const message = JSON.parse(response.body);
            if (message.type === 'unitDto') {
                updateUnitPosition(message);
            } else if (message.type === 'bulletDto') {
                handleBulletMessage(message);
            } else if (message.type === 'messages'){
                updateMessages();
            }
        });
    });
}
function disconnectWebSocket() {
    if (stompClient !== null && stompClient !== undefined && stompClient.connected) {
        stompClient.disconnect();
        console.log("WebSocket disconnected");
    }
}
function updateUnitPosition(updatedUnit) {
    const unitElement = document.getElementById(updatedUnit.id);
    if (unitElement) {
        unitElement.style.left = updatedUnit.x + 'px';
        unitElement.style.top = updatedUnit.y + 'px';

        const unitIndex = units.findIndex(unit => unit.id === updatedUnit.id);
        if (unitIndex !== -1) {
            units[unitIndex].x = updatedUnit.x;
            units[unitIndex].y = updatedUnit.y;
        } else {
            units.push(updatedUnit);
        }
        
        updateMiniMap(units);
    } else {
        console.log(updatedUnit);
        createSquareOnLoad(updatedUnit.id, updatedUnit.x, updatedUnit.y, 
            updatedUnit.unitTemplateDto.unitType.size, updatedUnit.unitTemplateDto.id, updatedUnit.userId
            , updatedUnit.unitTemplateDto.speed, updatedUnit.unitTemplateDto.range, updatedUnit.unitTemplateDto.reload
            , updatedUnit.unitTemplateDto.damage, updatedUnit.currentHealthPoints, updatedUnit.userName, updatedUnit.unitTemplateDto.name);
        units.push(updatedUnit);
        updateMiniMap(units);
    }
}


function updateMiniMap(units) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    var miniMap = document.getElementById('mini-map');
    miniMap.innerHTML = '';

    units.filter(unit => unit.alive).forEach(unit => {
        console.log('Unit data:', unit);
        var miniSquare = document.createElement('div');
        miniSquare.style.width = '10px';
        miniSquare.style.height = '10px';
        miniSquare.style.backgroundColor = unit.userId.toString() === userId ? 'blue' : 'red';
        miniSquare.style.position = 'absolute';
        miniSquare.style.left = (unit.x / 100) + 'px';
        miniSquare.style.top = (unit.y / 100) + 'px';
        miniMap.appendChild(miniSquare);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    var openModalButton = document.getElementById("openUnitModal");
    var unitModal = document.getElementById("unitModal");
    var closeModalButton = document.getElementById("unitModalClose");
    var existingUnitsTable = document.getElementById("existingUnitsTable").getElementsByTagName('tbody')[0];

    openModalButton.addEventListener("click", function() {
        unitModal.classList.add("active");
    });

    closeModalButton.addEventListener("click", function() {
        unitModal.classList.remove("active");
    });

    window.addEventListener("click", function(event) {
        if (event.target == unitModal) {
            unitModal.classList.remove("active");
        }
    });

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/unitTemplates', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(unit => {
            var row = existingUnitsTable.insertRow();
            row.innerHTML = `<td>${unit.name}</td>
                             <td>${unit.cost}</td>
                             <td>${unit.healthPoints}</td>
                             <td>${unit.reload ? unit.reload + " секунд" : '-'}</td>
                             <td>${unit.damage ? unit.damage : "-"}</td>
                             <td>${unit.speed}</td>
                             <td>${unit.range ? unit.range : '-'}</td>`;
            
            if (unit.name !== "Королева") {
                var createButtonCell = row.insertCell();
                createButtonCell.innerHTML = `<button class="create-unit-button" onclick="createSelectUnitAndSendRequest(${unit.id}, ${unit.cost})">Створити</button>`;
            }
        });
    })
    .catch(error => console.error('Помилка:', error));
});
async function createSelectUnitAndSendRequest(unitTemplateId, cost) {
    const gameId = getGameIdFromURL();
    const userId = getUserIdFromURL();

    let resourcesElement = document.getElementById('resourceValue');
    if (!resourcesElement) {
        console.error("Елемент з ідентифікатором 'resourceValue' не знайдено.");
        return null;
    }
    let resources = parseInt(resourcesElement.textContent);

    if (isNaN(resources) || resources < cost) {
        alert("Недостатньо ресурсів для створення юніта.");
        return null;
    }

    resources -= cost;
    resourcesElement.textContent = resources;
    await updatePlayerResources();

    const randomCoords = getRandomCoordinatesNearSquare(queenUnitId, 700);

    if (!randomCoords) {
        return;
    }

    const payload = {
        x: randomCoords.x,
        y: randomCoords.y,
        gameId: gameId,
        userId: userId,
        unitTemplateDto: {
            id: unitTemplateId
        }
    };

    try {
        const response = await fetch('https://strategygame-server-strategygame.azuremicroservices.io/units', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        sendBatchUpdate(units);
        window.location.reload();

    } catch (error) {
        console.error("Error creating unit:", error);
    }
}

function getRandomCoordinatesNearSquare(squareId, distance) {
    const square = document.getElementById(squareId);

    if (!square) {
        alert("Нажаль у вас немає королеви для створення нових юнітів!")
        return null;
    }

    const rect = square.getBoundingClientRect();
    
    const gridRect = document.getElementById('grid').getBoundingClientRect();

    const squareX = rect.left - gridRect.left;
    const squareY = rect.top - gridRect.top;

    console.log(`Square position: (${squareX}, ${squareY})`);

    const randomOffsetX = Math.floor(Math.random() * (2 * distance + 1)) - distance;
    const randomOffsetY = Math.floor(Math.random() * (2 * distance + 1)) - distance;

    let newX = squareX + randomOffsetX;
    let newY = squareY + randomOffsetY;

    if (newX < 0) {
        newX = 0;
    } else if (newX > gridRect.width - 50) {
        newX = gridRect.width - 50;
    }

    if (newY < 0) {
        newY = 0;
    } else if (newY > gridRect.height - 50) {
        newY = gridRect.height - 50;
    }

    console.log(`Generated random coordinates: (${newX}, ${newY})`);

    return { x: newX, y: newY };
}
document.addEventListener('DOMContentLoaded', function() {
    const goToQueenButton = document.getElementById('goToQueenButton');
    goToQueenButton.addEventListener('click', function() {
        if (queenUnitId) {
            const queenSquare = document.getElementById(queenUnitId);
            if (queenSquare) {
                const grid = document.getElementById('grid');
                const gridRect = grid.getBoundingClientRect();
                const squareRect = queenSquare.getBoundingClientRect();
                const offsetX = squareRect.left - gridRect.left;
                const offsetY = squareRect.top - gridRect.top;
                window.scrollTo(offsetX - 1500, offsetY - 500);
            } else {
                console.error('Queen square not found.');
            }
        } else {
            alert("Нажаль у вас немає королеви!")
        }
    });
});

async function sendBatchUpdate(userUnits) {
    const token = getToken();

    try {
        const response = await fetch('https://strategygame-server-strategygame.azuremicroservices.io/units/batch/send-movement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userUnits)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        console.log('Batch update sent successfully');
        loadUnits();
    } catch (error) {
        console.error('Error sending batch update:', error);
    }
}

window.addEventListener('beforeunload', function(event) {
    sendBatchUpdate(units);
});

function startBatchUpdateTimer() {
    if (units) {
        setInterval(async () => {
            try {
                await updatePlayerResources()
                await sendBatchUpdate(units);
            } catch (error) {
                console.error('Error in batch update timer:', error);
            }
        }, 15000);
    } else {
        console.error('Units is not defined');
    }
}

async function getPlayerResourcesFromServer(gameId, userId) {
    try {
        const response = await fetch(`https://strategygame-server-strategygame.azuremicroservices.io/playerResources?gameId=${gameId}&userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch player resources');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching player resources:', error);
        return null;
    }
}

let resourceId = null;

async function updateResourcesCount() {
    const resourceValueElement = document.getElementById('resourceValue');
    const gameId = getGameIdFromURL();
    const userId = getUserIdFromURL();

    let resources = await getPlayerResourcesFromServer(gameId, userId);
    if (resources !== null) {
        resourceId = resources.id; 
        resourceValueElement.textContent = resources.resources;
        setInterval(async () => {
            resources.resources++;
            resourceValueElement.textContent = resources.resources;
        }, 1000);
    } else {
        resourceValueElement.textContent = 'N/A';
    }
}

updateResourcesCount();

async function updatePlayerResources() {
    const resourceValueElement = document.getElementById('resourceValue');

    const playerResourcesDto = {
        id: resourceId,
        resources: parseInt(resourceValueElement.textContent)
    };

    const response = await fetch('https://strategygame-server-strategygame.azuremicroservices.io/playerResources/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(playerResourcesDto)
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
}

// ATACK

function attackFunction() {
    document.addEventListener('mousedown', initiateAttack);
    document.removeEventListener('mousedown', movementFunction);
}

function initiateAttack(event) {
    if (event.button === 2) {
        event.preventDefault();

        var grid = document.getElementById('grid');
        var gridRect = grid.getBoundingClientRect();

        var clickX = event.clientX - gridRect.left;
        var clickY = event.clientY - gridRect.top;

        attackFromSelectedUnits(clickX, clickY);
    }
}

function attackFromSelectedUnits(targetX, targetY) {
    squaresCollection.forEach(unit => {
        if (!unit.unitTemplateDto || !unit.unitTemplateDto.range || !unit.unitTemplateDto.reload) {
            console.warn("Одиниця не має необхідних властивостей:", unit);
            return;
        }
        
        var unitRect = unit.getBoundingClientRect();
        var startX = unitRect.left + unitRect.width / 2;
        var startY = unitRect.top + unitRect.height / 2;

        var grid = document.getElementById('grid');
        var gridRect = grid.getBoundingClientRect();

        startX -= gridRect.left;
        startY -= gridRect.top;

        var deltaX = targetX - startX;
        var deltaY = targetY - startY;
        var angle = Math.atan2(deltaY, deltaX);
        var endX = startX + unit.unitTemplateDto.range * Math.cos(angle);
        var endY = startY + unit.unitTemplateDto.range * Math.sin(angle);

        var reloadInMillis = unit.unitTemplateDto.reload * 1000;
        if (!unit.lastAttack || (Date.now() - unit.lastAttack) >= reloadInMillis) {
            unit.lastAttack = Date.now();
            createAndAnimateBullet(startX, startY, endX, endY, unit.unitTemplateDto.damage, unit.userId);
        }
    });
}

function createAndAnimateBullet(startX, startY, targetX, targetY, damage, userId) {
    var bullet = document.createElement('div');
    bullet.className = 'bullet';
    var bulletId = Math.floor(Math.random() * 1000000);
    bullet.id = bulletId;
    bullet.userId = userId;
    bullet.damage = damage;

    bullet.style.zIndex = '9999';
    bullet.style.left = startX + 'px';
    bullet.style.top = startY + 'px';

    var grid = document.getElementById('grid');
    grid.appendChild(bullet);

    setTimeout(() => {
        bullet.style.display = 'block';
        animateBullet(bullet, startX, startY, targetX, targetY, damage, bulletId);
    }, 0);
}

function animateBullet(bullet, startX, startY, targetX, targetY, damage, bulletId) {
    var duration = 1000;
    var startTime = null;
    var stepInterval = 9;

    function animationStep(timestamp) {
        
        if (!startTime) startTime = timestamp;
        var progress = timestamp - startTime;
        var fraction = progress / duration;

        if (fraction < 1) {
            var currentX = startX + (targetX - startX) * fraction;
            var currentY = startY + (targetY - startY) * fraction;
            bullet.style.left = currentX + 'px';
            bullet.style.top = currentY + 'px';
            setTimeout(() => {
                requestAnimationFrame(animationStep);
                checkBulletCollision(bullet, targetX, targetY, damage, bullet.userId);
                sendBulletStep(bulletId, currentX, currentY, damage);
            }, stepInterval);
        } else {
            bullet.style.left = targetX + 'px';
            bullet.style.top = targetY + 'px';
            setTimeout(() => bullet.remove(), 500);
            checkBulletCollision(bullet, targetX, targetY, damage, bullet.userId); 
            sendBulletStep(bulletId, targetX, targetY, damage);
        }
    }

    requestAnimationFrame(animationStep);
}

function checkBulletCollision(bullet, bulletX, bulletY, damage, bulletUserId) {
    const allDivs = document.querySelectorAll('div');

    allDivs.forEach(div => {
        if (div.classList.contains('gameSquare')) {
            const unitX = parseInt(div.style.left, 10);
            const unitY = parseInt(div.style.top, 10);
            const size = parseInt(div.style.width, 10);

            if (bulletX > unitX && bulletX < unitX + size &&
                bulletY > unitY && bulletY < unitY + size) {

                    if (parseInt(bulletUserId) !== parseInt(div.dataset.userId)) {
                        const unitTemplateDto = div.unitTemplateDto;
                        if (unitTemplateDto) {
                            const unitId = div.id;
                            const unitToUpdate = units.find(unit => unit.id === parseInt(unitId));
                            if (unitToUpdate) {
                                unitToUpdate.currentHealthPoints -= damage;
                                window.location.reload();
                                if (unitToUpdate.currentHealthPoints <= 0) {
                                    sendBatchUpdate(units);
                                    window.location.reload();
                                }
                            } else {
                                console.error("Одиниця з id не знайдена в колекції units:", unitId);
                            }
                            bullet.style.display = 'none';
                        } else {
                            console.error("Одиниця не має unitTemplateDto:", div);
                        }
                    }
                    
            }
        }
    });
}

function sendBulletStep(id, x, y, damage) {
    var gameId = getGameIdFromURL();
    var userId = getUserIdFromURL();
    var bulletDto = {
        id: id,
        x: x,
        y: y,
        gameId: gameId,
        userId: userId,
        damage: damage
    };

    fetch('https://strategygame-server-strategygame.azuremicroservices.io/bullets/game/bullet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(bulletDto)
    })
    .then(response => {
        if (!response.ok) {
            console.error('Не вдалося надіслати крок кулі на сервер.');
        }
    })
    .catch(error => {
        console.error('Помилка під час відправки кроку кулі:', error);
    });
}

function handleBulletMessage(bulletDto) {
    var bulletId = bulletDto.id;
    var x = bulletDto.x;
    var y = bulletDto.y;
    var userId = bulletDto.userId;
    var damage = bulletDto.damage;

    var existingBullet = document.getElementById(bulletId);

    if (!existingBullet) {
        existingBullet = document.createElement('div');
        existingBullet.id = bulletId;
        existingBullet.className = 'bullet';
        existingBullet.style.left = x + 'px';
        existingBullet.style.top = y + 'px';
        existingBullet.userId = userId;
        existingBullet.damage = damage;

        var grid = document.getElementById('grid');
        grid.appendChild(existingBullet);
    } else {
        existingBullet.style.left = x + 'px';
        existingBullet.style.top = y + 'px';
        existingBullet.userId = userId;
        existingBullet.damage = damage;
    }

    var bulletStyle = window.getComputedStyle(existingBullet);
    if (bulletStyle.getPropertyValue('display') !== 'none') {
        checkBulletCollision(existingBullet, x, y, damage, userId);
    }
}


'use strict';

let loginSection = document.getElementById('login-section');
let chatSection = document.getElementById('chat-section');
let loginForm = document.getElementById('loginForm');
let messageForm = document.getElementById('messageForm');
let chatMessages = document.getElementById('chat-messages');
let statusElement = document.querySelector('.status');

let usernameInput = document.getElementById('username');
let chatMessageInput = document.getElementById('chatMessage');
let logoutButton = document.getElementById('logout');

let stompClient = null;
let username = null;

const avatarColors = ['#e74c3c', '#8e44ad', '#3498db', '#16a085', '#f39c12', '#d35400', '#2c3e50'];

/**
 * Подключение к чату при отправке формы логина.
 */
function connectToChat(event) {
    event.preventDefault();
    username = usernameInput.value.trim();

    if (username) {
        // Скрываем форму авторизации и показываем чат
        loginSection.style.display = 'none';
        chatSection.classList.remove('hidden');

        // Инициализация WebSocket
        let socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }
}

/**
 * Действия при успешном подключении.
 */
function onConnected() {
    // Подписываемся на публичный топик
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Сообщаем серверу о новом участнике
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({ sender: username, type: 'JOIN' })
    );

    statusElement.style.display = 'none';
}

/**
 * Обработка ошибки подключения.
 */
function onError(error) {
    statusElement.textContent = 'Connection error. Please refresh the page.';
    statusElement.style.backgroundColor = '#e74c3c';
}

/**
 * Отправка сообщения в чат.
 */
function sendChatMessage(event) {
    event.preventDefault();
    let messageContent = chatMessageInput.value.trim();

    if (messageContent && stompClient) {
        let chatMsg = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMsg));
        chatMessageInput.value = '';
    }
}

/**
 * Обработка полученного сообщения.
 */
function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    let li = document.createElement('li');

    if (message.type === 'JOIN') {
        li.textContent = `${message.sender} has joined the chat.`;
        li.style.textAlign = 'center';
        li.style.fontStyle = 'italic';
    } else if (message.type === 'LEAVE') {
        li.textContent = `${message.sender} has left the chat.`;
        li.style.textAlign = 'center';
        li.style.fontStyle = 'italic';
    } else {
        // Создаем аватар
        let avatar = document.createElement('span');
        avatar.textContent = message.sender.charAt(0).toUpperCase();
        avatar.style.backgroundColor = getAvatarColor(message.sender);
        avatar.style.color = '#fff';
        avatar.style.display = 'inline-block';
        avatar.style.width = '30px';
        avatar.style.height = '30px';
        avatar.style.borderRadius = '50%';
        avatar.style.textAlign = 'center';
        avatar.style.lineHeight = '30px';
        avatar.style.marginRight = '10px';
        li.appendChild(avatar);

        // Текст сообщения
        let text = document.createElement('span');
        text.innerHTML = `<strong>${message.sender}:</strong> ${message.content}`;
        li.appendChild(text);
    }

    chatMessages.appendChild(li);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Функция для получения цвета аватара на основе имени отправителя.
 */
function getAvatarColor(sender) {
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
        hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }
    let index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
}

// Обработчики событий
loginForm.addEventListener('submit', connectToChat);
messageForm.addEventListener('submit', sendChatMessage);

if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        // Для простоты перезагружаем страницу при logout
        location.reload();
    });
}

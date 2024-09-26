let chatId;
let joinSection;
let waitingSection;
let connectingSection;
let chatSection;
let chatHistory;
let messageInput;

let waitingText;
let waiting = false;
const waitingInterval = 30;
let waitingSeconds;

let connectingText;
let connecting = false;

function showJoinSection() {
    joinSection.hidden = false;
    waitingSection.hidden = true;
    connectingSection.hidden = true;
    chatSection.hidden = true;
}

function showWaitingSection() {
    joinSection.hidden = true;
    waitingSection.hidden = false;
    connectingSection.hidden = true;
    chatSection.hidden = true;
}

function showConnectingSection() {
    joinSection.hidden = true;
    waitingSection.hidden = true;
    connectingSection.hidden = false;
    chatSection.hidden = true;
}

function showChatSection() {
    joinSection.hidden = true;
    waitingSection.hidden = true;
    connectingSection.hidden = true;
    chatSection.hidden = false;
}

function createChatClick() {
    showWaitingSection();
    waiting = true;
    waitingSeconds = waitingInterval;
    waitingUpdate();
}

function joinChatClick() {
    showConnectingSection();
    connecting = true;
    connectingUpdate();
}

function refreshClick() {
}

function sendMessageClick() {
    if (!messageInput.value) {
        return;
    }

    let messageDiv = document.createElement("div");
    messageDiv.className = "message me";
    messageDiv.innerText = messageInput.value;

    chatHistory.prepend(messageDiv);
    chatHistory.scrollTop = 0;
    messageInput.value = "";
}

function messageKeyDown(e) {
    if (e.key === "Enter") {
        sendMessageClick();
    }
}

function waitingUpdate() {
    if (!waiting) {
        return;
    }

    // TODO
    setTimeout(waitingUpdate, 1000);
}

function connectingUpdate() {
    if (!connecting) {
        return;
    }

    connectingText.innerText += ".";
    setTimeout(connectingUpdate, 1000);
}

function main() {
    chatId = new URLSearchParams(window.location.search).get("chatId");
    joinSection = document.getElementById("join-section");
    waitingSection = document.getElementById("waiting-section");
    connectingSection = document.getElementById("connecting-section");
    chatSection = document.getElementById("chat-section");
    chatHistory = document.getElementById("chat-history");
    messageInput = document.getElementById("message-input");

    waitingText = document.getElementById("waiting-text");
    connectingText = document.getElementById("connecting-text");

    window.history.pushState("", "", "/");

    if (chatId) {
        showConnectingSection();
    } else {
        showJoinSection()
    }
}

main();

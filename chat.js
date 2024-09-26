let chatId;
let joinLink;

let joinSection;
let waitingSection;
let joinLinkText;
let refreshButton;
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
    waiting = true;
    waitingSeconds = waitingInterval;
    waitingUpdate();

    joinSection.hidden = true;
    waitingSection.hidden = false;
    connectingSection.hidden = true;
    chatSection.hidden = true;
}

function showConnectingSection() {
    connecting = true;
    connectingUpdate();

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
    joinLink = window.location.href + "?chatId=" + chatId;
    joinLinkText.value = joinLink;

    showWaitingSection();
}

function joinChatClick() {
    showConnectingSection();
}

function refreshClick() {
    waiting = false;
    refresh();
}

function copyClick() {
    navigator.clipboard.writeText(joinLink);
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

    waitingText.innerText = "Refreshing in " + --waitingSeconds + " seconds.";

    if (waitingSeconds === 0) {
        refresh();
        return;
    }

    setTimeout(waitingUpdate, 1000);
}

function connectingUpdate() {
    if (!connecting) {
        return;
    }

    connectingText.innerText += ".";
    setTimeout(connectingUpdate, 1000);
}

function refresh() {
    refreshButton.disabled = true;

    setTimeout(refreshFailed, 3000);
}

function refreshSucceed() {
    showChatSection();
}

function refreshFailed() {
    refreshButton.disabled = false;
    waiting = true;
    waitingSeconds = waitingInterval;
    waitingUpdate();
}

function main() {
    chatId = new URLSearchParams(window.location.search).get("chatId");
    joinSection = document.getElementById("join-section");
    waitingSection = document.getElementById("waiting-section");
    joinLinkText = document.getElementById("join-link");
    refreshButton = document.getElementById("refresh-button");
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

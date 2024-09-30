let chatId;
let joinLink;

let joinSection;
let joinInput;
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
    showConnectingSection();

    rtcGetOffer()
        .then(o => signalingPostOffer(o))
        .then(c => postOfferDone(c));
}

function postOfferDone(c) {
    connecting = false;
    chatId = c;
    joinLink = window.location.href + "?chatId=" + chatId;
    joinLinkText.value = joinLink;

    showWaitingSection();
}

function joinChatClick() {
    showConnectingSection();

    const linkPrefix = window.location.href + "?chatId=";
    let joinInputValue = joinInput.value;

    if (joinInputValue.startsWith(linkPrefix)) {
        chatId = joinInputValue.substr(linkPrefix.length);
    } else {
        chatId = joinInputValue;
    }

    joinChat();
}

function joinChat() {
    signalingGetOffer(chatId)
        .then(o => rtcGetAnswer(o))
        .then(a => signalingPutAnswer(chatId, a));
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

    rtcSendMessage(messageInput.value);
    addMessageBubbleMe(messageInput.value);
}

function addMessageBubble(msg, className) {
    let messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.innerText = msg;

    chatHistory.prepend(messageDiv);
}

function addMessageBubbleMe(msg) {
    addMessageBubble(msg, "message me");
    chatHistory.scrollTop = 0;
    messageInput.value = "";
}

function addMessageBubbleOther(msg) {
    addMessageBubble(msg, "message other");
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
        waiting = false;
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
    showConnectingSection();
    refreshButton.disabled = true;

    signalingGetAnswer(chatId)
        .then(a => getAnswerDone(a));
}

function getAnswerDone(a) {
    if (a) {
        refreshSucceed(a);
    }
    refreshFailed();
}

function refreshSucceed(a) {
    rtcSetAnswer(a);
}

function refreshFailed() {
    connecting = false;
    refreshButton.disabled = false;
    showWaitingSection();
}

function onMessageReceived(msg) {
    addMessageBubbleOther(msg);
}

function onChatReady() {
    connecting = false;
    showChatSection();
}

function main() {
    chatId = new URLSearchParams(window.location.search).get("chatId");
    joinSection = document.getElementById("join-section");
    joinInput = document.getElementById("join-input");
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

    rtcSetOnDataChannelReady(onChatReady);
    rtcSetOnDataMessageReceived(onMessageReceived);

    if (chatId) {
        showConnectingSection();
        joinChat();
    } else {
        showJoinSection()
    }
}

main();

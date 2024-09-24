// A and B

function onIceCandidate(e) {
    const candidate = e.candidate;
    if (candidate) {
        console.log('onIceCandidate: ' + JSON.stringify(candidate));
        candidates.push(candidate);
        return;
    }

    iceDoneResolver();
}

function onMessage(e) {
    console.log('onMessage: ' + e.data);
    message = JSON.parse(e.data);
}

function onDataChannelOpen() {
    console.log("onDataChannelOpen");
}

function onDataChannelMessage(e) {
    console.log("onDataChannelMessage: " + e.data);
}

function sendMessage(message) {
    dataChannel.send(message);
}

let candidates = [];
let remoteCandidates;
let dataChannel;
let offer;
let answer;
let message;
let {'promise': iceDonePromise, 'resolve': iceDoneResolver} = Promise.withResolvers();

let pc = new RTCPeerConnection();
pc.onicecandidate = onIceCandidate;

let broadcastChannel = new BroadcastChannel('broadcastChannel');
broadcastChannel.onmessage = onMessage;

// B
dataChannel = pc.createDataChannel('dataChannel');
dataChannel.onopen = onDataChannelOpen;
dataChannel.onmessage = onDataChannelMessage;

offer = await pc.createOffer();

// This line calls onIceCandidate twice
await pc.setLocalDescription(offer);

iceDonePromise.then(() => broadcastChannel.postMessage(JSON.stringify({offer, candidates})));

// A
function onDataChannel(e) {
    console.log("onDataChannel: " + JSON.stringify(e));

    dataChannel = e.channel;
    dataChannel.onopen = onDataChannelOpen;
    dataChannel.onmessage = onDataChannelMessage;
}

pc.ondatachannel = onDataChannel;

offer = message.offer;
remoteCandidates = message.candidates;

await pc.setRemoteDescription(offer);

answer = await pc.createAnswer();

// This line calls onIceCandidate twice
await pc.setLocalDescription(answer);

iceDonePromise.then(() => broadcastChannel.postMessage(JSON.stringify({answer, candidates})));

// B
answer = message.answer;
remoteCandidates = message.candidates;

await pc.setRemoteDescription(answer);

// A or B
remoteCandidates.forEach(c => pc.addIceCandidate(c));
sendMessage('Hello!')

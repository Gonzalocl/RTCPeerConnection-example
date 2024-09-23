let pc;
let answer;
let candidates = [];
let dataChannel;
let broadcastChannel = new BroadcastChannel('broadcastChannel');

// 3
broadcastChannel.onmessage = e => {
    console.log('MESSAGE: ' + e.data);

    let message = JSON.parse(e.data);

    peer(message.offer, message.candidates);
}

// 4
async function peer(offer, remoteCandidates) {
    pc = new RTCPeerConnection();
    pc.onicecandidate = onIceCandidate;

    pc.ondatachannel = onDataChannel;

    await pc.setRemoteDescription(offer);

    answer = await pc.createAnswer();

    // This line calls onIceCandidate twice
    await pc.setLocalDescription(answer);

    // Only necessary on one side
    remoteCandidates.forEach(c => pc.addIceCandidate(c));

    console.log('ANSWER: ' + JSON.stringify(answer));
}

// 5
function onIceCandidate(e) {
    const candidate = e.candidate;

    console.log('ICE: ' + candidate);

    if (candidate) {
        candidates.push(candidate);
        return;
    }

    let message = JSON.stringify({'answer': answer, 'candidates': candidates});

    broadcastChannel.postMessage(message);
}

function onDataChannel(e) {
    console.log("onDataChannel: " + e);

    dataChannel = e.channel;
    dataChannel.onopen = onDataChannelOpen;
    dataChannel.onmessage = onDataChannelMessage;
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

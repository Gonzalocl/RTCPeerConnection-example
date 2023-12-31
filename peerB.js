let pc;
let offer;
let candidates = [];
let dataChannel;
let broadcastChannel = new BroadcastChannel('broadcastChannel');

async function peer() {
    pc = new RTCPeerConnection();
    pc.onicecandidate = onIceCandidate;

    dataChannel = pc.createDataChannel('dataChannel');
    dataChannel.onopen = onDataChannelOpen;
    dataChannel.onmessage = onDataChannelMessage;

    offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    console.log('OFFER: ' + JSON.stringify(offer));
}

function onIceCandidate(e) {
    const candidate = e.candidate;

    console.log('ICE: ' + candidate);

    if (candidate) {
        candidates.push(candidate);
        return;
    }

    let message = JSON.stringify({'offer': offer, 'candidates': candidates});

    broadcastChannel.postMessage(message);
}

broadcastChannel.onmessage = async e => {
    console.log('MESSAGE: ' + e.data);

    let message = JSON.parse(e.data);

    await pc.setRemoteDescription(message.answer);

    message.candidates.forEach(c => pc.addIceCandidate(c));
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

peer()


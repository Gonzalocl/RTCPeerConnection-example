let pc;
let offer;
let candidates = [];
let broadcastChannel = new BroadcastChannel('broadcastChannel');

async function peer() {
    pc = new RTCPeerConnection();
    pc.onicecandidate = onIceCandidate;
    let channel = pc.createDataChannel('dataChannel');
    channel.onopen = onDataChannelOpen;

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

function onDataChannelOpen(e) {
    console.log("onDataChannelOpen: " + e);
}

peer()



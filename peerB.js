function onIceCandidate(e) {
    const candidate = e.candidate;
    console.log('ICE: ' + candidate);
}

function onDataChannelOpen(e) {
    console.log("onDataChannelOpen: " + e);
}

let pc;
let broadcastChannel = new BroadcastChannel('broadcastChannel');
broadcastChannel.onmessage = e => {
    console.log('MESSAGE: ' + e.data);
    pc.setRemoteDescription(JSON.parse(e.data));
}

async function peer() {
    pc = new RTCPeerConnection();
    pc.onicecandidate = onIceCandidate;
    let channel = pc.createDataChannel('dataChannel');
    channel.onopen = onDataChannelOpen;

    let offer = await pc.createOffer();

    pc.setLocalDescription(offer);

    broadcastChannel.postMessage(JSON.stringify(offer));

    console.log('OFFER: ' + JSON.stringify(offer));
}

peer()


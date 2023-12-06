function onIceCandidate(e) {
    const candidate = e.candidate;
    console.log('ICE: ' + candidate);
}

function onDataChannel(e) {
    console.log("onDataChannel: " + e);
}

let pc;
let broadcastChannel = new BroadcastChannel('broadcastChannel');
broadcastChannel.onmessage = e => {
    console.log('MESSAGE: ' + e.data);
    peer(JSON.parse(e.data));
}

async function peer(offer) {
    pc = new RTCPeerConnection();
    pc.onicecandidate = onIceCandidate;
    pc.ondatachannel = onDataChannel;

    pc.setRemoteDescription(offer);

    let answer = await pc.createAnswer();

    pc.setLocalDescription(answer);

    broadcastChannel.postMessage(JSON.stringify(answer));

    console.log('ANSWER: ' + JSON.stringify(answer));
}


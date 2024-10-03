// step 0 on peers A and B
function onIceCandidate(e) {
    const candidate = e.candidate;
    if (candidate) {
        console.log('onIceCandidate: ' + JSON.stringify(candidate));
        candidates.push(candidate);
        return;
    }

    iceDoneResolver(JSON.stringify({offer, answer, candidates}));
}

function onDataChannelOpen() {
    console.log("onDataChannelOpen");
    onDataChannelReady();
}

function onDataChannelMessage(e) {
    console.log("onDataChannelMessage: " + e.data);
    onDataMessageReceived(e.data);
}

function rtcSendMessage(message) {
    dataChannel.send(message);
}

function rtcSetOnDataMessageReceived(f) {
    onDataMessageReceived = f;
}

function rtcSetOnDataChannelReady(f) {
    onDataChannelReady = f;
}

let candidates = [];
let remoteCandidates;
let dataChannel;
let offer;
let answer;
let {'promise': iceDonePromise, 'resolve': iceDoneResolver} = Promise.withResolvers();
let onDataChannelReady;
let onDataMessageReceived;

let pc = new RTCPeerConnection({iceServers: [{urls: ["stun:stun.l.google.com:19302"]}], iceTransportPolicy: "all"});
pc.onicecandidate = onIceCandidate;

// step 1 on peer A
async function rtcGetOffer() {
    dataChannel = pc.createDataChannel("dataChannel");
    dataChannel.onopen = onDataChannelOpen;
    dataChannel.onmessage = onDataChannelMessage;

    offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return iceDonePromise;
}

// step 2 on peer B
async function rtcGetAnswer(o) {
    function onDataChannel(e) {
        console.log("onDataChannel: " + JSON.stringify(e));

        dataChannel = e.channel;
        dataChannel.onopen = onDataChannelOpen;
        dataChannel.onmessage = onDataChannelMessage;
    }

    pc.ondatachannel = onDataChannel;

    o = JSON.parse(o);
    offer = o.offer;
    remoteCandidates = o.candidates;

    await pc.setRemoteDescription(offer);
    remoteCandidates.forEach(c => pc.addIceCandidate(c));

    answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return iceDonePromise;
}

// step 3 on peer A
async function rtcSetAnswer(a) {
    a = JSON.parse(a);
    answer = a.answer;
    remoteCandidates = a.candidates;

    await pc.setRemoteDescription(answer);
    remoteCandidates.forEach(c => pc.addIceCandidate(c));
}

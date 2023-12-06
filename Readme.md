# RTCPeerConnection-example

This example opens a bidirectional `RTCDataChannel` connection between two tabs
of the same browser without the need for a signalign server.

Copy peerA.js contents into a new tab's JavaScript console and peerB.js contents
into another tab's JavaScript console. Write `sendMessage('Hello!')` in one
console and see the message being received in the other console.

<https://webrtc.org/>

<https://webrtc.github.io/samples/>

<https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols>

<https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection>

# TODO
 - Handle errors (Omitted to make the code clearer).
 - Close connections (Omitted to make the code clearer).
 - Signaling server (This version uses `BroadcastChannel` to make it simpler).


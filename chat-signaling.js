const signalingServerUrl = "https://gonzalocl1024.pythonanywhere.com/chat-signaling";

async function signalingPostOffer(o) {
    const response = await fetch(signalingServerUrl + "/offer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({"offer": o})
    });

    const response_body = await response.json();
    return response_body.chat_id;
}

async function signalingGetOffer(c) {
    const response = await fetch(signalingServerUrl + "/" + c + "/offer", {
        headers: {
            "Accept": "application/json"
        }
    });

    const response_body = await response.json();
    return response_body.offer;
}

async function signalingPutAnswer(c, a) {
    await fetch(signalingServerUrl + "/" + c + "/answer", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({"answer": a})
    });
}

async function signalingGetAnswer(c) {
    const response = await fetch(signalingServerUrl + "/" + c + "/answer", {
        headers: {
            "Accept": "application/json"
        }
    });

    const response_body = await response.json();
    return response_body.answer;
}

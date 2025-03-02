console.log("YouTube Caption to Sign Language Extension Loaded!");

// Sign language video mapping
const captionToVideoMap = {
    "do": "do.mp4",
    "dream": "dream.mp4",
    "that": "that.mp4",
    "you": "you.mp4",
    "your": "your.mp4",
    "not": "not.mp4",
    "care": "care.mp4",
    "i": "i.mp4",
    "disappointing": "disappointing.mp4",
    "hold": "hold.mp4",
    "is": "is.mp4",
    "music": "music.mp4",
    "mind": "mind.mp4",
    "know": "know.mp4",
    "working": "working.mp4",
    "[music]": "music.mp4"
};

let captionBuffer = []; // Stores recent captions

// Function to extract and process captions
function extractCaptions() {
    const captionElements = document.querySelectorAll(".ytp-caption-segment");

    if (captionElements.length === 0) {
        console.warn("No captions found!");
        return;
    }

    let newCaptions = [];

    captionElements.forEach(el => {
        let text = el.innerText.toLowerCase().trim();
        if (text && !captionBuffer.includes(text)) {
            newCaptions.push(text);
        }
    });

    if (newCaptions.length > 0) {
        captionBuffer.push(...newCaptions);

        // Keep only the last 5 captions to form meaningful phrases
        if (captionBuffer.length > 5) {
            captionBuffer.shift();
        }

        const extractedText = captionBuffer.join(" ");
        console.log("Extracted Captions:", extractedText); // ✅ Debug log

        const videoFile = getSignLanguageVideo(extractedText);
        if (videoFile) {
            showPopupWithVideo(videoFile);
            captionBuffer = []; // Clear buffer after playing video to avoid replaying
        }
    }
}

// Function to match captions with sign language videos
function getSignLanguageVideo(extractedText) {
    let bestMatch = null;

    // Prioritize longer phrases first
    let sortedPhrases = Object.keys(captionToVideoMap).sort((a, b) => b.length - a.length);

    for (let phrase of sortedPhrases) {
        if (extractedText.includes(phrase)) {
            bestMatch = captionToVideoMap[phrase];
            break; // Stop after finding the longest match
        }
    }

    return bestMatch;
}

// Function to show a pop-up with the sign language video
function showPopupWithVideo(videoFile) {
    const videoUrl = chrome.runtime.getURL(`video/${videoFile}`);
    let popup = document.getElementById("popup-video-container");

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "popup-video-container";
        popup.style = `
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 400px; height: 250px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid white; border-radius: 10px;
            padding: 10px; display: flex;
            flex-direction: column; align-items: center;
            justify-content: center; z-index: 10000;
        `;

        const videoElement = document.createElement("video");
        videoElement.id = "popup-video";
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.loop = false;
        videoElement.muted = false;
        videoElement.style.width = "100%";
        videoElement.style.height = "80%";
        popup.appendChild(videoElement);

        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.style = `
            margin-top: 10px; padding: 5px 10px;
            background: red; color: white; border: none;
            cursor: pointer; border-radius: 5px;
        `;
        closeButton.addEventListener("click", () => {
            popup.style.display = "none";
        });

        popup.appendChild(closeButton);
        document.body.appendChild(popup);
    }

    const videoElement = document.getElementById("popup-video");
    if (videoElement.src !== videoUrl) {
        videoElement.src = videoUrl;
        videoElement.play().catch(e => console.error("Playback error:", e));
        popup.style.display = "flex";
    }
}

// **Real-time caption detection using MutationObserver**
const observer = new MutationObserver(() => {
    console.log("Mutation detected, extracting captions..."); // ✅ Debug log
    extractCaptions();
});

// Start observing captions when video plays
function startObserving() {
    const captionContainer = document.querySelector(".ytp-caption-window-container");

    if (captionContainer) {
        observer.observe(captionContainer, { childList: true, subtree: true });
        console.log("Observing captions..."); // ✅ Debug log
    } else {
        console.warn("Caption container not found! Retrying...");
        setTimeout(startObserving, 3000);
    }
}

// Force caption check every second in case MutationObserver misses changes
setInterval(() => {
    console.log("Checking for captions manually...");
    extractCaptions();
}, 1000);

// Run observer when the video starts
setTimeout(startObserving, 5000);












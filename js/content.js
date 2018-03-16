const video = document.querySelector("video");
const currentHref = window.location.href;
let tempVideoId = currentHref.substring(currentHref.lastIndexOf('/') + 1).split('.')[0];
const videoId = tempVideoId.includes("=") ? tempVideoId.split('=')[1] : tempVideoId;


// Disable default actions of space and arrow keys unless the search box is active
// (otherwise they interfere with keyboard shortcuts)
window.addEventListener("keydown", function(e) {
    let targetElement = e.target.tagName.toLocaleLowerCase();
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1 && targetElement !== "input" && targetElement !== "textarea") {
        e.preventDefault();
    }
});

// Keyboard - keypress general listener, calls
document.addEventListener('keyup', doc_keyUp, false);

// Video events
video.addEventListener('dblclick', videoToggleFullscreen);
if (currentHref.includes("h5p.org/h5p/embed")) {
    video.addEventListener('click', videoPlayPause);
}

// VIDEO FUNCTIONS
function videoSetPartialTime(keycode) {
    let numkeyPressed = keycode-48;  // 48: keycode for key '1' is 49, '2' is 50 etc =>
    // to get the number key pressed, we need to substract 48 from 'value'
    video.currentTime = video.duration*numkeyPressed/10;
}

function videoIncrementCurrentTime(value) {
    video.currentTime += value;
}

function videoPlayPause() {
    video.paused ? video.play() : video.pause();
}

function videoIncrementPlaybackRate(value) {
    let new_playbackRate = video.playbackRate + value;
    if (new_playbackRate > 6) {
        video.playbackRate = 6;
    } else if (new_playbackRate <= 0) {
        video.playbackRate = 0.25;
    } else {
        video.playbackRate = new_playbackRate;
    }
}

function videoIncrementVolume(value) {
    // using just video.volume += value would raise exception when .volume value would be >1 or <0.
    let new_volume = video.volume + value;
    if (new_volume > 1) {
        video.volume = 1;  
    } else if (new_volume < 0) {
        video.volume = 0;
    } else {
        video.volume = new_volume;
    }
}

function videoSaveTimestamp() {
    // Store {videoId: current_time}, i.e. {12623: 123.3512312}
    chrome.storage.local.set({[videoId]:video.currentTime}/*, function(){ console.log("Timestamp saved"); }*/);
    // document.getElementById("btn-ts-load").disabled = false;
}

function videoLoadTimestamp() {
    chrome.storage.local.get(videoId, function (result) {
        if(result[videoId] !== undefined) {
            video.currentTime = result[videoId];
        }
    });    
}

function videoToggleMute() {
    video.muted = !video.muted;
}

function videoToggleFullscreen() {
    // Uses Fullscreen API, see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
    if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
    } else {
            video.webkitRequestFullscreen();
    }
}

function videoToggletheaterMode() {
    // Adds or removes class="theater"; see '.theater' css-rules in /css/general.css
    console.log(currentHref);
    if (currentHref.includes("www.uttv.ee/naita?id=")) {
        document.getElementsByClassName('span4')[0].classList.toggle('theater');
        document.getElementsByClassName('span8')[0].classList.toggle('theater');
        document.getElementsByClassName('span12')[0].classList.toggle('theater');
        video.classList.toggle('theater');
    } else if (currentHref.includes("h5p.org")) {
        video.classList.toggle('theater');
    }
}

function downloadVideo() {
    if (video !== null) downloadFile(video.src);
}

function embedVideo() {
    if (video !== null) {
        if (currentHref.includes("h5p.org/h5p/embed") || currentHref.includes("www.uttv.ee/embed")) {
            video.pause();
            window.open(currentHref, "_blank");
        } else if (currentHref.includes("uttv.ee")) {
            let uttvEmbedHref = "https://www.uttv.ee/embed?id=" + videoId + "&t=" + Math.round(video.currentTime);
            video.pause();
            window.open(uttvEmbedHref, "_blank");
        }
    }
}

function downloadFile(url) {
    // Initiate download from the input url.
    let fileName = video.src.substring(video.src.lastIndexOf('/')+1);
    let anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
}

function copyVideoFrameToClipboard() {
    // Copies the current frame of the video to clipboard. 
    // Create the canvas and fill it's context with current video frame
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight; 
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to Data URL and 
    let dataURI = canvas.toDataURL('image/png'); // can also use 'image/jpeg'
    
    // To copy the image to clipboard, the image needs to be visible on the page
    // (programmatic copying of images is not yet supported - see  https://w3c.github.io/clipboard-apis/ )
    // To achieve this, create an <img> element and append it to a div.
    let img = new Image;
    img.crossOrigion = "Anonymous";
    img.src = dataURI;
    let div = document.createElement('div');
    div.contentEditable = true;
    div.appendChild(img);
    
    // Append the div to body (make the image visibile for copying), copy the visibile
    // elements range and remove the div (remove the image).
    document.body.appendChild(div); 
    SelectText(div); // Copy visible range.
    document.execCommand('Copy');
    document.body.removeChild(div); 
}

function SelectText(element) {
    // Select content to enable copying the selection to clipboard. 
    // Input element should be a div containing the image/etc. 
    // Source: https://stackoverflow.com/a/40547470
    if (document.body.createTextRange) {
        let range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        let selection = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function doc_keyUp(e) {
    // Get keycodes from: http://keycode.info/
    let targetElement = e.target.tagName.toLocaleLowerCase();
    if (targetElement !== "input" && targetElement !== "textarea" && !e.metaKey) {
    // Capture key presses only if they're made outside of search box (in that case user wants to input text)
    // AND when metaKey (Windows key; cmd-key) is not pressed (in that case user probably wants to use a global hotkey).
        if (e.ctrlKey && e.which === 67) {                   // Ctrl + c: Keep copy working
            document.execCommand("Copy");
        } else if (e.shiftKey && e.which === 39) {           // Shift + ->: Long forward
            videoIncrementCurrentTime(300);
        } else if (e.ctrlKey && e.which === 39) {            // Ctrl + ->: Medium forward
            videoIncrementCurrentTime(60);
        } else if (e.which === 39) {                         // ->: Small forward
            videoIncrementCurrentTime(10);
        } else if (e.shiftKey && e.which === 37) {           // Shift + <-: Long backward
            videoIncrementCurrentTime(-300);
        } else if (e.ctrlKey && e.which === 37) {            // Ctrl + <-: Medium backward
            videoIncrementCurrentTime(-60);
        } else if (e.which === 37) {                         // <-: Small backward
            videoIncrementCurrentTime(-10);
        } else if (e.which >= 49 && e.which <= 57) {         // Number keys (1-9): Jump to % of video
            videoSetPartialTime(e.which);
        } else if (e.which === 32) {                         // Space: Play/pause
            videoPlayPause();
        } else if (e.which === 38) {                         // +: Increase speed by 0.25
            videoIncrementPlaybackRate(0.25); 
        } else if (e.which === 40) {                         // -: Decrease speed by 0.25
            videoIncrementPlaybackRate(-0.25);  
        } else if (e.which === 107 || e.which === 187) {     // Up: Increase volume by 0.1
            videoIncrementVolume(0.1);  
        } else if (e.which === 109 || e.which === 189) {     // Down: Decrease volume by 0.1
            videoIncrementVolume(-0.1); 
        } else if (e.which === 77) {                         // m: Toggle mute
            videoToggleMute();
        } else if (e.which === 70) {                         // f: Toggle fullscreen
            videoToggleFullscreen();
        } else if (e.which === 84) {                         // t: Toggle theater mode (uttv)
            videoToggletheaterMode();
        } else if (e.which === 83) {                         // s: Save timestamp
            videoSaveTimestamp();
        } else if (e.which === 76) {                         // l: Load timestamp
            videoLoadTimestamp();
        } else if (e.which === 68) {                         // d: Download video
            downloadVideo();
        } else if (e.which === 69) {                         // e: Open embed video
            embedVideo();
        } else if (e.which === 67) {                         // c: Copy frame to clipboard
			copyVideoFrameToClipboard();
        }
    }
}

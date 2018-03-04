const video = document.querySelector("video");
const currentHref = window.location.href;
let tempVideoId = currentHref.substring(currentHref.lastIndexOf('/') + 1).split('.')[0];
const videoId = tempVideoId.includes("=") ? tempVideoId.split('=')[1] : tempVideoId;


// LOAD DEFAULTS
loadUserSettings();  // Set buttonbar visibility and autohide settings
setTimestampLoadButtonInitialState();  // Load default status (disabled || enabled) of 'Load Timestamp'

// Disable default actions of space and arrow keys unless the search box is active
// (otherwise they interfere with keyboard shortcuts)
window.addEventListener("keydown", function(e) {
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1 && e.target !== document.getElementById("search_input")) {
        e.preventDefault();
    }
});

// Keyboard - keypress general listener, calls
document.addEventListener('keyup', doc_keyUp, false);

// Video events
video.addEventListener('dblclick', videoToggleFullscreen);
// video.addEventListener('click', videoPlayPause);


// GENERAL FUNCTIONS
function localize(message) {
    return chrome.i18n.getMessage(message);
}

function loadUserSettings() {
    chrome.storage.sync.get({
        displayButtonbar: true,
        autohideButtonbar: true
    }, function(items) {
        if (items.displayButtonbar) {
            document.getElementById('buttonbar').style.display = 'block';
            if (items.autohideButtonbar) {
                // If both displayButtonbar AND autohideButtonbar are selected, then add the class fader (see css)
                // and change the default visibility = hidden  to visibile when mouseover spank8.
                document.getElementById('buttonbar').classList.add('fader');
                document.getElementsByClassName('span8')[0].addEventListener('mouseover', function () {
                    document.getElementById('buttonbar').style.visibility = 'visible';
                });
            } else {
                // If displayButtonbar is selected without autohide, then we can automatically set buttonbar visibile.
                document.getElementById('buttonbar').style.visibility = 'visible';
            }
        } else {
            document.getElementById('buttonbar').style.display = 'none'
        }
    });
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

function videoSetPlaybackRate(value) {
    video.playbackRate = value;
    // checkPlaybackRateAndChangeButtonBackground();
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
    // checkPlaybackRateAndChangeButtonBackground();
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
    // If fullscreenElement is found, the video is fullscreen => exit full screen
    if (document.fullscreenElement || document.webkitFullscreenElement || document.webkitFullscreenElement) {
        if (document.fullscreenElement) {  // Standard
            document.exitFullscreen();
        } else if (document.mozFullScreenElement) {  // Gecko (Firefox)
            document.mozCancelFullScreen();
        } else if (document.webkitFullscreenElement) {  // Blink (Chrome & Opera) + Edge + Safari
            document.webkitExitFullscreen();
        }
    // otherwise the video should be opened in fullscreen
    } else {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        }
    }
}

function videoToggletheaterMode() {
    // Adds or removes class="theater"; see '.theater' css-rules in /css/general.css
    document.getElementsByClassName('span4')[0].classList.toggle('theater');
    document.getElementsByClassName('span8')[0].classList.toggle('theater');
    document.getElementsByClassName('span12')[0].classList.toggle('theater');
    video.classList.toggle('theater');
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

function doc_keyUp(e) {
    // Get keycodes from: http://keycode.info/
    if (e.target !== document.getElementById("search_input") && !e.metaKey) {
    // Capture key presses only if they're made outside of search box (in that case user wants to input text)
    // AND when metaKey (Windows key; cmd-key) is not pressed (in that case user probably wants to use a global hotkey).
        if (e.shiftKey && e.which === 39) {                  // Shift + ->: Long forward
            videoIncrementCurrentTime(300);
        } else if (e.ctrlKey && e.which === 39) {              // Ctrl + ->: Medium forward
            videoIncrementCurrentTime(60);
        } else if (e.which === 39) {                          // ->: Small forward
            videoIncrementCurrentTime(10);
        } else if (e.shiftKey && e.which === 37) {            // Shift + <-: Long backward
            videoIncrementCurrentTime(-300);
        } else if (e.ctrlKey && e.which === 37) {            // Ctrl + <-: Medium backward
            videoIncrementCurrentTime(-60);
        } else if (e.which === 37) {                        // <-: Small backward
            videoIncrementCurrentTime(-10);
        } else if (e.which >= 49 && e.which <= 57) {        // Number keys (1-9): Jump to % of video
            videoSetPartialTime(e.which);
        } else if (e.which === 32) {                        // Space: Play/pause
            videoPlayPause();
        } else if (e.which === 38) {                         // +: Increase speed by 0.25
            videoIncrementPlaybackRate(0.25); 
        } else if (e.which === 40) {                        // -: Decrease speed by 0.25
            videoIncrementPlaybackRate(-0.25);  
        } else if (e.which === 107 || e.which === 187) {    // Up: Increase volume by 0.1
            videoIncrementVolume(0.1);  
        } else if (e.which === 109 || e.which === 189) {    // Down: Decrease volume by 0.1
            videoIncrementVolume(-0.1); 
        } else if (e.which === 77) {                        // m: Toggle mute
            videoToggleMute();
        } else if (e.which === 70) {                        // f: Toggle fullscreen
            videoToggleFullscreen();
        } else if (e.which === 84) {                        // t: Toggle theater mode
            videoToggletheaterMode();
        } else if (e.which === 83) {                        // s: Save timestamp
            videoSaveTimestamp();
        } else if (e.which === 76 || e.which === 67) {        // l/c: Load timestamp
            videoLoadTimestamp();
        } else if (e.which === 68) {                        // d: Download video
            downloadVideo();
        } else if (e.which === 69) {                        // e: Open embed video
            embedVideo();
        }
    }
}

function setTimestampLoadButtonInitialState() {
    chrome.storage.local.get(videoId, function (result) {
        document.getElementById("btn-ts-load").disabled = (result[videoId] === undefined);
    });
}

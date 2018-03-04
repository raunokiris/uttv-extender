// Keyboard - keypress general listener, calls
document.addEventListener('keyup', doc_keyUp, false);

const videoUrl = document.querySelector("meta[property='og:video']").getAttribute("content");

function doc_keyUp(e) {
    // Get keycodes from: http://keycode.info/
    if (e.target !== document.getElementById("searchInput") && !e.metaKey) {
    // Capture key presses only if they're made outside of search box (in that case user wants to input text)
    // AND when metaKey (Windows key; cmd-key) is not pressed (in that case user probably wants to use a global hotkey).
        if (e.which === 69) {                  // e @ embed
            openEmbeddedVideo();    
        } else if (e.which === 68) {          // d @ download
            downloadVideo();    
        }
    }
}

function openEmbeddedVideo() {
    window.open(videoUrl, "_blank");
}

function downloadVideo() {
    let videoFileUrl = videoUrl.split('?')[0];
    let fileType = document.querySelector("meta[property='og:video:type']").getAttribute("content").split('/')[1];
    let fileExtension = fileType ? "." + fileType : "";
    let anchor = document.createElement('a');
    anchor.href = videoFileUrl;
    //anchor.target = '_blank';
    anchor.download = document.title + fileExtension;
    anchor.click();
}

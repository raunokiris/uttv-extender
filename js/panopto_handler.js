const videoUrl = document.querySelector("meta[property='og:video']").getAttribute("content");

document.addEventListener('keyup', doc_keyUp, false); // Add keyboard listeners for panopto video player

function doc_keyUp(e) {
    // Get keycodes from: http://keycode.info/
    let targetElement = e.target.tagName.toLocaleLowerCase();
    if (targetElement !== "input" && targetElement !== "textarea" && !e.metaKey) {
    // Capture key presses only if they're made outside of search box (in that case user wants to input text)
    // AND when metaKey (Windows key; cmd-key) is not pressed (in that case user probably wants to use a global hotkey).
        if (e.ctrlKey && e.which === 67) {                   // Ctrl + c: Keep copy working
            document.execCommand("Copy");
        } else if (e.which === 69) {                         // e @ embed
            openEmbeddedVideo();    
        } else if (e.which === 68) {                         // d @ download
            downloadVideo();    
        } else if (e.which === 67) {                         // c: Copy frame to clipboard
        copyVideoFrameToClipboard();
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

function copyVideoFrameToClipboard() {
    // Copies the current frame of the video to clipboard.
    // Create the canvas and fill it's context with current video frame
    let video = document.querySelectorAll("video")[document.querySelectorAll("video").length-1];
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to Data URL and
    let dataURI = canvas.toDataURL('image/png');

    // To copy the image to clipboard, the image needs to be visible on the page (programmatical copying of images is not yet supported - see  https://w3c.github.io/clipboard-apis/ )
    // To achieve this, create an <img> element and append it to a div.
    let img = new Image;
    img.src = dataURI;
    let div = document.createElement('div');
    div.contentEditable = true;
    div.appendChild(img);

    // Append the div to body (make the image visibile for copying), copy the visibile elements range and remove the div (remove the image).
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

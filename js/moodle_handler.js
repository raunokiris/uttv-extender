const iframe = document.querySelector("iframe");
const currentHref = window.location.href;

document.addEventListener('keydown', doc_keyDown, false);  // logic to pass on keypresses made in main page to iframe
document.addEventListener('keyup', doc_keyUp, false);  // listeners for main page (not iframe)

function doc_keyUp(e) {
    // Get keycodes from: http://keycode.info/
    let targetTagName = e.target === document.body ? e.target.tagName.toLocaleLowerCase() : undefined;
    // Uncaught TypeError: Cannot read property 'toLocaleLowerCase' of undefined
    if (targetTagName !== "input" && targetTagName !== "textarea" && !e.metaKey) {
        /* Capture key presses only if they're made outside of search box (in that case user wants to input text)
        AND when metaKey (Win key; cmd-key) is not pressed (in that case user probably wants to use a global hotkey).*/
        if (e.ctrlKey && e.which === 67) {                   // Ctrl + c: Keep copy working
            document.execCommand("Copy");
        } else if (e.which === 84) {                         // t - theater mode
            videoToggletheaterMode();
        }
    }
}

function doc_keyDown(e) {
    /*
    If the pressed key belongs to the array of shortcutKeys, gives focus to iframe on keydown,
    which means that the keyup event will be registered in iframe, triggering relevant function.
    After 0.3 seconds the iframe will be blurred and original document will be refocused
    to ensure, that original window can registers the next keypress. Otherwise the iframe will
    stay focused and shortcut keys aimed at the original document (e.g. 't') will not work.
    */
    let shortcutKeys = [  // All shortcut-keys except Ctrl/Shift and T.
        67, 32, 37, 38, 39, 40, 49, 50, 51, 52, 53, 54, 55, 56,
        57, 67, 68, 69, 70, 76, 77, 83, 107, 109, 187, 189,
    ];

    let targetTagName = e.target ? e.target.tagName.toLocaleLowerCase() : undefined;
    if (targetTagName !== "input" && targetTagName !== "textarea" && !e.metaKey) {
        if (shortcutKeys.includes(e.which)) {                                 // t - theater mode
            iframe.focus();  // Give focus to iframe to send to register keyUp in iframe.
            refocusOnDocument();  // Refocus on original document.
        }
    }
}

function videoToggletheaterMode() {
    document.querySelector('iframe').classList.toggle('theater');
    if (!currentHref.includes("inpopup=1")) {
        document.querySelector('aside#block-region-side-pre').classList.toggle('theater');
        document.querySelector('section#region-main').classList.toggle('theater');
    }
}

function refocusOnDocument() {
    // Refocus on the original page.
    setTimeout(function () {
        iframe.blur();
    }, 300);
}


/*
Code for registering iframe click (and to blur the iframe again)
source: https://gist.github.com/jaydson/1780598
*/
let myConfObj = {
    iframeMouseOver : false
};

window.addEventListener('blur', function(){
    if(myConfObj.iframeMouseOver){         // Iframe click registered
        refocusOnDocument();
    }
});

iframe.addEventListener('mouseover',function(){
    myConfObj.iframeMouseOver = true;
});

iframe.addEventListener('mouseout',function(){
    myConfObj.iframeMouseOver = false;
});

function saveOptions() {
    chrome.storage.sync.set({
        displayButtonbar: document.getElementById('displayBtnbar').checked,
        autohideButtonbar: document.getElementById('autohideBtnbar').checked
    }, function() {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = localize('optionSaveSuccess');
    setTimeout(function() {status.innerHTML = '&nbsp;';}, 2000);
    });
}

function restoreOptions() {
    // Read values and set defaults
    chrome.storage.sync.get({
        displayButtonbar: true,
        autohideButtonbar: true
    }, function(items) {
        document.getElementById('displayBtnbar').checked = items.displayButtonbar;
        document.getElementById('autohideBtnbar').checked = items.autohideButtonbar;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);  // load defaults
document.getElementById('save').addEventListener('click', saveOptions);  // save options
document.getElementById('displayBtnbar').onclick = toggleAutohideButtonbarDisabledState;  // disable/enable autohide input

//Localization:
document.getElementById('displayBtnbar').labels[0].textContent = " " + localize('optionDisplayButtonbar');
document.getElementById('autohideBtnbar').labels[0].textContent = " " + localize('optionAutohideButtonbar');
document.getElementById('save').textContent = localize('optionSave');

function localize(message) {
    return chrome.i18n.getMessage(message);
}

function toggleAutohideButtonbarDisabledState() {
    document.getElementById('autohideBtnbar').disabled = !document.getElementById('displayBtnbar').checked;
    if (!document.getElementById('displayBtnbar').checked && document.getElementById('autohideBtnbar').checked) {
        document.getElementById('autohideBtnbar').checked = false;
    }
}
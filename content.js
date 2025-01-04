let link;

document.addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
        event.preventDefault(); // Prevent default link behavior
        link = event.target.href; // Save the link

        // Save the link in local storage
        chrome.storage.local.set({ link: link }, function() {
            console.log('Link saved: ' + link);
        });

        // Open the popup
        chrome.runtime.sendMessage({ action: "openPopup" });
    }
});

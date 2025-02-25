chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube Downloads Organizer Installed");
    // Additional setup can be performed here
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`Message received: ${request.message}`);
    // Handle different messages based on request
    sendResponse({status: 'success'});
});

// You can add more listeners for different events as needed.
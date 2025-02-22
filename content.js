console.log("YouTube Download Organizer extension loaded!");

// Wait for Sidebar to Load
function waitForSidebar() {
    const checkSidebar = setInterval(() => {
        const sidebar = document.querySelector("ytd-guide-section-renderer");
        if (sidebar) {
            clearInterval(checkSidebar);
            injectSidebarUI();
        }
    }, 1000);
}

// Inject Categories into YouTube Sidebar
function injectSidebarUI() {
    const sidebar = document.querySelector("ytd-guide-section-renderer");
    if (!sidebar) return;

    if (document.getElementById("sidebar-category-organizer")) return;

    const categoryBox = document.createElement("div");
    categoryBox.id = "sidebar-category-organizer";
    categoryBox.style.padding = "10px";
    categoryBox.style.marginTop = "10px";
    categoryBox.style.background = "#f9f9f9";
    categoryBox.style.borderRadius = "10px";
    categoryBox.style.border = "1px solid #ddd";

    categoryBox.innerHTML = `
        <h3 style="font-size: 14px; color: #333; margin-bottom: 10px;"> Categories</h3>
        <ul id="category-list" style="list-style: none; padding: 5px; margin: 0; max-height: 150px; overflow-y: auto; border: 1px solid #ccc; border-radius: 6px; background: #fff;"></ul>
        <input type="text" id="new-category" placeholder="New category" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 6px; margin-top: 5px;">
        <button id="add-category" style="width: 100%; padding: 6px; background: #ff4444; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 8px;"> Add</button>
    `;

    sidebar.appendChild(categoryBox);
    updateCategoryList();
}

// Update Category List (Now Handles Drag & Drop!)
function updateCategoryList() {
    chrome.storage.local.get(["categories"], function (result) {
        const categoryList = document.getElementById("category-list");
        categoryList.innerHTML = "";

        const categories = result.categories || [];
        categories.forEach(category => {
            const li = document.createElement("li");
            li.innerText = category;
            li.style.padding = "8px";
            li.style.borderBottom = "1px solid #ddd";
            li.style.cursor = "pointer";
            li.style.background = "#fff";
            li.style.borderRadius = "5px";
            li.style.marginBottom = "5px";
            li.style.textAlign = "center";

            li.addEventListener("click", function () {
                filterVideosByCategory(category);
            });

            // Enable drag & drop for category names
            li.addEventListener("dragover", (event) => event.preventDefault());
            li.addEventListener("drop", (event) => {
                event.preventDefault();
                const videoUrl = event.dataTransfer.getData("text/plain").trim();
                saveVideoToCategory(category, videoUrl);
            });

            categoryList.appendChild(li);
        });
    });
}

// Filter Videos and Add Download Buttons
function filterVideosByCategory(category) {
    chrome.storage.local.get(["videoCategories"], function (result) {
        const videoCategories = result.videoCategories || {};
        const allowedVideos = videoCategories[category] || []; 

        console.log(`Filtering videos for category "${category}":`, allowedVideos);

        // Function to process a single video element
        function processVideoElement(videoElement) {
            // Try different selectors to find the video link
            const videoLink = videoElement.querySelector('a[href*="watch?v="]');
            if (!videoLink || !videoLink.href) return null;

            const videoId = extractVideoID(videoLink.href);
            if (!videoId) return null;

            return {
                element: videoElement,
                id: videoId,
                link: videoLink.href
            };
        }

        // Function to hide a video element
        function hideVideo(element) {
            // First try: direct style
            element.style.setProperty('display', 'none', 'important');
            
            // Second try: parent container
            const container = element.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer');
            if (container) {
                container.style.setProperty('display', 'none', 'important');
            }
            
            // Third try: add a class
            element.classList.add('category-hidden');
            
            // Fourth try: wrap in hidden div
            if (!element.parentElement.classList.contains('category-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'category-wrapper';
                wrapper.style.setProperty('display', 'none', 'important');
                element.parentElement.insertBefore(wrapper, element);
                wrapper.appendChild(element);
            }
        }

        // Function to show a video element
        function showVideo(element) {
            // Remove all hiding methods
            element.style.removeProperty('display');
            element.classList.remove('category-hidden');
            
            const container = element.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer');
            if (container) {
                container.style.removeProperty('display');
            }
            
            // Unwrap if wrapped
            const wrapper = element.closest('.category-wrapper');
            if (wrapper) {
                wrapper.parentElement.insertBefore(element, wrapper);
                wrapper.remove();
            }
        }

        // Add necessary styles
        const style = document.createElement('style');
        style.textContent = `
            .category-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                width: 0 !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);

        // Process all video elements
        function processVideos() {
            let found = 0;
            const processedIds = new Set();

            // Get all possible video containers
            const containers = [
                ...document.querySelectorAll('ytd-rich-item-renderer'),
                ...document.querySelectorAll('ytd-video-renderer'),
                ...document.querySelectorAll('ytd-compact-video-renderer'),
                ...document.querySelectorAll('ytd-grid-video-renderer')
            ];

            containers.forEach(container => {
                const videoData = processVideoElement(container);
                if (!videoData) return;

                console.log(`Processing video: ${videoData.id}`);

                if (allowedVideos.includes(videoData.id) && !processedIds.has(videoData.id)) {
                    showVideo(container);
                    processedIds.add(videoData.id);
                    found++;

                    // Add download button
                    if (!container.querySelector('.category-download-btn')) {
                        const downloadBtn = document.createElement('button');
                        downloadBtn.className = 'category-download-btn';
                        downloadBtn.textContent = 'Download';
                        downloadBtn.style.cssText = `
                            position: absolute;
                            top: 4px;
                            right: 4px;
                            background: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            padding: 4px 8px;
                            cursor: pointer;
                            z-index: 9999;
                        `;
                        
                        downloadBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://www.y2mate.com/youtube/${videoData.id}`, '_blank');
                        });

                        const thumbnail = container.querySelector('#thumbnail');
                        if (thumbnail) {
                            thumbnail.style.position = 'relative';
                            thumbnail.appendChild(downloadBtn);
                        }
                    }
                } else {
                    hideVideo(container);
                }
            });

            // Show feedback
            const feedbackMsg = document.createElement('div');
            feedbackMsg.textContent = `Showing ${found} videos from category: ${category}`;
            feedbackMsg.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 4px;
                z-index: 9999;
            `;
            document.body.appendChild(feedbackMsg);
            setTimeout(() => feedbackMsg.remove(), 3000);

            return found > 0;
        }

        // Initial processing
        if (!processVideos()) {
            // If no videos found, try again after a short delay
            const interval = setInterval(() => {
                if (processVideos()) {
                    clearInterval(interval);
                }
            }, 1000);

            // Clear interval after 10 seconds to prevent infinite checking
            setTimeout(() => clearInterval(interval), 10000);
        }
    });
}

// Helper function to clean video URL (Fix Matching Issue)
function extractVideoID(url) {
    if (!url || typeof url !== "string") return "";
    // Handle both watch?v= format and youtu.be format
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    return (watchMatch && watchMatch[1]) || (shortMatch && shortMatch[1]) || "";
}

// Make YouTube Videos Draggable
function makeVideosDraggable() {
    document.querySelectorAll("ytd-thumbnail").forEach((thumbnail) => {
        const anchorTag = thumbnail.closest("a");
        if (!anchorTag || !anchorTag.href) return; // Prevents null errors

        const videoUrl = extractVideoID(anchorTag.href);
        if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.includes("watch?v=")) return; // Extra safety check

        thumbnail.setAttribute("draggable", "true");
        thumbnail.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", videoUrl);
            console.log(` Dragging video: ${videoUrl}`);
        });
    });
}

// Add New Category
document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "add-category") {
        const categoryName = document.getElementById("new-category").value.trim();
        if (!categoryName) return;

        chrome.storage.local.get(["categories"], function (result) {
            const categories = result.categories || [];
            if (categories.includes(categoryName)) {
                alert("Category already exists!");
                return;
            }

            categories.push(categoryName);
            chrome.storage.local.set({ categories }, function () {
                updateCategoryList();
                document.getElementById("new-category").value = "";
            });
        });
    }
});

// Save Video to Category
function saveVideoToCategory(category, videoUrl) {
    const videoID = extractVideoID(videoUrl);
    console.log(` Extracted video ID: ${videoUrl}`);
    if (!videoID) {
        console.error(" Error: Invalid video ID.");
        return;
    }

    chrome.storage.local.get(["videoCategories"], function (result) {
        let videoCategories = result.videoCategories || {};

        if (!videoCategories[category]) {
            videoCategories[category] = [];
        }

        if (!videoCategories[category].includes(videoID)) {
            videoCategories[category].push(videoID);
            chrome.storage.local.set({ videoCategories }, function () {
                console.log(` Video saved: ${videoID} under category: ${category}`);
            });
        } else {
            console.log(` Video already exists in category: ${category}`);
        }
    });
}

document.addEventListener("drop", function (event) {
    event.preventDefault();
    const videoUrl = event.dataTransfer.getData("text/plain").trim();
    console.log(" Dragged video URL:", videoUrl);

    if (!videoUrl || !videoUrl.includes("watch?v=")) {
        console.error(" No valid video URL was dragged!");
        alert("Error: No valid video URL found.");
        return;
    }
});

document.addEventListener("dragover", function (event) {
    event.preventDefault();
});

// Observer to Reapply Filtering on New Videos
const observer = new MutationObserver(() => {
    makeVideosDraggable();
});
observer.observe(document.body, { childList: true, subtree: true });

// Run Everything on Load
window.onload = function () {
    waitForSidebar();
    makeVideosDraggable();
};

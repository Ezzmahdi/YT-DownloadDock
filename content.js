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

    // Add required styles
    const style = document.createElement('style');
    style.textContent = `
        .category-sidebar {
            padding: 12px 0;
            margin: 8px 0;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
        }

        .category-header {
            font-size: 14px;
            color: var(--yt-spec-text-secondary);
            margin-bottom: 12px;
            font-weight: 500;
            padding: 0 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .category-list {
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 300px;
            overflow-y: auto;
        }

        .category-item {
            display: flex;
            align-items: center;
            padding: 0 12px;
            height: 40px;
            cursor: pointer;
            transition: all 0.15s ease;
            color: var(--yt-spec-text-primary);
            border-radius: 6px;
            margin: 0 8px;
        }

        .category-item:hover {
            background: var(--yt-spec-menu-background);
        }

        .category-item.active {
            background: var(--yt-spec-menu-background);
            font-weight: 500;
        }

        .category-icon {
            margin-right: 12px;
            width: 18px;
            height: 18px;
            opacity: 0.7;
            color: var(--yt-spec-text-primary);
        }

        .category-name {
            flex-grow: 1;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .category-count {
            margin-left: 8px;
            font-size: 12px;
            color: var(--yt-spec-text-secondary);
            font-weight: 400;
            min-width: 20px;
            text-align: right;
        }

        .new-category-btn {
            display: flex;
            align-items: center;
            padding: 0 12px;
            height: 40px;
            width: calc(100% - 16px);
            margin: 4px 8px;
            border: none;
            background: transparent;
            cursor: pointer;
            color: var(--yt-spec-text-primary);
            font-size: 14px;
            text-align: left;
            border-radius: 6px;
            transition: all 0.15s ease;
        }

        .new-category-btn:hover {
            background: var(--yt-spec-menu-background);
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }

        .modal-content {
            background: var(--yt-spec-brand-background-solid, #fff);
            padding: 24px;
            border-radius: 12px;
            width: 400px;
            max-width: 90vw;
        }

        .modal-header {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 24px;
            color: var(--yt-spec-text-primary);
        }

        .modal-input-group {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .modal-input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid var(--yt-spec-10-percent-layer);
            border-radius: 6px;
            background: transparent;
            color: var(--yt-spec-text-primary);
            font-size: 14px;
            transition: all 0.15s ease;
        }

        .modal-input:focus {
            outline: none;
            border-color: #000;
            background: rgba(0, 0, 0, 0.05);
        }

        .modal-button {
            padding: 0 16px;
            height: 36px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.15s ease;
            background-color: #000 !important;
            color: #fff !important;
        }

        .modal-button:hover {
            background-color: #2d2d2d !important;
        }

        .remove-zone {
            margin: 8px;
            padding: 12px;
            border: 2px dashed #ff0000;
            border-radius: 6px;
            text-align: center;
            color: #ff0000;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .remove-zone:hover {
            background: rgba(255, 0, 0, 0.1);
        }

        .remove-zone.drag-over {
            background: rgba(255, 0, 0, 0.2);
            border-style: solid;
        }

        .remove-zone svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

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

    const categoryBox = document.createElement("div");
    categoryBox.id = "sidebar-category-organizer";
    categoryBox.className = "category-sidebar";

    categoryBox.innerHTML = `
        <h3 class="category-header">Categories</h3>
        <ul id="category-list" class="category-list"></ul>
        <button id="new-category-btn" class="new-category-btn">
            <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            New Category
        </button>
    `;

    const removeZone = createRemoveZone();
    categoryBox.appendChild(removeZone);

    sidebar.appendChild(categoryBox);

    // Add modal HTML
    const modal = document.createElement('div');
    modal.id = 'category-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">Create New Category</div>
                <div class="modal-input-group">
                    <input type="text" id="new-category-input" class="modal-input" placeholder="Category name">
                    <button id="add-category" class="modal-button" style="background-color: #000; color: #fff;">Create</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add modal event listeners
    document.getElementById('new-category-btn').addEventListener('click', () => {
        document.getElementById('category-modal').style.display = 'block';
        document.getElementById('new-category-input').focus();
    });

    document.addEventListener('click', (e) => {
        const modal = document.getElementById('category-modal');
        const modalContent = modal?.querySelector('.modal-content');
        if (e.target.closest('.modal-content')) return; // Click inside modal
        if (e.target.id === 'new-category-btn') return; // Click on new category button
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.getElementById('new-category-input').value = '';
        }
    });

    document.getElementById('add-category').addEventListener('click', () => {
        const categoryName = document.getElementById('new-category-input').value.trim();
        if (categoryName) {
            chrome.storage.local.get(['categories'], function(result) {
                const categories = result.categories || [];
                if (!categories.includes(categoryName)) {
                    categories.push(categoryName);
                    chrome.storage.local.set({ categories }, function() {
                        updateCategoryList();
                        document.getElementById('category-modal').style.display = 'none';
                        document.getElementById('new-category-input').value = '';
                    });
                }
            });
        }
    });

    document.getElementById('new-category-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-category').click();
        }
    });

    updateCategoryList();
}

// Function to create the remove zone
function createRemoveZone() {
    const removeZone = document.createElement('div');
    removeZone.className = 'remove-zone';
    removeZone.innerHTML = `
        Drop here to remove from all categories
    `;

    // Add drag and drop event listeners
    removeZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        removeZone.classList.add('drag-over');
    });

    removeZone.addEventListener('dragleave', () => {
        removeZone.classList.remove('drag-over');
    });

    removeZone.addEventListener('drop', (e) => {
        e.preventDefault();
        removeZone.classList.remove('drag-over');
        const videoUrl = e.dataTransfer.getData('text/plain');
        if (videoUrl) {
            removeVideoFromAllCategories(videoUrl);
        }
    });

    return removeZone;
}

// Function to remove video from all categories
function removeVideoFromAllCategories(videoUrl) {
    const videoID = extractVideoID(videoUrl);
    if (!videoID) {
        console.error('Invalid video URL:', videoUrl);
        return;
    }

    chrome.storage.local.get(['videoCategories'], function(result) {
        const videoCategories = result.videoCategories || {};
        let wasRemoved = false;

        // Remove the video from all categories
        Object.keys(videoCategories).forEach(category => {
            if (videoCategories[category].includes(videoID)) {
                videoCategories[category] = videoCategories[category].filter(id => id !== videoID);
                updateCategoryCount(category, videoCategories[category].length);
                wasRemoved = true;
            }
        });

        if (wasRemoved) {
            chrome.storage.local.set({ videoCategories }, function() {
                showFeedbackMessage('Video removed from all categories');
                // Refresh the current category view if needed
                if (activeCategory) {
                    filterVideosByCategory(activeCategory);
                }
            });
        }
    });
}

// Update the updateCategoryList function to show video counts
function updateCategoryList() {
    chrome.storage.local.get(['categories', 'videoCategories'], function(result) {
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        const categories = result.categories || [];
        const videoCategories = result.videoCategories || {};

        categories.forEach(category => {
            const videosInCategory = videoCategories[category] || [];
            const li = document.createElement('li');
            li.className = `category-item ${category === activeCategory ? 'active' : ''}`;
            
            li.innerHTML = `
                <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="category-name">${category}</span>
                <span class="category-count">${videosInCategory.length}</span>
            `;

            li.addEventListener('click', function() {
                document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                if (category === activeCategory) {
                    activeCategory = null;
                    showAllVideos();
                } else {
                    activeCategory = category;
                    li.classList.add('active');
                    filterVideosByCategory(category);
                }
            });

            li.addEventListener('dragover', (event) => event.preventDefault());
            li.addEventListener('drop', (event) => {
                event.preventDefault();
                const videoUrl = event.dataTransfer.getData('text/plain').trim();
                saveVideoToCategory(category, videoUrl);
            });

            categoryList.appendChild(li);
        });
    });
}

// Keep track of active category
let activeCategory = null;

// Keep track of which category a video is being dragged from
let dragSourceCategory = null;

// Filter Videos and Add Download Buttons
function filterVideosByCategory(category) {
    chrome.storage.local.get(["videoCategories"], function (result) {
        dragSourceCategory = category; // Set the source category when filtering
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
            showFeedbackMessage(`Showing ${found} videos in category "${category}"`);

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

// Function to show all videos
function showAllVideos() {
    dragSourceCategory = null; // Reset source category when showing all videos
    // Remove any existing category-hidden classes
    document.querySelectorAll('.category-hidden').forEach(el => {
        el.classList.remove('category-hidden');
    });

    // Remove any wrapper divs
    document.querySelectorAll('.category-wrapper').forEach(wrapper => {
        const parent = wrapper.parentElement;
        while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
        }
        wrapper.remove();
    });

    // Show all video containers
    const containers = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer');
    containers.forEach(container => {
        container.style.removeProperty('display');
        container.style.removeProperty('visibility');
        container.style.removeProperty('opacity');
        container.style.removeProperty('width');
        container.style.removeProperty('height');
        container.style.removeProperty('margin');
        container.style.removeProperty('padding');
        container.style.removeProperty('overflow');
        
        // Remove download buttons
        const downloadBtn = container.querySelector('.category-download-btn');
        if (downloadBtn) {
            downloadBtn.remove();
        }
    });

    // Show feedback message
    showFeedbackMessage("Showing all videos");
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
    const containers = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer');
    containers.forEach(container => {
        const thumbnail = container.querySelector('#thumbnail');
        if (thumbnail) {
            thumbnail.draggable = true;
            
            thumbnail.addEventListener('dragstart', (event) => {
                const videoUrl = thumbnail.href;
                if (videoUrl) {
                    event.dataTransfer.setData('text/plain', videoUrl);
                    // If we're in a filtered view, this is our source category
                    if (activeCategory) {
                        dragSourceCategory = activeCategory;
                    }
                }
            });

            thumbnail.addEventListener('dragend', () => {
                // Reset the source category after the drag operation
                setTimeout(() => {
                    dragSourceCategory = null;
                }, 100);
            });
        }
    });
}

// Update the saveVideoToCategory function to handle video removal from previous category
function saveVideoToCategory(category, videoUrl) {
    if (!videoUrl) return;

    const videoID = extractVideoID(videoUrl);
    if (!videoID) {
        console.error('Invalid video URL:', videoUrl);
        return;
    }

    chrome.storage.local.get(['videoCategories'], function(result) {
        const videoCategories = result.videoCategories || {};
        
        // Initialize the target category if it doesn't exist
        if (!videoCategories[category]) {
            videoCategories[category] = [];
        }

        // If we're dragging from an active category and it's different from the target
        if (dragSourceCategory && dragSourceCategory !== category) {
            // Remove from previous category if it exists there
            if (videoCategories[dragSourceCategory]) {
                videoCategories[dragSourceCategory] = videoCategories[dragSourceCategory].filter(id => id !== videoID);
                // Update the count for the source category
                updateCategoryCount(dragSourceCategory, videoCategories[dragSourceCategory].length);
            }
        }

        // Add to new category if not already there
        if (!videoCategories[category].includes(videoID)) {
            videoCategories[category].push(videoID);
            chrome.storage.local.set({ videoCategories }, function() {
                // Update counts for both categories
                updateCategoryCount(category, videoCategories[category].length);
                showFeedbackMessage('Video moved to category');
                
                // Refresh the current category view immediately
                if (activeCategory) {
                    filterVideosByCategory(activeCategory);
                }
            });
        }
    });
}

// Function to update category count in UI
function updateCategoryCount(category, count) {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        const nameEl = item.querySelector('.category-name');
        if (nameEl && nameEl.textContent === category) {
            const countEl = item.querySelector('.category-count');
            if (countEl) {
                countEl.textContent = count;
            }
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

// Function to show feedback message
function showFeedbackMessage(message) {
    const feedbackMsg = document.createElement('div');
    feedbackMsg.textContent = message;
    feedbackMsg.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 16px;
        border-radius: 20px;
        z-index: 9999;
        font-size: 14px;
        backdrop-filter: blur(4px);
    `;
    document.body.appendChild(feedbackMsg);
    setTimeout(() => feedbackMsg.remove(), 2000);
}

// Run Everything on Load
window.onload = function () {
    waitForSidebar();
    makeVideosDraggable();
};
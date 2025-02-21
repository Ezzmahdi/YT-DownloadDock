console.log("YouTube Download Organizer extension loaded!");

// 🛑 Wait for Sidebar to Load
function waitForSidebar() {
    const checkSidebar = setInterval(() => {
        const sidebar = document.querySelector("ytd-guide-section-renderer");
        if (sidebar) {
            clearInterval(checkSidebar);
            injectSidebarUI();
        }
    }, 1000);
}

// 🏗️ Inject Categories into YouTube Sidebar
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
        <h3 style="font-size: 14px; color: #333; margin-bottom: 10px;">🎯 Categories</h3>
        <ul id="category-list" style="list-style: none; padding: 5px; margin: 0; max-height: 150px; overflow-y: auto; border: 1px solid #ccc; border-radius: 6px; background: #fff;"></ul>
        <input type="text" id="new-category" placeholder="New category" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 6px; margin-top: 5px;">
        <button id="add-category" style="width: 100%; padding: 6px; background: #ff4444; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 8px;">➕ Add</button>
    `;

    sidebar.appendChild(categoryBox);
    updateCategoryList();
}

// 📝 Update Category List (Now Handles Drag & Drop!)
function updateCategoryList() {
    chrome.storage.local.get(["categories"], function (result) {
        const categoryList = document.getElementById("category-list");
        categoryList.innerHTML = "";

        const categories = result.categories || [];
        categories.forEach(category => {
            const li = document.createElement("li");
            li.innerText = category;
            li.classList.add("category-item");
            li.style.padding = "8px";
            li.style.cursor = "pointer";
            li.style.background = "#fff";
            li.style.borderRadius = "5px";
            li.style.marginBottom = "5px";
            li.style.textAlign = "center";
            li.style.border = "1px solid #ddd";
            li.style.transition = "background 0.3s";

            li.addEventListener("mouseover", () => li.style.background = "#e6e6e6");
            li.addEventListener("mouseout", () => li.style.background = "#fff");

            // 🛑 Enable Drag & Drop for Categories
            li.addEventListener("dragover", (event) => event.preventDefault());
            li.addEventListener("drop", (event) => {
                event.preventDefault();
                const videoUrl = event.dataTransfer.getData("text/plain").trim();
                if (!videoUrl || !videoUrl.includes("watch?v=")) {
                    console.error("❌ Invalid video URL!");
                    return;
                }
                saveVideoToCategory(category, videoUrl);
            });

            li.addEventListener("click", function () {
                filterVideosByCategory(category);
            });

            categoryList.appendChild(li);
        });
    });
}

// 🔍 ✅ **Fixed: Hide Videos When Clicking a Category**
function filterVideosByCategory(category) {
    chrome.storage.local.get(["videoCategories"], function (result) {
        const videoCategories = result.videoCategories || {};
        const allowedVideos = videoCategories[category] || [];

        const videoElements = document.querySelectorAll("ytd-playlist-video-renderer, ytd-rich-item-renderer"); // ✅ Now supports multiple video types

        let found = 0;
        videoElements.forEach((videoElement) => {
            const videoLink = videoElement.querySelector("a#thumbnail")?.href;
            if (!videoLink) return;

            const cleanVideoUrl = extractVideoID(videoLink);
            if (allowedVideos.includes(cleanVideoUrl)) {
                videoElement.style.display = "block"; // ✅ Show videos in category
                found++;
            } else {
                videoElement.style.display = "none"; // ✅ Hide videos not in category
            }
        });

        console.log(`📂 Showing ${found} videos from category: ${category}`);
    });
}

// ✨ Helper function to clean video URL (Fix Matching Issue)
function extractVideoID(url) {
    const match = url.match(/watch\?v=([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

// 🎥 Make YouTube Videos Draggable
function makeVideosDraggable() {
    document.querySelectorAll("ytd-thumbnail").forEach((thumbnail) => {
        const anchorTag = thumbnail.closest("a");
        if (!anchorTag) return;

        const videoUrl = extractVideoID(anchorTag.href);
        if (!videoUrl.includes("watch?v=")) return;

        thumbnail.setAttribute("draggable", "true");
        thumbnail.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", videoUrl);
            console.log(`🎬 Dragging video: ${videoUrl}`);
        });
    });
}

// ➕ Add New Category
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

// 🎯 Save Video to Category
function saveVideoToCategory(category, videoUrl) {
    const cleanVideoUrl = extractVideoID(videoUrl); // ✅ Fix URL before saving

    chrome.storage.local.get(["videoCategories"], function (result) {
        let videoCategories = result.videoCategories || {};

        if (!videoCategories[category]) {
            videoCategories[category] = [];
        }

        if (!videoCategories[category].includes(cleanVideoUrl)) {
            videoCategories[category].push(cleanVideoUrl);
            chrome.storage.local.set({ videoCategories }, function () {
                console.log(`✅ Video saved under category: ${category}`);
            });
        } else {
            console.log(`⚠️ Video already exists in category: ${category}`);
        }
    });
}

// 🚀 Run Everything on Load
window.onload = function () {
    waitForSidebar();
    makeVideosDraggable();
};

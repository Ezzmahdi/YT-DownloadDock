console.log("YouTube Download Organizer extension loaded!");
document.querySelectorAll("a#thumbnail").forEach((el) => console.log(el.href));


// Inject the UI panel
function injectUI() {
    if (document.getElementById("custom-download-organizer")) return;

    const organizerUI = document.createElement("div");
    organizerUI.id = "custom-download-organizer";
    organizerUI.style.position = "fixed";
    organizerUI.style.right = "20px";
    organizerUI.style.top = "80px";
    organizerUI.style.background = "#ffffff";
    organizerUI.style.padding = "20px";
    organizerUI.style.borderRadius = "12px";
    organizerUI.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.3)";
    organizerUI.style.zIndex = "10000";
    organizerUI.style.width = "320px";
    organizerUI.style.fontFamily = "Arial, sans-serif";
    organizerUI.style.border = "1px solid #ddd";
    organizerUI.style.textAlign = "center";

    organizerUI.innerHTML = `
        <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">🎥 YouTube Organizer</h2>

        <div style="padding: 10px; background: #f8f8f8; border-radius: 8px; border: 1px solid #ddd;">
            <h3 style="font-size: 14px; margin-bottom: 10px; color: #555;">Categories</h3>
            <ul id="category-list" style="
                list-style: none; padding: 5px; margin: 0; max-height: 100px; overflow-y: auto;
                border: 1px solid #ccc; border-radius: 6px; background: #fff; text-align: left;">
            </ul>
        </div>

        <div style="margin-top: 15px;">
            <input type="text" id="new-category" placeholder="Enter category name" 
                style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; margin-top: 5px;">
            <button id="add-category" 
                style="width: 100%; padding: 8px; margin-top: 8px; background: #ff4444; color: white; 
                border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                ➕ Add Category
            </button>
        </div>

        <h3 style="margin-top: 20px; font-size: 14px; color: #555;">Select a Category</h3>
        <select id="category-dropdown" style="
            width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; margin-top: 5px;">
            <option value="" disabled selected>Choose a category</option>
        </select>

        <div id="category-videos" style="
            max-height: 250px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; 
            background: #fafafa; border-radius: 8px; margin-top: 15px; text-align: left;">
            <p style="color: gray;">No videos selected.</p>
        </div>
    `;

    document.body.appendChild(organizerUI);

    updateCategoryList();

}

function makeVideosDraggable() {
    document.querySelectorAll("ytd-thumbnail").forEach((thumbnail) => {
        // Get the closest anchor tag
        const anchorTag = thumbnail.closest("a");
        if (!anchorTag) return; // Skip if no link is found

        const videoUrl = anchorTag.href;
        if (!videoUrl.includes("watch?v=")) return; // Only allow valid YouTube videos

        // Make the thumbnail draggable
        thumbnail.setAttribute("draggable", "true");
        thumbnail.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", videoUrl);
            console.log(`🎬 Video dragged: ${videoUrl}`);
        });
    });
}


// Function to update category list and dropdown
function updateCategoryList() {
    chrome.storage.local.get(["categories"], function (result) {
        const categoryList = document.getElementById("category-list");
        const categoryDropdown = document.getElementById("category-dropdown");
        categoryList.innerHTML = "";
        categoryDropdown.innerHTML = '<option value="" disabled selected>Select a category</option>';

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
                showVideosInCategory(category);
            });
            categoryList.appendChild(li);

            // Add category to the dropdown
            const option = document.createElement("option");
            option.value = category;
            option.innerText = category;
            categoryDropdown.appendChild(option);
        });
    });
}

// Function to save a video to a category
function saveVideoToCategory(category, videoUrl) {
    if (!videoUrl || videoUrl.trim() === "") {
        console.error("❌ Error: Video URL is empty or invalid.");
        return;
    }

    chrome.storage.local.get(["videoCategories"], function (result) {
        let videoCategories = result.videoCategories || {};

        if (!videoCategories[category]) {
            videoCategories[category] = [];
        }

        // Prevent duplicate videos
        if (!videoCategories[category].includes(videoUrl)) {
            videoCategories[category].push(videoUrl);
            chrome.storage.local.set({ videoCategories }, function () {
                console.log(`✅ Video saved: ${videoUrl} under category: ${category}`);
                showVideosInCategory(category);
            });
        } else {
            console.log(`⚠️ Video already exists in category: ${category}`);
        }

        // 🔄 Force UI refresh
        updateCategoryList();
        showVideosInCategory(category);
    });
}



// Function to retrieve and display videos under a category
function showVideosInCategory(category) {
    chrome.storage.local.get(["videoCategories"], function (result) {
        console.log("Retrieving videos for category:", category);
        console.log("Full Storage Data:", result.videoCategories);

        const videoCategories = result.videoCategories || {};
        const categoryVideosDiv = document.getElementById("category-videos");
        categoryVideosDiv.innerHTML = `<p style="color: gray;">Loading videos...</p>`;

        const videos = videoCategories[category] || [];

        if (videos.length === 0) {
            categoryVideosDiv.innerHTML = "<p style='color: gray;'>No videos in this category.</p>";
            return;
        }

        let videoHTML = "";
        videos.forEach(videoUrl => {
            videoHTML += `<div style="margin-bottom: 10px;">
                <a href="${videoUrl}" target="_blank" 
                    style="color: #0073ff; text-decoration: none; font-size: 14px;">${videoUrl}</a>
            </div>`;
        });

        categoryVideosDiv.innerHTML = videoHTML;
    });
}

// Function to add a new category
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

// Function to handle video drag and drop into categories
document.addEventListener("drop", function (event) {
    event.preventDefault();

    const videoUrl = event.dataTransfer.getData("text/plain").trim();
    console.log("🎥 Dragged video URL:", videoUrl);

    if (!videoUrl || !videoUrl.includes("watch?v=")) {
        console.error("❌ No valid video URL was dragged!");
        alert("Error: No valid video URL found.");
        return;
    }

    const categoryDropdown = document.getElementById("category-dropdown");
    const selectedCategory = categoryDropdown.value;

    if (!selectedCategory) {
        alert("Please select a category first.");
        return;
    }

    saveVideoToCategory(selectedCategory, videoUrl);
});



document.addEventListener("dragover", function (event) {
    event.preventDefault();
});

// Inject UI when the page loads
window.onload = function () {
    injectUI();
    makeVideosDraggable();
};

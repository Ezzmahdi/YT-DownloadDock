document.addEventListener("DOMContentLoaded", function () {
    loadPopupCategories();

    document.getElementById("popup-add-category").addEventListener("click", function () {
        const input = document.getElementById("popup-new-category");
        const category = input.value.trim();

        if (category) {
            try {
                let categories = JSON.parse(localStorage.getItem("videoCategories")) || [];
                if (!categories.includes(category)) {
                    categories.push(category);
                    localStorage.setItem("videoCategories", JSON.stringify(categories));
                    loadPopupCategories();
                    showFeedbackMessage(`Category '${category}' added!`);
                } else {
                    showFeedbackMessage(`Category '${category}' already exists!`);
                }
            } catch (error) {
                showFeedbackMessage(`Error adding category: ${error.message}`);
            }
            input.value = "";
        } else {
            showFeedbackMessage(`Please enter a category name.`);
        }
    });

    document.getElementById("popup-category-list").addEventListener("click", function (event) {
        if (event.target.tagName === "LI") {
            const categoryToRemove = event.target.textContent;
            try {
                let categories = JSON.parse(localStorage.getItem("videoCategories")) || [];
                categories = categories.filter(cat => cat !== categoryToRemove);
                localStorage.setItem("videoCategories", JSON.stringify(categories));
                loadPopupCategories();
                showFeedbackMessage(`Category '${categoryToRemove}' removed!`);
            } catch (error) {
                showFeedbackMessage(`Error removing category: ${error.message}`);
            }
        }
    });
});

function loadPopupCategories() {
    try {
        const storedCategories = JSON.parse(localStorage.getItem("videoCategories")) || [];
        const categoryList = document.getElementById("popup-category-list");
        categoryList.innerHTML = "";

        storedCategories.forEach((category) => {
            const li = document.createElement("li");
            li.textContent = category;
            categoryList.appendChild(li);
        });
    } catch (error) {
        showFeedbackMessage(`Error loading categories: ${error.message}`);
    }
}

function showFeedbackMessage(message) {
    const feedbackMsg = document.createElement('div');
    feedbackMsg.textContent = message;
    feedbackMsg.className = 'feedback-message';
    document.body.appendChild(feedbackMsg);
    setTimeout(() => feedbackMsg.remove(), 2000);
}

document.addEventListener("DOMContentLoaded", function () {
    loadPopupCategories();

    document.getElementById("popup-add-category").addEventListener("click", function () {
        const input = document.getElementById("popup-new-category");
        const category = input.value.trim();

        if (category) {
            let categories = JSON.parse(localStorage.getItem("videoCategories")) || [];
            if (!categories.includes(category)) {
                categories.push(category);
                localStorage.setItem("videoCategories", JSON.stringify(categories));
                loadPopupCategories();
            }
            input.value = "";
        }
    });
});

function loadPopupCategories() {
    const storedCategories = JSON.parse(localStorage.getItem("videoCategories")) || [];
    const categoryList = document.getElementById("popup-category-list");
    categoryList.innerHTML = "";

    storedCategories.forEach((category) => {
        const li = document.createElement("li");
        li.textContent = category;
        categoryList.appendChild(li);
    });
}

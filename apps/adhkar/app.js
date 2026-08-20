// ============================================================
// API
// ============================================================

const API =
    "https://api.islamic.app/v1/dhikr";


// ============================================================
// Elements
// ============================================================

const categories =
    document.getElementById("categories");

const adhkarPage =
    document.getElementById("adhkarPage");

const adhkarContainer =
    document.getElementById("adhkarContainer");

const categoryTitle =
    document.getElementById("categoryTitle");

const backButton =
    document.getElementById("backButton");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");


// ============================================================
// State
// ============================================================

let currentAdhkar = [];

let currentCategory = "";


// ============================================================
// Category Names
// ============================================================

const categoryNames = {

    "morning":
        "🌅 أذكار الصباح",

    "evening":
        "🌇 أذكار المساء",

    "before-sleep":
        "😴 أذكار النوم",

    "after-prayer":
        "🕌 أذكار بعد الصلاة"

};


// ============================================================
// Open Category
// ============================================================

document
    .querySelectorAll(".category-card")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;

                loadAdhkar(category);

            }

        );

    });


// ============================================================
// Load Adhkar
// ============================================================

async function loadAdhkar(category) {

    currentCategory =
        category;


    categories.classList.add(
        "hidden"
    );


    adhkarPage.classList.remove(
        "hidden"
    );


    categoryTitle.textContent =
        categoryNames[category] ||
        "🤲 الأذكار";


    adhkarContainer.innerHTML = `
        <div class="loading">

            <div class="spinner"></div>

            <p>
                جاري تحميل الأذكار...
            </p>

        </div>
    `;


    try {

        const response =
            await fetch(
                `${API}/${category}`
            );


        if (!response.ok) {

            throw new Error(
                "API Error"
            );

        }


        const result =
            await response.json();


        console.log(
            "Adhkar API:",
            result
        );
        
        currentAdhkar =
            extractAdhkar(result);


        if (!currentAdhkar.length) {

            throw new Error(
                "No adhkar found"
            );

        }


        renderAdhkar();


    } catch (error) {

        console.error(error);


        adhkarContainer.innerHTML = `
            <div class="loading">

                <p>
                    حدث خطأ أثناء تحميل الأذكار.
                </p>

                <p>
                    تأكد من اتصالك بالإنترنت.
                </p>

            </div>
        `;

    }

}


// ============================================================
// Extract Adhkar
// ============================================================

// ============================================================
// Extract Adhkar
// ============================================================

function extractAdhkar(result) {

    if (
        Array.isArray(result?.data?.duas)
    ) {

        return result.data.duas;

    }

    return [];

}


// ============================================================
// Render Adhkar
// ============================================================

function renderAdhkar() {

    adhkarContainer.innerHTML =
        currentAdhkar
            .map(
                (dhikr, index) => {

                    // ==========================
                    // Arabic text
                    // ==========================

                    const text =
                        dhikr?.ar?.text ||
                        "";


                    // ==========================
                    // Count
                    // ==========================

                    const count =
                        Number(
                            dhikr?.ar?.count ||
                            dhikr?.ar?.repeat ||
                            dhikr?.count ||
                            1
                        );


                    return `
                        <article
                            class="dhikr-card"
                            data-index="${index}"
                            data-count="${count}"
                            data-current="0"
                        >

                            <div class="dhikr-text">
                                ${text}
                            </div>


                            <div class="dhikr-info">

                                <span class="counter">
                                    0 / ${count}
                                </span>


                                <button
                                    class="count-button"
                                    onclick="countDhikr(${index})"
                                >
                                    📿 اضغط للتسبيح
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    updateProgress();

}


// ============================================================
// Count Dhikr
// ============================================================

function countDhikr(index) {

    const card =
        document.querySelector(
            `.dhikr-card[data-index="${index}"]`
        );


    if (!card) {
        return;
    }


    let current =
        Number(
            card.dataset.current
        );


    const count =
        Number(
            card.dataset.count
        );


    if (
        current >= count
    ) {

        return;

    }


    current++;


    card.dataset.current =
        current;


    const counter =
        card.querySelector(
            ".counter"
        );


    counter.textContent =
        `${current} / ${count}`;


    if (
        current >= count
    ) {

        card.classList.add(
            "completed"
        );


        const button =
            card.querySelector(
                ".count-button"
            );


        button.disabled =
            true;


        button.textContent =
            "✓ تم";

    }


    updateProgress();

}


// ============================================================
// Progress
// ============================================================

function updateProgress() {

    const cards =
        document.querySelectorAll(
            ".dhikr-card"
        );


    if (!cards.length) {

        progressBar.style.width =
            "0%";

        progressText.textContent =
            "0%";

        return;

    }


    let completed =
        0;


    cards.forEach(card => {

        const current =
            Number(
                card.dataset.current
            );


        const count =
            Number(
                card.dataset.count
            );


        if (
            current >= count
        ) {

            completed++;

        }

    });


    const percentage =
        Math.round(
            (completed / cards.length) *
            100
        );


    progressBar.style.width =
        `${percentage}%`;


    progressText.textContent =
        `${percentage}%`;

}


// ============================================================
// Back Button
// ============================================================

backButton.addEventListener(
    "click",
    () => {

        adhkarPage.classList.add(
            "hidden"
        );


        categories.classList.remove(
            "hidden"
        );

    }
);

// ============================================================
// Theme
// ============================================================

const themeButton =
    document.getElementById("themeButton");


// Load saved theme

const savedTheme =
    localStorage.getItem("adhkar-theme") ||
    "dark";


document.body.classList.toggle(
    "light-theme",
    savedTheme === "light"
);


updateThemeButton();


// Change theme

themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-theme"
        );


        const isLight =
            document.body.classList.contains(
                "light-theme"
            );


        localStorage.setItem(
            "adhkar-theme",
            isLight
                ? "light"
                : "dark"
        );


        updateThemeButton();

    }
);


// Button icon

function updateThemeButton() {

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    themeButton.textContent =
        isLight
            ? "🌙"
            : "☀️";

}
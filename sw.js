const CACHE_NAME = "halal-tech-v9";

const BASE_PATH = "/halal-tech/";

const STATIC_FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./manifest.json",

    "./css/style.css",

    "./js/main.js",
    "./js/apps.js",
    "./js/firebase.js",

    "./assets/wallpapers/001.png",
    "./assets/wallpapers/002.png",
    "./assets/wallpapers/003.jpg",
    "./assets/wallpapers/004.jpg",
    "./assets/wallpapers/005.jpg"
];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", event => {

    console.log("[SW] Installing:", CACHE_NAME);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_FILES);
            })
    );

    self.skipWaiting();

});


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", event => {

    console.log("[SW] Activating:", CACHE_NAME);

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", event => {

    const originalRequest = event.request;


    // --------------------------------------------------------
    // GET only
    // --------------------------------------------------------

    if (originalRequest.method !== "GET") {
        return;
    }


    const originalURL =
        new URL(originalRequest.url);


    // --------------------------------------------------------
    // External requests
    // --------------------------------------------------------

    if (
        originalURL.origin !== self.location.origin
    ) {
        return;
    }


    // --------------------------------------------------------
    // Only handle normal requests
    // --------------------------------------------------------

    event.respondWith(

        fetch(originalRequest)

            .then(response => {

                // =================================================
                // REQUEST WORKED
                // Don't modify anything.
                // =================================================

                if (
                    response &&
                    response.ok
                ) {

                    return response;

                }


                // =================================================
                // REQUEST FAILED
                //
                // Try /halal-tech/ version
                // =================================================

                return tryHalalTechPath(
                    originalRequest,
                    response
                );

            })

            .catch(error => {

                console.warn(
                    "[SW] Original request failed:",
                    originalURL.pathname,
                    error
                );


                // =================================================
                // Network error
                // Try /halal-tech/ version
                // =================================================

                return tryHalalTechPath(
                    originalRequest,
                    null
                );

            })

    );

});


// ============================================================
// TRY HALAL-TECH PATH
// ============================================================

async function tryHalalTechPath(
    originalRequest,
    originalResponse
) {

    const originalURL =
        new URL(originalRequest.url);


    // --------------------------------------------------------
    // If already inside /halal-tech/
    // don't modify it.
    // --------------------------------------------------------

    if (
        originalURL.pathname.startsWith(
            BASE_PATH
        )
    ) {

        // If we already have a real response,
        // return it.

        if (originalResponse) {
            return originalResponse;
        }


        // Otherwise try cache.

        const cached =
            await caches.match(
                originalRequest
            );

        if (cached) {
            return cached;
        }


        return new Response(
            "Offline",
            {
                status: 503,
                statusText: "Offline",
                headers: {
                    "Content-Type":
                        "text/plain"
                }
            }
        );

    }


    // --------------------------------------------------------
    // Build new /halal-tech/ URL
    // --------------------------------------------------------

    const fixedURL =
        new URL(
            BASE_PATH +
            originalURL.pathname.replace(
                /^\/+/,
                ""
            ),
            originalURL.origin
        );


    fixedURL.search =
        originalURL.search;


    console.log(
        "[SW] Original request failed:",
        originalURL.pathname
    );

    console.log(
        "[SW] Trying:",
        fixedURL.pathname
    );


    // --------------------------------------------------------
    // Create fixed request
    // --------------------------------------------------------

    const fixedRequest =
        new Request(
            fixedURL.href,
            originalRequest
        );


    // --------------------------------------------------------
    // Check cache first
    // --------------------------------------------------------

    const cachedResponse =
        await caches.match(
            fixedRequest
        );


    if (cachedResponse) {

        console.log(
            "[SW] Loaded from cache:",
            fixedURL.pathname
        );

        return cachedResponse;

    }


    // --------------------------------------------------------
    // Try actual /halal-tech/ URL
    // --------------------------------------------------------

    try {

        const fixedResponse =
            await fetch(
                fixedRequest
            );


        if (
            fixedResponse &&
            fixedResponse.ok
        ) {

            console.log(
                "[SW] Fixed path worked:",
                fixedURL.pathname
            );


            // ------------------------------------------------
            // Save successful response
            // ------------------------------------------------

            const responseToCache =
                fixedResponse.clone();


            caches.open(CACHE_NAME)
                .then(cache => {

                    return cache.put(
                        fixedRequest,
                        responseToCache
                    );

                })
                .catch(error => {

                    console.warn(
                        "[SW] Cache save failed:",
                        error
                    );

                });


            return fixedResponse;

        }


        // ----------------------------------------------------
        // Both paths failed
        // ----------------------------------------------------

        if (originalResponse) {
            return originalResponse;
        }


        return fixedResponse;

    }

    catch (error) {

        console.warn(
            "[SW] Fixed path also failed:",
            fixedURL.pathname,
            error
        );


        // ----------------------------------------------------
        // Try original cache
        // ----------------------------------------------------

        const originalCached =
            await caches.match(
                originalRequest
            );


        if (originalCached) {
            return originalCached;
        }


        // ----------------------------------------------------
        // Try fixed cache
        // ----------------------------------------------------

        const fixedCached =
            await caches.match(
                fixedRequest
            );


        if (fixedCached) {
            return fixedCached;
        }


        // ----------------------------------------------------
        // Completely offline
        // ----------------------------------------------------

        return new Response(
            "Offline",
            {
                status: 503,
                statusText: "Offline",
                headers: {
                    "Content-Type":
                        "text/plain"
                }
            }
        );

    }

}
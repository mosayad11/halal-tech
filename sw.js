const CACHE_NAME = "halal-tech-v6";

const STATIC_FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./manifest.json",
    "./css/style.css",
    "./js/main.js",
    "./js/apps.js",
    "./js/firebase.js",
];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", event => {

    console.log("[SW] Installing:", CACHE_NAME);

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    STATIC_FILES
                );

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

                        .filter(
                            name => name !== CACHE_NAME
                        )

                        .map(
                            name => caches.delete(name)
                        )

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

    const request =
        event.request;

    // We only handle GET requests.
    if (request.method !== "GET") {
        return;
    }


    const url =
        new URL(request.url);


    // ========================================================
    // IMPORTANT:
    // Never intercept external APIs.
    // ========================================================

    if (
        url.origin !== self.location.origin
    ) {

        return;

    }


    // ========================================================
    // App / Asset files
    // Cache First
    // ========================================================

    const isAppFile =
        url.pathname.includes("/halal-tech/apps/");

    const isAssetFile =
        url.pathname.includes("/halal-tech/assets/");


    if (
        isAppFile ||
        isAssetFile
    ) {

        event.respondWith(

            caches.match(request)

                .then(cachedResponse => {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(request)

                        .then(response => {

                            if (
                                !response ||
                                response.status !== 200
                            ) {

                                return response;

                            }


                            const responseToCache =
                                response.clone();


                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseToCache
                                    );

                                })
                                .catch(error => {

                                    console.warn(
                                        "[SW] Cache put failed:",
                                        error
                                    );

                                });


                            return response;

                        });

                })

                .catch(error => {

                    console.warn(
                        "[SW] App/asset fetch failed:",
                        error
                    );


                    return caches.match(request)
                        .then(cachedResponse => {

                            if (cachedResponse) {

                                return cachedResponse;

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

                        });

                })

        );


        return;

    }


    // ========================================================
    // Normal local website files
    // Network First
    // ========================================================

    event.respondWith(

        fetch(request)

            .then(response => {

                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const responseToCache =
                        response.clone();


                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                request,
                                responseToCache
                            );

                        })
                        .catch(error => {

                            console.warn(
                                "[SW] Cache update failed:",
                                error
                            );

                        });

                }


                return response;

            })

            .catch(() => {

                return caches.match(request)

                    .then(cachedResponse => {

                        if (cachedResponse) {

                            return cachedResponse;

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

                    });

            })

    );

});
const CACHE_NAME = "halal-tech-v8";

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

    console.log(
        "[SW] Installing:",
        CACHE_NAME
    );

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

    console.log(
        "[SW] Activating:",
        CACHE_NAME
    );

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )

                        .map(
                            name =>
                                caches.delete(name)
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


    // ========================================================
    // Only GET requests
    // ========================================================

    if (
        request.method !== "GET"
    ) {

        return;

    }


    const url =
        new URL(request.url);


    // ========================================================
    // Never intercept external requests
    // ========================================================

    if (
        url.origin !== self.location.origin
    ) {

        return;

    }


    // ========================================================
    // FIX GITHUB PAGES PATH
    //
    // Example:
    //
    // /assets/wallpapers/004.jpg
    //
    // becomes:
    //
    // /halal-tech/assets/wallpapers/004.jpg
    //
    // ========================================================

    let fixedURL = null;


    if (
        url.pathname.startsWith("/assets/")
    ) {

        fixedURL =
            new URL(
                BASE_PATH +
                url.pathname.substring(
                    "/".length
                ),
                url.origin
            );

    }


    else if (
        url.pathname.startsWith("/apps/")
    ) {

        fixedURL =
            new URL(
                BASE_PATH +
                url.pathname.substring(
                    "/".length
                ),
                url.origin
            );

    }


    // ========================================================
    // If we fixed the URL
    // ========================================================

    if (fixedURL) {

        console.log(
            "[SW] Fixed path:",
            url.pathname,
            "->",
            fixedURL.pathname
        );


        const fixedRequest =
            new Request(
                fixedURL.href,
                {
                    method: request.method,
                    headers: request.headers,
                    mode: request.mode,
                    credentials: request.credentials,
                    cache: request.cache,
                    redirect: request.redirect,
                    referrer: request.referrer,
                    referrerPolicy:
                        request.referrerPolicy
                }
            );


        event.respondWith(

            caches.match(
                fixedRequest
            )

                .then(cachedResponse => {

                    if (cachedResponse) {

                        console.log(
                            "[SW] Fixed request served from cache:",
                            fixedURL.pathname
                        );

                        return cachedResponse;

                    }


                    return fetch(
                        fixedRequest
                    )

                        .then(response => {

                            if (
                                !response ||
                                response.status !== 200
                            ) {

                                return response;

                            }


                            const responseToCache =
                                response.clone();


                            caches.open(
                                CACHE_NAME
                            )

                                .then(cache => {

                                    cache.put(
                                        fixedRequest,
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
                        "[SW] Fixed request failed:",
                        error
                    );


                    return caches.match(
                        fixedRequest
                    )

                        .then(cachedResponse => {

                            if (cachedResponse) {

                                return cachedResponse;

                            }


                            return new Response(
                                "Offline",
                                {
                                    status: 503,
                                    statusText:
                                        "Offline",
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
    // Detect normal App / Asset files
    // ========================================================

    const scopePath =
        new URL(
            self.registration.scope
        ).pathname;


    const isAppFile =
        url.pathname.startsWith(
            scopePath + "apps/"
        );


    const isAssetFile =
        url.pathname.startsWith(
            scopePath + "assets/"
        );


    // ========================================================
    // App / Asset files
    // Cache First
    // ========================================================

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


                            caches.open(
                                CACHE_NAME
                            )

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
                                    statusText:
                                        "Offline",
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


                    caches.open(
                        CACHE_NAME
                    )

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
                                statusText:
                                    "Offline",
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
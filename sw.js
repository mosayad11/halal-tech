const CACHE_NAME = "halal-tech-v1";


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "[SW] Installing new version..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll([
                    "./",
                    "./index.html",
                    "./manifest.json",
                    "./css/style.css",
                    "./js/main.js",
                    "./js/apps.js"
                ]);

            })

    );

    /*
     * Activate the new Service Worker
     * immediately instead of waiting for
     * all old tabs to close.
     */
    self.skipWaiting();

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    console.log(
        "[SW] Activating new version..."
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

                /*
                 * Take control of all open pages
                 */
                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // ============================================
    // APPS FOLDER
    // ============================================

    const isAppFile =
        url.pathname.includes("/halal-tech/apps/");

    const isAssetFile =
        url.pathname.includes("/halal-tech/assets/");

    if (isAppFile || isAssetFile) {

        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {

                    // موجود في الكاش
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // غير موجود → نزله من النت واعمله cache
                    return fetch(event.request)
                        .then(response => {

                            if (!response || response.status !== 200) {
                                return response;
                            }

                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(
                                        event.request,
                                        responseToCache
                                    );
                                });

                            return response;
                        });
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );

        return;
    }

    // ============================================
    // OTHER FILES
    // ============================================

    event.respondWith(
        fetch(event.request)
            .then(response => {

                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {
                    const clone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, clone);
                        });
                }

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
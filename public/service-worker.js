const FILES_TO_CACHE = [
    "/index.html",
    "/css/styles.css",
    "/js/index.js",
    "/js/idb.js",
    "/"
];

const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// self.addEventListener('fetch', function (e) {
//     console.log('fetch request : ' + e.request.url)
//     e.respondWith(
//         caches.match(e.request).then(function (request) {
//             if (request) { // if cache is available, respond with cache
//                 console.log('responding with cache : ' + e.request.url)
//                 return request
//             } else {       // if there are no cache, try fetching request
//                 console.log('file is not cached, fetching : ' + e.request.url)
//                 return fetch(e.request)
//             }
//         })
//     )
// })

// fetch
self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/")) {
        e.respondWith(
            caches.open(CACHE_NAME + 'data').then(cache => {
                return fetch(e.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(e.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    e.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(e.request).then(response => {
                return response || fetch(e.request);
            });
        })
    );
});
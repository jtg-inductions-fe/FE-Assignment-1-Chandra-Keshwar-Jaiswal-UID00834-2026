import { URL, CACHE_NAME, CACHE_KEY } from './constants';

async function getDeals() {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(CACHE_KEY);
    if (cachedResponse) {
        return await cachedResponse.json();
    }
    const response = await fetch(URL);
    const data = await response.json();
    await cache.put(CACHE_KEY, response.clone());
    return data;
}
getDeals();

import { URL, CACHE_NAME, CACHE_KEY } from './constants';

/**
 * Retrieves deal data from Cache Storage or fetches it from the deals API.
 *
 * A successful API response is cached so subsequent loads can reuse it.
 *
 * @async
 * @returns {Promise<Array<Object>>} The raw deals returned by the API.
 */
async function getDeals() {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(CACHE_KEY);
    if (cachedResponse) {
        return await cachedResponse.json();
    }
    const response = await fetch(URL);
    await cache.put(CACHE_KEY, response.clone());
    return await response.json();
}
getDeals();

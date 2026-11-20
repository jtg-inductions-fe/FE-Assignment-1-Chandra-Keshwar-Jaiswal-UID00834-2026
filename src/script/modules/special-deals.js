import {
    URL,
    CACHE_NAME,
    CACHE_KEY,
    DEFAULT_VALIDITY_DAYS,
    STORAGE_KEY,
    state,
    ONE_DAY_IN_MS,
    WHEEL_SIZE,
} from './constants.js';

/**
 * Retrieves deal data from Cache Storage or fetches it from the deals API.
 * A successful API response is cached so subsequent loads can reuse it.
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

/**
 * Converts API deal records into the application's normalized deal shape.
 * @param {Array<Object>} apiDeals - Raw deal records returned by the API.
 * @returns {Array<{label: string, promoCode: string, validFor: number}>}
 * Normalized deals with a default validity period when one is not provided.
 */
function normalizeDeals(apiDeals) {
    return apiDeals.map((deal) => ({
        label: deal.label,
        promoCode: deal.promoCode,
        validFor: Number(deal.validFor) || DEFAULT_VALIDITY_DAYS,
    }));
}

/**
 * Loads the saved wheel and won-deal data from local storage.
 * Invalid or unavailable JSON is treated as an empty user-data object.
 * @returns {Object} The parsed user data, or an empty object when unavailable.
 */
function loadUserData() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

/**
 * Persists the user's won deals and current wheel arrangement in local storage.
 * Wheel entries are stored as promo codes; empty segments are stored as null.
 * @returns {void}
 */
function saveUserData() {
    const userData = {
        wonDeals: state.wonDeals,
        wheelPromoCodes: state.wheelDeals.map(
            (deal) => deal?.promoCode ?? null,
        ),
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch {
        return;
    }
}

/**
 * Calculates the timestamp at which a won deal expires.
 * @param {{wonAt: number, validFor: number}} deal - A won deal.
 * @returns {number} Expiry timestamp in milliseconds since the Unix epoch.
 */
function getExpiryTime(deal) {
    return deal.wonAt + deal.validFor * ONE_DAY_IN_MS;
}

/**
 * Checks whether a won deal has reached or passed its expiry timestamp.
 * @param {{wonAt: number, validFor: number}} deal - A won deal.
 * @returns {boolean} True when the deal has expired; otherwise false.
 */
function isDealExpired(deal) {
    return Date.now() >= getExpiryTime(deal);
}

/**
 * Calculates the number of whole or partial days remaining before expiry.
 * @param {{wonAt: number, validFor: number}} deal - A won deal.
 * @returns {number} Remaining days, rounded up and with a minimum of one.
 */
function getRemainingDays(deal) {
    const remainingTime = getExpiryTime(deal) - Date.now();
    return Math.ceil(remainingTime / ONE_DAY_IN_MS);
}

/**
 * Builds the validity label displayed on a won-deal card.
 * @param {{wonAt: number, validFor: number}} deal - A won deal.
 * @returns {string} Either "Expired" or a remaining-days label.
 */
function getValidityText(deal) {
    if (isDealExpired(deal)) {
        return 'Expired';
    }

    return `Expires in ${getRemainingDays(deal)}d`;
}

/**
 * Returns deals that the user has not already won.
 * @returns {Array<Object>} Eligible deals from the current deal collection.
 */
function getEligibleDeals() {
    const wonPromoCodes = new Set(state.wonDeals.map((deal) => deal.promoCode));
    return state.deals.filter((deal) => !wonPromoCodes.has(deal.promoCode));
}

/**
 * Returns a shuffled copy of the supplied deals using Fisher-Yates shuffle.
 * The input array is not mutated.
 * @param {Array<Object>} deals - Items to shuffle.
 * @returns {Array<Object>} A shuffled copy of the input array.
 */
function shuffleDeals(deals) {
    const shuffledDeals = [...deals];
    for (let i = shuffledDeals.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledDeals[i], shuffledDeals[randomIndex]] = [
            shuffledDeals[randomIndex],
            shuffledDeals[i],
        ];
    }

    return shuffledDeals;
}

/**
 * Prepares the wheel with a randomized set of eligible deals.
 * Empty slots are represented by null when fewer than WHEEL_SIZE deals are available.
 * @returns {Array<Object|null>} The deals and empty slots for the wheel.
 */
function prepareWheel() {
    const eligibleDeals = getEligibleDeals();
    while (eligibleDeals.length < WHEEL_SIZE) {
        eligibleDeals.push(null);
    }
    return shuffleDeals(eligibleDeals).slice(0, WHEEL_SIZE);
}

/**
 * Restores won deals and the saved wheel arrangement from local storage.
 * If the saved wheel is missing, a new arrangement is prepared.
 * @returns {void}
 */
function restoreUserState() {
    const savedData = loadUserData();
    state.wonDeals = Array.isArray(savedData.wonDeals)
        ? savedData.wonDeals
        : [];

    const savedWheel = savedData.wheelPromoCodes;
    if (!Array.isArray(savedWheel)) {
        state.wheelDeals = prepareWheel();
        saveUserData();
        return;
    }

    const eligibleDeals = getEligibleDeals();
    const eligibleDealMap = new Map(
        eligibleDeals.map((deal) => [deal.promoCode, deal]),
    );

    state.wheelDeals = savedWheel.map(
        (promoCode) => eligibleDealMap.get(promoCode) ?? null,
    );

    saveUserData();
}
const deals = normalizeDeals(await getDeals());
getValidityText(deals[0]);
restoreUserState();

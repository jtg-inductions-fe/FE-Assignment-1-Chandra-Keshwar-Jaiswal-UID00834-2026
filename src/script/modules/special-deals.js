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

function normalizeDeals(apiDeals) {
    return apiDeals.map((deal) => ({
        label: deal.label,
        promoCode: deal.promoCode,
        validFor: Number(deal.validFor) || DEFAULT_VALIDITY_DAYS,
    }));
}

function loadUserData() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveUserData() {
    const userData = {
        wonDeals: state.wonDeals,
        wheelPromoCodes: state.wheelDeals.map(
            (deal) => deal?.promoCode ?? null,
        ),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

function getExpiryTime(deal) {
    return deal.wonAt + deal.validFor * ONE_DAY_IN_MS;
}

function isDealExpired(deal) {
    return Date.now() >= getExpiryTime(deal);
}

function getRemainingDays(deal) {
    const remainingTime = getExpiryTime(deal) - Date.now();
    return Math.max(1, Math.ceil(remainingTime / ONE_DAY_IN_MS));
}

function getValidityText(deal) {
    if (isDealExpired(deal)) {
        return 'Expired';
    }

    return `Expires in ${getRemainingDays(deal)}d`;
}

function getEligibleDeals() {
    const wonPromoCodes = new Set(state.wonDeals.map((deal) => deal.promoCode));
    return state.deals.filter((deal) => !wonPromoCodes.has(deal.promoCode));
}

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

function prepareWheel() {
    const eligibleDeals = getEligibleDeals();
    while (eligibleDeals.length < WHEEL_SIZE) {
        eligibleDeals.push(null);
    }
    return shuffleDeals(eligibleDeals).slice(0, WHEEL_SIZE);
}

function restoreUserState() {
    const savedData = loadUserData();
    state.wonDeals = Array.isArray(savedData.wonDeals)
        ? savedData.wonDeals
        : [];

    const savedWheel = savedData.wheelPromoCodes;
    if (!Array.isArray(savedWheel) || savedWheel.length !== WHEEL_SIZE) {
        state.wheelDeals = prepareWheel();
        saveUserData();
        return;
    }

    const eligibleDeals = getEligibleDeals();
    const eligibleDealMap = new Map(
        eligibleDeals.map((deal) => [deal.promoCode, deal]),
    );

    state.wheelDeals = savedWheel.map((promoCode) =>
        promoCode === null ? null : (eligibleDealMap.get(promoCode) ?? null),
    );

    saveUserData();
}
const deals = normalizeDeals(getDeals());
getValidityText(deals[0]);
restoreUserState();

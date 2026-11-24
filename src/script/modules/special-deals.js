import {
    URL,
    CACHE_NAME,
    CACHE_KEY,
    DEFAULT_VALIDITY_DAYS,
    STORAGE_KEY,
    state,
    ONE_DAY_IN_MS,
    WHEEL_SIZE,
    COPY_DISABLED_SVG_PATH,
    SEGMENT_ANGLES,
    FULL_ROTATIONS,
    RESULT_DISPLAY_DELAY,
    CHECK_SVG_PATH,
    COPY_SVG_PATH,
} from './constants.js';

const wheel = document.querySelector('.wheel__body--wheel');
const wheelSegments = document.querySelector('.wheel__segments');
const spinButton = document.querySelector('[data-action="spin"]');
const wheelResult = document.querySelector('.wheel__reward');
const wheelSegmentTemplate = document.querySelector('#wheel-segment-template');
const dealCardTemplate = document.querySelector('#deal-card-template');
const dealsList = document.querySelector('.deal-section__list');
const unlockedDealsCount = document.querySelector('.wheel__counter');
const selectedReward = document.querySelector('.wheel__reward-details');
const wheelSection = document.querySelector('.wheel');
const dealsSection = document.querySelector('.deal-section');
const loadingView = document.querySelector('.wheel__loading');
const interactiveView = document.querySelector('.wheel__interactive');
const specialDealsDialog = document.querySelector('#special-deals-dialog');
const openButton = document.querySelector('#special-deals');

let isInitialized = false;
let initializationPromise = null;

/**
 * Returns cached deals or fetches and caches them from the API.
 * @returns {Promise<Array<Object>>} Raw deal records.
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
 * Normalizes API deals and applies default validity days if missing.
 * @param {Array<Object>} apiDeals - Raw API deals.
 * @returns {Array<{label: string, promoCode: string, validFor: number}>} Normalized deals.
 */
function normalizeDeals(apiDeals) {
    return apiDeals.map((deal) => ({
        label: deal.label,
        promoCode: deal.promoCode,
        validFor: Number(deal.validFor) || DEFAULT_VALIDITY_DAYS,
    }));
}

/**
 * Reads saved user data from local storage, or returns `{}` on error.
 * @returns {Object} Parsed user data.
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
 * Saves won deals and wheel promo codes to local storage.
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
 * Returns a deal's expiration timestamp in milliseconds.
 * @param {{wonAt: number, validFor: number}} deal - Won deal object.
 * @returns {number} Expiry timestamp.
 */
function getExpiryTime(deal) {
    return deal.wonAt + deal.validFor * ONE_DAY_IN_MS;
}

/**
 * Checks whether a won deal is expired.
 * @param {{wonAt: number, validFor: number}} deal - Won deal object.
 * @returns {boolean} True if expired.
 */
function isDealExpired(deal) {
    return Date.now() >= getExpiryTime(deal);
}

/**
 * Calculates days remaining until a deal expires.
 * @param {{wonAt: number, validFor: number}} deal - Won deal object.
 * @returns {number} Remaining days (rounded up).
 */
function getRemainingDays(deal) {
    const remainingTime = getExpiryTime(deal) - Date.now();
    return Math.ceil(remainingTime / ONE_DAY_IN_MS);
}

/**
 * Formats a deal's expiry status text for display.
 * @param {{wonAt: number, validFor: number}} deal - Won deal object.
 * @returns {string} `"Expired"` or `"Expires in <n>d"`.
 */
function getValidityText(deal) {
    if (isDealExpired(deal)) {
        return 'Expired';
    }

    return `Expires in ${getRemainingDays(deal)}d`;
}

/**
 * Filters out deals already won by the user.
 * @returns {Array<Object>} Unwon deals.
 */
function getEligibleDeals() {
    const wonPromoCodes = new Set(state.wonDeals.map((deal) => deal.promoCode));

    return state.deals.filter((deal) => !wonPromoCodes.has(deal.promoCode));
}

/**
 * Returns a non-mutating Fisher-Yates shuffled copy of deals.
 * @param {Array<Object>} deals - Deals to shuffle.
 * @returns {Array<Object>} Shuffled deals.
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
 * Builds a randomized wheel array padded with `null` up to `WHEEL_SIZE`.
 * @returns {Array<Object|null>} Wheel slots.
 */
function prepareWheel() {
    const eligibleDeals = getEligibleDeals();
    while (eligibleDeals.length < WHEEL_SIZE) {
        eligibleDeals.push(null);
    }
    return shuffleDeals(eligibleDeals).slice(0, WHEEL_SIZE);
}

/**
 * Restores won deals and wheel slots from storage, or initializes a new wheel.
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

/**
 * Renders wheel segments from `state.wheelDeals`.
 * @returns {void}
 */
function renderWheel() {
    wheelSegments.replaceChildren();
    state.wheelDeals.forEach((deal) => {
        const fragment = wheelSegmentTemplate.content.cloneNode(true);
        const title = fragment.querySelector('.wheel__segment-title');
        title.textContent = deal?.label ?? 'No Coupon';
        wheelSegments.append(fragment);
    });
}

/**
 * Builds a deal card fragment and disables copy if expired.
 * @param {Object} deal - Deal object to render.
 * @returns {DocumentFragment} Populated deal card fragment.
 */
function createDealCard(deal) {
    const fragment = dealCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.deal-card');
    card.querySelector('.wheel__deal-label').textContent = deal.label;
    card.querySelector('.wheel__description').textContent =
        getValidityText(deal);
    card.querySelector('.wheel__deal-code').textContent = deal.promoCode;

    const expired = isDealExpired(deal);
    const copyButton = card.querySelector('[data-action="copy-code"]');
    if (expired) {
        card.classList.add('deal-card--expired');
        copyButton.disabled = true;
        copyButton.querySelector('img').src = COPY_DISABLED_SVG_PATH;
    }
    return fragment;
}

/**
 * Renders won deals (active first, sorted by expiry) and updates counter.
 * @returns {void}
 */
function renderUnlockedDeals() {
    dealsList.replaceChildren();
    const sortedDeals = [...state.wonDeals].sort((a, b) => {
        const aExpired = isDealExpired(a);
        const bExpired = isDealExpired(b);
        if (aExpired !== bExpired) {
            return aExpired ? 1 : -1;
        }
        return getExpiryTime(b) - getExpiryTime(a);
    });
    sortedDeals.forEach((deal) => {
        dealsList.append(createDealCard(deal));
    });
    unlockedDealsCount.textContent = String(state.wonDeals.length);
}

/**
 * Displays the latest spin result ("Try Again" or won deal card).
 * @param {Object|null} deal - Won deal object, or null if no deal was won.
 * @returns {void}
 */
function renderResult(deal) {
    const resultLabel = wheelResult.querySelector('.wheel__deal-label');
    wheelResult.hidden = false;

    if (!deal) {
        resultLabel.textContent = 'Try Again';
        selectedReward.hidden = true;
        return;
    }

    resultLabel.textContent = 'You Won!';
    selectedReward.hidden = false;
    selectedReward.replaceChildren(createDealCard(deal));
}

/**
 * Toggles visibility between wheel and deals sections.
 * @param {'wheel'|'deals'} view - Target view.
 * @returns {void}
 */
function setView(view) {
    state.currentView = view;
    wheelSection.hidden = view !== 'wheel';
    dealsSection.hidden = view !== 'deals';
}

/**
 * Shows the loading view while deals initialize.
 * @returns {void}
 */
function showLoadingView() {
    state.currentView = 'loading';
    wheelSection.hidden = false;
    dealsSection.hidden = true;
    loadingView.hidden = false;
    interactiveView.hidden = true;
}

/**
 * Removes the spinning class and snaps the wheel to 0deg.
 * @returns {void}
 */
function resetWheelTransform() {
    wheel.classList.remove('wheel__body--spinning');
    wheel.style.transform = 'rotate(0deg)';
}

/**
 * Adds a `wonAt` timestamp, saves the deal, updates storage, and re-renders deals.
 * @param {Object} deal - Deal won on the current spin.
 * @returns {Object} Deal with `wonAt` timestamp.
 */
function recordWinningDeal(deal) {
    const winningDeal = { ...deal, wonAt: Date.now() };
    state.wonDeals.push(winningDeal);
    saveUserData();
    renderUnlockedDeals();
    return winningDeal;
}

/**
 * Replaces the won segment with an unused eligible deal or `null`.
 * @returns {void}
 */
function replaceWonSegment() {
    if (state.selectedIndex === null) return;

    const currentSlotDeal = state.wheelDeals[state.selectedIndex];
    if (!currentSlotDeal) return;

    const activeWheelCodes = new Set(
        state.wheelDeals.filter(Boolean).map((deal) => deal.promoCode),
    );
    const availableReplacements = getEligibleDeals().filter(
        (deal) => !activeWheelCodes.has(deal.promoCode),
    );

    state.wheelDeals[state.selectedIndex] =
        shuffleDeals(availableReplacements)[0] ?? null;
}

/**
 * Picks a random segment, enables the spin class, and rotates the wheel.
 * @returns {void}
 */
function spinWheel() {
    if (state.isSpinning) return;

    state.isSpinning = true;
    state.selectedIndex = null;
    spinButton.disabled = true;
    wheelResult.hidden = true;

    state.selectedIndex = Math.floor(Math.random() * WHEEL_SIZE);

    const segmentAngle = SEGMENT_ANGLES[state.selectedIndex];
    const targetRotation = FULL_ROTATIONS * 360 - segmentAngle;
    wheel.classList.add('wheel__body--spinning');
    wheel.style.transform = `rotate(${targetRotation}deg)`;
}

/**
 * Records a win, displays the result, and schedules `finishSpin`.
 * @returns {void}
 */
function handleSpinComplete() {
    if (!state.isSpinning || state.selectedIndex === null) return;

    const selectedDeal = state.wheelDeals[state.selectedIndex];
    const wonDeal = selectedDeal ? recordWinningDeal(selectedDeal) : null;

    renderResult(wonDeal);
    window.setTimeout(finishSpin, RESULT_DISPLAY_DELAY);
}

/**
 * Updates wheel segments, saves state, resets rotation, and re-enables spin.
 * @returns {void}
 */
function finishSpin() {
    replaceWonSegment();
    saveUserData();
    renderWheel();
    resetWheelTransform();
    state.selectedIndex = null;
    state.isSpinning = false;
    spinButton.disabled = false;
}

/**
 * Copies the deal code to clipboard and briefly swaps the copy icon.
 * @param {HTMLButtonElement} element - Clicked copy button.
 * @returns {Promise<void>}
 */
async function handleCopyCode(element) {
    const dealCard = element.closest('.deal-card');
    const code = dealCard.querySelector('.wheel__deal-code').textContent;
    const dealMap = new Map(
        state.wonDeals.map((deal) => [deal.promoCode, deal]),
    );
    const deal = dealMap.get(code);
    if (isDealExpired(deal)) {
        renderUnlockedDeals();
        return;
    }

    try {
        await navigator.clipboard.writeText(code);
        const copyImg = element.querySelector('img');
        copyImg.src = CHECK_SVG_PATH;
        window.setTimeout(() => {
            copyImg.src = COPY_SVG_PATH;
        }, 2000);
    } catch (error) {
        console.error('Failed to copy code:', error);
    }
}

/**
 * Fetches deals, restores user state, and renders initial wheel and deals views.
 * @returns {Promise<void>}
 */
async function initialize() {
    showLoadingView();
    const apiDeals = await getDeals();
    state.deals = normalizeDeals(apiDeals);
    restoreUserState();
    renderWheel();
    renderUnlockedDeals();
    loadingView.hidden = true;
    interactiveView.hidden = false;
    setView('wheel');
}

/**
 * Sets up Special Deals dialog actions, spin events, and lazy initialization.
 * @param {Object} [options] - Optional dialog callbacks.
 * @param {() => void} [options.onDialogChange] - Runs when dialog opens or closes.
 * @returns {void}
 */
export function initSpecialDeals({ onDialogChange }) {
    if (!specialDealsDialog || !openButton || !wheel) return;

    specialDealsDialog.addEventListener('click', (event) => {
        if (event.target === specialDealsDialog && !state.isSpinning) {
            specialDealsDialog.close();
            return;
        }

        const actionElement = event.target.closest('[data-action]');
        if (!actionElement) return;

        const action = actionElement.dataset.action;

        if (action === 'spin') {
            spinWheel();
        } else if (action === 'view-deals') {
            if (state.isSpinning) return;
            renderUnlockedDeals();
            setView('deals');
        } else if (action === 'back-to-wheel') {
            setView('wheel');
        } else if (action === 'close') {
            if (!state.isSpinning) {
                specialDealsDialog.close();
            }
        } else if (action === 'copy-code') {
            handleCopyCode(actionElement);
        }
    });

    specialDealsDialog.addEventListener('cancel', (event) => {
        if (state.isSpinning) {
            event.preventDefault();
            return;
        }
        window.location.replace('http://localhost:3000/');
    });

    wheel.addEventListener('transitionend', (event) => {
        if (event.target !== wheel || event.propertyName !== 'transform') {
            return;
        }
        handleSpinComplete();
    });

    openButton.addEventListener('click', async () => {
        if (!specialDealsDialog.open) {
            specialDealsDialog.showModal();
        }

        onDialogChange();

        if (isInitialized) {
            resetWheelTransform();
            setView('wheel');
            return;
        }

        if (initializationPromise) {
            return;
        }

        try {
            initializationPromise = initialize();
            await initializationPromise;
            isInitialized = true;
        } catch (error) {
            console.error(error);
            showLoadingView();
        } finally {
            initializationPromise = null;
        }
    });

    specialDealsDialog.addEventListener('close', () => {
        onDialogChange();
        resetWheelTransform();
        wheelResult.hidden = true;
        selectedReward.hidden = true;
        state.selectedIndex = null;
        window.location.replace('http://localhost:3000/');
    });
}

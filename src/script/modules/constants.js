export const URL =
    'https://gist.githubusercontent.com/ameer-wajid-ali/1f29ebee4295cede36f8d74b45e576df/raw/122966c9a123861249f173911d8d93a76dc06d7a/';
export const state = {
    deals: [],
    wheelDeals: [],
    wonDeals: [],
    selectedDeal: null,
    currentView: 'loading',
    isSpinning: false,
    rotation: 0,
};
export const CACHE_NAME = 'special-deals-api';
export const CACHE_KEY = 'special-deals-api-response';
export const COPY_SVG_PATH = 'public/assets/images/copy.svg';
export const COPY_DISABLED_SVG_PATH = 'public/assets/images/copy-disabled.svg';
export const STORAGE_KEY = 'special-deals-user-state';
export const WHEEL_SIZE = 4;
export const DEFAULT_VALIDITY_DAYS = 7;
export const ONE_DAY_IN_SEC = 8640000;
export const SPIN_DURATION = 5000;
export const FULL_ROTATIONS = 6;
export const SEGMENT_ANGLES = [45, 135, 225, 315];

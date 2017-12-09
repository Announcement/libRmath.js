export * from './c99_gamma';
export * from './dgamma';
export * from './gamma_cody';
import { gammafn } from './gamma_fn';
export * from './gammalims';
export * from './lgamma_fn';
export * from './lgammacor';
export * from './pgamma';
export * from './polygamma';
export * from './qgamma';
export * from './rgamma';
export { gammafn };

export const gamma = {
    gamma: gammafn
};

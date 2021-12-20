/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABGCAYAAACUsCfoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMJJREFUeNrs3M0JhDAQBtDEH7QcS9jS7GBbsxdPIuqqJ1kIyJLLyvtgmCGBwCP3iX3fv4ui6MqyDEftc7gzp7Jt21nXOcdZ5jeHKsbY1XX9ats23K2maZLwdV3Dsixnv87fPefdL2+lv+7hAQcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH/8dUx6KIeZ7P3QnTNIVxHB+/HGPP8BFgANTMW0xuY9ZuAAAAAElFTkSuQmCC';
export default image;
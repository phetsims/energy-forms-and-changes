/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
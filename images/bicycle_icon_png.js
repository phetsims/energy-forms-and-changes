/* eslint-disable */
var img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
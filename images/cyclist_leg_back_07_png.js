/* eslint-disable */
var img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
/* eslint-disable */
var img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
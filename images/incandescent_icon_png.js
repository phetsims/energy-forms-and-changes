/* eslint-disable */
var img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAeCAYAAADU8sWcAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASRJREFUeNpiZCANNOAQXwDED/Co3wDEFwgZHgDE94FYAIf8fxzYgQj19/GoY+hHUlhAA8thOAEmyQilQZr3I2kCBZEhlYJdHtlCIPgANRuu/jySy87jCXZygQEQv4eavx/KBwMBtGBRYKANcMAWPQ5ovqYbYIT63AApPi4wjAI6BDs9AXKCO0Bvy/8je5xpIIOdCS2r7ae35QPq85FpOctAZu0B9flo2T5atg9o2Z5Ag/YbNl9/QJYoQGrgzaeBxQJojdT5yIXMByQfJ0AbkQtB8YKjSWyAI4QeYFGvAK2wkBumC9E1rsfSwMfVTt+Po0PQgMPX77GpQY7zQCCeQIMg/wDtq4HoQmTL0ct2kOREaNDb4whyBjylIC71IHMb0eUBAgwAafNmfjSmbaIAAAAASUVORK5CYII=';
export default image;
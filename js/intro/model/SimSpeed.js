// Copyright 2018-2020, University of Colorado Boulder

/**
 * enum for sim speed settings
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const SimSpeed = Enumeration.byKeys( [ 'NORMAL', 'FAST_FORWARD' ] );

energyFormsAndChanges.register( 'SimSpeed', SimSpeed );
export default SimSpeed;
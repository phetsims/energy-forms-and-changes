// Copyright 2016-2021, University of Colorado Boulder

/**
 * base class for energy sources, converters, and users, that can be connected together to create what is referred to
 * as an "energy system" in this simulation
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import PositionableFadableModelElement from './PositionableFadableModelElement.js';

class EnergySystemElement extends PositionableFadableModelElement {

  /**
   * @param {Image} iconImage
   * @param {Object} [options]
   */
  constructor( iconImage, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioState: false
    }, options );

    super( new Vector2( 0, 0 ), 1.0, options );

    // @public (read-only) {image}
    this.iconImage = iconImage;

    // @public (read-only) {ObservableArrayDef.<EnergyChunk>}
    this.energyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    // @public {BooleanProperty}
    this.activeProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'activeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the system element is active. system elements are active when visible on the screen'
    } );

    // @public {string} - a11y name of this energy system element, used by assistive technology, set by sub-types
    this.a11yName = 'name not set';

    // at initialization, oldPosition is null, so skip that case with lazyLink
    this.positionProperty.lazyLink( ( newPosition, oldPosition ) => {

      // When setting PhET-iO state, the EnergyChunk is already in its correct spot, so don't alter that based on Property
      // listeners, see https://github.com/phetsims/energy-forms-and-changes/issues/362
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        const deltaPosition = newPosition.minus( oldPosition );
        this.energyChunkList.forEach( chunk => {
          chunk.translate( deltaPosition.x, deltaPosition.y );
        } );
      }
    } );
  }

  /**
   * activate this element
   * @public
   */
  activate() {
    this.activeProperty.set( true );
  }

  /**
   * deactivate this element - this causes all energy chunks to be removed
   * @public
   */
  deactivate() {
    this.activeProperty.set( false );

    // Don't do this as a listener to activeProperty because we don't want it done during PhET-iO state set
    this.clearEnergyChunks();
  }

  /**
   * clear daughter energy chunks
   * @protected
   */
  clearEnergyChunks() {
    this.energyChunkList.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.energyChunkList.clear();
  }

  /**
   * @abstract
   * @public (EnergySystemElementIO)
   */
  toStateObject() {
    return null; // can be overridden
  }

  /**
   * @abstract
   * @public (EnergySystemElementIO)
   */
  applyState() {
    return null; // can be overridden
  }
}

energyFormsAndChanges.register( 'EnergySystemElement', EnergySystemElement );
export default EnergySystemElement;
// Copyright 2016-2023, University of Colorado Boulder

/**
 * base class for energy sources, converters, and users, that can be connected together to create what is referred to
 * as an "energy system" in this simulation
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import PositionableFadableModelElement, { PositionableFadableModelElementOptions } from './PositionableFadableModelElement.js';

type SelfOptions = EmptySelfOptions;
export type EnergySystemElementOptions = SelfOptions & PositionableFadableModelElementOptions;

class EnergySystemElement extends PositionableFadableModelElement {

  public readonly iconImage: Image;
  public readonly energyChunkList: ObservableArray<EnergyChunk>;
  public readonly activeProperty: BooleanProperty;

  // A11y name of this energy system element, used by assistive technology, set by subtypes
  public a11yName: string;

  public constructor( iconImage: Image, providedOptions?: EnergySystemElementOptions ) {

    const options = optionize<EnergySystemElementOptions, SelfOptions, PositionableFadableModelElementOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioState: false
    }, providedOptions );

    super( new Vector2( 0, 0 ), 1.0, options );

    this.iconImage = iconImage;
    this.energyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),

      // @ts-expect-error
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );
    this.activeProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'activeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the system element is active. system elements are active when visible on the screen'
    } );
    this.a11yName = 'name not set';

    // at initialization, oldPosition is null, so skip that case with lazyLink
    this.positionProperty.lazyLink( ( newPosition, oldPosition ) => {

      // When setting PhET-iO state, the EnergyChunk is already in its correct spot, so don't alter that based on Property
      // listeners, see https://github.com/phetsims/energy-forms-and-changes/issues/362
      if ( !isSettingPhetioStateProperty.value ) {
        const deltaPosition = newPosition.minus( oldPosition );
        this.energyChunkList.forEach( chunk => {
          chunk.translate( deltaPosition.x, deltaPosition.y );
        } );
      }
    } );
  }

  /**
   * activate this element
   */
  public activate(): void {
    this.activeProperty.set( true );
  }

  /**
   * deactivate this element - this causes all energy chunks to be removed
   */
  public deactivate(): void {
    this.activeProperty.set( false );

    // Don't do this as a listener to activeProperty because we don't want it done during PhET-iO state set
    this.clearEnergyChunks();
  }

  /**
   * clear daughter energy chunks
   */
  protected clearEnergyChunks(): void {

    // @ts-expect-error
    this.energyChunkList.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.energyChunkList.clear();
  }

  /**
   * @abstract
   * (EnergySystemElementIO)
   */
  public toStateObject(): null {
    return null; // can be overridden
  }

  /**
   * @abstract
   * (EnergySystemElementIO)
   */
  public applyState(): null {
    return null; // can be overridden
  }
}

energyFormsAndChanges.register( 'EnergySystemElement', EnergySystemElement );
export default EnergySystemElement;
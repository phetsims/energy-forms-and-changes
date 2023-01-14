// Copyright 2016-2023, University of Colorado Boulder

/**
 * a Scenery Node that allows the user to select the various elements contained within a carousel by presenting a set of
 * radio-style push buttons, each with an icon image of the selection that it represents
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EFACConstants from '../../common/EFACConstants.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const BUTTON_IMAGE_HEIGHT_AND_WIDTH = 44; // In screen coordinates, which is close to pixels.

class EnergySystemElementSelector extends Panel {

  /**
   * @param {EnergySystemElementCarousel} carousel
   * @param {Object} [options]
   */
  constructor( carousel, options ) {

    options = merge( {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
      xMargin: 10,
      yMargin: 10,

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    const buttonElementList = [];

    for ( let i = 0; i < carousel.managedElements.length; i++ ) {
      const element = carousel.managedElements[ i ];
      const elementName = carousel.elementNames.VALUES[ i ];
      const iconImage = element.iconImage;
      const width = iconImage.getBounds().getWidth();
      const height = iconImage.getBounds().getHeight();
      const denominator = ( width > height ) ? width : height;

      assert && assert( denominator > 0, 'Largest image dimension = 0 --> division by 0' );

      iconImage.setScaleMagnitude( BUTTON_IMAGE_HEIGHT_AND_WIDTH / denominator );
      buttonElementList.push( {
        value: elementName,
        createNode: () => iconImage,
        tandemName: _.camelCase( `${elementName.name}RadioButton` )
      } );
    }

    const buttonGroup = new RectangularRadioButtonGroup( carousel.targetElementNameProperty, buttonElementList, {
      orientation: 'horizontal',
      spacing: 15,
      radioButtonOptions: {
        baseColor: Color.WHITE
      },
      tandem: options.tandem.createTandem( 'radioButtonGroup' )
    } );

    // link the visibility of the buttons to their corresponding system elements, see https://github.com/phetsims/energy-forms-and-changes/issues/305
    buttonGroup.children.forEach( ( button, index ) => {
      button.visibleProperty.lazyLink( () => {
        carousel.managedElements[ index ].visibleProperty.value = button.visible;
      } );
    } );

    super( buttonGroup, options );
  }
}

energyFormsAndChanges.register( 'EnergySystemElementSelector', EnergySystemElementSelector );
export default EnergySystemElementSelector;
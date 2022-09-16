// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scenery node that represents a beaker in the view. This representation is split between a front node and a back
 * node, which must be separately added to the scene graph. This is done to allow a layering effect. Hence, this cannot
 * be added directly to the scene graph, and the client must add each layer separately.
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Transform3 from '../../../../dot/js/Transform3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EnergyChunkContainerSliceNode from '../../intro/view/EnergyChunkContainerSliceNode.js';
import EFACConstants from '../EFACConstants.js';
import EFACQueryParameters from '../EFACQueryParameters.js';
import EnergyChunkNode from './EnergyChunkNode.js';
import PerspectiveWaterNode from './PerspectiveWaterNode.js';

const waterString = EnergyFormsAndChangesStrings.water;

// constants
const OUTLINE_COLOR = 'rgb( 160, 160, 160 )';
const PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;
const LABEL_FONT = new PhetFont( 26 );
const BEAKER_COLOR = 'rgba( 250, 250, 250, 0.39 )'; // alpha value chosen empirically
const NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK = 4; // number of minor ticks between each major tick. Generalize if needed.

class BeakerView extends PhetioObject {

  /**
   * @param {Beaker} beaker - model of a beaker
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( beaker, energyChunksVisibleProperty, modelViewTransform, options ) {

    options = merge( {
      label: waterString,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: ReferenceIO( IOType.ObjectIO ),
      phetioState: false
    }, options );

    super( options );

    // @private
    this.modelViewTransform = modelViewTransform;
    this.followPosition = true;

    // @public (read-only) {Node} - layer nodes, public so that they can be layered correctly by the screen view, see
    // the header comment for info about how these are used.
    this.frontNode = new Node();
    this.backNode = new Node();
    this.grabNode = new Node( { cursor: 'pointer' } );

    // control the Node properties of all three layers at once
    const visibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'visibleProperty' )
    } );
    visibleProperty.link( visible => {
      this.frontNode.visible = visible;
      this.backNode.visible = visible;
      this.grabNode.visible = visible;
    } );

    // extract the scale transform from the MVT so that we can separate the shape from the position
    const scaleTransform = new Transform3(
      Matrix3.scaling( modelViewTransform.matrix.m00(), modelViewTransform.matrix.m11() )
    );

    // get a Bounds2 object defining the beaker size and position in the view
    const beakerBounds = scaleTransform.transformShape( beaker.getUntransformedBounds() );

    // Create the shapes for the top and bottom of the beaker.  These are ellipses in order to create a 3D-ish look.
    const ellipseHeight = beakerBounds.getWidth() * PERSPECTIVE_PROPORTION;
    const beakerHalfWidth = beakerBounds.width / 2;
    const beakerEllipseHalfHeight = ellipseHeight / 2;
    const topEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.minY, beakerHalfWidth, beakerEllipseHalfHeight, 0 );
    const bottomEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.maxY, beakerHalfWidth, beakerEllipseHalfHeight, 0 );

    // @private - Add the fluid.  It will adjust its size based on the fluid level.
    this.fluid = new PerspectiveWaterNode(
      beakerBounds,
      beaker.fluidProportionProperty,
      beaker.temperatureProperty,
      beaker.fluidBoilingPoint,
      beaker.fluidColor,
      beaker.steamColor
    );
    this.frontNode.addChild( this.fluid );

    // create and add the node for the body of the beaker
    const beakerBody = new Shape()
      .moveTo( beakerBounds.minX, beakerBounds.minY ) // Top left of the beaker body.
      .ellipticalArc( beakerBounds.centerX, beakerBounds.minY, beakerHalfWidth, beakerEllipseHalfHeight, 0, Math.PI, 0, true )
      .lineTo( beakerBounds.maxX, beakerBounds.maxY ) // Bottom right of the beaker body.
      .ellipticalArc( beakerBounds.centerX, beakerBounds.maxY, beakerHalfWidth, beakerEllipseHalfHeight, 0, 0, Math.PI, false )
      .close();

    this.frontNode.addChild( new Path( beakerBody, {
      fill: BEAKER_COLOR,
      lineWidth: 3,
      stroke: OUTLINE_COLOR
    } ) );

    // vars used for drawing the tick marks
    const numberOfMajorTicks = Math.floor( beaker.height / beaker.majorTickMarkDistance );
    const numberOfTicks = numberOfMajorTicks * ( NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK + 1 ); // total number of ticks
    const majorTickLengthAngle = 0.13 * Math.PI; // empirically determined
    const minorTickLengthAngle = majorTickLengthAngle / 2; // empirically determined
    const spaceBetweenEachTickMark = Math.abs( modelViewTransform.modelToViewDeltaY( beaker.majorTickMarkDistance ) /
                                               ( NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK + 1 ) );

    // x-distance between the left edge of the beaker and the start of the ticks along an ellipse, in radians
    const xOriginAngle = 0.1 * Math.PI;
    let yPosition = beakerBounds.maxY;

    // create the tick marks shape
    const tickMarks = new Shape().moveTo( beakerBounds.minX, beakerBounds.maxY ); // bottom left of the beaker body

    // draw the tick marks
    for ( let tickIndex = 0; tickIndex < numberOfTicks; tickIndex++ ) {
      yPosition -= spaceBetweenEachTickMark;
      const startAngle = Math.PI - xOriginAngle;
      const tickLengthAngle = ( tickIndex + 1 ) % ( NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK + 1 ) === 0 ? majorTickLengthAngle : minorTickLengthAngle;
      const endAngle = startAngle - tickLengthAngle;

      tickMarks.newSubpath(); // don't connect the tick marks with additional lines
      tickMarks.ellipticalArc(
        beakerBounds.centerX,
        yPosition,
        beakerHalfWidth,
        beakerEllipseHalfHeight,
        0,
        startAngle,
        endAngle,
        true
      );
    }

    // add the tick marks
    this.frontNode.addChild( new Path( tickMarks, {
      lineWidth: 1,
      stroke: 'black'
    } ) );

    // add the bottom ellipse
    this.backNode.addChild( new Path( bottomEllipse, {
      fill: BEAKER_COLOR,
      lineWidth: 3,
      stroke: OUTLINE_COLOR
    } ) );

    // Add the top ellipse.  It is behind the water for proper Z-order behavior.
    this.backNode.addChild( new Path( topEllipse, {
      fill: BEAKER_COLOR,
      stroke: OUTLINE_COLOR,
      lineWidth: 3
    } ) );

    // add a rectangle to the back that is invisible but allows the user to grab the beaker
    this.backNode.addChild( new Rectangle( beakerBounds, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) );

    // Make the front and back nodes non-pickable so that the grab node can be used for grabbing. This makes it possible
    // to remove things from the beaker.
    this.frontNode.pickable = false;
    this.backNode.pickable = false;

    // add the label, positioning it just below the front, top water line
    const labelText = new RichText( options.label, {
      font: LABEL_FONT,
      maxWidth: beakerBounds.width * 0.7, // empirically determined to look nice
      tandem: options.tandem.createTandem( 'labelText' ),
      phetioVisiblePropertyInstrumented: true
    } );

    labelText.translation = new Vector2(
      beakerBounds.centerX - labelText.bounds.width / 2,
      beakerBounds.maxY - beakerBounds.height * beaker.fluidProportionProperty.value + topEllipse.bounds.height * 1.1
    );
    labelText.pickable = false;
    this.frontNode.addChild( labelText );

    // @protected {Node} - the layer where the contained energy chunk nodes will be placed
    this.energyChunkRootNode = new Node();
    this.backNode.addChild( this.energyChunkRootNode );

    // add the energy chunk container slice nodes to the energy chunk layer
    beaker.slices.forEach( slice => {
      this.energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( slice, modelViewTransform ) );
    } );

    // Watch for coming and going of energy chunks that are approaching this model element and add/remove them as
    // needed.
    beaker.approachingEnergyChunks.addItemAddedListener( addedEnergyChunk => {
      const energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      this.energyChunkRootNode.addChild( energyChunkNode );

      const removalListener = removedEnergyChunk => {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          this.energyChunkRootNode.removeChild( energyChunkNode );
          energyChunkNode.dispose();
          beaker.approachingEnergyChunks.removeItemRemovedListener( removalListener );
        }
      };
      beaker.approachingEnergyChunks.addItemRemovedListener( removalListener );
    } );

    // add the node that can be used to grab and move the beaker
    const grabNodeShape = beakerBody;
    this.grabNode.addChild( new Path( grabNodeShape, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) ); // invisible, yet pickable
    this.grabNode.addChild( new Path( topEllipse, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) );

    // if enabled (for debug), show the outline of the rectangle that represents the beaker's position in the model
    if ( EFACQueryParameters.show2DBeakerBounds ) {
      this.frontNode.addChild( new Rectangle( beakerBounds, {
        fill: 'red',
        stroke: 'lime',
        lineWidth: 2
      } ) );
    }

    // update the offset if and when the model position changes
    beaker.positionProperty.link( position => {

      if ( this.followPosition ) {
        const offset = modelViewTransform.modelToViewPosition( position );

        this.frontNode.translation = offset;
        this.backNode.translation = offset;
        this.grabNode.translation = offset;
      }

      // compensate the energy chunk layer so that the energy chunk nodes can handle their own positioning
      this.energyChunkRootNode.translation = modelViewTransform.modelToViewPosition( position ).rotated( Math.PI );
    } );

    // adjust the transparency of the water and label based on energy chunk visibility
    energyChunksVisibleProperty.link( energyChunksVisible => {
      labelText.opacity = energyChunksVisible ? 0.5 : 1;
      const opacity = EFACConstants.NOMINAL_WATER_OPACITY;
      this.fluid.opacity = energyChunksVisible ? opacity * 0.75 : opacity;
    } );

    // reset this node if the beaker it represents gets reset
    beaker.resetInProgressProperty.lazyLink( resetInProgress => {

      // reset this view node at the end of the beaker's reset, since it should be in a reasonable state at that point
      if ( !resetInProgress ) {
        this.reset();
      }
    } );
  }

  /**
   * @public
   */
  reset() {
    this.fluid.reset();
  }

  /**
   * step this view element
   * @param dt - time step, in seconds
   * @public
   */
  step( dt ) {
    this.fluid.step( dt );
  }

  /**
   * set whether this node should follow its beaker position. this is useful for the case where its parent node is
   * handling its position
   * @param {boolean} followPosition
   * @public
   */
  setFollowPosition( followPosition ) {
    this.followPosition = followPosition;
  }

  /**
   * moves all layers to the front of their respective node layers
   * @public
   */
  moveToFront() {
    this.backNode.moveToFront();
    this.frontNode.moveToFront();
    this.grabNode.moveToFront();
  }
}

energyFormsAndChanges.register( 'BeakerView', BeakerView );
export default BeakerView;

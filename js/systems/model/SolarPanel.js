// Copyright 2016-2019, University of Colorado Boulder

/**
 * A type that represents a model of a solar panel that converts light energy to electrical energy.  The panel actually
 * consists of an actual panel but also is meant to have a lower assembly through which energy chunks move.  The
 * appearance needs to be tightly coordinated with the images used in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const Energy = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Energy' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  const EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyConverter' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const SOLAR_PANEL_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_icon.png' );

  // constants
  const PANEL_SIZE = new Dimension2( 0.15, 0.07 ); // size of the panel-only portion (no connectors), in meters

  // Constants used for creating the path followed by the energy chunks and for positioning the wire and connector
  // images in the view.  Many of these numbers were empirically determined based on the images, and will need to be
  // updated if the images change.  All values are in meters.
  const PANEL_CONNECTOR_OFFSET = new Vector2( 0.015, 0 ); // where the bottom of the panel connects to the wires & such
  const OFFSET_TO_CONVERGENCE_POINT = PANEL_CONNECTOR_OFFSET.plusXY( 0, 0.0065 );
  const OFFSET_TO_FIRST_CURVE_POINT = PANEL_CONNECTOR_OFFSET.plusXY( 0, -0.025 );
  const OFFSET_TO_SECOND_CURVE_POINT = PANEL_CONNECTOR_OFFSET.plusXY( 0.005, -0.033 );
  const OFFSET_TO_THIRD_CURVE_POINT = PANEL_CONNECTOR_OFFSET.plusXY( 0.015, -0.040 );
  const OFFSET_TO_OUTGOING_CONNECTOR = PANEL_CONNECTOR_OFFSET.plusXY( 0.042, -0.041 );
  const REFLECTION_ANGLE = 1.012; // when a chunk gets reflected, send it away from the panel at this angle, in radians.

  // Inter chunk spacing time for when the chunks reach the 'convergence point' at the bottom of the solar panel.
  // Empirically determined to create an appropriate flow of electrical chunks in an energy user wire. In seconds.
  const MIN_INTER_CHUNK_TIME = 0.6;

  class SolarPanel extends EnergyConverter {

    /**
     * @param {BooleanProperty} energyChunksVisibleProperty
     */
    constructor( energyChunksVisibleProperty ) {
      super( new Image( SOLAR_PANEL_ICON ) );

      // @public {string} - a11y name
      this.a11yName = EFACA11yStrings.solarPanel.value;

      // @private
      this.electricalEnergyChunkMovers = [];
      this.lightEnergyChunkMovers = [];
      this.latestChunkArrivalTime = 0;
      this.energyOutputRate = 0;
      this.numberOfConvertedChunks = 0;
      this.energyChunksVisibleProperty = energyChunksVisibleProperty;

      // @private - counter to mimic function of IClock in original Java code
      this.simulationTime = 0;

      // A shape used to describe where the collection area is relative to the model position.  The collection area is at
      // the top, and the energy chunks flow through wires and connectors below.
      // @public - (read-only)
      this.untranslatedPanelBounds = new Bounds2(
        -PANEL_SIZE.width / 2,
        0,
        PANEL_SIZE.width / 2,
        PANEL_SIZE.height
      );

      // @public - (read-only)
      this.untranslatedAbsorptionShape = new Shape()
        .moveTo( 0, 0 )
        .lineToRelative( -PANEL_SIZE.width / 2, 0 )
        .lineToRelative( PANEL_SIZE.width, PANEL_SIZE.height )
        .close();

      this.positionProperty.link( position => {

        // shape used when determining if a given chunk of light energy should be absorbed. It is created at (0,0) relative
        // to the solar panel, so its position needs to be adjusted when the solar panel changes its position. It cannot
        // just use a relative position to the solar panel because energy chunks that are positioned globally need to check
        // to see if they are located within this shape, so it needs a global position as well. The untranslated version of
        // this shape is needed to draw the helper shape node in SolarPanelNode.
        // @private {Shape}
        this.absorptionShape = this.untranslatedAbsorptionShape.transformed( Matrix3.translation( position.x, position.y ) );
      } );
    }

    /**
     * @param  {number} dt - time step, in seconds
     * @param  {Energy} incomingEnergy - type, amount, direction of energy
     * @returns {Energy}
     * @override
     * @public
     */
    step( dt, incomingEnergy ) {
      if ( this.activeProperty.value ) {

        // handle any incoming energy chunks
        if ( this.incomingEnergyChunks.length > 0 ) {

          this.incomingEnergyChunks.forEach( incomingChunk => {

            if ( incomingChunk.energyTypeProperty.get() === EnergyType.LIGHT ) {

              if ( this.numberOfConvertedChunks < 4 ) {

                // convert this chunk to electrical energy and add it to the list of energy chunks being managed
                incomingChunk.energyTypeProperty.set( EnergyType.ELECTRICAL );
                this.energyChunkList.push( incomingChunk );

                // add a "mover" that will move this energy chunk to the bottom of the solar panel
                this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover(
                  incomingChunk,
                  EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), [ OFFSET_TO_CONVERGENCE_POINT ] ),
                  this.chooseChunkSpeedOnPanel( incomingChunk ) )
                );

                this.numberOfConvertedChunks++;
              }
              else {

                // leave this chunk as light energy and add it to the list of energy chunks being managed
                this.energyChunkList.push( incomingChunk );

                // add a "mover" that will reflect this energy chunk up and away from the panel
                this.lightEnergyChunkMovers.push( new EnergyChunkPathMover(
                  incomingChunk,
                  EnergyChunkPathMover.createStraightPath( incomingChunk.positionProperty.get(), REFLECTION_ANGLE ),
                  EFACConstants.ENERGY_CHUNK_VELOCITY )
                );

                this.numberOfConvertedChunks = 0;
              }
            }

            // by design, this shouldn't happen, so raise an error if it does
            else {
              assert && assert(
                false,
                'Encountered energy chunk with unexpected type: ' + incomingChunk.energyTypeProperty.get()
              );
            }
          } );

          this.incomingEnergyChunks.length = 0;
        }

        // move the energy chunks that are currently under management
        this.moveElectricalEnergyChunks( dt );
        this.moveReflectedEnergyChunks( dt );
      }

      // produce the appropriate amount of energy
      let energyProduced = 0;
      if ( this.activeProperty.value && incomingEnergy.type === EnergyType.LIGHT ) {

        // 68% efficient. Empirically determined to match the rate of energy chunks that flow from the sun to the solar
        // panel (this way, the fan moves at the same speed when chunks are on or off).
        energyProduced = incomingEnergy.amount * 0.68;
      }
      this.energyOutputRate = energyProduced / dt;

      this.simulationTime += dt;

      return new Energy( EnergyType.ELECTRICAL, energyProduced, 0 );
    }

    /**
     * update electrical energy chunk positions
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks( dt ) {

      // iterate over a copy to mutate original without problems
      const movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( mover => {

        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          _.pull( this.electricalEnergyChunkMovers, mover );
          const pathThroughConverterOffsets = [
            OFFSET_TO_FIRST_CURVE_POINT,
            OFFSET_TO_SECOND_CURVE_POINT,
            OFFSET_TO_THIRD_CURVE_POINT,
            OFFSET_TO_OUTGOING_CONNECTOR
          ];

          // energy chunk has reached the bottom of the panel and now needs to move through the converter
          if ( mover.energyChunk.positionProperty.value.equals( this.positionProperty.value.plus( OFFSET_TO_CONVERGENCE_POINT ) ) ) {
            this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, pathThroughConverterOffsets ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          }

          // the energy chunk has traveled across the panel and through the converter, so pass it off to the next
          // element in the system
          else {
            this.outgoingEnergyChunks.push( mover.energyChunk );
            this.energyChunkList.remove( mover.energyChunk );
          }
        }
      } );
    }

    /**
     * update light energy chunk positions
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveReflectedEnergyChunks( dt ) {

      // iterate over a copy to mutate original without problems
      const movers = _.clone( this.lightEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        // remove this energy chunk entirely
        if ( mover.pathFullyTraversed ) {
          _.pull( this.lightEnergyChunkMovers, mover );
          this.energyChunkList.remove( mover.energyChunk );
        }
      } );
    }

    /**
     * @param {Energy} incomingEnergy
     * @public
     * @override
     */
    preloadEnergyChunks( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( incomingEnergy.amount === 0 || incomingEnergy.type !== EnergyType.LIGHT ) {

        // no energy chunk pre-loading needed
        return;
      }

      const absorptionBounds = this.getAbsorptionShape().bounds;
      const lowerLeftOfPanel = new Vector2( absorptionBounds.minX, absorptionBounds.minY );
      const upperRightOfPanel = new Vector2( absorptionBounds.maxX, absorptionBounds.maxY );
      const crossLineAngle = upperRightOfPanel.minus( lowerLeftOfPanel ).angle();
      const crossLineLength = lowerLeftOfPanel.distance( upperRightOfPanel );
      const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
      let preloadComplete = false;

      // simulate energy chunks moving through the system
      while ( !preloadComplete ) {

        // full energy rate generates too many chunks, so an adjustment factor is used
        energySinceLastChunk += incomingEnergy.amount * dt * 0.4;

        // determine if time to add a new chunk
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          let initialPosition;
          if ( this.energyChunkList.length === 0 ) {

            // for predictability of the algorithm, add the first chunk to the center of the panel
            initialPosition = lowerLeftOfPanel.plus(
              new Vector2( crossLineLength * 0.5, 0 ).rotated( crossLineAngle )
            );
          }
          else {

            // choose a random location along the center portion of the cross line
            initialPosition = lowerLeftOfPanel.plus(
              new Vector2( crossLineLength * ( 0.5 * phet.joist.random.nextDouble() + 0.25 ), 0 ).rotated( crossLineAngle )
            );
          }

          const newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            initialPosition,
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk to the bottom of the solar panel
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover(
            newEnergyChunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), [ OFFSET_TO_CONVERGENCE_POINT ] ),
            this.chooseChunkSpeedOnPanel( newEnergyChunk ) )
          );

          // update energy since last chunk
          energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );

        if ( this.outgoingEnergyChunks.length > 0 ) {

          // an energy chunk has made it all the way through the system, which completes the pre-load
          preloadComplete = true;
        }
      }
    }

    /**
     * @returns {Energy} type, amount, direction of emitted energy
     */
    getEnergyOutputRate() {
      return new Energy( EnergyType.ELECTRICAL, this.energyOutputRate, 0 );
    }

    /**
     * choose speed of chunk on panel such that it won't clump up with other chunks
     * @param  {EnergyChunk} incomingEnergyChunk
     * @returns {number} speed
     * @private
     */
    chooseChunkSpeedOnPanel( incomingEnergyChunk ) {

      // start with default speed
      const chunkSpeed = EFACConstants.ENERGY_CHUNK_VELOCITY;

      // count the number of chunks currently on the panel
      let numChunksOnPanel = 0;

      this.electricalEnergyChunkMovers.forEach( mover => {
        if ( mover.getFinalDestination().equals( this.positionProperty.value.plus( OFFSET_TO_CONVERGENCE_POINT ) ) ) {
          numChunksOnPanel++;
        }
      } );

      // compute the projected time of arrival at the convergence point
      const distanceToConvergencePoint =
        incomingEnergyChunk.positionProperty.get().distance( this.positionProperty.value.plus( OFFSET_TO_CONVERGENCE_POINT ) );
      const travelTime = distanceToConvergencePoint / chunkSpeed;
      let projectedArrivalTime = this.simulationTime + travelTime;

      // calculate the minimum spacing based on the number of chunks on the panel
      const minArrivalTimeSpacing = numChunksOnPanel <= 3 ?
                                    MIN_INTER_CHUNK_TIME :
                                  MIN_INTER_CHUNK_TIME / ( numChunksOnPanel - 2 );

      // if the projected arrival time is too close to the current last chunk, slow down so that the minimum spacing is
      // maintained
      if ( this.latestChunkArrivalTime + minArrivalTimeSpacing > projectedArrivalTime ) {
        projectedArrivalTime = this.latestChunkArrivalTime + minArrivalTimeSpacing;
      }

      this.latestChunkArrivalTime = projectedArrivalTime;

      return distanceToConvergencePoint / ( projectedArrivalTime - this.simulationTime );
    }

    /**
     * @param {EnergyChunk[]} energyChunks
     * @public
     * @override
     */
    injectEnergyChunks( energyChunks ) {

      // before adding all injected chunks into the solar panel's incoming energy chunks array, make sure that they are
      // all light energy. if not, pull out the bad ones and pass the rest through.
      // see https://github.com/phetsims/energy-forms-and-changes/issues/150
      energyChunks.forEach( chunk => {
        if ( chunk.energyTypeProperty.value !== EnergyType.LIGHT ) {
          energyChunks = _.pull( energyChunks, chunk );
        }
      } );
      EnergyConverter.prototype.injectEnergyChunks.call( this, energyChunks );
    }

    /**
     * @public
     * @override
     */
    clearEnergyChunks() {
      EnergyConverter.prototype.clearEnergyChunks.call( this );
      this.electricalEnergyChunkMovers.length = 0;
      this.latestChunkArrivalTime = 0;
    }

    /**
     * get the shape of the area where light can be absorbed
     * @returns {Shape}
     */
    getAbsorptionShape() {
      return this.absorptionShape;
    }
  }

  // statics
  SolarPanel.PANEL_CONNECTOR_OFFSET = PANEL_CONNECTOR_OFFSET;

  return energyFormsAndChanges.register( 'SolarPanel', SolarPanel );
} );


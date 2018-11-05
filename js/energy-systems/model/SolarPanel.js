// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type that represents a model of a solar panel that converts light energy to electrical energy
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyConverter' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var SOLAR_PANEL_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_icon.png' );

  // constants
  var CONVERTER_IMAGE_OFFSET = new Vector2( 0.0095, -0.0345 );
  var CONNECTOR_IMAGE_OFFSET = new Vector2( 0.0515, -0.0355 );

  // The size of the solar panel image that is created in the view is scaled down to the height in this dimension,
  // which was empirically determined to give the solar panel the correct size. The width in this dimension was derived
  // from the height by maintaining the same aspect ratio that the image has. Note that the width is the overall width
  // of the solar panel, not the length of the bottom or top edge.
  var SOLAR_PANEL_SIZE = new Dimension2( 0.151, 0.073 );

  // Constants used for creating the path followed by the energy chunks. Many of these numbers were empirically
  // determined based on the images, and will need to be updated if the images change.
  var OFFSET_TO_CONVERGENCE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x, 0.0155 );
  var OFFSET_TO_FIRST_CURVE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x, -0.0195 );
  var OFFSET_TO_SECOND_CURVE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x + 0.005, -0.0275 );
  var OFFSET_TO_THIRD_CURVE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x + 0.015, -0.034 );
  var OFFSET_TO_CONNECTOR_CENTER = CONNECTOR_IMAGE_OFFSET

  // Inter chunk spacing time for when the chunks reach the 'convergence point' at the bottom of the solar panel.
  // Empirically determined to create an appropriate flow of electrical chunks in an energy user wire. In seconds.
  var MIN_INTER_CHUNK_TIME = 0.6;

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function SolarPanel( energyChunksVisibleProperty ) {

    EnergyConverter.call( this, new Image( SOLAR_PANEL_ICON ) );
    var self = this;

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.solarPanel.value;

    // @private
    this.energyChunkMovers = [];
    this.latestChunkArrivalTime = 0;
    this.energyOutputRate = 0;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private - counter to mimic function of IClock in original Java code
    this.simulationTime = 0;

    // shape used when determining if a given chunk of light energy should be absorbed. It is created at (0,0) relative
    // to the solar panel, so its position needs to be adjusted when the solar panel changes its position. It cannot
    // just use a relative position to the solar panel because energy chunks that are positioned globally need to check
    // to see if they are located within this shape, so it needs a global position as well.
    this.untranslatedAbsorptionShape = new Shape()
      .moveTo( 0, 0 )
      .lineToRelative( -SOLAR_PANEL_SIZE.width / 2, 0 )
      .lineToRelative( SOLAR_PANEL_SIZE.width, SOLAR_PANEL_SIZE.height )
      .close();

    this.positionProperty.link( function( position ) {

      // @public {Shape}
      self.absorptionShape = self.untranslatedAbsorptionShape.transformed( Matrix3.translation( position.x, position.y ) );
    } );
  }

  energyFormsAndChanges.register( 'SolarPanel', SolarPanel );

  return inherit( EnergyConverter, SolarPanel, {

    /**
     * @param  {number} dt - time step, in seconds
     * @param  {Energy} incomingEnergy - type, amount, direction of energy
     * @returns {Energy}
     * @override
     * @public
     */
    step: function( dt, incomingEnergy ) {

      var self = this;

      if ( this.activeProperty.value ) {

        // handle any incoming energy chunks
        if ( this.incomingEnergyChunks.length > 0 ) {

          this.incomingEnergyChunks.forEach( function( incomingChunk ) {

            if ( incomingChunk.energyTypeProperty.get() === EnergyType.LIGHT ) {

              // convert this chunk to electrical energy and add it to the list of energy chunks being managed
              incomingChunk.energyTypeProperty.set( EnergyType.ELECTRICAL );
              self.energyChunkList.push( incomingChunk );

              // add a "mover" that will move this energy chunk to the bottom of the solar panel
              self.energyChunkMovers.push( new EnergyChunkPathMover(
                incomingChunk,
                self.createPathToPanelBottom( self.positionProperty.get() ),
                self.chooseChunkSpeedOnPanel( incomingChunk ) )
              );
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
        this.moveEnergyChunks( dt );
      }

      // produce the appropriate amount of energy
      var energyProduced = 0;
      if ( this.activeProperty.value && incomingEnergy.type === EnergyType.LIGHT ) {
        energyProduced = incomingEnergy.amount; // Perfectly efficient conversion. We should patent this.
      }
      this.energyOutputRate = energyProduced / dt;

      this.simulationTime += dt;

      return new Energy( EnergyType.ELECTRICAL, energyProduced, 0 );
    },

    /**
     * update energy chunk positions
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveEnergyChunks: function( dt ) {

      // iterate over a copy to mutate original without problems
      var movers = _.clone( this.energyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {

        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          _.pull( self.energyChunkMovers, mover );

          // energy chunk has reached the bottom of the panel and now needs to move through the converter
          if ( mover.energyChunk.positionProperty.value.equals( self.positionProperty.value.plus( OFFSET_TO_CONVERGENCE_POINT ) ) ) {
            self.energyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createPathThroughConverter( self.positionProperty.value ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          }

          // the energy chunk has traveled across the panel and through the converter, so pass it off to the next
          // element in the system
          else {
            self.outgoingEnergyChunks.push( mover.energyChunk );
            self.energyChunkList.remove( mover.energyChunk );
          }
        }
      } );
    },

    /**
     * @param {Energy} incomingEnergy
     * @public
     * @override
     */
    preLoadEnergyChunks: function( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( incomingEnergy.amount === 0 || incomingEnergy.type !== EnergyType.LIGHT ) {

        // no energy chunk pre-loading needed
        return;
      }

      var absorptionBounds = this.getAbsorptionShape().bounds;
      var lowerLeftOfPanel = new Vector2( absorptionBounds.minX, absorptionBounds.minY );
      var upperRightOfPanel = new Vector2( absorptionBounds.maxX, absorptionBounds.maxY );
      var crossLineAngle = upperRightOfPanel.minus( lowerLeftOfPanel ).angle();
      var crossLineLength = lowerLeftOfPanel.distance( upperRightOfPanel );
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
      var preLoadComplete = false;

      // simulate energy chunks moving through the system
      while ( !preLoadComplete ) {

        // full energy rate generates too many chunks, so an adjustment factor is used
        energySinceLastChunk += incomingEnergy.amount * dt * 0.4;

        // determine if time to add a new chunk
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var initialPosition;
          if ( this.energyChunkList.length === 0 ) {

            // for predictability of the algorithm, add the first chunk to the center of the panel
            initialPosition = lowerLeftOfPanel.plus(
              new Vector2( crossLineLength * 0.5, 0 ).rotated( crossLineAngle )
            );
          }
          else {

            // choose a random location along the center portion of the cross line
            initialPosition = lowerLeftOfPanel.plus(
              new Vector2( crossLineLength * ( 0.5 * phet.joist.random.nextDouble() + 0.25 ), 0 ).rotated( crossLineAngle ) );
          }

          var newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            initialPosition,
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk to the bottom of the solar panel
          this.energyChunkMovers.push( new EnergyChunkPathMover(
            newEnergyChunk,
            this.createPathToPanelBottom( this.positionProperty.get() ),
            this.chooseChunkSpeedOnPanel( newEnergyChunk ) )
          );

          // update energy since last chunk
          energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveEnergyChunks( dt );

        if ( this.outgoingEnergyChunks.length > 0 ) {

          // an energy chunk has made it all the way through the system, which completes the pre-load
          preLoadComplete = true;
        }
      }
    },

    /**
     * @returns {Energy} type, amount, direction of emitted energy
     */
    getEnergyOutputRate: function() {
      return new Energy( EnergyType.ELECTRICAL, this.energyOutputRate, 0 );
    },

    /**
     * choose speed of chunk on panel such that it won't clump up with other chunks
     * @param  {EnergyChunk} incomingEnergyChunk
     * @returns {number} speed
     * @private
     */
    chooseChunkSpeedOnPanel: function( incomingEnergyChunk ) {

      // start with default speed
      var chunkSpeed = EFACConstants.ENERGY_CHUNK_VELOCITY;

      // count the number of chunks currently on the panel
      var numChunksOnPanel = 0;

      var self = this;

      this.energyChunkMovers.forEach( function( mover ) {
        if ( mover.getFinalDestination().equals( self.positionProperty.value.plus( OFFSET_TO_CONVERGENCE_POINT ) ) ) {
          numChunksOnPanel++;
        }
      } );

      // compute the projected time of arrival at the convergence point
      var distanceToConvergencePoint =
        incomingEnergyChunk.positionProperty.get().distance( this.positionProperty.value.plus( OFFSET_TO_CONVERGENCE_POINT ) );
      var travelTime = distanceToConvergencePoint / chunkSpeed;
      var projectedArrivalTime = this.simulationTime + travelTime;

      // calculate the minimum spacing based on the number of chunks on the panel
      var minArrivalTimeSpacing = numChunksOnPanel <= 3 ?
                                  MIN_INTER_CHUNK_TIME :
                                  MIN_INTER_CHUNK_TIME / ( numChunksOnPanel - 2 );

      // if the projected arrival time is too close to the current last chunk, slow down so that the minimum spacing is
      // maintained
      if ( this.latestChunkArrivalTime + minArrivalTimeSpacing > projectedArrivalTime ) {
        projectedArrivalTime = this.latestChunkArrivalTime + minArrivalTimeSpacing;
      }

      this.latestChunkArrivalTime = projectedArrivalTime;

      return distanceToConvergencePoint / ( projectedArrivalTime - this.simulationTime );
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergyConverter.prototype.clearEnergyChunks.call( this );
      this.energyChunkMovers.length = 0;
      this.latestChunkArrivalTime = 0;
    },

    /**
     * @param {Vector2} panelPosition
     * @private
     */
    createPathToPanelBottom: function( panelPosition ) {
      var path = [];
      path.push( panelPosition.plus( OFFSET_TO_CONVERGENCE_POINT ) );
      return path;
    },

    /**
     * @param {Vector2} panelPosition
     * @private
     */
    createPathThroughConverter: function( panelPosition ) {
      var path = [];
      path.push( panelPosition.plus( OFFSET_TO_FIRST_CURVE_POINT ) );
      path.push( panelPosition.plus( OFFSET_TO_SECOND_CURVE_POINT ) );
      path.push( panelPosition.plus( OFFSET_TO_THIRD_CURVE_POINT ) );
      path.push( panelPosition.plus( OFFSET_TO_CONNECTOR_CENTER ) );
      return path;
    },

    /**
     * get the shape of the area where light can be absorbed
     * @return {Shape}
     */
    getAbsorptionShape: function() {
      return this.absorptionShape;
    }
  }, {

    // statics
    SOLAR_PANEL_SIZE: SOLAR_PANEL_SIZE
  } );
} );


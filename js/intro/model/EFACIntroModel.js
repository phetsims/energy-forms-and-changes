// Copyright 2014-2018, University of Colorado Boulder

/**
 *  model for the 'Intro' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Air = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Air' );
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var BeakerContainer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BeakerContainer' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Brick = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Brick' );
  var Burner = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Burner' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var StickyTemperatureAndColorSensor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/StickyTemperatureAndColorSensor' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IronBlock = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/IronBlock' );
  var Line = require( 'KITE/segments/Line' );
  var Property = require( 'AXON/Property' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var TemperatureAndColor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/TemperatureAndColor' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var NUM_THERMOMETERS = 3;
  var BEAKER_WIDTH = 0.085; // in meters
  var BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;

  // initial thermometer location, intended to be away from any model objects so that they don't get stuck to anything
  var INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

  // minimum distance allowed between two objects, used to prevent floating point issues
  var MIN_INTER_ELEMENT_DISTANCE = 1E-9; // in meters

  // Threshold of temperature difference between the bodies in a multi-body system below which energy can be exchanged
  // with air.
  var MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE = 2.0; // in degrees K, empirically determined

  // flag that can be turned on in order to print out some profiling info - TODO: Make this a query param is retained
  var ENABLE_INTERNAL_PROFILING = false;

  // local variables for the class to be used when internal profiling is enabled
  var previousTime = 0;
  var TIME_ARRAY_LENGTH = 100;
  var times = [];
  var countUnderMin = 0;

  /**
   * main constructor for EFACIntroModel, which contains all of the model logic for the Intro sim screen
   * @constructor
   */
  function EFACIntroModel() {

    var self = this;

    // @public (read-only) {BooleanProperty} - controls whether the energy chunks are visible in the view
    this.energyChunksVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {BooleanProperty} - is the sim running or paused?
    this.playProperty = new BooleanProperty( true );

    // @public (read-only) {BooleanProperty} - true indicates normal speed, false is fast-forward
    this.normalSimSpeedProperty = new Property( true );

    // @public (read-only) {Air} - model of the air that surrounds the other model elements, and can absorb or provide
    // energy
    this.air = new Air( this.energyChunksVisibleProperty );

    // @public (read-only) {Burner} - right and left burners
    this.rightBurner = new Burner( new Vector2( 0.18, 0 ), this.energyChunksVisibleProperty );
    this.leftBurner = new Burner( new Vector2( 0.08, 0 ), this.energyChunksVisibleProperty );

    //  @public (read-only) {Brick}
    this.brick = new Brick( new Vector2( -0.1, 0 ), this.energyChunksVisibleProperty );

    // @public (read-only) {IronBlock}
    this.ironBlock = new IronBlock( new Vector2( -0.175, 0 ), this.energyChunksVisibleProperty );

    var listOfThingsThatCanGoInBeaker = [ this.brick, this.ironBlock ];

    // @public (read-only) {BeakerContainer)
    this.beaker = new BeakerContainer(
      new Vector2( -0.015, 0 ),
      BEAKER_WIDTH,
      BEAKER_HEIGHT,
      listOfThingsThatCanGoInBeaker,
      this.energyChunksVisibleProperty
    );

    // @private - put all the thermal containers on a list for easy iteration
    this.thermalContainers = [ this.brick, this.ironBlock, this.beaker ];

    // @private - put burners into a list for easy iteration
    this.burners = [ this.rightBurner, this.leftBurner ];

    // @private - put all of the model elements on a list for easy iteration
    this.modelElementList = [ this.leftBurner, this.rightBurner, this.brick, this.ironBlock, this.beaker ];

    // @public (read-only) {StickyTemperatureAndColorSensor[]}
    this.temperatureAndColorSensors = [];
    _.times( NUM_THERMOMETERS, function() {
      var thermometer = new StickyTemperatureAndColorSensor( self, INITIAL_THERMOMETER_LOCATION, false );
      self.temperatureAndColorSensors.push( thermometer );

      // Add handling for a special case where the user drops something (generally a block) in the beaker behind this
      // thermometer. The action is to automatically move the thermometer to a location where it continues to sense the
      // beaker temperature. This was requested after interviews.
      thermometer.sensedElementColorProperty.link( function( newColor, oldColor ) {

        var blockWidthIncludingPerspective = self.ironBlock.getProjectedShape().bounds.width;

        var xRange = new RangeWithValue(
          self.beaker.getBounds().centerX - blockWidthIncludingPerspective / 2,
          self.beaker.getBounds().centerX + blockWidthIncludingPerspective / 2
        );

        if ( oldColor === EFACConstants.WATER_COLOR_IN_BEAKER && !thermometer.userControlled &&
             xRange.contains( thermometer.positionProperty.value.x ) ) {
          thermometer.userControlled = true; // Must toggle userControlled to enable element following.
          thermometer.position = new Vector2(
            self.beaker.getBounds().maxX - 0.01,
            self.beaker.getBounds().minY + self.beaker.getBounds().height * 0.33 );
          thermometer.userControlled = false; // Must toggle userControlled to enable element following.
        }
      } );
    } );
  }

  energyFormsAndChanges.register( 'EFACIntroModel', EFACIntroModel );

  return inherit( Object, EFACIntroModel, {

    /**
     * restore the initial conditions of the model
     * @public
     */
    reset: function() {

      // TODO: Reset is currently bypassed.  This was done in March 2017 because the sim was failing automated testing,
      // and it was due to issues with reset not restoring state properly, but I (@jbphet) don't have time to do any
      // further investigation.  See https://github.com/phetsims/energy-forms-and-changes/issues/25 for more
      // information.  Restore the commented-out code below as part of the process to make it work.
      console.log( 'warning: portions of reset are temporarily bypassed' );

      //this.energyChunksVisibleProperty.reset();
      //this.playProperty.reset();
      //this.normalSimSpeedProperty.reset();
      //this.air.reset();
      //this.leftBurner.reset();
      //this.rightBurner.reset();
      //this.ironBlock.reset();
      //this.brick.reset();
      //this.beaker.reset();
      //
      //this.temperatureAndColorSensors.forEach( function( thermometer ) {
      //  thermometer.reset();
      //} );
    },

    /**
     * step the sim forward by one fixed nominal frame time
     * @public
     */
    manualStep: function() {
      this.stepModel( EFACConstants.SIM_TIME_PER_TICK_NORMAL );
    },

    /**
     * step function or this model, automatically called by joist
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step: function( dt ) {
      if ( this.playProperty.get() ) {
        var multiplier = this.normalSimSpeedProperty.get() ? 1 : EFACConstants.FAST_FORWARD_MULTIPLIER;
        // TODO: This uses a fixed step instead of dt, this will need to be changed, see https://github.com/phetsims/energy-forms-and-changes/issues/42
        // this.stepModel( dt * multiplier );
        this.stepModel( EFACConstants.SIM_TIME_PER_TICK_NORMAL * multiplier );
      }
    },

    /**
     * update the state of the model for a given time amount
     * @param {number} dt - time step, in seconds
     * @private
     */
    stepModel: function( dt ) {

      var self = this;

      if ( ENABLE_INTERNAL_PROFILING ) {
        var time = new Date().getTime();
        if ( previousTime !== 0 && time - previousTime > 48 || countUnderMin + 1 >= TIME_ARRAY_LENGTH ) {
          console.log( '----------------------' );
          for ( var i = 0; i < countUnderMin; i++ ) {
            console.log( times[ i ] + ' ' );
          }
          countUnderMin = 0;
        }
        previousTime = time;
      }

      // cause any user-movable model elements that are not supported by a surface to fall or, in some cases, jump up
      // towards the nearest supporting surface
      var unsupported;
      var raised;
      this.thermalContainers.forEach( function( movableModelElement ) {
        var y = movableModelElement.positionProperty.value.y;
        if ( y !== 0 && !y ) {
          assert && assert( false, 'NaN value in position' );
        }
        unsupported = movableModelElement.supportingSurfaceProperty === null;
        raised = ( movableModelElement.positionProperty.value.y !== 0 );
        if ( !movableModelElement.userControlledProperty.value && unsupported && raised ) {
          self.fallToSurface( movableModelElement, dt );
        }
      } );

      // update the fluid level in the beaker, which could be displaced by one or more of the blocks
      this.beaker.updateFluidLevel( [ this.brick.getBounds(), this.ironBlock.getBounds() ] );

      //=====================================================================
      // Energy and Energy Chunk Exchange
      //=====================================================================

      // Note: The original intent was to design all the energy containers such that the order of the exchange didn't
      // matter, nor who was exchanging with whom.  This turned out to be a lot of extra work to maintain, and was
      // eventually abandoned.  So, the order and nature of the exchanged below should be maintained unless there is a
      // good reason not to, and any changes should be well tested.

      // loop through all the movable thermal energy containers and have them exchange energy with one another
      self.thermalContainers.forEach( function( container1, index ) {
        self.thermalContainers.slice( index + 1,
          self.thermalContainers.length ).forEach( function( container2 ) {
          container1.exchangeEnergyWith( container2, dt );
        } );
      } );

      // exchange thermal energy between the burners and the other thermal model elements, including air
      this.burners.forEach( function( burner ) {
        if ( burner.areAnyOnTop( self.thermalContainers ) ) {
          self.thermalContainers.forEach( function( energyContainer ) {
            burner.addOrRemoveEnergyToFromObject( energyContainer, dt );
          } );
        }
        else {
          // Nothing on a burner, so heat/cool the air.
          burner.addOrRemoveEnergyToFromAir( self.air, dt );
        }
      } );

      // exchange energy chunks between burners and non-air energy containers
      this.thermalContainers.forEach( function( element ) {
        self.burners.forEach( function( burner ) {
          if ( burner.inContactWith( element ) ) {
            var burnerChunkBalance = burner.getEnergyChunkBalanceWithObjects();
            var elementChunkBalance = element.getEnergyChunkBalance();

            if ( burner.canSupplyEnergyChunk() && ( burnerChunkBalance > 0 || elementChunkBalance < 0 ) ) {
              // Push an energy chunk into the item on the burner.
              element.addEnergyChunk( burner.extractClosestEnergyChunk( element.getCenterPoint() ) );
            }
            else if ( burner.canAcceptEnergyChunk() && ( burnerChunkBalance < 0 || elementChunkBalance > 0 ) ) {
              // Extract an energy chunk from the model element
              var energyChunk = element.extractClosestEnergyChunk( burner.getFlameIceRect() );

              if ( energyChunk !== null ) {
                burner.addEnergyChunk( energyChunk );
              }
            }
          }
        } );
      } );

      // exchange energy chunks between movable thermal energy containers
      self.thermalContainers.forEach( function( container1, index ) {
        self.thermalContainers.slice( index + 1,
          self.thermalContainers.length ).forEach( function( container2 ) {
          if ( container1.getThermalContactArea().getThermalContactLength( container2.getThermalContactArea() ) > 0 ) {

            // exchange one or more chunks if appropriate
            if ( container1.getEnergyChunkBalance() > 0 && container2.getEnergyChunkBalance < 0 ) {
              container2.addEnergyChunk( container1.extractClosestEnergyChunk( container2.getThermalContactArea() ) );
            }
            else if ( container1.getEnergyChunkBalance() < 0 && container2.getEnergyChunkBalance() > 0 ) {
              container1.addEnergyChunk( container2.extractClosestEnergyChunk( container1.getThermalContactArea() ) );
            }
          }
        } );
      } );

      // exchange energy and energy chunks between the movable thermal energy containers and the air
      this.thermalContainers.forEach( function( container1 ) {

        // set up some variables that are used to decide whether or not energy should be exchanged with air
        var contactWithOtherMovableElement = false;
        var immersedInBeaker = false;
        var maxTemperatureDifference = 0;

        // figure out the max temperature difference between touching energy containers
        self.thermalContainers.forEach( function( container2 ) {
          if ( container2 === container1 ) {
            return;
          }
          if ( container1.getThermalContactArea().getThermalContactLength( container2.getThermalContactArea() ) > 0 ) {
            contactWithOtherMovableElement = true;
            maxTemperatureDifference = Math.max( Math.abs( container1.getTemperature() - container2.getTemperature() ),
              maxTemperatureDifference );
          }
        } );

        if ( self.beaker.getThermalContactArea().containsPoint( container1.getBounds() ) ) {

          // this model element is immersed in the beaker
          immersedInBeaker = true;
        }

        // exchange energy and energy chunks with the air if appropriate conditions are met
        if ( !contactWithOtherMovableElement ||
             ( !immersedInBeaker && ( maxTemperatureDifference < MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE ||
                                      container1.getEnergyBeyondMaxTemperature() > 0 ) ) ) {
          self.air.exchangeEnergyWith( container1, dt );

          if ( container1.getEnergyChunkBalance() > 0 ) {
            var pointAbove = new Vector2( phet.joist.random.nextDouble() * container1.getBounds().width + container1.getBounds().minX,
              container1.getBounds().maxY );
            var energyChunk = container1.extractClosestEnergyChunkToPoint( pointAbove );

            if ( energyChunk ) {
              var energyChunkMotionConstraints = null;
              if ( container1 instanceof Beaker ) {

                // Constrain the energy chunk's motion so that it doesn't go through the edges of the beaker. There is a
                // bit of a fudge factor in here to make sure that the sides of the energy chunk, and not just the
                // center, stay in bounds.
                var energyChunkWidth = 0.01;
                energyChunkMotionConstraints = new Rectangle( container1.getBounds().minX + energyChunkWidth / 2,
                  container1.getBounds().minY,
                  container1.getBounds().width - energyChunkWidth,
                  container1.getBounds().height );
              }
              self.air.addEnergyChunk( energyChunk, energyChunkMotionConstraints );
            }
          }
          else if ( container1.getEnergyChunkBalance < 0 &&
                    container1.getTemperature() < self.air.getTemperature() ) {
            container1.addEnergyChunk( self.air.requestEnergyChunk( container1.getCenterPoint() ) );
          }
        }
      } );

      // exchange energy chunks between the air and the burners
      this.burners.forEach( function( burner ) {
        if ( burner.getEnergyChunkCountForAir() > 0 ) {
          self.air.addEnergyChunk( burner.extractClosestEnergyChunk( burner.getCenterPoint() ), null );
        }
        else if ( burner.getEnergyChunkCountForAir() < 0 ) {
          burner.addEnergyChunk( self.air.requestEnergyChunk( burner.getCenterPoint() ) );
        }
      } );

      // step model elements to animate energy chunks movement
      this.air.step( dt );
      this.burners.forEach( function( burner ) {
        burner.step( dt );
      } );

      this.thermalContainers.forEach( function( thermalEnergyContainer ) {
        thermalEnergyContainer.step( dt );
      } );

      this.temperatureAndColorSensors.forEach( function( thermometer ) {
        thermometer.step( dt );
      } );
    },

    /**
     * make a user-movable model element fall to the nearest supporting surface
     * @param {MovableModelElement} modelElement - the falling object
     * @param {number} dt - time step in seconds
     * @private
     */
    fallToSurface: function( modelElement, dt ) {
      var self = this;
      var minYPos = 0;
      var targetX = 0;
      var targetY = 0;
      var acceleration = -9.8; // meters/s/s

      // determine whether there is something below this element that it can land upon
      var potentialSupportingSurface = self.findBestSupportSurface( modelElement );

      // if so, center the modelElement above its new parent
      if ( potentialSupportingSurface !== null ) {
        minYPos = potentialSupportingSurface.value.yPos;
        targetX = potentialSupportingSurface.value.getCenterX();
        targetY = modelElement.positionProperty.value.y;
        modelElement.positionProperty.set( new Vector2( targetX, targetY ) );
      }

      // calculate a proposed Y position based on gravitational falling
      var velocity = modelElement.verticalVelocityProperty.value + acceleration * dt;
      var proposedYPos = modelElement.positionProperty.value.y + velocity * dt;
      if ( proposedYPos < minYPos ) {

        // the element has landed on the ground or some other surface
        proposedYPos = minYPos;
        modelElement.verticalVelocityProperty.set( 0 );
        if ( potentialSupportingSurface !== null ) {
          modelElement.setSupportingSurfaceProperty( potentialSupportingSurface );
          potentialSupportingSurface.value.addElementToSurface( modelElement );
        }
      }
      else {
        modelElement.verticalVelocityProperty.set( velocity );
      }
      modelElement.positionProperty.set( new Vector2( modelElement.positionProperty.value.x, proposedYPos ) );
    },

    /**
     * get a list of the thermal blocks
     * @return {Block[]}
     */
    getBlockList: function() {
      return [ this.ironBlock, this.brick ];
    },

    /**
     * Project a line into a 2D shape based on the provided projection vector. This is a convenience function used by
     * the code that detects potential collisions between the 2D objects in model space.
     * @param {Line} edge
     * @param {Vector2} projection
     * @returns {Shape}
     * @private
     */
    projectShapeFromLine: function( edge, projection ) {
      var shape = new Shape();
      shape.moveToPoint( edge.start );
      shape.lineTo( edge.start.x + projection.x, edge.start.y + projection.y );
      shape.lineTo( edge.end.x + projection.x, edge.end.y + projection.y );
      shape.lineToPoint( edge.end );
      shape.close();
      return shape;

    },

    /**
     * Evaluate whether the proposed position would cause the model element to move through another solid element, or
     * the side of the beaker, or something that would look weird to the user and, if so, prevent the odd behavior from
     * happening by returning a location that works better.
     * @param {RectangularThermalMovableModelElement} modelElement - element whose position is being validated
     * @param {Vector2} proposedPosition - proposed new position for element
     * @returns {Vector2} the original proposed position if valid, or alternative position if not
     */
    constrainedPosition: function( modelElement, proposedPosition ) {

      // carry this model through scope of nested callbacks
      var self = this;

      // compensate for the model element's center X position
      var translation = proposedPosition.copy().minus( modelElement.positionProperty.value );

      // figure out how far the block's right edge appears to protrude to the side due to perspective
      var blockPerspectiveExtension = EFACConstants.BLOCK_SURFACE_WIDTH *
                                      EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION *
                                      Math.cos( EFACConstants.BLOCK_PERSPECTIVE_ANGLE ) / 2;

      // Validate against burner boundaries.  Treat the burners as one big blocking rectangle so that the user can't
      // drag things between them.  Also, compensate for perspective so that we can avoid difficult z-order issues.
      var standPerspectiveExtension = this.leftBurner.getOutlineRect().height *
                                      EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                      Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;
      var burnerRectX = this.leftBurner.getOutlineRect().minX - standPerspectiveExtension -
                        ( modelElement !== this.beaker ? blockPerspectiveExtension : 0 );
      var burnerBlockingRect = new Rectangle(
        burnerRectX,
        this.leftBurner.getOutlineRect().minY,
        this.rightBurner.getOutlineRect().maxX - burnerRectX,
        this.leftBurner.getOutlineRect().height
      );
      translation = this.determineAllowedTranslation( modelElement.getBounds(), burnerBlockingRect, translation, false );

      // validate against the sides of the beaker
      if ( modelElement !== this.beaker ) {

        // create three rectangles to represent the two sides and the top of the beaker
        var testRectThickness = 1E-3; // 1 mm thick walls.
        var beakerRect = this.beaker.getBounds();
        var beakerLeftSide = new Rectangle(
          beakerRect.minX - blockPerspectiveExtension,
          this.beaker.getBounds().minY,
          testRectThickness + blockPerspectiveExtension * 2,
          this.beaker.getBounds().height + blockPerspectiveExtension
        );
        var beakerRightSide = new Rectangle(
          this.beaker.getBounds().maxX - testRectThickness - blockPerspectiveExtension,
          this.beaker.getBounds().minY,
          testRectThickness + blockPerspectiveExtension * 2,
          this.beaker.getBounds().height + blockPerspectiveExtension
        );
        var beakerBottom = new Rectangle(
          this.beaker.getBounds().minX,
          this.beaker.getBounds().minY,
          this.beaker.getBounds().width,
          testRectThickness
        );

        // Do not restrict the model element's motion in positive Y direction if the beaker is sitting on top of the
        // model element - the beaker will simply be lifted up.
        var restrictPositiveY = !this.beaker.isStackedUpon( modelElement );

        // Clamp the translation based on the beaker position.
        translation = this.determineAllowedTranslation(
          modelElement.getBounds(),
          beakerLeftSide,
          translation,
          restrictPositiveY
        );
        translation = this.determineAllowedTranslation(
          modelElement.getBounds(),
          beakerRightSide,
          translation,
          restrictPositiveY
        );
        translation = this.determineAllowedTranslation(
          modelElement.getBounds(),
          beakerBottom,
          translation,
          restrictPositiveY
        );
      }

      // now check the model element's motion against each of the blocks
      this.getBlockList().forEach( function( block ) {
        if ( modelElement === block ) {
          // don't test against self
          return;
        }

        // Do not restrict the model element's motion in positive Y direction if the tested block is sitting on top of
        // the model element - the block will simply be lifted up.
        var restrictPositiveY = !block.isStackedUpon( modelElement );

        var testRect = modelElement.getBounds();
        if ( modelElement === self.beaker ) {

          // Special handling for the beaker - block it at the outer edge of the block instead of the center in order to
          // simplify z-order handling.
          testRect = new Rectangle( testRect.minX - blockPerspectiveExtension,
            testRect.minY,
            testRect.width + blockPerspectiveExtension * 2,
            testRect.height
          );
        }

        // Clamp the translation based on the test block's position, but handle the case where the block is immersed in
        // the beaker.
        if ( modelElement !== self.beaker || !self.beaker.getBounds().containsBounds( block.getBounds() ) ) {
          translation = self.determineAllowedTranslation( testRect, block.getBounds(), translation, restrictPositiveY );
        }
      } );

      // determine the new position based on the resultant translation
      var newPosition = modelElement.positionProperty.value.plus( translation ).copy();

      // clamp Y position to be positive to prevent dragging below table
      newPosition.setY( Math.max( newPosition.y, 0 ) );

      return newPosition;
    },

    /**
     * Determine the portion of a proposed translation that may occur given a moving rectangle and a stationary
     * rectangle that can block the moving one.
     * @param {Rectangle} movingRect
     * @param {Rectangle} stationaryRect
     * @param {Vector2} proposedTranslation
     * @param {boolean} restrictPosY        Flag that controls whether the positive Y direction is restricted.  This
     *                                      is often set false if there is another model element on top of the one
     *                                      being tested.
     * @returns {Vector2}
     * @private
     */
    determineAllowedTranslation: function( movingRect, stationaryRect, proposedTranslation, restrictPosY ) {

      // test for case where rectangles already overlap
      if ( movingRect.intersectsBounds( stationaryRect ) ) {

        // The rectangles already overlap.  Are they right on top of one another?
        if ( movingRect.centerX === stationaryRect.centerX && movingRect.centerX === stationaryRect.centerY ) {
          console.log( 'Warning: Rectangle centers in same location, returning zero vector.' );
          return new Vector2( 0, 0 );
        }

        // determine the motion in the X & Y directions that will "cure" the overlap
        var xOverlapCure = 0;
        if ( movingRect.maxX > stationaryRect.minX && movingRect.minX < stationaryRect.minX ) {
          xOverlapCure = stationaryRect.minX - movingRect.maxX;
        }
        else if ( stationaryRect.maxX > movingRect.minX && stationaryRect.minX < movingRect.minX ) {
          xOverlapCure = stationaryRect.maxX - movingRect.minX;
        }
        var yOverlapCure = 0;
        if ( movingRect.maxY > stationaryRect.minY && movingRect.minY < stationaryRect.minY ) {
          yOverlapCure = stationaryRect.minY - movingRect.maxY;
        }
        else if ( stationaryRect.maxY > movingRect.minY && stationaryRect.minY < movingRect.minY ) {
          yOverlapCure = stationaryRect.maxY - movingRect.minY;
        }

        // Something is wrong with algorithm if both values are zero, since overlap was detected by the "intersects"
        // method.
        assert && assert(
          !( xOverlapCure === 0 && yOverlapCure === 0 ),
          'xOverlap and yOverlap should not both be zero'
        );

        // return a vector with the smallest valid "cure" value, leaving the other translation value unchanged
        if ( xOverlapCure !== 0 && Math.abs( xOverlapCure ) < Math.abs( yOverlapCure ) ) {
          return new Vector2( xOverlapCure, proposedTranslation.y );
        }
        else {
          return new Vector2( proposedTranslation.x, yOverlapCure );
        }
      }

      var xTranslation = proposedTranslation.x;
      var yTranslation = proposedTranslation.y;

      // X direction
      if ( proposedTranslation.x > 0 ) {

        // check for collisions moving right
        var rightEdge = new Line(
          new Vector2( movingRect.maxX, movingRect.minY ),
          new Vector2( movingRect.maxX, movingRect.maxY )
        );
        var rightEdgeSmear = this.projectShapeFromLine( rightEdge, proposedTranslation );

        if ( rightEdge.start.x <= stationaryRect.minX && rightEdgeSmear.intersectsBounds( stationaryRect ) ) {

          // collision detected, limit motion
          xTranslation = stationaryRect.minX - rightEdge.start.x - MIN_INTER_ELEMENT_DISTANCE;
        }
      }
      else if ( proposedTranslation.x < 0 ) {

        // check for collisions moving left
        var leftEdge = new Line(
          new Vector2( movingRect.minX, movingRect.minY ),
          new Vector2( movingRect.minX, movingRect.maxY )
        );
        var leftEdgeSmear = this.projectShapeFromLine( leftEdge, proposedTranslation );

        if ( leftEdge.start.x >= stationaryRect.maxX && leftEdgeSmear.intersectsBounds( stationaryRect ) ) {

          // collision detected, limit motion
          xTranslation = stationaryRect.maxX - leftEdge.start.x + MIN_INTER_ELEMENT_DISTANCE;
        }
      }

      // Y direction.
      if ( proposedTranslation.y > 0 && restrictPosY ) {

        // check for collisions moving up
        var movingTopEdge = new Line(
          new Vector2( movingRect.minX, movingRect.maxY ),
          new Vector2( movingRect.maxX, movingRect.maxY )
        );
        var topEdgeSmear = this.projectShapeFromLine( movingTopEdge, proposedTranslation );

        if ( movingTopEdge.start.y <= stationaryRect.minY && topEdgeSmear.intersectsBounds( stationaryRect ) ) {

          // collision detected, limit motion
          yTranslation = stationaryRect.minY - movingTopEdge.start.y - MIN_INTER_ELEMENT_DISTANCE;
        }
      }
      if ( proposedTranslation.y < 0 ) {

        // check for collisions moving down
        var movingBottomEdge = new Line(
          new Vector2( movingRect.minX, movingRect.minY ),
          new Vector2( movingRect.maxX, movingRect.minY )
        );
        var bottomEdgeSmear = this.projectShapeFromLine( movingBottomEdge, proposedTranslation );

        if ( movingBottomEdge.start.y >= stationaryRect.maxY && bottomEdgeSmear.intersectsBounds( stationaryRect ) ) {

          // collision detected, limit motion
          yTranslation = stationaryRect.maxY - movingBottomEdge.start.y + MIN_INTER_ELEMENT_DISTANCE;
        }
      }

      return new Vector2( xTranslation, yTranslation );
    },

    /**
     * returns true if surface1 is above surface 2 such that they overlap in the x (horizontal) direction
     * @param {HorizontalSurface} surface1
     * @param {HorizontalSurface} surface2
     * @private
     */
    isDirectlyAbove: function( surface1, surface2 ) {
      return surface2.xRange.contains( surface1.getCenterX() ) && surface1.yPos > surface2.yPos;
    },

    /**
     * @param {UserMovableModelElement} element
     * @returns {Property.<HorizontalSurface>}
     * @private
     */
    findBestSupportSurface: function( element ) {
      var self = this;
      var bestOverlappingSurface = null;

      // check each of the possible supporting elements in the model to see if this element can go on top of it
      this.modelElementList.forEach( function( potentialSupportingElement ) {

        if ( potentialSupportingElement === element || potentialSupportingElement.isStackedUpon( element ) ) {

          // The potential supporting element is either the same as the test element or is sitting on top of the test
          // element.  In either case, it can't be used to support the test element, so skip it.
          return;
        }

        var bottom = element.bottomSurfaceProperty;
        var top = potentialSupportingElement.topSurfaceProperty;

        assert && assert( top.value === null || top.value.owner === potentialSupportingElement );

        if ( top.value && bottom.value.overlapsWith( top.value ) ) {

          // there is at least some overlap, so determine if this surface is the best one so far
          var surfaceOverlap = self.getHorizontalOverlap( top.value, bottom.value );

          // The following nasty 'if' clause determines if the potential supporting surface is a better one than we
          // currently have based on whether we have one at all, or has more overlap than the previous best choice, or
          // is directly above the current one.
          if ( bestOverlappingSurface === null ||
               ( surfaceOverlap > self.getHorizontalOverlap( bestOverlappingSurface.value, bottom.value ) &&
                 !self.isDirectlyAbove( bestOverlappingSurface.value, top.value ) ) ||
               ( self.isDirectlyAbove( top.value, bestOverlappingSurface.value ) ) ) {
            bestOverlappingSurface = top;
          }
        }
      } );

      // Make sure that the best supporting surface isn't at the bottom of a stack, which can happen in cases where the
      // model element being tested isn't directly above the best surface's center.
      if ( bestOverlappingSurface !== null ) {
        while ( bestOverlappingSurface.value.getElementOnSurface() !== null ) {
          // TODO: The commented-out code was helpful in starting to track down some issues related to reset that was
          // causing failures of the automated testing, see
          // https://github.com/phetsims/energy-forms-and-changes/issues/25.  I (jblanco) am leaving it here so that
          // I can more easily pick this up again when the sim becomes more of a priority.
          //assert && assert(
          //  bestOverlappingSurface.getElementOnSurface().topSurfaceProperty.get() !== null,
          //  'top surface is not set on model element, this should not happen'
          //);
          //console.log( '--------------' );
          //console.log( 'best overlapping surface was owned by ' + bestOverlappingSurface.owner.id );
          bestOverlappingSurface = bestOverlappingSurface.value.getElementOnSurface().topSurfaceProperty;
          //console.log( 'best overlapping surface now owned by ' + bestOverlappingSurface.owner.id );
          //if ( bestOverlappingSurface && bestOverlappingSurface.owner === element ){
          //  debugger;
          //}
        }
      }

      return bestOverlappingSurface;
    },

    /**
     * get the amount of overlap in the x direction between two horizontal surfaces
     * @param {HorizontalSurface} surface1
     * @param {HorizontalSurface} surface2
     * @public
     */
    getHorizontalOverlap: function( surface1, surface2 ) {
      var lowestMax = Math.min( surface1.xRange.max, surface2.xRange.max );
      var highestMin = Math.max( surface1.xRange.min, surface2.xRange.min );
      return Math.max( lowestMax - highestMin, 0 );
    },

    /**
     * get the temperature and color that would be sensed by a thermometer at the provided location
     * @param {Vector2} position - location to be sensed
     * @returns {TemperatureAndColor} - object with temperature and color
     * @public
     */
    getTemperatureAndColorAtLocation: function( position ) {
      var locationAsPoint = position;

      // Test blocks first.  This is a little complicated since the z-order must be taken into account.
      var copyOfBlockList = this.getBlockList().slice( 0 );

      copyOfBlockList.sort( function( block1, block2 ) {
        if ( block1.position === block2.position ) {
          return 0;
        }
        if ( block2.positionProperty.value.x > block1.positionProperty.value.x || block2.positionProperty.value.y > block1.positionProperty.value.y ) {
          return 1;
        }
        return -1;
      } );

      copyOfBlockList.forEach( function( block ) {
        if ( block.getProjectedShape().containsPoint( locationAsPoint ) ) {
          return new TemperatureAndColor( block.temperature, block.color );
        }
      } );

      // test if this point is in the water or steam associated with the beaker
      if ( this.beaker.getThermalContactArea().containsPoint( locationAsPoint ) ) {
        return new TemperatureAndColor( this.beaker.temperatureProperty.get(), EFACConstants.WATER_COLOR_IN_BEAKER );
      }
      else if ( this.beaker.getSteamArea().containsPoint( locationAsPoint ) && this.beaker.steamingProportion > 0 ) {
        return new TemperatureAndColor( this.beaker.getSteamTemperature(
          locationAsPoint.y - this.beaker.getSteamArea().minY ), 'white' );
      }

      // test if the point is a burner
      this.burners.forEach( function( burner ) {
        if ( burner.getFlameIceRect().containsPoint( locationAsPoint ) ) {
          return new TemperatureAndColor( burner.getTemperature(), EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR );
        }
      } );

      // point is in nothing else, so return the air temperature
      return new TemperatureAndColor( this.air.getTemperature(), EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR );
    }
  } );
} );
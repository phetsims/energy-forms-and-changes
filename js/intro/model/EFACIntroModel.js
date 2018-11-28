// Copyright 2014-2018, University of Colorado Boulder

/**
 *  model for the 'Intro' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Air = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Air' );
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var BeakerContainer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BeakerContainer' );
  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var BlockType = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BlockType' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Burner = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Burner' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimSpeed = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/SimSpeed' );
  var StickyTemperatureAndColorSensor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/StickyTemperatureAndColorSensor' );
  var TemperatureAndColor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/TemperatureAndColor' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var NUM_THERMOMETERS = 3;
  var BEAKER_WIDTH = 0.085; // in meters
  var BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;
  var MAJOR_TICK_MARK_DISTANCE = BEAKER_HEIGHT * 0.95 / 3;

  // the sim model x range is laid out in meters with 0 in the middle, so this value is the left edge of the sim, in meters
  var LEFT_EDGE = -0.30;
  var RIGHT_EDGE = 0.30;

  // this is the desired space between the edges of the sim ( left edge or right edge) and the edge
  // of the widest element (a beaker) when it's sitting at one of the outer snap-to spots on the ground, in meters
  var EDGE_PAD = 0.016;

  // number of snap-to spots on the ground, should match number of thermal containers
  var NUM_GROUND_SPOTS = 6;

  // initial thermometer location, intended to be away from any model objects so that they don't get stuck to anything
  var INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

  // minimum distance allowed between two objects, used to prevent floating point issues
  var MIN_INTER_ELEMENT_DISTANCE = 1E-9; // in meters

  // Threshold of temperature difference between the bodies in a multi-body system below which energy can be exchanged
  // with air.
  var MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE = 2.0; // in degrees K, empirically determined

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
    this.normalSimSpeedProperty = new Property( SimSpeed.NORMAL );

    // @public (read-only) {Air} - model of the air that surrounds the other model elements, and can absorb or provide
    // energy
    this.air = new Air( this.energyChunksVisibleProperty );

    // @private - calculate space in between the center points of the snap-to spots on the ground
    this.spaceBetweenSpotCenters = ( RIGHT_EDGE - LEFT_EDGE - ( EDGE_PAD * 2 ) - BEAKER_WIDTH ) / ( NUM_GROUND_SPOTS - 1 );
    this.groundSpotXPositions = [];

    // determine the locations of the snap-to spots, and round them to a few decimal places
    var leftEdgeToBeakerCenterPad = LEFT_EDGE + EDGE_PAD + ( BEAKER_WIDTH / 2 );
    for ( var i = 0; i < NUM_GROUND_SPOTS; i++ ) {
      this.groundSpotXPositions.push( Math.round( ( this.spaceBetweenSpotCenters * i + leftEdgeToBeakerCenterPad ) * 1000 ) / 1000 );
    }

    // @public (read-only) {Block}
    this.brick = new Block(
      new Vector2( this.groundSpotXPositions[ 1 ], 0 ),
      this.energyChunksVisibleProperty,
      BlockType.BRICK
    );

    // @public (read-only) {Block}
    this.ironBlock = new Block(
      new Vector2( this.groundSpotXPositions[ 0 ], 0 ),
      this.energyChunksVisibleProperty,
      BlockType.IRON
    );

    // @public (read-only) {Block[]} - list of all blocks in sim
    this.blocks = [ this.brick, this.ironBlock ];

    var listOfThingsThatCanGoInBeaker = [ this.brick, this.ironBlock ];

    // @public (read-only) {BeakerContainer)
    this.waterBeaker = new BeakerContainer(
      new Vector2( this.groundSpotXPositions[ 2 ], 0 ),
      BEAKER_WIDTH,
      BEAKER_HEIGHT,
      listOfThingsThatCanGoInBeaker,
      this.energyChunksVisibleProperty, {
        majorTickMarkDistance: MAJOR_TICK_MARK_DISTANCE
      }
    );

    // @public (read-only) {BeakerContainer)
    this.oliveOilBeaker = new BeakerContainer(
      new Vector2( this.groundSpotXPositions[ 3 ], 0 ),
      BEAKER_WIDTH,
      BEAKER_HEIGHT,
      listOfThingsThatCanGoInBeaker,
      this.energyChunksVisibleProperty, {
        fluidColor: EFACConstants.OLIVE_OIL_COLOR_IN_BEAKER,
        fluidSpecificHeat: EFACConstants.OLIVE_OIL_SPECIFIC_HEAT,
        fluidDensity: EFACConstants.OLIVE_OIL_DENSITY,
        fluidBoilingPoint: EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE,
        energyContainerCategory: EnergyContainerCategory.OLIVE_OIL,
        majorTickMarkDistance: MAJOR_TICK_MARK_DISTANCE
      }
    );

    // @public (read-only) {Burner} - right and left burners
    this.leftBurner = new Burner( new Vector2( this.groundSpotXPositions[ 4 ], 0 ), this.energyChunksVisibleProperty );
    this.rightBurner = new Burner( new Vector2( this.groundSpotXPositions[ 5 ], 0 ), this.energyChunksVisibleProperty );

    // @public (read-only) {BeakerContainer[]}
    this.beakers = [ this.waterBeaker, this.oliveOilBeaker ];

    // @private - put all the thermal containers on a list for easy iteration
    this.thermalContainers = [ this.brick, this.ironBlock, this.waterBeaker, this.oliveOilBeaker ];

    // @private - put burners into a list for easy iteration
    this.burners = [ this.rightBurner, this.leftBurner ];

    // @private - put all of the model elements on a list for easy iteration
    this.modelElementList = [ this.leftBurner, this.rightBurner, this.brick, this.ironBlock, this.waterBeaker, this.oliveOilBeaker ];

    // @public (read-only) {StickyTemperatureAndColorSensor[]}
    this.temperatureAndColorSensors = [];
    _.times( NUM_THERMOMETERS, function() {
      var sensor = new StickyTemperatureAndColorSensor( self, INITIAL_THERMOMETER_LOCATION, false );
      self.temperatureAndColorSensors.push( sensor );

      // Add handling for a special case where the user drops something (generally a block) in the beaker behind this
      // thermometer. The action is to automatically move the thermometer to a location where it continues to sense the
      // beaker temperature. This was requested after interviews.
      sensor.sensedElementColorProperty.link( function( newColor, oldColor ) {

        self.beakers.forEach( function( beaker ) {
          var blockWidthIncludingPerspective = self.ironBlock.getProjectedShape().bounds.width;

          var xRange = new Range(
            beaker.getBounds().centerX - blockWidthIncludingPerspective / 2,
            beaker.getBounds().centerX + blockWidthIncludingPerspective / 2
          );

          if ( newColor !== sensor.sensedElementColorProperty.initialValue &&
               oldColor === beaker.fluidColor &&
               !sensor.userControlledProperty.get() &&
               !beaker.userControlledProperty.get() &&
               xRange.contains( sensor.positionProperty.value.x ) ) {

            // fake a movement by the user to a point in the beaker where the sensor is not over a brick
            sensor.userControlledProperty.set( true ); // must toggle userControlled to enable element following
            sensor.position = new Vector2(
              beaker.getBounds().maxX - 0.01,
              beaker.getBounds().minY + beaker.getBounds().height * 0.33
            );
            sensor.userControlledProperty.set( false );
          }
        } );
      } );
    } );

    // Pre-calculate the space occupied by the burners, since they don't move.  This is used when validating positions
    // of movable model elements.  The space is extended a bit to the left to avoid awkward z-ording issues when
    // preventing overlap.
    var leftBurnerBounds = this.leftBurner.getCompositeBounds();
    var rightBurnerBounds = this.rightBurner.getCompositeBounds();
    var burnerPerspectiveExtension = leftBurnerBounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                     Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;

    this.burnerBlockingRect = new Bounds2(
      leftBurnerBounds.minX - burnerPerspectiveExtension,
      leftBurnerBounds.minY,
      rightBurnerBounds.maxX,
      rightBurnerBounds.maxY
    );
  }

  // helper function
  function mapHeatCoolLevelToColor( heatCoolLevel ) {
    var color;
    if ( heatCoolLevel > 0 ) {
      color = 'orange';
    }
    else if ( heatCoolLevel < 0 ) {
      color = '#87CEFA';
    }
    else {
      color = EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR;
    }
    return color;
  }

  energyFormsAndChanges.register( 'EFACIntroModel', EFACIntroModel );

  return inherit( Object, EFACIntroModel, {

    /**
     * restore the initial conditions of the model
     * @public
     */
    reset: function() {
      this.energyChunksVisibleProperty.reset();
      this.playProperty.reset();
      this.normalSimSpeedProperty.reset();
      this.air.reset();
      this.leftBurner.reset();
      this.rightBurner.reset();
      this.ironBlock.reset();
      this.brick.reset();
      this.waterBeaker.reset();
      this.oliveOilBeaker.reset();
      this.temperatureAndColorSensors.forEach( function( sensor ) {
        sensor.reset();
      } );
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
        var multiplier = this.normalSimSpeedProperty.get() === SimSpeed.NORMAL ? 1 :
                         EFACConstants.FAST_FORWARD_MULTIPLIER;
        this.stepModel( dt * multiplier );
      }
    },

    /**
     * update the state of the model for a given time amount
     * @param {number} dt - time step, in seconds
     * @private
     */
    stepModel: function( dt ) {

      var self = this;

      // Cause any user-movable model elements that are not supported by a surface to fall or, in some cases, jump up
      // towards the nearest supporting surface.
      var unsupported;
      var raised;
      this.thermalContainers.forEach( function( movableModelElement ) {
        unsupported = movableModelElement.supportingSurface === null;
        raised = ( movableModelElement.positionProperty.value.y !== 0 );
        if ( !movableModelElement.userControlledProperty.value && unsupported && raised ) {
          self.fallToSurface( movableModelElement, dt );
        }
        else if ( !movableModelElement.userControlledProperty.value &&
                  unsupported &&
                  !self.groundSpotXPositions.includes( movableModelElement.positionProperty.value.x ) ) {
          self.fallToSurface( movableModelElement, dt );
        }
      } );

      // update the fluid level in the beaker, which could be displaced by one or more of the blocks
      this.beakers.forEach( function( beaker ) {
        beaker.updateFluidDisplacement( [ self.brick.getBounds(), self.ironBlock.getBounds() ] );
      } );

      //=====================================================================
      // Energy and Energy Chunk Exchange
      //=====================================================================

      // Note: The original intent was to design all the energy containers such that the order of the exchange didn't
      // matter, nor who was exchanging with whom.  This turned out to be a lot of extra work to maintain, and was
      // eventually abandoned.  So, the order and nature of the exchanges below should be maintained unless there is a
      // good reason not to, and any changes should be well tested.

      // loop through all the movable thermal energy containers and have them exchange energy with one another
      self.thermalContainers.forEach( function( container1, index ) {
        self.thermalContainers.slice( index + 1, self.thermalContainers.length ).forEach( function( container2 ) {
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
              element.addEnergyChunk( burner.extractEnergyChunkClosestToPoint( element.getCenterPoint() ) );
            }
            else if ( burner.canAcceptEnergyChunk() && ( burnerChunkBalance < 0 || elementChunkBalance > 0 ) ) {
              // Extract an energy chunk from the model element
              var energyChunk = element.extractEnergyChunkClosestToShape( burner.getFlameIceRect() );

              if ( energyChunk !== null ) {
                burner.addEnergyChunk( energyChunk );
              }
            }
          }
        } );
      } );

      // exchange energy chunks between movable thermal energy containers
      self.thermalContainers.forEach( function( container1, index ) {
        self.thermalContainers.slice( index + 1, self.thermalContainers.length ).forEach( function( container2 ) {
          if ( container1.thermalContactArea.getThermalContactLength( container2.thermalContactArea ) > 0 ) {

            // exchange one or more chunks if appropriate
            if ( container1.getEnergyChunkBalance() > 0 && container2.getEnergyChunkBalance() < 0 ) {
              container2.addEnergyChunk( container1.extractEnergyChunkClosestToShape( container2.thermalContactArea ) );
            }
            else if ( container1.getEnergyChunkBalance() < 0 && container2.getEnergyChunkBalance() > 0 ) {
              container1.addEnergyChunk( container2.extractEnergyChunkClosestToShape( container1.thermalContactArea ) );
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
          if ( container1.thermalContactArea.getThermalContactLength( container2.thermalContactArea ) > 0 ) {
            contactWithOtherMovableElement = true;
            maxTemperatureDifference = Math.max( Math.abs( container1.getTemperature() - container2.getTemperature() ),
              maxTemperatureDifference );
          }
        } );

        self.beakers.forEach( function( beaker ) {
          if ( beaker.thermalContactArea.containsPoint( container1.getBounds() ) ) {

            // this model element is immersed in the beaker
            immersedInBeaker = true;
          }
        } );

        // exchange energy and energy chunks with the air if appropriate conditions are met
        if ( !contactWithOtherMovableElement ||
             ( !immersedInBeaker && ( maxTemperatureDifference < MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE ||
                                      container1.getEnergyBeyondMaxTemperature() > 0 ) ) ) {
          self.air.exchangeEnergyWith( container1, dt );

          if ( container1.getEnergyChunkBalance() > 0 ) {
            var pointAbove = new Vector2(
              phet.joist.random.nextDouble() * container1.getBounds().width + container1.getBounds().minX,
              container1.getBounds().maxY
            );
            var energyChunk = container1.extractEnergyChunkClosestToPoint( pointAbove );

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
          self.air.addEnergyChunk( burner.extractEnergyChunkClosestToPoint( burner.getCenterPoint() ), null );
        }
        else if ( burner.getEnergyChunkCountForAir() < 0 ) {
          burner.addEnergyChunk( self.air.extractEnergyChunkClosestToPoint( burner.getCenterPoint() ) );
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

      // sort list of ground spots in order, with the closest spot to modelElement first
      this.groundSpotXPositions.sort( function( a, b ) {
        var distanceA = Math.abs( a - modelElement.positionProperty.value.x );
        var distanceB = Math.abs( b - modelElement.positionProperty.value.x );
        return distanceA - distanceB;
      } );
      var destinationXSpot = null;
      var destinationSurface = null;

      // check out each spot
      for ( var i = 0; i < this.groundSpotXPositions.length &&
                       destinationXSpot === null &&
                       destinationSurface === null; i++
      ) {
        var modelElementsInSpot = [];

        // get a list of what's currently in the spot being checked
        this.modelElementList.forEach( function( potentialRestingModelElement ) {
          if (
            potentialRestingModelElement !== modelElement &&

            // this if statement is checking each potentialRestingModelElement to see which ones are already in the spot
            // that modelElement is falling to.
            //
            // the following first condition usually just needs to check if potentialRestingModelElement's center x
            // coordinate matches the current ground spot x coordinate, but instead it considers any
            // potentialRestingModelElement's to be in this spot if its center x coordinate is within half a spot's
            // width of the ground spot x coordinate. this handles the multitouch case where modelElement is falling and
            // a user drags a different model element somewhere underneath it (which is likely not located at a ground
            // x coordinate), because instead of not detecting that user-held model element as occupying this spot
            // (and therefore falling through it and overlapping), it does detect it, and then falls to the model elements
            // surface instead of all the way down to the ground spot.
            //
            // the first condition of the or clause checks that potentialRestingModelElement is below modelElement
            // because in the case where a beaker with a block inside is being dropped, we don't want the beaker to
            // think that its block is in the spot below it. however, because of floating point errors, sometimes when
            // a block is dragged onto a burner surface next to another block, it is actually slightly lower than the
            // resting block, so it still needs to detect that the resting block is in that spot. otherwise, it will
            // jump inside of it instead of on top of it. that is solved by the second condition of the or clause, which
            // makes sure that the approaching block is far enough away in the x direction that it couldn't be a block
            // inside a beaker, since a block and its containing beaker share the same x coordinate. for that reason,
            // the minimum distance away was arbitrarily chosen.
            Math.abs( potentialRestingModelElement.positionProperty.value.x - self.groundSpotXPositions[ i ] ) <= self.spaceBetweenSpotCenters / 2 &&
            ( potentialRestingModelElement.positionProperty.value.y <= modelElement.positionProperty.value.y ||
              Math.abs( potentialRestingModelElement.positionProperty.value.x - modelElement.positionProperty.value.x ) > modelElement.width / 2
            )
          ) {
            modelElementsInSpot.push( potentialRestingModelElement );
          }
        } );

        if ( modelElementsInSpot.length > 0 ) {
          var highestElement = modelElementsInSpot[ 0 ];
          var beakerFoundInSpot = highestElement instanceof Beaker;

          // if more than one model element is in the spot, find the highest surface and flag any beakers that are present
          for ( var j = 1; j < modelElementsInSpot.length && !beakerFoundInSpot; j++ ) {
            beakerFoundInSpot = beakerFoundInSpot || modelElementsInSpot[ j ] instanceof Beaker;
            if ( modelElementsInSpot[ j ].topSurface.positionProperty.value.y > highestElement.topSurface.positionProperty.value.y ) {
              highestElement = modelElementsInSpot[ j ];
            }
          }
          var currentModelElementInStack = modelElement;
          var beakerFoundInStack = currentModelElementInStack instanceof Beaker;

          // iterate through the stack of model elements being held and flag if any beakers are in it
          while ( currentModelElementInStack.topSurface.getElementOnSurface() && !beakerFoundInStack ) {
            beakerFoundInStack = beakerFoundInStack || currentModelElementInStack.topSurface.getElementOnSurface() instanceof Beaker;
            currentModelElementInStack = currentModelElementInStack.topSurface.getElementOnSurface();
          }

          if ( !( beakerFoundInSpot && beakerFoundInStack ) ) {
            destinationSurface = highestElement.topSurface;
          }
        }
        else {
          destinationXSpot = this.groundSpotXPositions[ i ];
        }
      }

      // if so, center the model element above its new supporting element
      if ( destinationSurface !== null ) {
        minYPos = destinationSurface.positionProperty.value.y;
        targetX = destinationSurface.getCenterX();
        targetY = modelElement.positionProperty.value.y;
        modelElement.positionProperty.set( new Vector2( targetX, targetY ) );
      }
      else {
        modelElement.positionProperty.set( new Vector2( destinationXSpot, modelElement.positionProperty.value.y ) );
      }

      // calculate a proposed Y position based on gravitational falling
      var velocity = modelElement.verticalVelocityProperty.value + acceleration * dt;
      var proposedYPos = modelElement.positionProperty.value.y + velocity * dt;
      if ( proposedYPos < minYPos ) {

        // the element has landed on the ground or some other surface
        proposedYPos = minYPos;
        modelElement.verticalVelocityProperty.set( 0 );
        if ( destinationSurface !== null ) {
          modelElement.setSupportingSurface( destinationSurface );
          destinationSurface.addElementToSurface( modelElement );
        }
      }
      else {
        modelElement.verticalVelocityProperty.set( velocity );
      }
      modelElement.positionProperty.set( new Vector2( modelElement.positionProperty.value.x, proposedYPos ) );
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
     * Evaluate whether the provided model element can be moved to the provided position without overlapping with other
     * solid model elements.  If overlap would occur, adjust the position to one that works.  Note that this is not
     * very general due to a number of special requirements for the Energy Forms and Changes sim, so it would likely not
     * be easy to reuse.
     * @param {RectangularThermalMovableModelElement} modelElement - element whose position is being checked
     * @param {Vector2} proposedPosition - the position where the model element would like to go
     * @returns {Vector2} the original proposed position if valid, or alternative position if not
     * TODO: Consider adding the optimization where a vector is provided so that a new one doesn't have to be allocated
     */
    constrainPosition: function( modelElement, proposedPosition ) {

      var self = this;

      // TODO: Optimize this method for allocations

      // calculate the proposed motion TODO consider optimizing to avoid allocation
      var allowedTranslation = proposedPosition.minus( modelElement.positionProperty.get() );

      // get the current composite bounds of the model element
      var modelElementBounds = modelElement.getCompositeBoundsForPosition( modelElement.positionProperty.get() );

      // create bounds that use the perspective compensation that is necessary for evaluating burner interaction
      var modelElementBoundsWithSidePerspective = new Bounds2(
        modelElementBounds.minX - modelElement.perspectiveCompensation.x,
        modelElementBounds.minY,
        modelElementBounds.maxX + modelElement.perspectiveCompensation.x,
        modelElementBounds.maxY
      );

      // validate against burner boundaries
      allowedTranslation = this.determineAllowedTranslation(
        modelElementBoundsWithSidePerspective,
        this.burnerBlockingRect,
        allowedTranslation,
        true
      );

      // TODO: There is a request to add another beaker, see https://github.com/phetsims/energy-forms-and-changes/issues/39.
      // The code below is not general enough to handle the interactions in that case, and will need to be improved.
      // One thought that I (jbphet) had was to add a set of methods to an object that would test the various interactions
      // and would be indexed by the model element type of the moving and stationary objects, so it would be structured
      // like this:
      // OVERLAP_TEST_FUNCTIONS = {
      //   block: {
      //     block: function...
      //     beaker: function...
      //     burners: function...
      //   }
      //   beaker: {
      //     block: function...
      //     beaker: function...
      //     burners: function...
      //   }
      // }

      // now check the model element's motion against each of the beakers
      this.beakers.forEach( function( beaker ) {

        if ( beaker === modelElement ) {
          // don't test against self
          return;
        }

        // get the bounds set that describes the shape of the beaker
        var beakerBoundsList = beaker.translatedPositionTestingBoundsList;

        // if the modelElement is a block, it has x and y perspective comp that need to be used
        var modelElementBoundsWithTopAndSidePerspective = new Bounds2(
          modelElementBounds.minX - modelElement.perspectiveCompensation.x,
          modelElementBounds.minY - modelElement.perspectiveCompensation.y,
          modelElementBounds.maxX + modelElement.perspectiveCompensation.x,
          modelElementBounds.maxY + modelElement.perspectiveCompensation.y
        );

        // don't restrict the motion based on the beaker if the beaker is on top of this model element
        if ( !beaker.isStackedUpon( modelElement ) ) {

          // TODO: This is less than ideal because it assumes the bottom of the beaker is the 2nd bounds entry
          allowedTranslation = self.determineAllowedTranslation(
            modelElementBoundsWithTopAndSidePerspective,
            beakerBoundsList[ 0 ],
            allowedTranslation,
            true
          );
          allowedTranslation = self.determineAllowedTranslation(
            modelElementBoundsWithSidePerspective,
            beakerBoundsList[ 1 ],
            allowedTranslation,
            true
          );
          allowedTranslation = self.determineAllowedTranslation(
            modelElementBoundsWithTopAndSidePerspective,
            beakerBoundsList[ 2 ],
            allowedTranslation,
            true
          );
        }
        else {
          // if beaker A is stacked on the current modelElement, get beaker B directly as the otherBeaker because there are
          // currently only two beakers. this will need to be generalized to check for each other beaker that is not
          // stacked on this modelElement if the time comes when more than two beakers exist.
          var otherBeaker = self.beakers[ 1 - self.beakers.indexOf( beaker ) ];

          // get the bounds of the other beaker and the bounds of the beaker stacked on top of this modelElement
          var otherBeakerBoundsList = otherBeaker.translatedPositionTestingBoundsList;
          var currentBeakerBounds = beaker.getBounds();

          allowedTranslation = self.determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 0 ],
            allowedTranslation,
            true
          );
          allowedTranslation = self.determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 1 ],
            allowedTranslation,
            true
          );
          allowedTranslation = self.determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 2 ],
            allowedTranslation,
            true
          );
        }
      } );

      // now check the model element's motion against each of the blocks
      this.blocks.forEach( function( block ) {

        if ( block === modelElement ) {
          // don't test against self
          return;
        }

        var blockBounds = block.getCompositeBounds();

        // Do not restrict the model element's motion in positive Y direction if the tested block is sitting on top of
        // the model element - the block will simply be lifted up.
        var restrictPositiveY = !block.isStackedUpon( modelElement );

        var modelElementBounds = modelElement.getCompositeBounds();

        self.beakers.forEach( function( beaker ) {
          if ( modelElement === beaker ) {

            // Special handling for the beaker: Use the perspective-compensated edge of the block instead of the model
            // edge in order to simplify z-order handling.
            blockBounds = new Bounds2(
              blockBounds.minX - self.brick.perspectiveCompensation.x,
              blockBounds.minY,
              blockBounds.maxX + self.brick.perspectiveCompensation.x,
              blockBounds.maxY
            );
          }

          // Clamp the translation based on the test block's position, but handle the case where the block is immersed
          // in the beaker.
          if ( !( modelElement === beaker &&
                  beaker.getCompositeBounds().containsBounds( blockBounds ) ) ) {

            allowedTranslation = self.determineAllowedTranslation(
              modelElementBounds,
              blockBounds,
              allowedTranslation,
              restrictPositiveY
            );
          }
        } );
      } );

      return modelElement.positionProperty.get().plus( allowedTranslation );
    },

    /**
     * a version of Bounds2.intersectsBounds that doesn't count equal edges as intersection
     * @param {Bounds2} bounds1
     * @param {Bounds2} bounds2
     * @return {boolean}
     */
    exclusiveIntersectsBounds: function( bounds1, bounds2 ) {
      var minX = Math.max( bounds1.minX, bounds2.minX );
      var minY = Math.max( bounds1.minY, bounds2.minY );
      var maxX = Math.min( bounds1.maxX, bounds2.maxX );
      var maxY = Math.min( bounds1.maxY, bounds2.maxY );
      return ( maxX - minX ) > 0 && ( maxY - minY > 0 );
    },

    /**
     * Determine the portion of a proposed translation that may occur given a moving rectangle and a stationary
     * rectangle that can block the moving one.
     * @param {Boundd2} movingElementBounds
     * @param {Boundd2} stationaryElementBounds
     * @param {Vector2} proposedTranslation
     * @param {boolean} restrictPosY        Flag that controls whether the positive Y direction is restricted.  This
     *                                      is often set false if there is another model element on top of the one
     *                                      being tested.
     * @returns {Vector2}
     * @private
     */
    determineAllowedTranslation: function( movingElementBounds,
                                           stationaryElementBounds,
                                           proposedTranslation,
                                           restrictPosY ) {

      // TODO: Use vector pooling and possibly Shape or Bounds2 pooling to improve performance

      // test for case where rectangles already overlap
      if ( this.exclusiveIntersectsBounds( movingElementBounds, stationaryElementBounds ) && restrictPosY ) {

        // the bounds already overlap - are they right on top of one another in both dimensions?
        // if ( movingElementBounds.centerX === stationaryElementBounds.centerX && movingElementBounds.centerY === stationaryElementBounds.centerY ) {
        //   console.log( 'Warning: Rectangle centers in same location, returning zero vector.' );
        //   return new Vector2( 0, 0 );
        // }

        // determine the motion in the X & Y directions that will "cure" the overlap
        var xOverlapCure = 0;
        if ( movingElementBounds.maxX >= stationaryElementBounds.minX &&
             movingElementBounds.minX <= stationaryElementBounds.minX ) {

          xOverlapCure = stationaryElementBounds.minX - movingElementBounds.maxX;
        }
        else if ( stationaryElementBounds.maxX >= movingElementBounds.minX &&
                  stationaryElementBounds.minX <= movingElementBounds.minX ) {

          xOverlapCure = stationaryElementBounds.maxX - movingElementBounds.minX;
        }
        var yOverlapCure = 0;
        if ( movingElementBounds.maxY >= stationaryElementBounds.minY &&
             movingElementBounds.minY <= stationaryElementBounds.minY ) {

          yOverlapCure = stationaryElementBounds.minY - movingElementBounds.maxY;
        }
        else if ( stationaryElementBounds.maxY >= movingElementBounds.minY &&
                  stationaryElementBounds.minY <= movingElementBounds.minY ) {

          yOverlapCure = stationaryElementBounds.maxY - movingElementBounds.minY;
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
      var motionTestBounds = Bounds2.NOTHING.copy();

      // X direction
      if ( proposedTranslation.x > 0 ) {

        // check for collisions moving right
        motionTestBounds.setMinMax(
          movingElementBounds.maxX,
          movingElementBounds.minY,
          movingElementBounds.maxX + xTranslation,
          movingElementBounds.maxY
        );

        if ( this.exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

          // collision detected, limit motion in this direction
          xTranslation = stationaryElementBounds.minX - movingElementBounds.maxX - MIN_INTER_ELEMENT_DISTANCE;
        }
      }
      else if ( proposedTranslation.x < 0 ) {


        // check for collisions moving left
        motionTestBounds.setMinMax(
          movingElementBounds.minX + xTranslation,
          movingElementBounds.minY,
          movingElementBounds.minX,
          movingElementBounds.maxY
        );

        if ( this.exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

          // collision detected, limit motion in this direction
          xTranslation = stationaryElementBounds.maxX - movingElementBounds.minX + MIN_INTER_ELEMENT_DISTANCE;
        }
      }

      // Y direction.
      if ( proposedTranslation.y > 0 && restrictPosY ) {

        // check for collisions moving up
        motionTestBounds.setMinMax(
          movingElementBounds.minX,
          movingElementBounds.maxY,
          movingElementBounds.maxX,
          movingElementBounds.maxY + yTranslation
        );

        if ( this.exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

          // collision detected, limit motion
          yTranslation = stationaryElementBounds.minY - movingElementBounds.maxY - MIN_INTER_ELEMENT_DISTANCE;
        }
      }
      else if ( proposedTranslation.y < 0 ) {

        // check for collisions moving down
        motionTestBounds.setMinMax(
          movingElementBounds.minX,
          movingElementBounds.minY + yTranslation,
          movingElementBounds.maxX,
          movingElementBounds.minY
        );

        if ( this.exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

          // collision detected, limit motion
          yTranslation = stationaryElementBounds.maxY - movingElementBounds.minY - MIN_INTER_ELEMENT_DISTANCE;
        }
      }

      return new Vector2( xTranslation, yTranslation );
    },

    /**
     * Get the temperature and color that would be sensed by a thermometer at the provided location.  This is done as
     * a single operation instead of having separate methods for getting temperature and color because it is more
     * efficient to do it like this.
     * @param {Vector2} position - location to be sensed
     * @returns {TemperatureAndColor} - object with temperature and color
     * @public
     */
    getTemperatureAndColorAtLocation: function( position ) {

      var temperatureAndColor = null;

      // Test blocks first.  This is a little complicated since the z-order must be taken into account.
      var copyOfBlockList = this.blocks.slice( 0 );

      copyOfBlockList.sort( function( block1, block2 ) {
        if ( block1.position === block2.position ) {
          return 0;
        }
        if ( block2.positionProperty.value.x > block1.positionProperty.value.x ||
             block2.positionProperty.value.y > block1.positionProperty.value.y ) {
          return 1;
        }
        return -1;
      } );

      for ( var i = 0; i < copyOfBlockList.length && !temperatureAndColor; i++ ) {
        var block = copyOfBlockList[ i ];
        if ( block.getProjectedShape().containsPoint( position ) ) {
          temperatureAndColor = new TemperatureAndColor( block.temperature, block.color );
        }
      }

      this.beakers.forEach( function( beaker ) {
        // test if this point is in the water or steam associated with the beaker
        if ( !temperatureAndColor && beaker.thermalContactArea.containsPoint( position ) ) {
          temperatureAndColor = new TemperatureAndColor(
            beaker.temperatureProperty.get(),
            beaker.fluidColor
          );
        }
        else if ( !temperatureAndColor &&
                  beaker.getSteamArea().containsPoint( position ) &&
                  beaker.steamingProportion > 0 ) {
          temperatureAndColor = new TemperatureAndColor(
            beaker.getSteamTemperature( position.y - beaker.getSteamArea().minY ),
            'white'
          );
        }
      } );

      // test if the point is a burner
      for ( i = 0; i < this.burners.length && !temperatureAndColor; i++ ) {
        var burner = this.burners[ i ];
        if ( burner.getFlameIceRect().containsPoint( position ) ) {
          temperatureAndColor = new TemperatureAndColor(
            burner.getTemperature(),
            mapHeatCoolLevelToColor( burner.heatCoolLevelProperty.get() )
          );
        }
      }

      if ( !temperatureAndColor ) {

        // the position is in nothing else, so return the air temperature and color
        temperatureAndColor = new TemperatureAndColor(
          this.air.getTemperature(),
          EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR
        );
      }

      return temperatureAndColor;
    }
  } );
} );
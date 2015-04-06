//  Copyright 2002-2015, University of Colorado Boulder

/**
 *  Model for the 'Intro' screen of the Energy Forms And Changes simulation.
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
  //var BlockNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/BlockNode' );
  var Brick = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Brick' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var ElementFollowingThermometer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ElementFollowingThermometer' );
  //var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var Burner = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Burner' );
  //var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IronBlock = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/IronBlock' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Range = require( 'DOT/Range' );
  //var Thermometer = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Thermometer' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Line = require( 'KITE/segments/Line' );
  var Shape = require( 'KITE/Shape' );

  // constants
//   Dimension2D STAGE_SIZE = CenteredStage.DEFAULT_STAGE_SIZE;
  var EDGE_INSET = 10;
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.

  // Initial thermometer location, intended to be away from any model objects.
  var INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

  var NUM_THERMOMETERS = 3;

  // Minimum distance allowed between two objects.  The basically prevents floating point issues.
  var MIN_INTER_ELEMENT_DISTANCE = 1E-9; // In meters.

  // Threshold of temperature difference between the bodies in a multi-body system below which energy can be exchanged with air.
  var MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE = 2.0; // In degrees K, empirically determined.

  var BEAKER_WIDTH = 0.085; // In meters.
  var BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;

  // Flag that can be turned on in order to print out some profiling info.
  var ENABLE_INTERNAL_PROFILING = false;

  // Public variables for the class to be used when internal profiling is enabled.
  var previousTime = 0;
  var TIME_ARRAY_LENGTH = 100;
  var times = [];
  var countUnderMin = 0;

  /**
   * Main constructor for EnergyFormsAndChangesIntroModel, which contains all of the model logic for the entire sim screen.
   *
   * @constructor
   */
  function EnergyFormsAndChangesIntroModel() {

    PropertySet.call( this, {
      energyChunksVisible: false
    } );

    // Extend the scope of this.
    var thisModel = this;

    // Add the air.
    this.air = new Air( this.energyChunksVisible );

    // Add the burners.
    this.rightBurner = new Burner( new Vector2( 0.18, 0 ), this.energyChunksVisibleProperty );
    this.leftBurner = new Burner( new Vector2( 0.08, 0 ), this.energyChunksVisibleProperty );

    // Add and position the blocks
    this.brick = new Brick( new Vector2( -0.1, 0 ), this.energyChunksVisibleProperty );
    this.ironBlock = new IronBlock( new Vector2( -0.175, 0 ), this.energyChunksVisibleProperty );

    // Add and position the beaker.
    var listOfThingsThatCanGoInBeaker = [ this.brick, this.ironBlock ];
    this.beaker = new BeakerContainer( new Vector2( -0.015, 0 ), BEAKER_WIDTH, BEAKER_HEIGHT, listOfThingsThatCanGoInBeaker, this.energyChunksVisibleProperty );

    // Put all the thermal containers on a list for easy iteration.
    this.movableThermalEnergyContainers = [ this.brick, this.ironBlock, this.beaker ];

    // Put burners into a list for easy iteration.
    this.burners = [ this.rightBurner, this.leftBurner ];

    // Add the thermometers.
    this.thermometers = [];
    for ( var i = 0; i < NUM_THERMOMETERS; i++ ) {
      var thermometer = new ElementFollowingThermometer( this, INITIAL_THERMOMETER_LOCATION, false );
      this.thermometers.push( thermometer );

      // Add handling for a special case where the user drops something (generally a block) in the beaker behind this thermometer.
      // The action is to automatically move the thermometer to a location where it continues to sense the beaker temperature.
      // This was requested after interviews.
      thermometer.sensedElementColorProperty.link( function( newColor, oldColor ) {

        var blockWidthIncludingPerspective = thisModel.ironBlock.getProjectedShape().bounds.width;

        var xRange = new Range(
          thisModel.beaker.getRect().centerX - blockWidthIncludingPerspective / 2,
          thisModel.beaker.getRect().centerX + blockWidthIncludingPerspective / 2
        );

        if ( oldColor === EFACConstants.WATER_COLOR_IN_BEAKER && !thermometer.userControlled && xRange.contains( thermometer.position.x ) ) {
          thermometer.userControlled = true; // Must toggle userControlled to enable element following.
          thermometer.position = new Vector2( thisModel.beaker.getRect().maxX - 0.01, thisModel.beaker.getRect().minY + thisModel.beaker.getRect().getHeight() * 0.33 );
          thermometer.userControlled = false; // Must toggle userControlled to enable element following.

        }
      } )
    }
  }

  return inherit( PropertySet, EnergyFormsAndChangesIntroModel, {

    /**
     * Restore the initial conditions of the model.
     */
    reset: function() {

      this.energyChunksVisibleProperty.reset();
      this.air.reset();
      this.leftBurner.reset();
      this.rightBurner.reset();
      this.ironBlock.reset();
      this.brick.reset();
      this.beaker.reset();

      for ( var thermometer in this.thermometers ) {
        if ( this.thermometers.hasOwnProperty( thermometer ) ) {
          thermometer.reset();
        }
      }

    },

    /**
     * Update the state of the model.
     *
     *   @param {number} dt Time step.
     */
    step: function( dt ) {

      // Extend Scope for nested callbacks
      var thisModel = this;

      if ( ENABLE_INTERNAL_PROFILING ) {
        var time = new Date().getTime();
        if ( previousTime != 0 && time - previousTime > 48 || countUnderMin + 1 >= TIME_ARRAY_LENGTH ) {
          console.log( "----------------------" );
          for ( var i; i < countUnderMin; i++ ) {
            console.log( times[ i ] + ' ' );
          }
          countUnderMin = 0;
        }
        previousTime = time;
      }

      // Cause any user-movable model elements that are not supported by a surface to fall (or, in some cases, jump up) towards the nearest supporting
      // surface.
      this.movableThermalEnergyContainers.forEach( function( movableModelElement ) {

        if ( !movableModelElement.userControlled && movableModelElement.supportingSurface == null && movableModelElement.position.y != 0 ) {
          var minYPos = 0;

          //Determine whether there is something below this element that it can land upon.
          var potentialSupportingSurface = this.findBestSupportSurface( movableModelElement );
          if ( potentialSupportingSurface != null ) {
            minYPos = potentialSupportingSurface.yPos;

            // Center the movableModelElement above its new parent
            var targetX = potentialSupportingSurface.centerX;
            thisModel.movableThermalEnergyContainers[ movableModelElement ].x = targetX;

          }
          // Calculate a proposed Y position based on gravitational falling.
          var acceleration = -9.8; // meters/s*s
          var velocity = movableModelElement.verticalVelocity + acceleration * dt;
          var proposedYPos = movableModelElement.positiony + velocity * dt;
          if ( proposedYPos < minYPos ) {
            // The element has landed on the ground or some other surface.
            proposedYPos = minYPos;
            thisModel.movableThermalEnergyContainers[ movableModelElement ].verticalVelocity = 0;
            if ( potentialSupportingSurface != null ) {
              thisModel.movableThermalEnergyContainers[ movableModelElement ].supportingSurface = potentialSupportingSurface;
              potentialSupportingSurface.addElementToSurface( thisModel.movableThermalEnergyContainers[ movableModelElement ] );
            }
            else {
              thisModel.movableThermalEnergyContainers[ movableModelElement ].verticalVelocity = velocity;
            }
          }
          thisModel.movableThermalEnergyContainers[ movableModelElement ].position = new Vector2( thisModel.movableThermalEnergyContainers[ movableModelElement.position.x ], proposedYPos );
        }
      } );

      // Update the fluid level in the beaker, which could be displaced by one or more of the blocks.
      this.beaker.updateFluidLevel( [ this.brick.getRect(), this.ironBlock.getRect() ] );

      //=====================================================================
      // Energy and Energy Chunk Exchange
      //=====================================================================

      // Note: The original intent was to design all the energy containers such that the order of the exchange didn't matter, nor who was exchanging
      // with whom.  This turned out to be a lot of extra work to maintain, and was eventually abandoned.  So, the order and nature of the exchanged
      // below should be maintained unless there is a good reason not to, and any changes should be well tested.

      // Loop through all the movable thermal energy containers and have them exchange energy with one another.
      for ( i = 0; i < this.movableThermalEnergyContainers.length; i++ ) {
        for ( var j = i + 1; j < this.movableThermalEnergyContainers.length; j++ ) {
          this.movableThermalEnergyContainers[ i ].exchangeEnergyWith( this.movableThermalEnergyContainers[ j ], dt );
        }
      }

      // Exchange thermal energy between the burners and the other thermal model elements, including air.
      for ( i = 0; i < this.burners.length; i++ ) {
        if ( this.burners[ i ].areAnyOnTop( this.movableThermalEnergyContainers ) ) {
          for ( j = 0; j < this.movableThermalEnergyContainers.length; j++ ) {
            this.burners[ i ].addOrRemoveEnergyToFromObject( this.movableThermalEnergyContainers[ j ], dt );
          }
        }
        else {
          // Nothing on a burner, so heat/cool the air.
          this.burners[ i ].addOrRemoveEnergyToFromAir( this.air, dt );
        }
      }

      // Exchange energy chunks between burners and non-air energy containers.
      this.movableThermalEnergyContainers.forEach( function( thermalModelElement ) {
        thisModel.burners.forEach( function( burner ) {
          if ( burner.inContactWith( thermalModelElement ) ) {
            if ( burner.canSupplyEnergyChunk() && ( burner.getEnergyChunkBalanceWithObjects() > 0 || thermalModelElement.getEnergyChunkBalance() < 0 ) ) {
              // Push an energy chunk into the item on the burner.
              thermalModelElement.addEnergyChunk( burner.extractClosestEnergyChunk( thermalModelElement.getCenterPoint() ) );
            }
            else if ( burner.canAcceptEnergyChunk() && ( burner.getEnergyChunkBalanceWithObjects() < 0 || thermalModelElement.getEnergyChunkBalance() > 0 ) ) {
              // Extract an energy chunk from the model element
              var energyChunk = thermalModelElement.extractClosestEnergyChunk( burner.getFlameIceRect() );
              if ( energyChunk != null ) {
                burner.addEnergyChunk( energyChunk );
              }
            }
          }
        } )
      } );

      // Exchange energy chunks between movable thermal energy containers.
      for ( i = 0; i < this.movableThermalEnergyContainers.length; i++ ) {
        for ( j = i + 1; j < this.movableThermalEnergyContainers.length; j++ ) {
          // localize objects of interest to reduce array lookups. // TODO: Refactor to do this throughout.
          var thermalModelElement1 = this.movableThermalEnergyContainers[ i ];
          var thermalModelElement2 = this.movableThermalEnergyContainers[ j ];

          if ( thermalModelElement1.getThermalContactArea().getThermalContactLength( thermalModelElement2.getThermalContactArea() ) > 0 ) {
            // Exchange chunks if approperiate.
            if ( thermalModelElement1.getEnergyChunkBalance() > 0 && thermalModelElement2.getEnergyChunkBalance < 0 ) {
              thermalModelElement2.addEnergyChunk( thermalModelElement1.extractClosestEnergyChunk( thermalModelElement2.getThermalContactArea().bounds ) );
            }
            else if ( thermalModelElement1.getEnergyChunkBalance() < 0 && thermalModelElement2.getEnergyChunkBalance() > 0 ) {
              thermalModelElement1.addEnergyChunk( thermalModelElement2.extractClosestEnergyChunk( thermalModelElement1.getThermalContactArea().bounds ) );
            }
          }
        }
      }

      // Exchange energy and energy chunks between the movable thermal energy containers and the air.
      this.movableThermalEnergyContainers.forEach( function( movableEnergyContainer ) {
        // Set up some variables that are used to decide whether or not energy should be exchanged with air.
        var contactWithOtherMovableElement = false;
        var immersedInBeaker = false;
        var maxTemperatureDifference = 0;

        // Figure out the max temperature difference between touching energy containers.
        for ( i = 0; i < thisModel.movableThermalEnergyContainers.length; i++ ) {
          // Localize object of interest to reduce number of array lookups.
          var otherMovableEnergyContainer = thisModel.movableThermalEnergyContainers[ i ];
          if ( otherMovableEnergyContainer === movableEnergyContainer ) {
            return;
          }
          if ( movableEnergyContainer.getThermalContactArea().getThermalContactLength( otherMovableEnergyContainer.getThermalContactArea() ) > 0 ) {
            contactWithOtherMovableElement = true;
            maxTemperatureDifference = Math.max( Math.abs( movableEnergyContainer.getTemperature() - otherMovableEnergyContainer.getTemperature() ), maxTemperatureDifference );
          }
        }

        if ( thisModel.beaker.getThermalContactArea().bounds.containsPoint( movableEnergyContainer.getRect() ) ) {
          // This model element is immersed in the beaker.
          immersedInBeaker = true;
        }

        // Exchange energy and energy chunks with the air if appropriate conditions are met.
        if ( !contactWithOtherMovableElement || ( !immersedInBeaker && ( maxTemperatureDifference < MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE || movableEnergyContainer.getEnergyBeyondMaxTemperature() > 0 ) ) ) {
          thisModel.air.exchangeEnergyWith( movableEnergyContainer, dt );
          if ( movableEnergyContainer.getEnergyChunkBalance() > 0 ) {
            var pointAbove = new Vector2( Math.random() * movableEnergyContainer.getRect().width + movableEnergyContainer.getRect.minX, movableEnergyContainer.getRect().maxY );
            var energyChunk = movableEnergyContainer.extractClosestEnergyChunk( pointAbove );
            if ( energyChunk != null ) {
              var energyChunkMotionConstraints = null;
              if ( movableEnergyContainer instanceof Beaker ) {
                // Constrain the energy chunk's motion so that it doesn't go through the edges of the beaker. There is a bit of a fudge
                // factor in here to make sure that the sides of the energy chunk, and not just the center, stay in bounds.
                var energyChunkWidth = 0.01;
                energyChunkMotionConstraints = new Rectangle( movableEnergyContainer.getRect().x + energyChunkWidth / 2,
                  movableEnergyContainer.getRect().y,
                  movableEnergyContainer.getRect().width - energyChunkWidth,
                  movableEnergyContainer.getRect().height );
              }
              thisModel.air.addEnergyChunk( energyChunk, energyChunkMotionConstraints );
            }
          }
          else if ( movableEnergyContainer.getEnergyChunkBalance < 0 && movableEnergyContainer.getTemperature() < thisModel.air.getTemperature() ) {
            movableEnergyContainer.addEnergyChunk( thisModel.air.requestEnergyChunk( movableEnergyContainer.getCenterPoint() ) );
          }
        }
      } );

      // Exchange energy chunks between the air and the burners.
      this.burners.forEach( function( burner ) {
        if ( burner.getEnergyChunkCountForAir() > 0 ) {
          thisModel.air.addEnergyChunk( burner.extractClosestEnergyChunk( burner.getCenterPoint() ), null );
        }
        else if ( burner.getEnergyChunkCountForAir() < 0 ) {
          burner.addEnergyChunk( thisModel.air.requestEnergyChunk( burner.getCenterPoint() ) );
        }
      } );
    },

    getBlockList: function() {
      return [ this.brick, this.ironBlock ];
    },

    /** Project a line into a 2D shape based on the provided projection vector. This is a convenience function used by the code that detects potential
     *  collisions between the 2D objects in model space.
     *
     * @param {Line} edge
     * @param {Vector2} projection
     * @returns {Shape}
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
     * Validate the position being proposed for the given model element.  This evaluates whether the proposed position would cause the model element
     * to move through another solid element, or the side of the beaker, or something that would look weird to the user and, if so, prevent the odd
     * behavior from happening by returning a location that works better.
     *
     * @param {RectangularThermalMovableModelElement} modelElement     Element whose position is being validated.
     * @param {Vector2} proposedPosition Proposed new position for element
     * @returns The original proposed position if valid, or alternative position
     *         if not.
     */
    validatePosition: function( modelElement, proposedPosition ) {
      debugger;

      // Carry this model through scope of nested callbacks.
      var thisModel = this;

      // Compensate for the model element's center X position.
      var translation = proposedPosition.copy().minus( modelElement.position );

      // Figure out how far the block's right edge appears to protrude to the side due to perspective.
      var blockPerspectiveExtension = EFACConstants.SURFACE_WIDTH * EFACConstants.PERSPECTIVE_EDGE_PROPORTION * Math.cos( EFACConstants.PERSPECTIVE_ANGLE ) / 2;

      // Validate against burner boundaries.  Treat the burners as one big blocking rectangle so that the user can't drag things betweenthem.  Also,
      // compensate for perspective so that we can avoid difficult z-order issues.
      var standPerspectiveExtension = this.leftBurner.getOutlineRect().height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;
      var burnerRectX = this.leftBurner.getOutlineRect().minX - standPerspectiveExtension - ( modelElement != this.beaker ? blockPerspectiveExtension : 0 );
      var burnerBlockingRect = new Rectangle(
        burnerRectX,
        this.leftBurner.getOutlineRect().minY,
        this.rightBurner.getOutlineRect().maxX - burnerRectX,
        this.leftBurner.getOutlineRect().height );
      translation = this.determineAllowedTranslation( modelElement.getRect(), burnerBlockingRect, translation, false );

      // Validate against the sides of the beaker.
      if ( modelElement != this.beaker ) {

        // Create three rectangles to represent the two sides and the top of the beaker.
        var testRectThickness = 1E-3; // 1 mm thick walls.
        var beakerRect = this.beaker.getRect();
        var beakerLeftSide = new Rectangle( beakerRect.minX - blockPerspectiveExtension,
          this.beaker.getRect().minY,
          testRectThickness + blockPerspectiveExtension * 2,
          this.beaker.getRect().height + blockPerspectiveExtension );
        var beakerRightSide = new Rectangle( this.beaker.getRect().maxX - testRectThickness - blockPerspectiveExtension,
          this.beaker.getRect().minY,
          testRectThickness + blockPerspectiveExtension * 2,
          this.beaker.getRect().height + blockPerspectiveExtension );
        var beakerBottom = new Rectangle( this.beaker.getRect().minX, this.beaker.getRect().minY, this.beaker.getRect().width, testRectThickness );

        // Do not restrict the model element's motion in positive Y direction if the beaker is sitting on top of the model element - the beaker will
        // simply be lifted up.
        var restrictPositiveY = !this.beaker.isStackedUpon( modelElement );

        // Clamp the translation based on the beaker position.
        translation = this.determineAllowedTranslation( modelElement.getRect(), beakerLeftSide, translation, restrictPositiveY );
        translation = this.determineAllowedTranslation( modelElement.getRect(), beakerRightSide, translation, restrictPositiveY );
        translation = this.determineAllowedTranslation( modelElement.getRect(), beakerBottom, translation, restrictPositiveY );
      }

      // Now check the model element's motion against each of the blocks.
      this.getBlockList().forEach( function( block ) {
        if( modelElement === block ) {
          // Don't test against self.
          return; // continue to next iteration.
        }

        // Do not restrict the model element's motion in positive Y direction if the tested block is sitting on top of the model element - the block
        // will simply be lifted up.
        var restrictPositiveY = !block.isStackedUpon( modelElement );

        var testRect = modelElement.getRect();
        if ( modelElement ===  thisModel.beaker ) {
          // Special handling for the beaker - block it at the outer edge of the block instead of the center in order to simplify z-order handling.
          testRect = new Rectangle( testRect.minX - blockPerspectiveExtension,
            testRect.minY,
            testRect.width + blockPerspectiveExtension * 2,
            testRect.height );
        }

        // Clamp the translation based on the test block's position, but handle the case where the block is immersed in the beaker.
        if ( modelElement != thisModel.beaker || !thisModel.beaker.getRect().containsBounds( block.getRect() ) ) {
          translation = thisModel.determineAllowedTranslation( testRect, block.getRect(), translation, restrictPositiveY );
        }

      });

      // Determine the new position based on the resultant translation.
      var newPosition = modelElement.position.plus( translation ).copy();

      // Clamp Y position to be positive to prevent dragging below table.
      newPosition.setY( Math.max( newPosition.getY(), 0 ) );

      return newPosition;
    },

    /**
     * Determine the portion of a proposed translation that may occur given a moving rectangle and a stationary rectangle that can block the moving
     * one.
     *
     * @param {Rectangle} movingRect
     * @param {Rectangle} stationaryRect
     * @param {Vector2} proposedTranslation
     * @param {boolean} restrictPosY        Boolean that controls whether the positive Y direction is restricted.  This is often set false if there
     *                                      is another model element on top of the one being tested.
     * @returns {Vector2}
     */
    determineAllowedTranslation: function( movingRect, stationaryRect, proposedTranslation, restrictPosY ) {

      // Test for case where rectangles already overlap.
      if ( movingRect.intersectsBounds( stationaryRect ) ) {

        // The rectangles already overlap.  Are they right on top of one another?
        if ( movingRect.centerX == stationaryRect.centerX && movingRect.centerX == stationaryRect.centerY ) {
          console.log( 'Warning: Rectangle centers in same location, returning zero vector.' );
          return new Vector2( 0, 0 );
        }

        // Determine the motion in the X & Y directions that will "cure" the overlap.
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

        // Something is wrong with algorithm if both values are zero,
        // since overlap was detected by the "intersects" method.
        assert && assert( !(xOverlapCure === 0 && yOverlapCure === 0), 'xOverlap and yOverlap should not both be zero' );

        // Return a vector with the smallest valid "cure" value, leaving the other translation value unchanged.
        if ( xOverlapCure != 0 && Math.abs( xOverlapCure ) < Math.abs( yOverlapCure ) ) {
          return new Vector2( xOverlapCure, proposedTranslation.y );
        }
        else {
          return new Vector2( proposedTranslation.x, yOverlapCure );
        }
      }

      var xTranslation = proposedTranslation.x;
      var yTranslation = proposedTranslation.y;

      // X direction.
      if ( proposedTranslation.x > 0 ) {

        // Check for collisions moving right.
        var rightEdge = new Line( movingRect.maxX, movingRect.minY, movingRect.maxX, movingRect.maxY );
        var rightEdgeSmear = this.projectShapeFromLine( rightEdge, proposedTranslation );

        if ( rightEdge.start.x <= stationaryRect.minX && rightEdgeSmear.intersectsBounds( stationaryRect ) ) {
          // Collision detected, limit motion.
          xTranslation = stationaryRect.minX - rightEdge.start.x - MIN_INTER_ELEMENT_DISTANCE;
        }
      }
      else if ( proposedTranslation.x < 0 ) {

        // Check for collisions moving left.
        var leftEdge = new Line( movingRect.minX, movingRect.minY, movingRect.minX, movingRect.maxY );
        var leftEdgeSmear = this.projectShapeFromLine( leftEdge, proposedTranslation );

        if ( leftEdge.start.x >= stationaryRect.maxX && leftEdgeSmear.intersectsBounds( stationaryRect ) ) {
          // Collision detected, limit motion.
          xTranslation = stationaryRect.getMaxX() - leftEdge.getX1() + MIN_INTER_ELEMENT_DISTANCE;
        }
      }

      // Y direction.
      if ( proposedTranslation.y > 0 && restrictPosY ) {

        // Check for collisions moving up.
        var movingTopEdge = new Line( movingRect.minX, movingRect.maxY, movingRect.maxX, movingRect.maxY );
        var topEdgeSmear = this.projectShapeFromLine( movingTopEdge, proposedTranslation );

        if ( movingTopEdge.start.y <= stationaryRect.minY && topEdgeSmear.intersectsBounds( stationaryRect ) ) {
          // Collision detected, limit motion.
          yTranslation = stationaryRect.minY - movingTopEdge.start.y - MIN_INTER_ELEMENT_DISTANCE;
        }
      }
      if ( proposedTranslation.y < 0 ) {

        // Check for collisions moving down.
        var movingBottomEdge = new Line( movingRect.minX, movingRect.minY, movingRect.maxX, movingRect.minY );
        var bottomEdgeSmear = this.projectShapeFromLine( movingBottomEdge, proposedTranslation );

        if ( movingBottomEdge.start.y >= stationaryRect.maxY && bottomEdgeSmear.intersectsBounds( stationaryRect ) ) {
          // Collision detected, limit motion.
          yTranslation = stationaryRect.maxY - movingBottomEdge.start.y + MIN_INTER_ELEMENT_DISTANCE;
        }
      }

      return new Vector2( xTranslation, yTranslation );
    }

  } )
} );

//    public Point2D validatePosition( RectangularThermalMovableModelElement modelElement, Point2D proposedPosition ) {
//
//
//        // Validate against burner boundaries.  Treat the burners as one big
//        // blocking rectangle so that the user can't drag things between
//        // them.  Also, compensate for perspective so that we can avoid
//        // difficult z-order issues.
//        double standPerspectiveExtension = leftBurner.getOutlineRect().getHeight() * EFACIntroCanvas.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos( BurnerStandNode.PERSPECTIVE_ANGLE ) / 2;
//        double burnerRectX = leftBurner.getOutlineRect().getX() - standPerspectiveExtension - ( modelElement != beaker ? blockPerspectiveExtension : 0 );
//        Rectangle2D burnerBlockingRect = new Rectangle2D.Double( burnerRectX,
//                                                                 leftBurner.getOutlineRect().getY(),
//                                                                 rightBurner.getOutlineRect().getMaxX() - burnerRectX,
//                                                                 leftBurner.getOutlineRect().getHeight() );
//        translation = determineAllowedTranslation( modelElement.getRect(), burnerBlockingRect, translation, false );
//
//        // Validate against the sides of the beaker.
//        if ( modelElement != beaker ) {
//
//            // Create three rectangles to represent the two sides and the top
//            // of the beaker.
//            double testRectThickness = 1E-3; // 1 mm thick walls.
//            Rectangle2D beakerRect = beaker.getRect();
//            Rectangle2D beakerLeftSide = new Rectangle2D.Double( beakerRect.getMinX() - blockPerspectiveExtension,
//                                                                 beaker.getRect().getMinY(),
//                                                                 testRectThickness + blockPerspectiveExtension * 2,
//                                                                 beaker.getRect().getHeight() + blockPerspectiveExtension );
//            Rectangle2D beakerRightSide = new Rectangle2D.Double( beaker.getRect().getMaxX() - testRectThickness - blockPerspectiveExtension,
//                                                                  beaker.getRect().getMinY(),
//                                                                  testRectThickness + blockPerspectiveExtension * 2,
//                                                                  beaker.getRect().getHeight() + blockPerspectiveExtension );
//            Rectangle2D beakerBottom = new Rectangle2D.Double( beaker.getRect().getMinX(), beaker.getRect().getMinY(), beaker.getRect().getWidth(), testRectThickness );
//
//            // Do not restrict the model element's motion in positive Y
//            // direction if the beaker is sitting on top of the model element -
//            // the beaker will simply be lifted up.
//            boolean restrictPositiveY = !beaker.isStackedUpon( modelElement );
//
//            // Clamp the translation based on the beaker position.
//            translation = determineAllowedTranslation( modelElement.getRect(), beakerLeftSide, translation, restrictPositiveY );
//            translation = determineAllowedTranslation( modelElement.getRect(), beakerRightSide, translation, restrictPositiveY );
//            translation = determineAllowedTranslation( modelElement.getRect(), beakerBottom, translation, restrictPositiveY );
//        }
//
//        // Now check the model element's motion against each of the blocks.
//        for ( Block block : Arrays.asList( ironBlock, brick ) ) {
//            if ( modelElement == block ) {
//                // Don't test against self.
//                continue;
//            }
//
//            // Do not restrict the model element's motion in positive Y
//            // direction if the tested block is sitting on top of the model
//            // element - the block will simply be lifted up.
//            boolean restrictPositiveY = !block.isStackedUpon( modelElement );
//
//            Rectangle2D testRect = modelElement.getRect();
//            if ( modelElement == beaker ) {
//                // Special handling for the beaker - block it at the outer
//                // edge of the block instead of the center in order to
//                // simplify z-order handling.
//                testRect = new Rectangle2D.Double( testRect.getX() - blockPerspectiveExtension,
//                                                   testRect.getY(),
//                                                   testRect.getWidth() + blockPerspectiveExtension * 2,
//                                                   testRect.getHeight() );
//            }
//
//            // Clamp the translation based on the test block's position, but
//            // handle the case where the block is immersed in the beaker.
//            if ( modelElement != beaker || !beaker.getRect().contains( block.getRect() ) ) {
//                translation = determineAllowedTranslation( testRect, block.getRect(), translation, restrictPositiveY );
//            }
//        }
//
//        // Determine the new position based on the resultant translation.
//        MutableVector2D newPosition = new MutableVector2D( modelElement.position.get().plus( translation ) );
//
//        // Clamp Y position to be positive to prevent dragging below table.
//        newPosition.setY( Math.max( newPosition.getY(), 0 ) );
//
//        return newPosition.toPoint2D();
//    }
//
//    public void dumpEnergies() {
//        for ( ThermalEnergyContainer thermalEnergyContainer : Arrays.asList( ironBlock, brick, beaker, air ) ) {
//            System.out.println( thermalEnergyContainer.getClass().getName() + " - energy = " + thermalEnergyContainer.getEnergy() );
//        }
//    }
//
//    /*
//     * Determine the portion of a proposed translation that may occur given
//     * a moving rectangle and a stationary rectangle that can block the moving
//     * one.
//     *
//     * @param movingRect
//     * @param stationaryRect
//     * @param proposedTranslation
//     * @param restrictPosY        Boolean that controls whether the positive Y
//     *                            direction is restricted.  This is often set
//     *                            false if there is another model element on
//     *                            top of the one being tested.
//     * @return
//     */
//    private Vector2D determineAllowedTranslation( Rectangle2D movingRect, Rectangle2D stationaryRect, Vector2D proposedTranslation, boolean restrictPosY ) {
//
//        // Test for case where rectangles already overlap.
//        if ( movingRect.intersects( stationaryRect ) ) {
//
//            // The rectangles already overlap.  Are they right on top of one another?
//            if ( movingRect.getCenterX() == stationaryRect.getCenterX() && movingRect.getCenterY() == stationaryRect.getCenterY() ) {
//                System.out.println( getClass().getName() + " - Warning: Rectangle centers in same location, returning zero vector." );
//                return new Vector2D( 0, 0 );
//            }
//
//            // Determine the motion in the X & Y directions that will "cure"
//            // the overlap.
//            double xOverlapCure = 0;
//            if ( movingRect.getMaxX() > stationaryRect.getMinX() && movingRect.getMinX() < stationaryRect.getMinX() ) {
//                xOverlapCure = stationaryRect.getMinX() - movingRect.getMaxX();
//            }
//            else if ( stationaryRect.getMaxX() > movingRect.getMinX() && stationaryRect.getMinX() < movingRect.getMinX() ) {
//                xOverlapCure = stationaryRect.getMaxX() - movingRect.getMinX();
//            }
//            double yOverlapCure = 0;
//            if ( movingRect.getMaxY() > stationaryRect.getMinY() && movingRect.getMinY() < stationaryRect.getMinY() ) {
//                yOverlapCure = stationaryRect.getMinY() - movingRect.getMaxY();
//            }
//            else if ( stationaryRect.getMaxY() > movingRect.getMinY() && stationaryRect.getMinY() < movingRect.getMinY() ) {
//                yOverlapCure = stationaryRect.getMaxY() - movingRect.getMinY();
//            }
//
//            // Something is wrong with algorithm if both values are zero,
//            // since overlap was detected by the "intersects" method.
//            assert !( xOverlapCure == 0 && yOverlapCure == 0 );
//
//            // Return a vector with the smallest valid "cure" value, leaving
//            // the other translation value unchanged.
//            if ( xOverlapCure != 0 && Math.abs( xOverlapCure ) < Math.abs( yOverlapCure ) ) {
//                return new Vector2D( xOverlapCure, proposedTranslation.getY() );
//            }
//            else {
//                return new Vector2D( proposedTranslation.getX(), yOverlapCure );
//            }
//        }
//
//        double xTranslation = proposedTranslation.getX();
//        double yTranslation = proposedTranslation.getY();
//
//        // X direction.
//        if ( proposedTranslation.getX() > 0 ) {
//
//            // Check for collisions moving right.
//            Line2D rightEdge = new Line2D.Double( movingRect.getMaxX(), movingRect.getMinY(), movingRect.getMaxX(), movingRect.getMaxY() );
//            Shape rightEdgeSmear = projectShapeFromLine( rightEdge, proposedTranslation );
//
//            if ( rightEdge.getX1() <= stationaryRect.getMinX() && rightEdgeSmear.intersects( stationaryRect ) ) {
//                // Collision detected, limit motion.
//                xTranslation = stationaryRect.getMinX() - rightEdge.getX1() - MIN_INTER_ELEMENT_DISTANCE;
//            }
//        }
//        else if ( proposedTranslation.getX() < 0 ) {
//
//            // Check for collisions moving left.
//            Line2D leftEdge = new Line2D.Double( movingRect.getMinX(), movingRect.getMinY(), movingRect.getMinX(), movingRect.getMaxY() );
//            Shape leftEdgeSmear = projectShapeFromLine( leftEdge, proposedTranslation );
//
//            if ( leftEdge.getX1() >= stationaryRect.getMaxX() && leftEdgeSmear.intersects( stationaryRect ) ) {
//                // Collision detected, limit motion.
//                xTranslation = stationaryRect.getMaxX() - leftEdge.getX1() + MIN_INTER_ELEMENT_DISTANCE;
//            }
//        }
//
//        // Y direction.
//        if ( proposedTranslation.getY() > 0 && restrictPosY ) {
//
//            // Check for collisions moving up.
//            Line2D movingTopEdge = new Line2D.Double( movingRect.getMinX(), movingRect.getMaxY(), movingRect.getMaxX(), movingRect.getMaxY() );
//            Shape topEdgeSmear = projectShapeFromLine( movingTopEdge, proposedTranslation );
//
//            if ( movingTopEdge.getY1() <= stationaryRect.getMinY() && topEdgeSmear.intersects( stationaryRect ) ) {
//                // Collision detected, limit motion.
//                yTranslation = stationaryRect.getMinY() - movingTopEdge.getY1() - MIN_INTER_ELEMENT_DISTANCE;
//            }
//        }
//        if ( proposedTranslation.getY() < 0 ) {
//
//            // Check for collisions moving down.
//            Line2D movingBottomEdge = new Line2D.Double( movingRect.getMinX(), movingRect.getMinY(), movingRect.getMaxX(), movingRect.getMinY() );
//            Shape bottomEdgeSmear = projectShapeFromLine( movingBottomEdge, proposedTranslation );
//
//            if ( movingBottomEdge.getY1() >= stationaryRect.getMaxY() && bottomEdgeSmear.intersects( stationaryRect ) ) {
//                // Collision detected, limit motion.
//                yTranslation = stationaryRect.getMaxY() - movingBottomEdge.getY1() + MIN_INTER_ELEMENT_DISTANCE;
//            }
//        }
//
//        return new Vector2D( xTranslation, yTranslation );
//    }
//
//    /* Project a line into a 2D shape based on the provided projection vector.
//     * This is a convenience function used by the code that detects potential
//     * collisions between the 2D objects in model space.
//     */
//    private Shape projectShapeFromLine( Line2D edge, Vector2D projection ) {
//        DoubleGeneralPath path = new DoubleGeneralPath();
//        path.moveTo( edge.getP1() );
//        path.lineTo( edge.getX1() + projection.getX(), edge.getY1() + projection.getY() );
//        path.lineTo( edge.getX2() + projection.getX(), edge.getY2() + projection.getY() );
//        path.lineTo( edge.getP2() );
//        path.closePath();
//        return path.getGeneralPath();
//    }
//
//    public ConstantDtClock getClock() {
//        return clock;
//    }
//
//    public Brick getBrick() {
//        return brick;
//    }
//
//    public IronBlock getIronBlock() {
//        return ironBlock;
//    }
//
//    public Burner getLeftBurner() {
//        return leftBurner;
//    }
//
//    public Burner getRightBurner() {
//        return rightBurner;
//    }
//
//    public BeakerContainer getBeaker() {
//        return beaker;
//    }
//
//    public Air getAir() {
//        return air;
//    }
//
//    private Property<HorizontalSurface> findBestSupportSurface( UserMovableModelElement element ) {
//        Property<HorizontalSurface> bestOverlappingSurface = null;
//
//        // Check each of the possible supporting elements in the model to see
//        // if this element can go on top of it.
//        for ( ModelElement potentialSupportingElement : Arrays.asList( leftBurner, rightBurner, brick, ironBlock, beaker ) ) {
//            if ( potentialSupportingElement == element || potentialSupportingElement.isStackedUpon( element ) ) {
//                // The potential supporting element is either the same as the
//                // test element or is sitting on top of the test element.  In
//                // either case, it can't be used to support the test element,
//                // so skip it.
//                continue;
//            }
//            if ( element.getBottomSurfaceProperty().get().overlapsWith( potentialSupportingElement.getTopSurfaceProperty().get() ) ) {
//
//                // There is at least some overlap.  Determine if this surface
//                // is the best one so far.
//                double surfaceOverlap = getHorizontalOverlap( potentialSupportingElement.getTopSurfaceProperty().get(), element.getBottomSurfaceProperty().get() );
//
//                // The following nasty 'if' clause determines if the potential
//                // supporting surface is a better one than we currently have
//                // based on whether we have one at all, or has more overlap
//                // than the previous best choice, or is directly above the
//                // current one.
//                if ( bestOverlappingSurface == null ||
//                     ( surfaceOverlap > getHorizontalOverlap( bestOverlappingSurface.get(), element.getBottomSurfaceProperty().get() ) &&
//                       !isDirectlyAbove( bestOverlappingSurface.get(), potentialSupportingElement.getTopSurfaceProperty().get() ) ) ||
//                     ( isDirectlyAbove( potentialSupportingElement.getTopSurfaceProperty().get(), bestOverlappingSurface.get() ) ) ) {
//                    bestOverlappingSurface = potentialSupportingElement.getTopSurfaceProperty();
//                }
//            }
//        }
//
//        // Make sure that the best supporting surface isn't at the bottom of
//        // a stack, which can happen in cases where the model element being
//        // tested isn't directly above the best surface's center.
//        if ( bestOverlappingSurface != null ) {
//            while ( bestOverlappingSurface.get().getElementOnSurface() != null ) {
//                bestOverlappingSurface = bestOverlappingSurface.get().getElementOnSurface().getTopSurfaceProperty();
//            }
//        }
//
//        return bestOverlappingSurface;
//    }
//
//
//    // Get the amount of overlap in the x direction between two horizontal surfaces.
//    private double getHorizontalOverlap( HorizontalSurface s1, HorizontalSurface s2 ) {
//        double lowestMax = Math.min( s1.xRange.getMax(), s2.xRange.getMax() );
//        double highestMin = Math.max( s1.xRange.getMin(), s2.xRange.getMin() );
//        return Math.max( lowestMax - highestMin, 0 );
//    }
//
//    // Returns true if surface s1's center is above surface s2.
//    private boolean isDirectlyAbove( HorizontalSurface s1, HorizontalSurface s2 ) {
//        return s2.xRange.contains( s1.getCenterX() ) && s1.yPos > s2.yPos;
//    }
//
//    /**
//     * Get the temperature and color that would be sensed by a thermometer at
//     * the provided location.
//     *
//     * @param location Location to be sensed.
//     * @return Composite object with temperature and color at the provided
//     *         location.
//     */
//    public TemperatureAndColor getTemperatureAndColorAtLocation( Vector2D location ) {
//        Point2D locationAsPoint = location.toPoint2D();
//
//        // Test blocks first.  This is a little complicated since the z-order
//        // must be taken into account.
//        List<Block> copyOfBlockList = new ArrayList<Block>( getBlockList() );
//        Collections.sort( copyOfBlockList, new Comparator<Block>() {
//            public int compare( Block b1, Block b2 ) {
//                if ( b1.position.get().equals( b2.position.get() ) ) {
//                    return 0;
//                }
//                if ( b2.position.get().getX() > b1.position.get().getX() || b2.position.get().getY() > b1.position.get().getY() ) {
//                    return 1;
//                }
//                return -1;
//            }
//        } );
//        for ( Block block : copyOfBlockList ) {
//            if ( block.getProjectedShape().contains( locationAsPoint ) ) {
//                return new TemperatureAndColor( block.getTemperature(), block.getColor() );
//            }
//        }
//
//        // Test if this point is in the water or steam associated with the beaker.
//        if ( beaker.getThermalContactArea().getBounds().contains( locationAsPoint ) ) {
//            return new TemperatureAndColor( beaker.getTemperature(), EFACConstants.WATER_COLOR_IN_BEAKER );
//        }
//        else if ( beaker.getSteamArea().contains( locationAsPoint ) && beaker.steamingProportion > 0 ) {
//            return new TemperatureAndColor( beaker.getSteamTemperature( locationAsPoint.getY() - beaker.getSteamArea().getMinY() ), Color.WHITE );
//        }
//
//        // Test if the point is a burner.
//        for ( Burner burner : Arrays.asList( leftBurner, rightBurner ) ) {
//            if ( burner.getFlameIceRect().contains( locationAsPoint ) ) {
//                return new TemperatureAndColor( burner.getTemperature(), EFACConstants.FIRST_TAB_BACKGROUND_COLOR );
//
//            }
//        }
//
//        // Point is in nothing else, so return the air temperature.
//        return new TemperatureAndColor( air.getTemperature(), EFACConstants.FIRST_TAB_BACKGROUND_COLOR );
//    }
//}
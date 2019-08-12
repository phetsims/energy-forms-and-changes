// Copyright 2014-2019, University of Colorado Boulder

/**
 * model for the 'Intro' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Air = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Air' );
  const Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  const BeakerContainer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BeakerContainer' );
  const Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  const BlockType = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BlockType' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Burner = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Burner' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const Emitter = require( 'AXON/Emitter' );
  const EnergyBalanceTracker = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyBalanceTracker' );
  const EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyContainerCategory' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const SimSpeed = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/SimSpeed' );
  const StickyTemperatureAndColorSensor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/StickyTemperatureAndColorSensor' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const NUMBER_OF_THERMOMETERS = 4;
  const BEAKER_WIDTH = 0.085; // in meters
  const BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;
  const BEAKER_MAJOR_TICK_MARK_DISTANCE = BEAKER_HEIGHT * 0.95 / 3;
  const FAST_FORWARD_MULTIPLIER = 4; // how many times faster the intro screen runs when in fast forward mode

  // the sim model x range is laid out in meters with 0 in the middle, so this value is the left edge of the sim, in meters
  const LEFT_EDGE = -0.30;
  const RIGHT_EDGE = 0.30;

  // the desired space between the edges of the sim (left edge or right edge) and the edge of the widest element
  // (a beaker) when it's sitting at one of the outer snap-to spots on the ground, in meters
  const EDGE_PAD = 0.016;

  // number of snap-to spots on the ground, should match number of thermal containers
  const NUMBER_OF_GROUND_SPOTS = 6;

  // initial thermometer location, intended to be away from any model objects so that they don't get stuck to anything
  const INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

  // minimum distance allowed between two objects, used to prevent floating point issues
  const MIN_INTER_ELEMENT_DISTANCE = 1E-9; // in meters

  class EFACIntroModel {

    /**
     * main constructor for EFACIntroModel, which contains all of the model logic for the Intro sim screen
     */
    constructor() {

      // @public {BooleanProperty} - controls whether the energy chunks are visible in the view
      this.energyChunksVisibleProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - controls whether HeaterCoolerNodes are linked together
      this.linkedHeatersProperty = new BooleanProperty( false );

      // @public {BooleanProperty} - is the sim running or paused?
      this.isPlayingProperty = new BooleanProperty( true );

      // @public {Property.<SimSpeed>} - controls the speed of the sim
      this.simSpeedProperty = new Property( SimSpeed.NORMAL, {
        validValues: [ SimSpeed.NORMAL, SimSpeed.FAST_FORWARD ]
      } );

      // @public (read-only) {Air} - model of the air that surrounds the other model elements, and can absorb or provide
      // energy
      this.air = new Air( this.energyChunksVisibleProperty );

      // @private {number} - calculate space in between the center points of the snap-to spots on the ground
      this.spaceBetweenGroundSpotCenters = ( RIGHT_EDGE - LEFT_EDGE - ( EDGE_PAD * 2 ) - BEAKER_WIDTH ) /
                                           ( NUMBER_OF_GROUND_SPOTS - 1 );
      // @private {number[]} - list of valid x-positions for model elements to rest
      this.groundSpotXPositions = [];

      // determine the locations of the snap-to spots, and round them to a few decimal places
      const leftEdgeToBeakerCenterPad = LEFT_EDGE + EDGE_PAD + ( BEAKER_WIDTH / 2 );
      for ( let i = 0; i < NUMBER_OF_GROUND_SPOTS; i++ ) {
        this.groundSpotXPositions.push(
          Util.roundSymmetric( ( this.spaceBetweenGroundSpotCenters * i + leftEdgeToBeakerCenterPad ) * 1000 ) / 1000
        );
      }

      // @public (read-only) {Block}
      this.ironBlock = new Block(
        new Vector2( this.groundSpotXPositions[ 0 ], 0 ),
        this.energyChunksVisibleProperty,
        BlockType.IRON
      );

      // @public (read-only) {Block}
      this.brick = new Block(
        new Vector2( this.groundSpotXPositions[ 1 ], 0 ),
        this.energyChunksVisibleProperty,
        BlockType.BRICK
      );

      // @public (read-only) {Block[]} - list of all blocks in sim
      this.blocks = [ this.brick, this.ironBlock ];

      // @public (read-only) {Burner} - right and left burners
      this.leftBurner = new Burner( new Vector2( this.groundSpotXPositions[ 2 ], 0 ), this.energyChunksVisibleProperty );
      this.rightBurner = new Burner( new Vector2( this.groundSpotXPositions[ 3 ], 0 ), this.energyChunksVisibleProperty );

      const listOfThingsThatCanGoInBeaker = [ this.brick, this.ironBlock ];

      // @public (read-only) {BeakerContainer)
      this.waterBeaker = new BeakerContainer(
        new Vector2( this.groundSpotXPositions[ 4 ], 0 ),
        BEAKER_WIDTH,
        BEAKER_HEIGHT,
        listOfThingsThatCanGoInBeaker,
        this.energyChunksVisibleProperty, {
          majorTickMarkDistance: BEAKER_MAJOR_TICK_MARK_DISTANCE
        }
      );

      // @public (read-only) {BeakerContainer)
      this.oliveOilBeaker = new BeakerContainer(
        new Vector2( this.groundSpotXPositions[ 5 ], 0 ),
        BEAKER_WIDTH,
        BEAKER_HEIGHT,
        listOfThingsThatCanGoInBeaker,
        this.energyChunksVisibleProperty, {
          fluidColor: EFACConstants.OLIVE_OIL_COLOR_IN_BEAKER,
          steamColor: EFACConstants.OLIVE_OIL_STEAM_COLOR,
          fluidSpecificHeat: EFACConstants.OLIVE_OIL_SPECIFIC_HEAT,
          fluidDensity: EFACConstants.OLIVE_OIL_DENSITY,
          fluidBoilingPoint: EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE,
          energyContainerCategory: EnergyContainerCategory.OLIVE_OIL,
          majorTickMarkDistance: BEAKER_MAJOR_TICK_MARK_DISTANCE
        }
      );

      // @public (read-only) {BeakerContainer[]}
      this.beakers = [ this.waterBeaker, this.oliveOilBeaker ];

      // @private {RectangularThermalMovableModelElement[]} - put all the thermal containers on a list for easy iteration
      this.thermalContainers = [ this.brick, this.ironBlock, this.waterBeaker, this.oliveOilBeaker ];

      // @private {Object} - an object that is used to track which thermal containers are in contact with one another in
      // each model step.
      this.inThermalContactInfo = {};
      this.thermalContainers.forEach( thermalContainer => {
        this.inThermalContactInfo[ thermalContainer.id ] = [];
      } );

      // @private {Burner[]} - put burners into a list for easy iteration
      this.burners = [ this.rightBurner, this.leftBurner ];

      // @private {ModelElement} - put all of the model elements on a list for easy iteration
      this.modelElementList = [ this.leftBurner, this.rightBurner, this.brick, this.ironBlock, this.waterBeaker, this.oliveOilBeaker ];

      // @public (read-only) {StickyTemperatureAndColorSensor[]}
      this.temperatureAndColorSensors = [];
      _.times( NUMBER_OF_THERMOMETERS, () => {
        const sensor = new StickyTemperatureAndColorSensor( this, INITIAL_THERMOMETER_LOCATION, false );
        this.temperatureAndColorSensors.push( sensor );

        // Add handling for a special case where the user drops something (generally a block) in the beaker behind this
        // thermometer. The action is to automatically move the thermometer to a location where it continues to sense the
        // beaker temperature. This was requested after interviews.
        sensor.sensedElementColorProperty.link( ( newColor, oldColor ) => {

          this.beakers.forEach( beaker => {
            const blockWidthIncludingPerspective = this.ironBlock.getProjectedShape().bounds.width;

            const xRange = new Range(
              beaker.getBounds().centerX - blockWidthIncludingPerspective / 2,
              beaker.getBounds().centerX + blockWidthIncludingPerspective / 2
            );

            const checkBlocks = block => {

              // see if one of the blocks is being sensed in the beaker
              return block.color === newColor && block.positionProperty.value.y > beaker.positionProperty.value.y;
            };

            // if the new color matches any of the blocks (which are the only things that can go in a beaker), and the
            // sensor was previously stuck to the beaker and sensing its fluid, then move it to the side of the beaker
            if ( _.some( this.blocks, checkBlocks ) &&
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

      // @private {EnergyBalanceTracker} - This is used to track energy exchanges between all of the various energy
      // containing elements and using that information to transfer energy chunks commensurately.
      this.energyBalanceTracker = new EnergyBalanceTracker();

      // @private {EnergyBalanceRecord[]} - An array used for getting energy balances from the energy balance tracker,
      // pre-allocated and reused in an effort to reduce memory allocations.
      this.reusableBalanceArray = [];

      // @private {Bounds2} - pre-allocated reusable bounds, used to reduce memory allocations
      this.reusableBounds = Bounds2.NOTHING.copy();

      // Pre-calculate the space occupied by the burners, since they don't move.  This is used when validating positions
      // of movable model elements.  The space is extended a bit to the left to avoid awkward z-ording issues when
      // preventing overlap.
      const leftBurnerBounds = this.leftBurner.getBounds();
      const rightBurnerBounds = this.rightBurner.getBounds();
      const burnerPerspectiveExtension = leftBurnerBounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                         Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;

      // @private {Bounds2}
      this.burnerBlockingRect = new Bounds2(
        leftBurnerBounds.minX - burnerPerspectiveExtension,
        leftBurnerBounds.minY,
        rightBurnerBounds.maxX,
        rightBurnerBounds.maxY
      );

      // @public - used to notify the view that a manual step was called
      this.manualStepEmitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );
    }

    /**
     * @param {number} heatCoolLevel
     * @returns {string}
     * @private
     */
    mapHeatCoolLevelToColor( heatCoolLevel ) {
      let color;
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

    //REVIEW #247 missing visibility annotation
    /**
     * determines if the first thermal model element is immersed in the second
     * @param {RectangularThermalMovableModelElement} thermalModelElement1
     * @param {RectangularThermalMovableModelElement} thermalModelElement2
     * @returns {boolean}
     */
    isImmersedIn( thermalModelElement1, thermalModelElement2 ) {
      return thermalModelElement1 !== thermalModelElement2 &&
             thermalModelElement1.blockType !== undefined &&
             thermalModelElement2.thermalContactArea.containsBounds( thermalModelElement1.getBounds() );
    }

    /**
     * restore the initial conditions of the model
     * @public
     */
    reset() {
      this.energyChunksVisibleProperty.reset();
      this.linkedHeatersProperty.reset();
      this.isPlayingProperty.reset();
      this.simSpeedProperty.reset();
      this.air.reset();
      this.leftBurner.reset();
      this.rightBurner.reset();
      this.ironBlock.reset();
      this.brick.reset();
      this.waterBeaker.reset();
      this.oliveOilBeaker.reset();
      this.temperatureAndColorSensors.forEach( sensor => {
        sensor.reset();
      } );
      this.energyBalanceTracker.clearAllBalances();
    }

    /**
     * step the sim forward by one fixed nominal frame time
     * @public
     */
    manualStep() {
      this.stepModel( EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      this.manualStepEmitter.emit( EFACConstants.SIM_TIME_PER_TICK_NORMAL ); // notify the view
    }

    /**
     * step function for this model, automatically called by joist
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step( dt ) {

      // only step the model if not paused
      if ( this.isPlayingProperty.get() ) {
        const multiplier = this.simSpeedProperty.get() === SimSpeed.NORMAL ? 1 : FAST_FORWARD_MULTIPLIER;
        this.stepModel( dt * multiplier );
      }

      // step the sensors regardless of whether the sim is paused, and fast forward makes no difference
      this.temperatureAndColorSensors.forEach( thermometer => {
        thermometer.step( dt );
      } );
    }

    /**
     * update the state of the model for a given time amount
     * @param {number} dt - time step, in seconds
     * @private
     */
    stepModel( dt ) {

      // Cause any user-movable model elements that are not supported by a surface to fall or, in some cases, jump up
      // towards the nearest supporting surface.
      this.thermalContainers.forEach( movableModelElement => {
        const userControlled = movableModelElement.userControlledProperty.value;
        const unsupported = movableModelElement.supportingSurface === null;
        const raised = movableModelElement.positionProperty.value.y !== 0;
        const atXSpot = _.includes( this.groundSpotXPositions, movableModelElement.positionProperty.value.x );
        if ( !userControlled && unsupported && ( raised || !atXSpot ) ) {
          this.fallToSurface( movableModelElement, dt );
        }
      } );

      // update the fluid level in the beaker, which could be displaced by one or more of the blocks
      this.beakers.forEach( beaker => {
        beaker.updateFluidDisplacement( [ this.brick.getBounds(), this.ironBlock.getBounds() ] );
      } );

      //=====================================================================
      // Energy and Energy Chunk Exchange
      //=====================================================================

      // Note: Ideally, the order in which the exchanges occur shouldn't make any difference, but since we are working
      // with discrete non-infinitesimal time values, it probably does, so any changes to the order in which the energy
      // exchanges occur below should be thoroughly tested.

      // --------- transfer continuous energy (and not energy chunks yet) between elements --------------

      // clear the flags that are used to track whether energy transfers occurred during this step
      this.energyBalanceTracker.clearRecentlyUpdatedFlags();

      // loop through all the movable thermal energy containers and have them exchange energy with one another
      this.thermalContainers.forEach( ( container1, index ) => {
        this.thermalContainers.slice( index + 1, this.thermalContainers.length ).forEach( container2 => {

          // transfer energy if there is a thermal differential, keeping track of what was exchanged
          const energyTransferredFrom1to2 = container1.exchangeEnergyWith( container2, dt );
          this.energyBalanceTracker.logEnergyExchange( container1.id, container2.id, energyTransferredFrom1to2 );
        } );
      } );

      // exchange thermal energy between the burners and the other thermal model elements, including air
      this.burners.forEach( burner => {
        let energyTransferredFromBurner = 0;
        if ( burner.areAnyOnTop( this.thermalContainers ) ) {
          this.thermalContainers.forEach( energyContainer => {
            energyTransferredFromBurner = burner.addOrRemoveEnergyToFromObject( energyContainer, dt );
            this.energyBalanceTracker.logEnergyExchange( burner.id, energyContainer.id, energyTransferredFromBurner );
          } );
        }
        else {

          // nothing on a burner, so heat/cool the air
          energyTransferredFromBurner = burner.addOrRemoveEnergyToFromAir( this.air, dt );
          this.energyBalanceTracker.logEnergyExchange( burner.id, this.air.id, energyTransferredFromBurner );
        }
      } );

      // clear the "in thermal contact" information
      _.values( this.inThermalContactInfo ).forEach( inContactList => {
        inContactList.length = 0;
      } );

      // exchange energy between the movable thermal energy containers and the air
      this.thermalContainers.forEach( container1 => {

        // detect elements that are immersed in a beaker and don't allow them to exchange energy directly with the air
        let immersedInBeaker = false;
        this.beakers.forEach( beaker => {
          if ( this.isImmersedIn( container1, beaker ) ) {

            // this model element is immersed in the beaker
            immersedInBeaker = true;
          }
        } );

        // exchange energy with the air if not immersed in the beaker
        if ( !immersedInBeaker ) {
          const energyExchangedWithAir = this.air.exchangeEnergyWith( container1, dt );
          this.energyBalanceTracker.logEnergyExchange( this.air.id, container1.id, energyExchangedWithAir );
        }
      } );

      // --------- transfer energy chunks between elements --------------

      // Get a list of all energy balances between pairs of objects whose magnitude exceeds the amount that corresponds
      // to an energy chunk, and that also were recently updated.  The reason that it is important whether or not the
      // balance was recently updated is that it indicates that the entities are in thermal contact, and thus can
      // exchange energy chunks.
      this.reusableBalanceArray.length = 0; // clear the list
      this.energyBalanceTracker.getBalancesOverThreshold(
        EFACConstants.ENERGY_PER_CHUNK,
        true,
        this.reusableBalanceArray
      );

      this.reusableBalanceArray.forEach( energyBalanceRecord => {

        const fromID = energyBalanceRecord.fromID;
        const toID = energyBalanceRecord.toID;

        // figure out who will supply the energy chunk and who will consume it
        let energyChunkSupplier;
        let energyChunkConsumer;
        if ( energyBalanceRecord.energyBalance > 0 ) {
          energyChunkSupplier = this.getThermalElementByID( fromID );
          energyChunkConsumer = this.getThermalElementByID( toID );
        }
        else {
          energyChunkSupplier = this.getThermalElementByID( toID );
          energyChunkConsumer = this.getThermalElementByID( fromID );
        }

        // if the transfer is supposed to go to or from a burner, make sure the burner is in the correct state
        if ( energyChunkSupplier.id.indexOf( 'burner' ) >= 0 && energyChunkSupplier.heatCoolLevelProperty.value < 0 ||
             energyChunkConsumer.id.indexOf( 'burner' ) >= 0 && energyChunkConsumer.heatCoolLevelProperty.value > 0 ) {

          // burner isn't in correct state, bail on this transfer
          return;
        }

        // transfer the energy chunk from the supplier to the consumer
        this.transferEnergyChunk( energyChunkSupplier, energyChunkConsumer, energyBalanceRecord );
      } );

      // Now that continuous energy has been exchanged and then energy chunks have been exchanged based on the
      // accumulated energy exchange balances, we now check to see if any thermal energy containers are left with an
      // imbalance between their energy levels versus the number of energy chunks they contain.  If such an imbalance is
      // detected, we search for a good candidate with which to make an exchange and, if one is found, transfer an
      // energy chunk.  If no good candidate is found, no transfer is made.
      this.thermalContainers.forEach( thermalContainer => {

        const energyChunkBalance = thermalContainer.getEnergyChunkBalance();
        if ( energyChunkBalance !== 0 ) {

          // This thermal energy container has an energy chunk imbalance.  Get a list of all thermal model elements with
          // which a recent thermal energy exchange has occurred, because this lets us know who is in thermal contact
          // ans could thus potentially supply or consume an energy chunk.
          const recentlyUpdatedBalances = this.energyBalanceTracker.getBalancesForID( thermalContainer.id, true );

          // set up some variables that will be used in the loops below
          let bestExchangeCandidate = null;
          let closestMatchExchangeRecord = null;
          let currentRecord;
          let otherElementInRecord;

          // Search for other thermal containers that can consume this container's excess or supply this container's
          // needs, as the case may be.
          for ( let i = 0; i < recentlyUpdatedBalances.length && bestExchangeCandidate === null; i++ ) {
            currentRecord = recentlyUpdatedBalances[ i ];
            otherElementInRecord = this.getThermalElementByID( currentRecord.getOtherID( thermalContainer.id ) );
            const thisElementTemperature = thermalContainer.getTemperature();
            const otherElementTemperature = otherElementInRecord.getTemperature();

            // See if there is another thermal container that is in the opposite situation from this one, i.e. one that
            // has a deficit of ECs when this one has excess, or vice versa.
            if ( this.thermalContainers.indexOf( otherElementInRecord ) >= 0 ) {
              const otherECBalance = otherElementInRecord.getEnergyChunkBalance();
              if ( energyChunkBalance > 0 && otherECBalance < 0 && thisElementTemperature > otherElementTemperature ||
                   energyChunkBalance < 0 && otherECBalance > 0 && thisElementTemperature < otherElementTemperature ) {

                // this is a great candidate for an exchange
                bestExchangeCandidate = otherElementInRecord;
                closestMatchExchangeRecord = currentRecord;
              }
            }
          }

          if ( !bestExchangeCandidate ) {

            // nothing found yet, see if there is a burner that could take or provide and energy chunk
            for ( let i = 0; i < recentlyUpdatedBalances.length && bestExchangeCandidate === null; i++ ) {
              currentRecord = recentlyUpdatedBalances[ i ];
              const otherID = currentRecord.getOtherID( thermalContainer.id );
              if ( otherID.indexOf( 'burner' ) >= 0 ) {

                // This is a burner, is it in a state where it is able to provide or receive an energy chunk?
                const burner = this.getThermalElementByID( otherID );
                const heatCoolLevel = burner.heatCoolLevelProperty.get();
                if ( energyChunkBalance > 0 && heatCoolLevel < 0 || energyChunkBalance < 0 && heatCoolLevel > 0 ) {
                  bestExchangeCandidate = burner;
                  closestMatchExchangeRecord = currentRecord;
                }
              }
            }
          }

          if ( bestExchangeCandidate ) {

            // a good candidate was found, make the transfer
            let energyChunkSupplier;
            let energyChunkConsumer;
            if ( energyChunkBalance > 0 ) {
              energyChunkSupplier = thermalContainer;
              energyChunkConsumer = bestExchangeCandidate;
            }
            else {
              energyChunkSupplier = bestExchangeCandidate;
              energyChunkConsumer = thermalContainer;
            }
            this.transferEnergyChunk( energyChunkSupplier, energyChunkConsumer, closestMatchExchangeRecord );
          }
        }
      } );

      // step model elements to animate energy chunks movement
      this.air.step( dt );
      this.burners.forEach( burner => {
        burner.step( dt );
      } );

      this.thermalContainers.forEach( thermalEnergyContainer => {
        thermalEnergyContainer.step( dt );
      } );
    }

    /**
     * exchanges an energy chunk between the provided model elements
     * @param {ModelElement} energyChunkSupplier
     * @param {ModelElement} energyChunkConsumer
     * @param {EnergyBalanceRecord} energyBalanceRecord
     * @private
     */
    transferEnergyChunk( energyChunkSupplier, energyChunkConsumer, energyBalanceRecord ) {

      // attempt to extract an energy chunk from the supplier
      let energyChunk;
      if ( energyChunkSupplier !== this.air ) {

        if ( energyChunkConsumer !== this.air ) {
          energyChunk = energyChunkSupplier.extractEnergyChunkClosestToBounds(
            energyChunkConsumer.getBounds()
          );
        }
        else {

          // when giving an energy chunk to the air, pull one from the top of the supplier
          energyChunk = energyChunkSupplier.extractEnergyChunkClosestToPoint(
            energyChunkSupplier.getCenterTopPoint()
          );
        }
      }
      else {

        // when getting an energy chunk from the air, just let is know roughly where it's going
        energyChunk = energyChunkSupplier.requestEnergyChunk( energyChunkConsumer.positionProperty.get() );
      }

      // if we got an energy chunk, pass it to the consumer
      if ( energyChunk ) {

        if ( energyChunkConsumer === this.air ) {

          // When supplying and energy chunk to the air, constrain the path that the energy chunk will take so that it
          // stays above the container.  The bounds are tweaked a bit to account for the width of the energy chunks in
          // the view.
          const supplierBounds = energyChunkSupplier.getBounds();
          const horizontalWanderConstraint = new Range( supplierBounds.minX + 0.01, supplierBounds.maxX - 0.01 );
          if ( energyChunk.positionProperty.value.x < horizontalWanderConstraint.min ) {
            energyChunk.setPositionXY( horizontalWanderConstraint.min, energyChunk.positionProperty.value.y );
          }
          else if ( energyChunk.positionProperty.value.x > horizontalWanderConstraint.max ) {
            energyChunk.setPositionXY( horizontalWanderConstraint.max, energyChunk.positionProperty.value.y );
          }
          energyChunkConsumer.addEnergyChunk( energyChunk, horizontalWanderConstraint );
        }
        else {
          energyChunkConsumer.addEnergyChunk( energyChunk );
        }

        // adjust the energy balance since a chunk was transferred, but don't cross zero for the energy balance
        let energyExchangeToLog;
        if ( energyBalanceRecord.energyBalance > 0 ) {
          energyExchangeToLog = Math.max( -EFACConstants.ENERGY_PER_CHUNK, -energyBalanceRecord.energyBalance );
        }
        else {
          energyExchangeToLog = Math.min( EFACConstants.ENERGY_PER_CHUNK, energyBalanceRecord.energyBalance );
        }
        this.energyBalanceTracker.logEnergyExchange(
          energyChunkSupplier.id,
          energyChunkConsumer.id,
          energyExchangeToLog
        );
      }
    }

    /**
     * make a user-movable model element fall to the nearest supporting surface
     * @param {UserMovableModelElement} modelElement - the falling object
     * @param {number} dt - time step in seconds
     * @private
     */
    fallToSurface( modelElement, dt ) {
      let minYPos = 0;
      const acceleration = -9.8; // meters/s/s

      // sort list of ground spots in order, with the closest spot to modelElement first
      const groundSpotXPositionsCopy = [ ...this.groundSpotXPositions ];
      groundSpotXPositionsCopy.sort( ( a, b ) => {
        const distanceA = Math.abs( a - modelElement.positionProperty.value.x );
        const distanceB = Math.abs( b - modelElement.positionProperty.value.x );
        return distanceA - distanceB;
      } );
      let destinationXSpot = null;
      let destinationSurface = null;

      // check out each spot
      for ( let i = 0; i < groundSpotXPositionsCopy.length &&
                       destinationXSpot === null &&
                       destinationSurface === null; i++
      ) {
        const modelElementsInSpot = [];

        // get a list of what's currently in the spot being checked
        this.modelElementList.forEach( potentialRestingModelElement => {
          if ( potentialRestingModelElement === modelElement ) {
            return;
          }

          // this if statement is checking each potentialRestingModelElement to see which ones are already in the spot
          // that modelElement is falling to.
          //
          // the following first condition usually just needs to check if potentialRestingModelElement's center x
          // coordinate matches the current ground spot x coordinate, but instead it considers any
          // potentialRestingModelElement's to be in this spot if its center x coordinate is within half a spot's
          // width of the ground spot x coordinate. this handles the multitouch case where modelElement is falling and
          // a user drags a different model element somewhere underneath it (which is likely not located at a ground
          // x coordinate), because instead of not detecting that user-held model element as occupying this spot
          // (and therefore falling through it and overlapping), it does detect it, and then falls to the model
          // elements surface instead of all the way down to the ground spot.
          //
          // the second condition checks that potentialRestingModelElement is below modelElement
          // because, for example, in the case where a beaker with a block inside is being dropped, we don't want the
          // beaker to think that its block is in the spot below it.
          if ( Math.abs( potentialRestingModelElement.positionProperty.value.x - groundSpotXPositionsCopy[ i ] ) <=
               this.spaceBetweenGroundSpotCenters / 2 &&
               potentialRestingModelElement.positionProperty.value.y <= modelElement.positionProperty.value.y ) {
            modelElementsInSpot.push( potentialRestingModelElement );

            // this is an additional search to see if there are any elements stacked on a found element that are
            // *above* the element being dropped, see https://github.com/phetsims/energy-forms-and-changes/issues/221
            let restingModelElement = potentialRestingModelElement;
            while ( restingModelElement.topSurface.elementOnSurfaceProperty.value ) {
              const stackedRestingModelElement = restingModelElement.topSurface.elementOnSurfaceProperty.value;
              if ( stackedRestingModelElement.positionProperty.value.y > modelElement.positionProperty.value.y &&
                   modelElementsInSpot.indexOf( stackedRestingModelElement ) < 0 ) {
                modelElementsInSpot.push( stackedRestingModelElement );
              }
              restingModelElement = stackedRestingModelElement;
            }
          }
        } );

        if ( modelElementsInSpot.length > 0 ) {

          // flag any beakers that are in the spot because beakers aren't allowed to stack on top of one another
          let beakerFoundInSpot = false;
          for ( let j = 0; j < modelElementsInSpot.length && !beakerFoundInSpot; j++ ) {
            beakerFoundInSpot = beakerFoundInSpot || modelElementsInSpot[ j ] instanceof Beaker;
          }
          let currentModelElementInStack = modelElement;
          let beakerFoundInStack = currentModelElementInStack instanceof Beaker;

          // iterate through the stack of model elements being held and flag if any beakers are in it
          while ( currentModelElementInStack.topSurface.elementOnSurfaceProperty.value && !beakerFoundInStack ) {
            beakerFoundInStack = beakerFoundInStack ||
                                 currentModelElementInStack.topSurface.elementOnSurfaceProperty.value instanceof Beaker;
            currentModelElementInStack = currentModelElementInStack.topSurface.elementOnSurfaceProperty.value;
          }

          if ( !( beakerFoundInSpot && beakerFoundInStack ) ) {

            // find the highest element in the stack
            let highestElement = modelElementsInSpot[ 0 ];
            for ( let j = 1; j < modelElementsInSpot.length; j++ ) {
              if ( modelElementsInSpot[ j ].topSurface.positionProperty.value.y >
                   highestElement.topSurface.positionProperty.value.y ) {
                highestElement = modelElementsInSpot[ j ];
              }
            }
            destinationSurface = highestElement.topSurface;
          }
        }
        else {
          destinationXSpot = groundSpotXPositionsCopy[ i ];
        }
      }

      if ( destinationSurface !== null ) {

        // center the model element above its new supporting element
        minYPos = destinationSurface.positionProperty.value.y;
        modelElement.positionProperty.set(
          new Vector2( destinationSurface.positionProperty.value.x, modelElement.positionProperty.value.y )
        );
      }
      else {
        modelElement.positionProperty.set( new Vector2( destinationXSpot, modelElement.positionProperty.value.y ) );
      }

      // calculate a proposed Y position based on gravitational falling
      const velocity = modelElement.verticalVelocityProperty.value + acceleration * dt;
      let proposedYPos = modelElement.positionProperty.value.y + velocity * dt;
      if ( proposedYPos < minYPos ) {

        // the element has landed on the ground or some other surface
        proposedYPos = minYPos;
        modelElement.verticalVelocityProperty.set( 0 );
        if ( destinationSurface !== null ) {
          modelElement.setSupportingSurface( destinationSurface );
          destinationSurface.elementOnSurfaceProperty.set( modelElement );
        }
      }
      else {
        modelElement.verticalVelocityProperty.set( velocity );
      }
      modelElement.positionProperty.set( new Vector2( modelElement.positionProperty.value.x, proposedYPos ) );
    }

    /**
     * Evaluate whether the provided model element can be moved to the provided position without overlapping with other
     * solid model elements. If overlap would occur, adjust the position to one that works. Note that this is not
     * very general due to a number of special requirements for the Energy Forms and Changes sim, so it would likely not
     * be easy to reuse.
     * @param {RectangularThermalMovableModelElement} modelElement - element whose position is being checked
     * @param {Vector2} proposedPosition - the position where the model element would like to go
     * @returns {Vector2} the original proposed position if valid, or alternative position if not
     * @public
     */
    constrainPosition( modelElement, proposedPosition ) {

      const modelElementPosition = modelElement.positionProperty.get();

      // calculate the proposed motion
      let allowedTranslation = Vector2.createFromPool(
        proposedPosition.x - modelElementPosition.x,
        proposedPosition.y - modelElementPosition.y
      );

      // get the current composite bounds of the model element
      const modelElementBounds = modelElement.getCompositeBoundsForPosition(
        modelElementPosition,
        this.reusableBounds
      );

      // create bounds that use the perspective compensation that is necessary for evaluating burner interaction
      const modelElementBoundsWithSidePerspective = Bounds2.createFromPool(
        modelElementBounds.minX - modelElement.perspectiveCompensation.x,
        modelElementBounds.minY,
        modelElementBounds.maxX + modelElement.perspectiveCompensation.x,
        modelElementBounds.maxY
      );

      // validate against burner boundaries
      allowedTranslation = this.determineAllowedTranslation(
        modelElementBoundsWithSidePerspective,
        this.burnerBlockingRect,
        allowedTranslation.x,
        allowedTranslation.y,
        true,
        allowedTranslation
      );

      // now check the model element's motion against each of the beakers
      this.beakers.forEach( beaker => {

        if ( beaker === modelElement ) {

          // don't test against self
          return;
        }

        // get the bounds set that describes the shape of the beaker
        const beakerBoundsList = beaker.translatedPositionTestingBoundsList;

        // if the modelElement is a block, it has x and y perspective comp that need to be used
        const modelElementBoundsWithTopAndSidePerspective = Bounds2.createFromPool(
          modelElementBounds.minX - modelElement.perspectiveCompensation.x,
          modelElementBounds.minY - modelElement.perspectiveCompensation.y,
          modelElementBounds.maxX + modelElement.perspectiveCompensation.x,
          modelElementBounds.maxY + modelElement.perspectiveCompensation.y
        );

        // don't restrict the motion based on the beaker if the beaker is on top of this model element
        if ( !beaker.isStackedUpon( modelElement ) ) {

          // the code below assumes that the bounds list is in the order: left side, bottom, right side. this assertion
          // verifies that.
          assert && assert(
          beakerBoundsList[ 0 ].centerX < beakerBoundsList[ 1 ].centerX &&
          beakerBoundsList[ 1 ].centerX < beakerBoundsList[ 2 ].centerX,
            'beaker bounds list is out of order'
          );

          allowedTranslation = this.determineAllowedTranslation(
            modelElementBoundsWithTopAndSidePerspective,
            beakerBoundsList[ 0 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
          allowedTranslation = this.determineAllowedTranslation(
            modelElementBoundsWithSidePerspective,
            beakerBoundsList[ 1 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
          allowedTranslation = this.determineAllowedTranslation(
            modelElementBoundsWithTopAndSidePerspective,
            beakerBoundsList[ 2 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
        }
        else {
          // if beaker A is stacked on the current modelElement, get beaker B directly as the otherBeaker because there
          // are currently only two beakers. this will need to be generalized to check for each other beaker that is not
          // stacked on this modelElement if the time comes when more than two beakers exist.
          const otherBeaker = this.beakers[ 1 - this.beakers.indexOf( beaker ) ];

          // get the bounds of the other beaker and the bounds of the beaker stacked on top of this modelElement
          const otherBeakerBoundsList = otherBeaker.translatedPositionTestingBoundsList;
          const currentBeakerBounds = beaker.getBounds();

          allowedTranslation = this.determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 0 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
          allowedTranslation = this.determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 1 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
          allowedTranslation = this.determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 2 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
        }

        modelElementBoundsWithTopAndSidePerspective.freeToPool();
      } );

      // now check the model element's motion against each of the blocks
      this.blocks.forEach( block => {

        if ( block === modelElement ) {

          // don't test against self
          return;
        }

        const blockBounds = block.getBounds();

        // Do not restrict the model element's motion in positive Y direction if the tested block is sitting on top of
        // the model element - the block will simply be lifted up.
        const isBlockStackedInBeaker = block.isStackedUpon( modelElement );

        if ( modelElement instanceof Block ) {

          allowedTranslation = this.determineAllowedTranslation(
            modelElement.getBounds(),
            blockBounds,
            allowedTranslation.x,
            allowedTranslation.y,
            !isBlockStackedInBeaker, // don't restrict in Y direction if this block is sitting in the beaker
            allowedTranslation
          );
        }
        else {

          // make sure this is a beaker before going any further
          assert && assert( modelElement instanceof BeakerContainer, 'unrecognized model element type' );

          // Test to see if the beaker's motion needs to be constrained due to the block's position, but *don't* do this
          // if the block is sitting inside the beaker, since it will be dragged along with the beaker's motion.
          if ( !isBlockStackedInBeaker ) {

            // Use the perspective-compensated edge of the block instead of the model edge in order to simplify z-order
            // handling.
            const perspectiveBlockBounds = Bounds2.createFromPool(
              blockBounds.minX - this.brick.perspectiveCompensation.x,
              blockBounds.minY,
              blockBounds.maxX + this.brick.perspectiveCompensation.x,
              blockBounds.maxY
            );

            // Clamp the translation of the beaker based on the test block's position.  This uses the sides of the beaker
            // and not it's outline so that the block can go inside.
            modelElement.translatedPositionTestingBoundsList.forEach( beakerEdgeBounds => {
              allowedTranslation = this.determineAllowedTranslation(
                beakerEdgeBounds,
                perspectiveBlockBounds,
                allowedTranslation.x,
                allowedTranslation.y,
                !isBlockStackedInBeaker,
                allowedTranslation
              );
            } );

            perspectiveBlockBounds.freeToPool();
          }
        }
      } );

      const newPosition = modelElementPosition.plus( allowedTranslation );

      // free reusable vectors and bounds
      allowedTranslation.freeToPool();
      modelElementBoundsWithSidePerspective.freeToPool();

      return newPosition;
    }

    //REVIEW #247 missing visibility annotation
    /**
     * a version of Bounds2.intersectsBounds that doesn't count equal edges as intersection
     * @param {Bounds2} bounds1
     * @param {Bounds2} bounds2
     * @returns {boolean}
     */
    exclusiveIntersectsBounds( bounds1, bounds2 ) {
      const minX = Math.max( bounds1.minX, bounds2.minX );
      const minY = Math.max( bounds1.minY, bounds2.minY );
      const maxX = Math.min( bounds1.maxX, bounds2.maxX );
      const maxY = Math.min( bounds1.maxY, bounds2.maxY );
      return ( maxX - minX ) > 0 && ( maxY - minY > 0 );
    }

    /**
     * Determines the portion of a proposed translation that may occur given a moving rectangle and a stationary
     * rectangle that can block the moving one.
     * @param {Bounds2} movingElementBounds
     * @param {Bounds2} stationaryElementBounds
     * @param {number} proposedTranslationX
     * @param {number} proposedTranslationY
     * @param {boolean} restrictPosY        Flag that controls whether the positive Y direction is restricted.  This
     *                                      is often set false if there is another model element on top of the one
     *                                      being tested.
     * @param {Vector2} [result] - optional vector to be reused
     * @returns {Vector2}
     * @private
     */
    determineAllowedTranslation(
      movingElementBounds,
      stationaryElementBounds,
      proposedTranslationX,
      proposedTranslationY,
      restrictPosY,
      result
    ) {

      result = result || new Vector2();

      // test for case where rectangles already overlap
      if ( this.exclusiveIntersectsBounds( movingElementBounds, stationaryElementBounds ) && restrictPosY ) {

        // determine the motion in the X & Y directions that will "cure" the overlap
        let xOverlapCure = 0;
        if ( movingElementBounds.maxX >= stationaryElementBounds.minX &&
             movingElementBounds.minX <= stationaryElementBounds.minX ) {

          xOverlapCure = stationaryElementBounds.minX - movingElementBounds.maxX;
        }
        else if ( stationaryElementBounds.maxX >= movingElementBounds.minX &&
                  stationaryElementBounds.minX <= movingElementBounds.minX ) {

          xOverlapCure = stationaryElementBounds.maxX - movingElementBounds.minX;
        }
        let yOverlapCure = 0;
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
          return result.setXY( xOverlapCure, proposedTranslationY );
        }
        else {
          return result.setXY( proposedTranslationX, yOverlapCure );
        }
      }

      let xTranslation = proposedTranslationX;
      let yTranslation = proposedTranslationY;
      const motionTestBounds = Bounds2.dirtyFromPool();

      // X direction
      if ( proposedTranslationX > 0 ) {

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
      else if ( proposedTranslationX < 0 ) {

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
      if ( proposedTranslationY > 0 && restrictPosY ) {

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
      else if ( proposedTranslationY < 0 ) {

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

      return result.setXY( xTranslation, yTranslation );
    }

    /**
     * Updates the temperature and color that would be sensed by a thermometer at the provided location.  This is done
     * as a single operation instead of having separate methods for getting temperature and color because it is more
     * efficient to do it like this.
     * @param {Vector2} position - location to be sensed
     * @param {Property.<number>} sensedTemperatureProperty
     * @param {Property.<Color>} sensedElementColorProperty
     * @public
     */
    updateTemperatureAndColorAtLocation( position, sensedTemperatureProperty, sensedElementColorProperty ) {

      let temperatureAndColorUpdated = false;

      // Test blocks first.  This is a little complicated since the z-order must be taken into account.
      const copyOfBlockList = this.blocks.slice( 0 );

      copyOfBlockList.sort( ( block1, block2 ) => {
        if ( block1.position === block2.position ) {
          return 0;
        }
        if ( block2.positionProperty.value.x > block1.positionProperty.value.x ||
             block2.positionProperty.value.y > block1.positionProperty.value.y ) {
          return 1;
        }
        return -1;
      } );

      for ( let i = 0; i < copyOfBlockList.length && !temperatureAndColorUpdated; i++ ) {
        const block = copyOfBlockList[ i ];
        if ( block.getProjectedShape().containsPoint( position ) ) {
          sensedTemperatureProperty.set( block.temperature );
          sensedElementColorProperty.set( block.color );
          temperatureAndColorUpdated = true;
          break;
        }
      }

      // test if this point is in any beaker's fluid
      for ( let i = 0; i < this.beakers.length && !temperatureAndColorUpdated; i++ ) {
        const beaker = this.beakers[ i ];
        if ( beaker.thermalContactArea.containsPoint( position ) ) {
          sensedTemperatureProperty.set( beaker.temperatureProperty.get() );
          sensedElementColorProperty.set( beaker.fluidColor );
          temperatureAndColorUpdated = true;
        }
      }

      // test if this point is in any beaker's steam. this check happens separately after all beakers' fluid have been
      // checked because in the case of a beaker body and another beaker's steam overlapping, the sensor should detect
      // the beaker body first
      for ( let i = 0; i < this.beakers.length && !temperatureAndColorUpdated; i++ ) {
        const beaker = this.beakers[ i ];
        if ( beaker.getSteamArea().containsPoint( position ) && beaker.steamingProportion > 0 ) {
          sensedTemperatureProperty.set( beaker.getSteamTemperature( position.y - beaker.getSteamArea().minY ) );
          sensedElementColorProperty.set( beaker.steamColor );
          temperatureAndColorUpdated = true;
        }
      }

      // test if the point is a burner
      for ( let i = 0; i < this.burners.length && !temperatureAndColorUpdated; i++ ) {
        const burner = this.burners[ i ];
        if ( burner.getFlameIceRect().containsPoint( position ) ) {
          sensedTemperatureProperty.set( burner.getTemperature() );
          sensedElementColorProperty.set( this.mapHeatCoolLevelToColor( burner.heatCoolLevelProperty.get() ) );
          temperatureAndColorUpdated = true;
        }
      }

      if ( !temperatureAndColorUpdated ) {

        // the position is in nothing else, so set the air temperature and color
        sensedTemperatureProperty.set( this.air.getTemperature() );
        sensedElementColorProperty.set( EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR );
      }
    }

    /**
     * get the thermal model element that has the provided ID
     * @param {string} id
     * @returns {Object} - one of the elements in the model that can provide and absorb energy
     * @private
     */
    getThermalElementByID( id ) {
      let element = null;
      if ( id === this.air.id ) {
        element = this.air;
      }
      else if ( id.indexOf( 'burner' ) >= 0 ) {
        element = _.find( this.burners, burner => burner.id === id );
      }
      else {
        element = _.find( this.thermalContainers, container => container.id === id );
      }
      assert && assert( element, `no element found for id: ${id}` );
      return element;
    }
  }

  return energyFormsAndChanges.register( 'EFACIntroModel', EFACIntroModel );
} );
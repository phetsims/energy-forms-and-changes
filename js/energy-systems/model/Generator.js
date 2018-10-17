// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type that models an electrical generator in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyConverter' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var GENERATOR_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_icon.png' );

  // constants

  // attributes of the wheel and generator
  var WHEEL_MOMENT_OF_INERTIA = 5; // In kg.
  var RESISTANCE_CONSTANT = 3; // Controls max speed and rate of slow down, empirically determined.
  var MAX_ROTATIONAL_VELOCITY = Math.PI / 2; // In radians/sec, empirically determined.

  // Images used to represent this model element in the view. Offsets empirically determined
  var WHEEL_CENTER_OFFSET = new Vector2( 0, 0.03 );
  var LEFT_SIDE_OF_WHEEL_OFFSET = new Vector2( -0.030, 0.03 );
  var CONNECTOR_OFFSET = new Vector2( 0.057, -0.041 );
  var WHEEL_RADIUS = 0.039; // half the width of the wheel image, need this precision for proper visual

  // offsets used to create the paths followed by the energy chunks
  var START_OF_WIRE_CURVE_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.01, -0.05 );
  var WIRE_CURVE_POINT_1_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.015, -0.062 );
  var WIRE_CURVE_POINT_2_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.03, -0.071 );
  var CENTER_OF_CONNECTOR_OFFSET = CONNECTOR_OFFSET;

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Generator( energyChunksVisibleProperty ) {

    EnergyConverter.call( this, new Image( GENERATOR_ICON ) );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.electricalGenerator.value;

    // @private {BooleanProperty}
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @public (read-only) {NumberProperty} - rotational position of the wheel
    this.wheelRotationalAngleProperty = new NumberProperty( 0 );

    // @public {BooleanProperty} - a flag that controls "direct coupling mode", which means that the generator wheel
    // turns at a rate that is directly proportional to the incoming energy, with no rotational inertia
    this.directCouplingModeProperty = new BooleanProperty( false );

    // @private
    this.wheelRotationalVelocity = 0;
    this.energyChunkMovers = [];

    // @public (read-only) {ObservableArray.<EnergyChunk} - The electrical energy chunks are kept on a separate list to
    // support placing them on a different layer in the view.
    this.electricalEnergyChunks = new ObservableArray();

    // // @public (read-only) {ObservableArray.<EnergyChunk} - the "hidden" energy chunks are kept on a separate list
    // mainly for code clarity
    this.hiddenEnergyChunks = new ObservableArray();
  }

  energyFormsAndChanges.register( 'Generator', Generator );

  return inherit( EnergyConverter, Generator, {

    /**
     * Factored from this.step
     * @param {number} dt time step in seconds
     * @param {Energy} incomingEnergy
     * @private
     */
    spinGeneratorWheel: function( dt, incomingEnergy ) {
      if ( !this.activeProperty.value ) {
        return;
      }

      // positive is counter clockwise
      var sign = Math.sin( incomingEnergy.direction ) > 0 ? -1 : 1;

      // handle different wheel rotation modes
      if ( this.directCouplingModeProperty.value ) {

        // treat the wheel as though it is directly coupled to the energy source, e.g. through a belt or drive shaft
        if ( incomingEnergy.type === EnergyType.MECHANICAL ) {
          var energyFraction = ( incomingEnergy.amount / dt ) / EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
          this.wheelRotationalVelocity = energyFraction * MAX_ROTATIONAL_VELOCITY * sign;
          this.wheelRotationalAngleProperty.set( this.wheelRotationalAngleProperty.value + this.wheelRotationalVelocity * dt );
        }

      } else {

        // treat the wheel like it is being moved from an external energy, such as water, and has inertia
        var torqueFromIncomingEnergy = 0;

        // empirically determined to reach max energy after a second or two
        var energyToTorqueConstant = 0.5;

        if ( incomingEnergy.type === EnergyType.MECHANICAL ) {
          torqueFromIncomingEnergy = incomingEnergy.amount * WHEEL_RADIUS * energyToTorqueConstant * sign;
        }

        var torqueFromResistance = -this.wheelRotationalVelocity * RESISTANCE_CONSTANT;
        var angularAcceleration = ( torqueFromIncomingEnergy + torqueFromResistance ) / WHEEL_MOMENT_OF_INERTIA;
        var newAngularVelocity = this.wheelRotationalVelocity + ( angularAcceleration * dt );
        this.wheelRotationalVelocity = Util.clamp(
          newAngularVelocity,
          -MAX_ROTATIONAL_VELOCITY,
          MAX_ROTATIONAL_VELOCITY
        );

        if ( Math.abs( this.wheelRotationalVelocity ) < 1E-3 ) {

          // prevent the wheel from moving forever
          this.wheelRotationalVelocity = 0;
        }
        this.wheelRotationalAngleProperty.set( this.wheelRotationalAngleProperty.value + this.wheelRotationalVelocity * dt );
      }
    },

    /**
     * step this model element in time
     * @param {number} dt time step
     * @param {Energy} incomingEnergy
     * @returns {Energy}
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      if ( this.activeProperty.value ) {

        var self = this;

        this.spinGeneratorWheel( dt, incomingEnergy );

        // handle any incoming energy chunks
        if ( this.incomingEnergyChunks.length > 0 ) {

          var incomingChunks = _.clone( this.incomingEnergyChunks );
          incomingChunks.forEach( function( chunk ) {

            // validate energy type
            assert && assert( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL,
              'EnergyType of incoming chunk expected to be of type MECHANICAL, but has type ' +
              chunk.energyTypeProperty.get() );

            // transfer chunk from incoming list to current list
            self.energyChunkList.push( chunk );
            _.pull( self.incomingEnergyChunks, chunk );

            // add a "mover" that will move this energy chunk to the center of the wheel
            var path = self.createMechanicalEnergyChunkPath( self.positionProperty.get() );
            var mover = new EnergyChunkPathMover( chunk, path, EFACConstants.ENERGY_CHUNK_VELOCITY );
            self.energyChunkMovers.push( mover );
          } );

          assert && assert(
            this.incomingEnergyChunks.length === 0,
            'this.incomingEnergyChunks should be empty: ' + this.incomingEnergyChunks
          );
        }

        // move the energy chunks and update their state
        this.updateEnergyChunkPositions( dt );

      } // this.active

      // produce the appropriate amount of energy
      var speedFraction = this.wheelRotationalVelocity / MAX_ROTATIONAL_VELOCITY;
      var energy = Math.abs( speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE ) * dt;
      return new Energy( EnergyType.ELECTRICAL, energy, 0 );
    },

    /**
     * @param {number} dt - time step, in seconds
     * @returns {Energy}
     * @private
     */
    updateEnergyChunkPositions: function( dt ) {
      var chunkMovers = _.clone( this.energyChunkMovers );

      var self = this;
      chunkMovers.forEach( function( mover ) {

        mover.moveAlongPath( dt );

        if ( !mover.pathFullyTraversed ) {
          return;
        }

        var chunk = mover.energyChunk;
        switch ( chunk.energyTypeProperty.get() ) {
          case EnergyType.MECHANICAL:

            // This mechanical energy chunk has traveled to the end of its path, so change it to electrical and send it
            // on its way.  Also add a "hidden" chunk so that the movement through the generator can be seen by the
            // user.
            self.energyChunkList.remove( chunk );
            _.pull( self.energyChunkMovers, mover );
            chunk.energyTypeProperty.set( EnergyType.ELECTRICAL );
            self.electricalEnergyChunks.push( chunk );
            self.energyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createElectricalEnergyChunkPath( self.positionProperty.value ),
              EFACConstants.ENERGY_CHUNK_VELOCITY )
            );
            var hiddenChunk = new EnergyChunk(
              EnergyType.HIDDEN,
              chunk.positionProperty.get(),
              Vector2.ZERO,
              self.energyChunksVisibleProperty
            );
            hiddenChunk.zPositionProperty.set( -EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED / 2 );
            self.hiddenEnergyChunks.push( hiddenChunk );
            self.energyChunkMovers.push( new EnergyChunkPathMover( hiddenChunk,
              self.createHiddenEnergyChunkPath( self.positionProperty.value ),
              EFACConstants.ENERGY_CHUNK_VELOCITY )
            );

            break;

          case EnergyType.ELECTRICAL:

            // This electrical energy chunk has traveled to the end of its path, so transfer it to the next energy
            // system.
            _.pull( self.energyChunkMovers, mover );
            self.outgoingEnergyChunks.push( chunk );

            break;

          case EnergyType.HIDDEN:

            // This hidden energy chunk has traveled to the end of its path, so just remove it, because the electrical
            // energy chunk to which is corresponds should now be visible to the user.
            self.hiddenEnergyChunks.remove( chunk );
            _.pull( self.energyChunkMovers, mover );

            break;

          default:
            assert && assert( false, 'Unrecognized EnergyType: ', chunk.energyTypeProperty.get() );
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

      if ( incomingEnergy.amount === 0 || incomingEnergy.type !== EnergyType.MECHANICAL ) {

        // no energy chunk pre-loading needed
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // simulate energy chunks moving through the system
      var preLoadComplete = false;
      while ( !preLoadComplete ) {
        energySinceLastChunk += incomingEnergy.amount * dt;

        // determine if time to add a new chunk
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var newChunk = new EnergyChunk( EnergyType.MECHANICAL,
            this.positionProperty.value.plus( LEFT_SIDE_OF_WHEEL_OFFSET ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newChunk );

          // add a 'mover' for this energy chunk
          this.energyChunkMovers.push( new EnergyChunkPathMover( newChunk,
            this.createMechanicalEnergyChunkPath( this.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );

          // update energy since last chunk
          energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        this.updateEnergyChunkPositions( dt );

        if ( this.outgoingEnergyChunks.length > 0 ) {

          // an energy chunk has made it all the way through the system
          preLoadComplete = true;
        }
      }
    },

    /**
     * @param {Vector2} panelPosition
     * @private
     */
    createMechanicalEnergyChunkPath: function( panelPosition ) {
      var path = [];
      path.push( panelPosition.plus( WHEEL_CENTER_OFFSET ) );
      return path;
    },

    /**
     * @param {Vector2} panelPosition
     * @private
     */
    createElectricalEnergyChunkPath: function( panelPosition ) {
      var path = [];
      path.push( panelPosition.plus( START_OF_WIRE_CURVE_OFFSET ) );
      path.push( panelPosition.plus( WIRE_CURVE_POINT_1_OFFSET ) );
      path.push( panelPosition.plus( WIRE_CURVE_POINT_2_OFFSET ) );
      path.push( panelPosition.plus( CENTER_OF_CONNECTOR_OFFSET ) );
      return path;
    },

    /**
     * @param {Vector2} panelPosition
     * @private
     */
    createHiddenEnergyChunkPath: function( panelPosition ) {
      var path = [];

      // overlaps with the electrical chunks until it reaches the window, then is done
      path.push( panelPosition.plus( START_OF_WIRE_CURVE_OFFSET ) );
      path.push( panelPosition.plus( WIRE_CURVE_POINT_1_OFFSET ) );

      return path;
    },

    /**
     * @returns {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      var speedFraction = this.wheelRotationalVelocity / MAX_ROTATIONAL_VELOCITY;
      var energy = Math.abs( speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE );
      return new Energy( EnergyType.ELECTRICAL, energy, 0 );
    },

    /**
     * deactivate the generator
     * @public
     * @override
     */
    deactivate: function() {
      EnergyConverter.prototype.deactivate.call( this );
      this.wheelRotationalVelocity = 0;
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergyConverter.prototype.clearEnergyChunks.call( this );
      this.electricalEnergyChunks.clear();
      this.hiddenEnergyChunks.clear();
      this.energyChunkMovers.length = 0;
    },

    /**
     * @public
     * @override
     */
    extractOutgoingEnergyChunks: function() {
      var chunks = _.clone( this.outgoingEnergyChunks );

      // Remove outgoing chunks from electrical energy chunks list
      this.electricalEnergyChunks.removeAll( chunks );
      this.outgoingEnergyChunks.length = 0;

      return chunks;
    },

    /**
     * restore the initial state
     * @public
     */
    reset: function() {
      this.wheelRotationalAngleProperty.reset();
      this.directCouplingModeProperty.reset();
    }
  }, {

    // statics
    WHEEL_CENTER_OFFSET: WHEEL_CENTER_OFFSET,
    WHEEL_RADIUS: WHEEL_RADIUS
  } );
} );
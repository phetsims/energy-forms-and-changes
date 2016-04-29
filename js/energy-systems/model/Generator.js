// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyConverter' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var GENERATOR_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_icon.png' );
  var CONNECTOR = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var GENERATOR = require( 'image!ENERGY_FORMS_AND_CHANGES/generator.png' );
  var GENERATOR_WHEEL_HUB_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_hub_2.png' );
  var GENERATOR_WHEEL_PADDLES_SHORT = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_paddles_short.png' );
  var GENERATOR_WHEEL_SPOKES = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_spokes.png' );
  var WIRE_BLACK_LEFT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_left.png' );

  // Constants

  // Attributes of the wheel and generator.
  var WHEEL_MOMENT_OF_INERTIA = 5; // In kg.
  var RESISTANCE_CONSTANT = 3; // Controls max speed and rate of slow down, empirically determined.
  var MAX_ROTATIONAL_VELOCITY = Math.PI / 2; // In radians/sec, empirically determined.

  // Images used to represent this model element in the view.
  // Offsets empirically determined
  var WHEEL_CENTER_OFFSET = new Vector2( 0, 0.03 );
  var LEFT_SIDE_OF_WHEEL_OFFSET = new Vector2( -0.030, 0.03 );
  var CONNECTOR_OFFSET = new Vector2( 0.057, -0.04 );

  var HOUSING_IMAGE = new EFACModelImage( GENERATOR, new Vector2( 0, 0 ) );
  var WHEEL_PADDLES_IMAGE = new EFACModelImage( GENERATOR_WHEEL_PADDLES_SHORT, WHEEL_CENTER_OFFSET );
  var WHEEL_HUB_IMAGE = new EFACModelImage( GENERATOR_WHEEL_HUB_2, WHEEL_CENTER_OFFSET );
  var SHORT_SPOKES_IMAGE = new EFACModelImage( GENERATOR_WHEEL_SPOKES, WHEEL_CENTER_OFFSET );
  var CONNECTOR_IMAGE = new EFACModelImage( CONNECTOR, CONNECTOR_OFFSET );
  var WIRE_CURVED_IMAGE = new EFACModelImage( WIRE_BLACK_LEFT, new Vector2( 0.0185, -0.015 ) );
  var WHEEL_RADIUS = WHEEL_HUB_IMAGE.width / 2;

  // Offsets used to create the paths followed by the energy chunks.
  var START_OF_WIRE_CURVE_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.01, -0.05 );
  var WIRE_CURVE_POINT_1_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.015, -0.06 );
  var WIRE_CURVE_POINT_2_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.03, -0.07 );
  var CENTER_OF_CONNECTOR_OFFSET = CONNECTOR_OFFSET;

  /**
   * @param {Property<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Generator( energyChunksVisibleProperty ) {

    // Add args to constructor as needed
    EnergyConverter.call( this, new Image( GENERATOR_ICON ) );

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    this.addProperty( 'wheelRotationalAngle', 0 );

    // Flag that controls "direct coupling mode", which means that the
    // generator wheel turns at a rate that is directly proportionate to the
    // incoming energy, with no rotational inertia.
    this.addProperty( 'directCouplingMode', false );

    this.wheelRotationalVelocity = 0;
    this.energyChunkMovers = [];

    // The electrical energy chunks are kept on a separate list to support
    // placing them on a different layer in the view.
    this.electricalEnergyChunks = new ObservableArray();

    // The "hidden" energy chunks are kept on a separate list mainly for
    // code clarity.
    this.hiddenEnergyChunks = new ObservableArray();
  }

  energyFormsAndChanges.register( 'Generator', Generator );

  return inherit( EnergyConverter, Generator, {

    /**
     * Factored from this.step
     * @param {Number} dt timestep
     * @param {Energy} incomingEnergy
     *
     * @private
     * @override
     */
    spinGeneratorWheel: function( dt, incomingEnergy ) {
      if ( !this.active ) {
        return;
      }

      // Positive is counter clockwise.
      var sign = Math.sin( incomingEnergy.direction ) > 0 ? -1 : 1;

      // Handle different wheel rotation modes.
      if ( this.directCouplingMode ) {

        // Treat the wheel as though it is directly coupled to the
        // energy source, e.g. through a belt or drive shaft.
        if ( incomingEnergy.type === EnergyType.MECHANICAL ) {
          var energyFraction = ( incomingEnergy.amount / dt ) / EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
          this.wheelRotationalVelocity = energyFraction * MAX_ROTATIONAL_VELOCITY * sign;
          this.wheelRotationalAngleProperty.set( this.wheelRotationalAngle + this.wheelRotationalVelocity * dt );
        }

      } else {
        // Treat the wheel like it is being moved from an external
        // energy, such as water, and has inertia.
        var torqueFromIncomingEnergy = 0;

        // Empirically determined to reach max energy after a second or two.
        var energyToTorqueConstant = 0.5;

        if ( incomingEnergy.type === EnergyType.MECHANICAL ) {
          torqueFromIncomingEnergy = incomingEnergy.amount * WHEEL_RADIUS * energyToTorqueConstant * sign;
        }

        var torqueFromResistance = -this.wheelRotationalVelocity * RESISTANCE_CONSTANT;
        var angularAcceleration = ( torqueFromIncomingEnergy + torqueFromResistance ) / WHEEL_MOMENT_OF_INERTIA;
        var newAngularVelocity = this.wheelRotationalVelocity + ( angularAcceleration * dt );
        this.wheelRotationalVelocity = Util.clamp( newAngularVelocity, -MAX_ROTATIONAL_VELOCITY, MAX_ROTATIONAL_VELOCITY );

        if ( Math.abs( this.wheelRotationalVelocity ) < 1E-3 ) {
          // Prevent the wheel from moving forever.
          this.wheelRotationalVelocity = 0;
        }
        this.wheelRotationalAngleProperty.set( this.wheelRotationalAngle + this.wheelRotationalVelocity * dt );
      }
    },

    /**
     * @param {Number} dt timestep
     * @param {Energy} incomingEnergy
     *
     * @return {Energy}
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      if ( this.active ) {

        var self = this;

        this.spinGeneratorWheel( dt, incomingEnergy );

        // Handle any incoming energy chunks.
        if ( this.incomingEnergyChunks.length > 0 ) {

          var incomingChunks = _.clone( this.incomingEnergyChunks );
          incomingChunks.forEach( function( chunk ) {

            // Validate energy type
            assert && assert( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL,
              'EnergyType of incoming chunk expected to be of type MECHANICAL, but has type ' +
              chunk.energyTypeProperty.get() );

            // Transfer chunk from incoming list to current list
            self.energyChunkList.push( chunk );
            _.remove( self.incomingEnergyChunks, function( ec ) {
              return ec === chunk;
            } );

            // Add a "mover" that will move this energy chunk to
            // the center of the wheel.
            var path = self.createMechanicalEnergyChunkPath( self.positionProperty.get() );
            var mover = new EnergyChunkPathMover( chunk, path, EFACConstants.ENERGY_CHUNK_VELOCITY );
            self.energyChunkMovers.push( mover );
          } );

          assert && assert( this.incomingEnergyChunks.length === 0,
            'this.incomingEnergyChunks should be empty: ' + this.incomingEnergyChunks );
        }

        // Move the energy chunks and update their state.
        this.updateEnergyChunkPositions( dt );

      } // this.active

      // Produce the appropriate amount of energy.
      var speedFraction = this.wheelRotationalVelocity / MAX_ROTATIONAL_VELOCITY;
      var energy = Math.abs( speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE ) * dt;
      return new Energy( EnergyType.ELECTRICAL, energy, 0 );
    },

    /**
     * [description]
     *
     * @param {Number} dt timestep
     *
     * @return {Energy}
     * @private
     */
    updateEnergyChunkPositions: function( dt ) {
      var chunkMovers = _.clone( this.energyChunkMovers );

      var self = this;
      chunkMovers.forEach( function( mover ) {

        mover.moveAlongPath( dt );

        // Nothing left to do unless chunk is at the end of its path
        if ( !mover.pathFullyTraversed ) {
          return;
        }

        var chunk = mover.energyChunk;
        switch ( chunk.energyTypeProperty.get() ) {
          case EnergyType.MECHANICAL:
            // This mechanical energy chunk has traveled to the
            // end of its path, so change it to electrical and
            // send it on its way.  Also add a "hidden" chunk
            // so that the movement through the generator can
            // be seen by the user.

            _.remove( self.energyChunkList, function( ec ) {
              return ec === chunk;
            } );

            _.remove( self.energyChunkMovers, function( m ) {
              return m === mover;
            } );

            chunk.energyTypeProperty.set( EnergyType.ELECTRICAL );

            self.electricalEnergyChunks.push( chunk );

            self.energyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createElectricalEnergyChunkPath( self.position ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );

            var hiddenChunk = new EnergyChunk(
              EnergyType.HIDDEN,
              chunk.positionProperty.get(),
              Vector2.ZERO,
              self.energyChunksVisibleProperty );

            // TODO: figure out why hidden chunks are not displaying.
            hiddenChunk.zPositionProperty.set( -EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED / 2 );

            self.hiddenEnergyChunks.push( hiddenChunk );

            self.energyChunkMovers.push( new EnergyChunkPathMover( hiddenChunk,
              self.createHiddenEnergyChunkPath( self.position ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );

            break;

          case EnergyType.ELECTRICAL:
            // This electrical energy chunk has traveled to the
            // end of its path, so transfer it to the next
            // energy system.
            _.remove( self.energyChunkMovers, function( m ) {
              return m === mover;
            } );

            self.outgoingEnergyChunks.push( chunk );
            break;

          case EnergyType.HIDDEN:
            // This hidden energy chunk has traveled to the end
            // of its path, so just remove it, because the
            // electrical energy chunk to which is corresponds
            // should now be visible to the user.

            self.hiddenEnergyChunks.remove( chunk );

            _.remove( self.energyChunkMovers, function( m ) {
              return m === mover;
            } );
            break;
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
        // No energy chunk pre-loading needed.
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // Simulate energy chunks moving through the system.
      var preLoadComplete = false;
      while ( !preLoadComplete ) {
        energySinceLastChunk += incomingEnergy.amount * dt;

        // Determine if time to add a new chunk.
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var newChunk = new EnergyChunk( EnergyType.MECHANICAL,
            this.position.plus( LEFT_SIDE_OF_WHEEL_OFFSET ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty );

          this.energyChunkList.push( newChunk );

          // Add a 'mover' for this energy chunk.
          this.energyChunkMovers.push( new EnergyChunkPathMover( newChunk,
            this.createMechanicalEnergyChunkPath( this.position ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );

          // Update energy since last chunk.
          energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        this.updateEnergyChunkPositions( dt );

        if ( this.outgoingEnergyChunks.length > 0 ) {
          // An energy chunk has made it all the way through the system.
          preLoadComplete = true;
        }
      }

    },

    /**
     * @param {Vector2} panelPosition [description]
     * @private
     */
    createMechanicalEnergyChunkPath: function( panelPosition ) {
      var path = [];

      path.push( panelPosition.plus( WHEEL_CENTER_OFFSET ) );

      return path;
    },

    /**
     * @param {Vector2} panelPosition [description]
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
     * @param {Vector2} panelPosition [description]
     * @private
     */
    createHiddenEnergyChunkPath: function( panelPosition ) {
      var path = [];

      // Overlaps with the electrical chunks until it reaches the window, then is done.
      path.push( panelPosition.plus( START_OF_WIRE_CURVE_OFFSET ) );
      path.push( panelPosition.plus( WIRE_CURVE_POINT_1_OFFSET ) );

      return path;
    },

    /**
     * [getEnergyOutputRate description]
     *
     * @return {Energy} [description]
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      var speedFraction = this.wheelRotationalVelocity / MAX_ROTATIONAL_VELOCITY;
      var energy = Math.abs( speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE );
      return new Energy( EnergyType.ELECTRICAL, energy, 0 );
    },

    /**
     * Deactivate the generator.
     * @public
     * @override
     */
    deactivate: function() {
      EnergyConverter.prototype.deactivate.call( this );
      this.wheelRotationalVelocity = 0;
    },

    /**
     * [clearEnergyChunks description]
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
     * [description]
     * @public
     * @override
     */
    extractOutgoingEnergyChunks: function() {
      var chunks = _.clone( this.outgoingEnergyChunks );

      // Remove outgoing chunks from electrical energy chunks list
      this.electricalEnergyChunks.removeAll( chunks );
      this.outgoingEnergyChunks.length = 0;

      return chunks;
    }

  }, {
    SHORT_SPOKES_IMAGE: SHORT_SPOKES_IMAGE,
    WHEEL_PADDLES_IMAGE: WHEEL_PADDLES_IMAGE,
    WIRE_CURVED_IMAGE: WIRE_CURVED_IMAGE,
    HOUSING_IMAGE: HOUSING_IMAGE,
    CONNECTOR_IMAGE: CONNECTOR_IMAGE,
    WHEEL_HUB_IMAGE: WHEEL_HUB_IMAGE,
    WHEEL_CENTER_OFFSET: WHEEL_CENTER_OFFSET,
    WHEEL_RADIUS: WHEEL_RADIUS
  } );
} );


// Copyright 2016-2018, University of Colorado Boulder

/**
 * main view for the 'Energy Systems' screen of the Energy Forms And Changes simulation
 *
 * @author  John Blanco
 * @author  Martin Veillette (Berea College)
 * @author  Jesse Greenberg
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var BeakerHeaterNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/BeakerHeaterNode' );
  var BeltNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/BeltNode' );
  var BikerNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/BikerNode' );
  var Checkbox = require( 'SUN/Checkbox' );
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkLegend = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EnergyChunkLegend' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySystemElementSelector = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EnergySystemElementSelector' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var FaucetAndWaterNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/FaucetAndWaterNode' );
  var GeneratorNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/GeneratorNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var LightBulbNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightBulbNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SolarPanelNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/SolarPanelNode' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var SunNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/SunNode' );
  var TeaKettleNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/TeaKettleNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );

  // constants
  var EDGE_INSET = 10;
  var SELECTOR_SPACING = 50;
  var BOTTOM_CONTROL_PANEL_HEIGHT = 49; // manually coordinated to match similar panel on 1st screen

  /**
   * @param {EnergySystemsModel} model
   * @constructor
   */
  function EnergySystemsScreenView( model ) {

    var self = this;

    ScreenView.call( this );

    // a11y - the scene summary to be read by assistive technology
    this.addChild( new Node( {
      tagName: 'div',
      innerContent: EFACA11yStrings.energySystemsScreenInteractionHint.value,
      descriptionContent: EFACA11yStrings.energySystemsScreenSummaryDescription.value
    } ) );

    // a11y - a description of the current configuration of the energy system to be read by assistive technology
    var energySystemConfigDescription = new Node( {
      tagName: 'h3',
      innerContent: EFACA11yStrings.energySystem.value,
      descriptionContent: EFACA11yStrings.energySystemHelpText.value
    } );
    this.addChild( energySystemConfigDescription );

    // update the a11y description as the selected element changes
    Property.multilink(
      [
        model.energySourcesCarousel.targetIndexProperty,
        model.energyConvertersCarousel.targetIndexProperty,
        model.energyUsersCarousel.targetIndexProperty
      ],
      function() {
        var energySource = model.energySourcesCarousel.getSelectedElement();
        var energyConverter = model.energyConvertersCarousel.getSelectedElement();
        var energyUser = model.energyUsersCarousel.getSelectedElement();
        assert && assert( energySource.a11yName, 'the selected element has no accessibility name specified' );
        energySystemConfigDescription.descriptionContent = StringUtils.fillIn(
          EFACA11yStrings.energySystemHelpText.value,
          {
            producer: energySource.a11yName,
            converter: energyConverter.a11yName,
            user: energyUser.a11yName
          }
        );
      }
    );

    // convenience variable
    var layoutBounds = this.layoutBounds;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model, which is on the
    // middle of the screen above the counter as located in the view. Final arg is zoom factor from original Java sim -
    // smaller zooms out, larger zooms in.
    var mvtOriginX = Math.round( layoutBounds.width * 0.5 );
    var mvtOriginY = Math.round( layoutBounds.height * 0.475 );
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, new Vector2( mvtOriginX, mvtOriginY ), 2200
    );

    // layer node for back-most layer
    var backLayer = new Node();
    this.addChild( backLayer );

    // create the checkbox that controls the visibility of the energy chunks
    var showEnergyChunksCheckbox = new Checkbox(
      new LayoutBox( {
        children: [
          new Text( energySymbolsString, { font: new PhetFont( 20 ) } ),
          EnergyChunkNode.createEnergyChunkNode( EnergyType.THERMAL )
        ],
        orientation: 'horizontal',
        spacing: 5
      } ),
      model.energyChunksVisibleProperty
    );

    // add the checkbox that controls the visibility of the energy chunks to a panel and then add it to the scene graph
    var showEnergyChunksPanel = new Panel( showEnergyChunksCheckbox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      right: layoutBounds.maxX - EDGE_INSET,
      top: EDGE_INSET
    } );
    self.addChild( showEnergyChunksPanel );

    // add the energy chunk legend
    var energyChunkLegend = new EnergyChunkLegend( {
      right: layoutBounds.maxX - EDGE_INSET,
      top: showEnergyChunksPanel.bottom + 10
    } );
    this.addChild( energyChunkLegend );

    // only show the energy chunk legend when energy chunks are visible
    model.energyChunksVisibleProperty.linkAttribute( energyChunkLegend, 'visible' );

    // create a background rectangle at the bottom of the screen where the play/pause controls will reside
    var bottomPanel = new Rectangle(
      0,
      0,
      layoutBounds.width * 2, // wide enough that users are unlikely to see the edge
      layoutBounds.height, // tall enough that users are unlikely to see the bottom
      {
        centerX: layoutBounds.centerX,
        top: layoutBounds.maxY - BOTTOM_CONTROL_PANEL_HEIGHT,
        fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR
      }
    );
    backLayer.addChild( bottomPanel );

    // add the reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
      },
      radius: EFACConstants.RESET_ALL_BUTTON_RADIUS,
      right: layoutBounds.maxX - EDGE_INSET,
      centerY: ( bottomPanel.top + layoutBounds.maxY ) / 2
    } );
    self.addChild( resetAllButton );

    // create the energy user nodes
    this.beakerHeaterNode = new BeakerHeaterNode(
      model.beakerHeater,
      model.energyChunksVisibleProperty,
      modelViewTransform
    );
    var incandescentBulbNode = new LightBulbNode(
      model.incandescentBulb,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      { bulbType: 'incandescent' }
    );
    var fluorescentBulbNode = new LightBulbNode(
      model.fluorescentBulb,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      { bulbType: 'fluorescent' }
    );
    this.addChild( this.beakerHeaterNode );
    this.addChild( incandescentBulbNode );
    this.addChild( fluorescentBulbNode );

    // create the energy converter nodes
    var generatorNode = new GeneratorNode( model.generator, modelViewTransform );
    var beltNode = new BeltNode( model.belt, modelViewTransform );
    var solarPanelNode = new SolarPanelNode( model.solarPanel, modelViewTransform );
    this.addChild( generatorNode );
    this.addChild( beltNode );
    this.addChild( solarPanelNode );

    // create the energy source nodes
    this.faucetNode = new FaucetAndWaterNode( model.faucet, model.energyChunksVisibleProperty, modelViewTransform );
    var sunNode = new SunNode( model.sun, model.energyChunksVisibleProperty, modelViewTransform );
    this.teaKettleNode = new TeaKettleNode( model.teaKettle, model.energyChunksVisibleProperty, modelViewTransform );
    var bikerNode = new BikerNode( model.biker, model.energyChunksVisibleProperty, modelViewTransform );
    this.addChild( sunNode );
    this.addChild( this.faucetNode );
    this.addChild( bikerNode );
    this.addChild( this.teaKettleNode );

    // add the energy system element selectors, which are sets of radio buttons
    var energySourceSelector = new EnergySystemElementSelector( model.energySourcesCarousel, {
      left: EDGE_INSET,
      bottom: bottomPanel.top - EDGE_INSET
    } );
    var energyConverterSelector = new EnergySystemElementSelector( model.energyConvertersCarousel, {
      left: energySourceSelector.right + SELECTOR_SPACING,
      bottom: bottomPanel.top - EDGE_INSET
    } );
    var energyUserSelector = new EnergySystemElementSelector( model.energyUsersCarousel, {
      left: energyConverterSelector.right + SELECTOR_SPACING,
      bottom: bottomPanel.top - EDGE_INSET
    } );
    this.addChild( energySourceSelector );
    this.addChild( energyConverterSelector );
    this.addChild( energyUserSelector );
  }

  energyFormsAndChanges.register( 'EnergySystemsScreenView', EnergySystemsScreenView );

  return inherit( ScreenView, EnergySystemsScreenView, {

    /**
     * step this view element, called by the framework
     * @param dt - time step, in seconds
     * @public
     */
    step: function( dt ) {
      this.teaKettleNode.steamNode.step( dt );
      this.beakerHeaterNode.step( dt );
      this.faucetNode.step( dt );
    }
  } );
} );


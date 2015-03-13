// Copyright 2002-2015, University of Colorado

/**
 * Clock control panel that shows "Normal Speed" and "Fast Forward" as radio
 * buttons with a play/pause and step button.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  /*
   * Constructor.
   */
  function NormalAndFastForwardTimeControlPanel( normalSpeed, clock ) {
    Node.call( this );
    var clockControlPanel = new PSwing( new PiccoloClockControlPanel( clock ).withAnonymousClassBody( {
      initializer: function() {
        setBackground( TRANSPARENT );
        getButtonCanvas().setBackground( TRANSPARENT );
        getBackgroundNode().setVisible( false );
        clearAllToolTips();
      }
    } ) );
    var normalSpeedButton = new PSwing( new PropertyRadioButton( normalMotionRadioButton, EnergyFormsAndChangesResources.Strings.NORMAL, normalSpeed, true ).withAnonymousClassBody( {
      initializer: function() {
        setBackground( TRANSPARENT );
        setFont( RADIO_BUTTON_FONT );
      }
    } ) );
    var fastForwardButton = new PSwing( new PropertyRadioButton( fastForwardRadioButton, EnergyFormsAndChangesResources.Strings.FAST_FORWARD, normalSpeed, false ).withAnonymousClassBody( {
      initializer: function() {
        setBackground( TRANSPARENT );
        setFont( RADIO_BUTTON_FONT );
      }
    } ) );
    this.addChild( new HBox( normalSpeedButton, fastForwardButton, clockControlPanel ) );
  }

  return inherit( Node, NormalAndFastForwardTimeControlPanel, {} );
} );


//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.Color;
//
//import edu.colorado.phet.common.phetcommon.model.clock.IClock;
//import edu.colorado.phet.common.phetcommon.model.property.SettableProperty;
//import edu.colorado.phet.common.phetcommon.view.controls.PropertyRadioButton;
//import edu.colorado.phet.common.phetcommon.view.util.PhetFont;
//import edu.colorado.phet.common.piccolophet.RichPNode;
//import edu.colorado.phet.common.piccolophet.nodes.layout.HBox;
//import edu.colorado.phet.common.piccolophet.nodes.mediabuttons.PiccoloClockControlPanel;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesResources;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolox.pswing.PSwing;
//
//import static edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesSimSharing.UserComponents.fastForwardRadioButton;
//import static edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesSimSharing.UserComponents.normalMotionRadioButton;
//
///**
// * Clock control panel that shows "Normal Speed" and "Fast Forward" as radio
// * buttons with a play/pause and step button.
// *
// * @author Sam Reid
// * @author John Blanco
// */
//public class NormalAndFastForwardTimeControlPanel extends RichPNode {
//
//  private final Color TRANSPARENT = new Color( 0, 0, 0, 0 );
//  private final PhetFont RADIO_BUTTON_FONT = new PhetFont( 16 );
//
//  /*
//   * Constructor.
//   */
//  public NormalAndFastForwardTimeControlPanel( SettableProperty<Boolean> normalSpeed, IClock clock ) {
//    PNode clockControlPanel = new PSwing( new PiccoloClockControlPanel( clock ) {{
//      setBackground( TRANSPARENT );
//      getButtonCanvas().setBackground( TRANSPARENT );
//      getBackgroundNode().setVisible( false );
//      clearAllToolTips();
//    }} );
//    PNode normalSpeedButton = new PSwing( new PropertyRadioButton<Boolean>( normalMotionRadioButton,
//      EnergyFormsAndChangesResources.Strings.NORMAL,
//      normalSpeed,
//      true ) {{
//      setBackground( TRANSPARENT );
//      setFont( RADIO_BUTTON_FONT );
//    }} );
//    PNode fastForwardButton = new PSwing( new PropertyRadioButton<Boolean>( fastForwardRadioButton,
//      EnergyFormsAndChangesResources.Strings.FAST_FORWARD,
//      normalSpeed,
//      false ) {{
//      setBackground( TRANSPARENT );
//      setFont( RADIO_BUTTON_FONT );
//    }} );
//
//    addChild( new HBox( normalSpeedButton, fastForwardButton, clockControlPanel ) );
//  }
//}

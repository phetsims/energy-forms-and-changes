# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Energy Forms and Changes Simulation

This is a PhET Interactive Simulation that teaches about heat transfer and energy system transformations. It has two screens:
- **Intro Screen**: Heat transfer between blocks and beakers with temperature measurement
- **Systems Screen**: Energy flow through interconnected system elements (sources, converters, users)

## Architecture Overview

### Key Model Concepts
- **Thermal Model Elements**: Blocks and beakers that can absorb/release thermal energy
- **Energy Chunks**: Visual representations of energy (shown as "Energy Symbols" in UI)
- **Energy Chunk Slices**: 2D shapes that hold and distribute energy chunks
- **Heat Transfer**: Uses equation `dQ/dt = -kAT` for energy transfer calculations
- **Energy System Elements**: Components that produce, convert, or use energy

### Code Structure
- `js/intro/` - First screen (heat transfer)
  - `model/` - Heat transfer physics, blocks, beakers, burners
  - `view/` - 3D projection views, temperature sensors
- `js/systems/` - Second screen (energy systems)
  - `model/` - Energy sources, converters, users, energy flow
  - `view/` - System element nodes, energy chunk visualization
- `js/common/` - Shared components
  - `model/` - Energy chunks, thermal elements, sensors
  - `view/` - Energy chunk rendering, common UI elements

### Important Implementation Details

1. **Energy Chunk Management**: 
   - Energy chunks are dynamically created/destroyed
   - Use `EnergyChunkGroup` and `EnergyChunkWanderControllerGroup` for memory management
   - Energy chunks must be properly disposed to prevent memory leaks

2. **Heat Transfer**:
   - Model tracks energy in joules internally
   - Temperature changes based on energy content and specific heat
   - Air is part of the model for ambient heat exchange

3. **Systems Screen Complexity**:
   - Energy propagation differs when chunks are visible vs. invisible
   - `preloadEnergyChunks` method handles chunk pre-population
   - `EnergyChunkPathMover` controls chunk movement through system

4. **3D Projection**:
   - Elements are modeled in 2D but displayed with 3D perspective
   - Position convention: horizontal center and vertical bottom of 2D element

## PhET-Specific Patterns

### Observer Pattern with Properties
```javascript
// Creating properties
this.temperatureProperty = new NumberProperty( 20 );

// Linking with automatic disposal
temperatureProperty.link( temperature => {
  // Update view based on temperature
}, { disposer: this } );
```

### Model-View Separation
- Models in `js/*/model/` never reference views
- Views in `js/*/view/` observe model changes via Properties
- Use `modelViewTransform` for coordinate conversions

## Common Development Tasks

### Adding/Modifying Energy Transfer
1. Check `HeatTransferConstants.js` for transfer rates
2. Review `ThermalContactArea.js` for contact detection
3. Test stacking configurations thoroughly

### Working with Energy Chunks
1. Use `EnergyChunkGroup` for creation
2. Implement proper disposal in `dispose()` methods
3. Test visibility toggling behavior

### Debugging Tips
- Energy chunks are computationally expensive - watch performance
- Check for memory leaks when chunks are created/destroyed
- Verify energy conservation in closed systems

## Important Files

- `doc/implementation-notes.md` - Detailed implementation documentation
- `doc/model.md` - Physics model description
- `EFACConstants.js` - Simulation-wide constants
- `EFACQueryParameters.js` - URL query parameters for debugging

# Energy Forms and Changes - Implementation Notes

## Introduction

Though it may not necessarily look like it, this is a complicated sim.  The stacking, dragging, dragging interactions,
heat transfer, steam, energy chunks - all of these things make for a simulation with a number of tricky bits that may
take a while to fully understand.  If you're reading this because you're about to undertake some sort of maintenance
effort, you're encouraged to make sure that you understand any portion of the code that you change before changing it.
With all the interdependencies, it would be easy to break it in odd ways.

This simulation was originally written in Java, and was later ported to HTML5. As a result, some of the code may appear
more "Java-esque" than if the sim had been originally written in HTML5.  In particular, there is a lot more use of
inheritance and long type hierarchies than would be used if this was done from scratch in JavaScript.  There are also
places that use setter/getter methods instead of directly accessing the value of a property.

Also, the port was done by a number of different contributors.  Every effort was made to keep the style reasonably
consistent, but some variation is inevitable in such situations.

## Terminology

In this document, in the code comments, and in the class and variable names in the code, a number of terms were used
that were either invented for the purpose of this sim or are used in a particular way.  Here are some definitions that
will help to navigate it all.

- Energy Chunks: Energy chunks appear in the simulation as small rectangles with the letter E on them (assuming you're
using the English version) and different colors depending on the type of energy depicted.  They are meant to convey the
movement and transformation of different types of energy.  In the code, the term "energy chunk" is sometimes abbreviated
as "ec" for brevity.  In the sim, the term "Energy Chunks" was replaced with "Energy Symbols" shortly before
publication of the original Java sim, but we elected to keep the term "Energy Chunks" in the codebase.
- Energy Chunk Slice: A 2D shape that is generally used in a model element that is projected into 3D and that is used to
contain and distribute energy chunks.
- Energy System Element: A portion of a system where energy is being produced, converted, and consumed.
- Thermal Model Element: A thermal model element is something in the sim that can absorb or release thermal energy.
This is more relevant on the first screen than the second, and the blocks and beakers are all thermal model elements.
There is no `ThermalElement` base class, so it is more of a contract that exists between various elements.
- Surface: In the first screen, the terms "surface" and "horizontal surface" come up a lot because any beaker or block
that is not being moved by the user will fall to and then rest on a surface.  The bench is a surface, the burners have
surfaces, and the blocks and beakers all have surfaces, since they can be stacked.

## General Information

**Memory Management:** For the most part, object instances (model and view) persist for the lifetime of the sim. In
these cases, there is no need to call `unlink`, `removeListener`, `dispose`, etc. In cases where objects are dynamically 
allocated and deallocated, such as EnergyChunks and ElementFollowers, those memory management functions should exist.
 
## Intro Screen

The first screen is all about heat transfer, and the only type of energy chunks that appear are thermal.  The model
keeps track of the amount of energy in each thermal model element (i.e. the bricks and the beakers) in joules.  Each
element also has a temperature that can change and a specific heat which is fixed.  Energy can be added to or removed
from the model elements, which leads to a change in temperature.  Energy is transferred into or out of a thermal model
element by the burner or by coming into contact with another model element that is at a different temperature.  Heat
transfer is done at each model step based on the heat transfer equation:

```
dQ/dt = -kAT
```

where `Q` is the amount of heat transferred, dt is the time, k is the heat transfer constant, A is the area of contact,
and T is the temperature difference.

When the "Energy Symbols" checkbox is checked, the energy symbols become visible in the sim.  These are meant to give
the user a much more visible means of seeing energy moving around.  The number of energy chunks in any given element is
a function of its energy content, which in turn is a function of its temperature and specific heat.  When the energy
in an element gets out of balance with the number of energy chunks it contains, the model tries to transfer an energy
chunk in or out of the unbalanced element.  This code gets a bit tricky because there is often a way that we want the
energy chunks to go.  For instance, if a model element is on the burning and the burner is heating, incoming energy
chunks should come from there and not from, say, the air.  There is also handling for a lot of difficult situations,
such as switching and burner quickly back and forth between heating and cooling. 

Note that the air is part of the model, and energy chunks can go into the air from hot elements, or come out of the air
for cool ones.

The thermal model elements often have a set of "energy chunk slices" within them that act as a shape in which the
energy chunks can be stored and distributed.  These are used as a way to distribute the energy chunks evenly throughout
the object and as a way to maintain some z-order information that is used when positioning the energy chunks in the
view to make the distribution appear more three-dimensional.

The burners are modeled as an energy containing model element, such as a block of iron, but one that can increase or
decrease its energy content based on the position of the burner.

Also, burners generate or absorb energy chunks as needed by the other energy containers when in the appropriate state
(i.e. heating or cooling).  Unlike the other energy containers, they don't calculate whether they have excess or a
deficit of energy chunks.

There is a static object called the `energyChunkDistributor` that (as the name suggests) is used to distribute the
energy chunks within a thermal model element.  It uses a damped repulsive spring model to make the energy chunks push
away from each other and from the walls of the energy chunk slice in which they are contained.  This algorithm can be
computationally expensive, so a fair amount of work has gone into making it reasonably efficient.

The user is able to move the blocks and beakers around and stack them, or put blocks inside of beakers, in order to
experiment with how the energy moves between the model elements in these situations.  The elements have a 3D projection
in the view, but they are modeled in 2D and projected into 3D in the view.  The code that governs where the various
elements can and can't be dragged is fairly involved, study it carefully before making any major changes.  The
convention for the position of the model elements is that the position represents the horizontal center and the
vertical bottom of the non-projected (i.e. 2D) element. This approach was used because it makes it easier to detect when
a model object is sitting on a surface.

Acceleration is simulated to make things fall when released by the user when they are above any resting suface.

## Systems Screen

### Model

The producers, converters, and consumers of energy are collectively referred to as "energy systems".

All energy systems produce, convert, and consume energy at the same max rate, just to keep things consistent.  This is
obviously much different from the real world (e.g. the sun doesn't really produce the same amount of energy as a tea
pot).

### View


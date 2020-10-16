
# Energy Forms and Changes - Implementation Notes

## Introduction

Though it may not necessarily look like it, this is a complicated sim.  The stacking, dragging, dragging interactions,
heat transfer, steam, energy chunks - all of these things make for a simulation with a number of tricky bits that may
take a while to fully understand.  If you're reading this because you're about to undertake some sort of maintenance
effort, you're encouraged to make sure you understand any portion of the code that you change before changing it. With
all the interdependencies, it would be easy to break the sim in odd and unexpected ways.

This simulation was originally written in Java, and was later ported to HTML5. As a result, some of the code may appear
more "Java-esque" than if the sim had started its life in HTML5.  In particular, there is a lot more use of inheritance
and deep type hierarchies.  There are also places that use setter/getter methods instead of directly accessing the value
of a property.

Also, the port was done by a number of different contributors.  Every effort was made to keep the style reasonably
consistent, but some variation is inevitable in such situations.

## Terminology

In this document, in the code comments, and in the class and variable names in the code, a number of terms were used
that were either invented for the purpose of this sim or are used in a particular way.  Here are some definitions that
will help to navigate it all.

- Energy Chunks: Energy chunks appear in the simulation as small rectangles with the letter E on them (assuming you're
using the English version) and different colors depending on the type of energy depicted.  They are meant to convey the
movement and transformation of different types of energy.  In the code, the term "energy chunk" is sometimes abbreviated
as "ec" for brevity.  In the user interface for the sim, the term "Energy Chunks" was replaced with "Energy Symbols"
shortly before publication of the original Java sim, but we elected to keep the term "Energy Chunks" in the codebase.
- Energy Chunk Distributor: A static object that is used to distribute the energy chunks within a model element that
contains them.
- Energy Chunk Slice: A 2D shape that is used to hold energy chunks and is projected into 3D in the view.  Energy
chunks are distributed within each energy chunk slice by repelling each other and being repelled by the walls.
- Energy System Element: A portion of a system where energy is being produced, converted, and/or used.
- Thermal Model Element: A thermal model element is something in the sim that can absorb or release thermal energy.
This is more relevant on the first screen than the second, and the blocks and beakers are all thermal model elements.
There is no `ThermalElement` base class, so it is more of a contract that exists between various elements.
- Surface: In the first screen, the terms "surface" and "horizontal surface" come up a lot because any beaker or block
that is not being moved by the user will fall to and then rest on a surface.  The bench is a surface, the burners have
surfaces, and the blocks and beakers all have surfaces, and this is what allows them to be stacked upon one another.

## General Information

**Memory Management:** For the most part, object instances (model and view) persist for the lifetime of the sim. In
these cases, there is no need to call `unlink`, `removeListener`, `dispose`, etc. In cases where objects are dynamically 
allocated and deallocated, such as EnergyChunks and ElementFollowers, those memory management functions do exist.
 
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

When the "Energy Symbols" checkbox is checked, the energy symbols become visible.  These are meant to give the user a
much clearer means of seeing energy moving around.  The number of energy chunks in any given element is a function of
its energy content, which in turn is a function of its temperature and specific heat.  When the simulated energy level
(the one that is measured in joules) in an element gets out of balance with the number of energy chunks it contains, the
model tries to transfer an energy chunk in or out of the unbalanced element.  This code gets a bit tricky because there
is often a direction that we want the energy chunks to go.  For instance, if a model element is on the burner and the
burner is heating, incoming energy chunks should come from there and not from, say, the air.  There is also handling for
a lot of difficult situations, such as switching and burner quickly back and forth between heating and cooling. Note
that the air is part of the model, and energy chunks can go into the air from hot elements, or come out of the air for
cool ones.

The thermal model elements generally have a set of "energy chunk slices" within them that act as a shape in which the
energy chunks can be stored and distributed.  These are used as a way to distribute the energy chunks evenly throughout
the object and to maintain some z-order information that is used when positioning the energy chunks in the view to make
the distribution appear more three-dimensional.

The burners are modeled as an energy containing model element, such as a block of iron, but one that can increase or
decrease its energy content based on the state of the burner. Also, burners generate or absorb energy chunks as needed
by the other energy containers when in the appropriate state (i.e. heating or cooling).  Unlike the other energy
containers, they don't calculate whether they have excess or insufficient energy chunks.

There is a static object called the `energyChunkDistributor` that (as the name suggests) is used to distribute the
energy chunks within a thermal model element.  It uses a damped repulsive spring model to make the energy chunks push
away from each other and from the walls of the energy chunk slice in which they are contained.  This algorithm is
computationally expensive, so a fair amount of work has gone into making it reasonably efficient, such as reusing
vectors instead of reallocating and tweaking the repulsion and damping parameters such that the energy chunks spread out
quickly without oscillating.

The simulation user is able to move the blocks and beakers around and stack them, or put blocks inside of beakers, in
order to experiment with how the energy moves between the model elements in these situations.  The elements have a 3D
projection in the view, but they are modeled in 2D.  The code that governs where the various elements can and can't be
dragged is fairly involved, so please study it carefully before making any major changes.  The convention for the
position of the model elements is that the position value represents the horizontal center and the vertical bottom of
the non-projected (i.e. 2D) element. This approach was used because it makes it easier to detect when a model object is
sitting on a surface.

Gravitational acceleration is simulated to make things fall to a surface when released in open space.

## Systems Screen

In the "Systems" screen, the idea is to enable the user to learn about how energy can flow through a system, being
converted between various forms and performing certain actions.  For instance, falling water can turn a generator wheel
which produces electrical energy that in turn heats water in a beaker.  This screen is designed with three columns with
an energy source on the left, a converter in the middle, and a user on the right.  (Obviously, in real life, the energy
sources and users are both really energy converters due to conservation of energy, but you get the idea, and this is the
terminology used in the sim.)  The user can select different source-converter-user configurations, some of which enable
energy to move all the way through the system and some that don't (e.g. the falling water doesn't produce energy in the
solar panel).

Each of the system elements that can be interconnected are subclasses of `EnergySystemElement`, and there are subclasses
for `EnergySource`, `EnergyConverter`, and `EnergyUser`, which are further subclassed into the specific elements, such
as `SolarPanel`.  Each of these track the amount of energy being produced, converted, or used both in terms of a
continuous numerical quantity in joules and in terms of energy chunks.  The latter is much trickier.  At each model
step, energy and possibly energy chunks are transferred between the various active elements.

Energy chunks move through the system and occasionally get converted as they go.  Their motion in controlled by
instances of `EnergyChunkPathMover`, which are essentially a series of points that the energy chunks travel to in
sequence as they flow through the system.

One of the most challenging parts of the implementation of this screen was adding the ability to switch between
having the energy chunks visible and invisible.  The reason this is tricky is because if the energy chunks are
invisible, energy should flow through the system pretty much instantly, since that's how we experience it.  For
instance, in a faucet-generator-lightbulb configuration, the light bulb should start glowing as soon as the wheel starts
turning.  However, if the energy chunks are visible, the light bulb shouldn't start glowing until the energy chunks have
propagated all the way to the filament, which and take several seconds.  But what if the user starts with the energy
chunks off, then turns them on?  In that case, the code needs to pre-populate all of the system elements with energy
chunks already fully distributed through them.  For that reason, there is a fair bit of code that is dedicated to pre-
loading the energy chunks, and every system element has a `preloadEnergyChunks` method.

## PhET-iO

Support for PhET-iO was added to the sim over the course of 2020.  Parts of this effort were straightforward, such as
attributes like the positions and temperatures of blocks.  As with much of the rest of the sim, the challenging parts
were mostly related to the energy chunks.  Initially we tried not instrumenting each individual energy chunk, but that
eventually proved problematic, and it was decided to use PhET-iO groups (`PhetioGroup`) to allow energy chunks to comme
and go and have that information be conveyed in the PhET-iO state data.  Along with the energy chunks, the types that
move the energy chunks around also had to be instrumented using PhET-iO groups, such as `EnergyChunkPathMover` and
`EnergyChunkWanderController`.
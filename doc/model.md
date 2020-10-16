# Energy Forms and Changes - Model Description

This document contains a high-level description of the model used in PhET's _Energy Forms and Changes_ simulation.
This simulation portrays the flow and transformation of energy.  The first screen is primarily about heat transfer,
and the second is about how energy moves through and is transformed in an energy system.

## Intro Screen

On the first screen, heat can be added to or removed from the blocks and beakers.  These can then be stacked on top of
one another, or blocks can be put inside beakers, so that heat energy can be transferred between them.  This heat
transfer can be measured by using the thermometers, and/or it can be seen visually by turning on "Energy Symbols.

The heat transfer equation is used to calculate the amount of heat transferred per unit time.  This equation is
(essentially):

```
dQ/dt = -kAT
```

where `Q` is the amount of energy transferred, `k` is the heat transfer constant, `A` is the area of contact, `T` is
the temperature difference, and `t` is time.  This equation is evaluated at a nominal rate of 60 times per second (which
is the animation frame rate of a web browser) to determine the amount of energy that is transferred between all objects
that are in contact with another.  Internally, the amount of energy in each object is calculated and maintained in
joules, though this is never visible to the user.

Each energy symbol represents a fixed quantity of energy.  As an object changes temperature, the amount of energy it
contains can get out of balance with the number of energy symbols, at which point it will seek to transfer an energy
symbol in or out in an exchange with some object with which it is in contact.

Air is included in the model, and objects that are hotter than room temperature will slowly lose heat to the air, and
objects that are below room temperature will slowly gain energy from the air.

Realistic values have been used for specific heat, density, and heat transfer rate for most items, but in some cases
non-actual values were used to make the main concepts more accessible.  One example is that the rate of heat exchange
with air is much higher than in the real world so that items don't take forever to cool off or warm up to room
temperature.

All of the energy depicted on the first screen is in the form of heat.

## Systems Screen

The system screen allows users to hook up various configurations of elements that produce, convert, and consume energy.
Energy is portrayed as light, heat, mechanical energy, and electricity.  Within the model, energy is transferred between
system elements as a numerical quantity representing joules.  Energy symbols are made to move through the system, and
each one represents a fixed quantity of energy, so the model attempts to make the number of energy symbols correspond to
the numerical energy being transferred.

Observant users may notice that the behavior is slightly different on this screen when energy symbols are visible versus
when they are not.  Specifically, energy takes longer to move through the system when the energy symbols are visible.
This was an intentional pedagogical choice so that users could better grasp the concept of how energy flows from element
to element and is converted from one form to another along the way.  However, this can get a bit tricky when turning the
symbols on and off.  In order to make the sim behave reasonably when switching energy symbol visibility on and off, the
model will internally propagate energy symbols through the system in a way that matches the numerically simulated energy
any time the energy symbol visibility transitions from off to on.    

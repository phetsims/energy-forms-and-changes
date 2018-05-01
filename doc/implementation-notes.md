
TODO: The contents of this file was copied over from the Java project in late
April 2018 and should be updated for the HTML5 version before publication.

This simulation was originally written in Java, and was later ported to HTML5.
As a result, some of the code may appear more "Java-esque" than if the sim had
been originally written in HTML5.  Also, the port was done by a number of
different contributors.  Every effort was made to keep the style reasonably
consistent, but some variation is inevitable in such situations.
  
Convention: Getters, Setters, and Public Member Variables

Property types (e.g. Property< Double > position) are public.  Member variables
that are final and also public.  All other attributes of a class are private
and are accessed via accessor methods.

A convention used in this sim which is a bit unusual is that the position of a
2D model object is the center bottom of the objects shape, i.e. the center of
the shape in the x direction but the bottom of the shape in the Y direction.
This was done to make it easier to detect when a model object is sitting on a
surface.

Screen 1

Acceleration is used to make things fall to give it a more natural look.

Terms: A "resting surface" is a flat surface upon which other objects in the
model can rest.

The burners are modeled as an energy containing model element, such as a block
of iron, but one that can increase or decrease its energy content based on the
position of the burner.

Also, burners generate or absorb energy chunks as needed by the other energy
containers when in the appropriate state (i.e. heating or cooling).  Unlike
the other energy containers, they don't calculate whether they have excess or
a deficit of energy chunks.

Screen 2

The producers, converters, and consumers of energy are collectively referred to
as "energy systems".

All energy systems produce, convert, and consume energy at the same max rate,
just to keep things consistent.  This is obviously much different from the
real world (e.g. the sun doesn't really produce the same amount of energy as a
tea pot).



---
layout: post
title:  "Version 0.0.14 released"
date:   2016-02-17 00:00:00
categories: 0.0.14
---
Version bump due to meteor package generation, release notes bellow.


Changes:

> * native map: basic pointer events support, the map should work fine on ie10+
> * native map: adding grab and grabbing cursors on the map for dragging effects
> * native map: when the left button is not clicked dont drag the map.
> * native map: remove editable markers when a vector is moving, and put then back only when dragging is done, this solves slow dragging on old ie (bugfix)
> * native map: editable vector markers should respond on the first touch
> * native map: vectors should not move around on map resize with svg backend
> * native map: vectors should be properly draggable after orientationchange event 
> * native map: Mouse scroll should work fine with a small map 
> * native map: if the zoom ui is to big for the map viewport, the zoom handle will be hidden and only +/- buttons will be displayed
> * native map: edit marker on vectors objects will resize the vector even if the marker is dragged outside of the map bounds
 
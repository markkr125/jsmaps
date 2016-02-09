# Changelog

## 0.0.12 - ?
 * native map: basic pointer events support, the map should work fine on ie10+
 * native map: adding grab and grabbing cursors on the map for dragging effects
 * native map: when the left button is not clicked dont drag the map.
 * native map: editable vector markers should respond on the first touch (bugfix)

## 0.0.11 - 2016-02-05
 * native map: circle is editable 
 * native map: many bug fixes on touch based systems
 * native map: zoom and layers ui now work touch based systems
 * native map: vectors are editable and draggable on touch based systems
 * native map: adding an opacity transition for images on movement
 * native map: map click events to touch events
 * bing map: fixing a bug on editable polygon under old ie
 * general api: editable marker that are used on vectors looks a bit better now
 * bing and here maps: circles are editable and draggable

## 0.0.10 - 2016-01-19
 * Only to update the package on nuget

## 0.0.9 - 2016-01-19
Native map changes:
 * will always check for css 3d
 * if no css 3d then check for css 2d
 * if no css 2d, then just show/hide the layer div 
 * using css transition for fadeout effect, javascript fadeout is still used when css transition is not supported
 * use a proper svg path to generate a circle.
 * vml backend now makes a real circle

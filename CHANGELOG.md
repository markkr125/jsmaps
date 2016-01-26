# Changelog

## 0.0.11 - ?
 * native map: circle is editable 
 * bing map: fixing a bug on editable polygon under old ie
 * general api: editable marker that are used on vectors look a bit better now
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

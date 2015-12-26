---
layout: post
title:  "Draggable and editable vectors on Bing and Here maps backends"
date:   2015-12-26 02:49:36
categories: bing here update
---
Recent version of the api (v0.0.5) has generic code for making vectors draggable and editable, and now it is used by JsMaps api on Here & Bing maps.
This currently works only on polygons and polylines, circles are not affected by this change.

Check out the <a href="{{ "/examples/" | prepend: site.baseurl }}" target="_blank">Examples</a> to see these new changes in action.

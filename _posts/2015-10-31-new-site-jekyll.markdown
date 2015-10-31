---
layout: post
title:  "New Jekyll Based Site"
date:   2015-10-31 17:28:23
categories: jekyll update
---
First version of the [Jekyll] site, and also introducing the new native maps backed.

The native map is based on the code from the project [khtml.maplib][khtml-maplib], and it only requires a map tile server using 256x256 map tiles.

Example on how to generate the native map using [OpenStreetMap] tiles:

{% highlight javascript %}
jsMaps.loader(function (){
        var tiles = new jsMaps.Native.Tiles();
        tiles.addTileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",['a','b','c'],'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>.','OpenStreetMap');

        var map = jsMaps.api.init(
                '#map',
                'native',
                {
                    center: {
                        latitude: 32.078930,
                        longitude: 34.773241
                    },
                    zoom: 14,
                    mouse_scroll: true,
                    zoom_control: true,
                    map_type: true
                },tiles
        );
    });
{% endhighlight %}

Check out the <a href="{{ "/examples/" | prepend: site.baseurl }}" target="_blank">Examples</a> what this backend is capable of.

[khtml-maplib]:    https://github.com/robotnic/khtml.maplib
[OpenStreetMap]:   https://www.openstreetmap.org/
[Jekyll]:   http://jekyllrb.com/


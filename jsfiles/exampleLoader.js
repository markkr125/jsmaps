function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jQuery.each(xml.split('\r\n'), function(index, node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var ExampleLoader = {
    jsFiles: function (supplier) {
        var files = {
            'native': ['<link type="text/css" rel="stylesheet" href="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native.css" />',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract-helper.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native-ui.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native-helper.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native-marker.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native-infoWindow.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/native/core.native-vector.js" type="text/javascript"></script>'
            ],
            'google': [
                '<script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract-helper.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/google/core.google.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/google/core.google-geocoder.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/google/core.google-staticmap.js" type="text/javascript"></script>'
            ],
            'yandex': [
                '<script src="http://api-maps.yandex.ru/2.1/?lang=en_US" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract-helper.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/yandex/core.yandex.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/yandex/core.yandex-geocoder.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/yandex/core.yandex-staticmap.js" type="text/javascript"></script>'
            ],
            'bing': [
                '<script type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract-helper.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/bing/core.bing.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/bing/core.bing-geocoder.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/bing/core.bing-staticmap.js" type="text/javascript"></script>'
            ],
            'here': [
                '<link rel="stylesheet" type="text/css" href="https://js.api.here.com/v3/3.0/mapsjs-ui.css" />',
                '<script type="text/javascript" charset="UTF-8" src="https://js.api.here.com/v3/3.0/mapsjs-core.js"></script>',
                '<script type="text/javascript" charset="UTF-8" src="https://js.api.here.com/v3/3.0/mapsjs-service.js"></script>',
                '<script type="text/javascript" charset="UTF-8" src="https://js.api.here.com/v3/3.0/mapsjs-ui.js"></script>',
                '<script type="text/javascript" charset="UTF-8" src="https://js.api.here.com/v3/3.0/mapsjs-mapevents.js"></script>',
                '<script src="http://js.api.here.com/v3/3.0/mapsjs-pano.js" type="text/javascript" charset="utf-8"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.abstract-helper.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/core.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/here/core.here.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/here/core.here-geocoder.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/here/core.here-staticmap.js" type="text/javascript"></script>',
                '<script src="https://cdn.rawgit.com/markkr125/jsmaps/'+LIBRARY_VERSION+'/library/here/core.here-vector.js" type="text/javascript"></script>'
            ]
        };

        if (typeof files[supplier] == 'undefined') throw 'unknown supplier '+supplier;
        return files[supplier];
    },

    exampleLoad: function (exampleCode,supplier) {
        exampleCode = decodeURIComponent(exampleCode);
        var staticFiles = this.jsFiles(supplier);

        var html = '<?xml version="1.0" encoding="UTF-8"?>'+
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
            '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><title>Example</title><style>html, body, #map {height: 100%; margin: 0; padding: 0;}</style>';

        for (var i in staticFiles) {
            if (staticFiles.hasOwnProperty(i) == false) continue;
            html += staticFiles[i];
        }


        var toReplace = '';
        var toReplace2 = '{}';

        if (supplier == 'native') {
            toReplace = 'var tiles = new jsMaps.Native.Tiles();'+"\n"+
            'tiles.addTileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",[\'a\',\'b\',\'c\'],\'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>.\',\'OpenStreetMap\');'+"\n"+
            'tiles.addTileLayer("http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png",[\'otile1\',\'otile2\',\'otile3\',\'otile4\'],\'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="https://developer.mapquest.com/content/osm/mq_logo.png">\',\'Map Quest\');'+"\n"+
            'tiles.addTileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg",[\'oatile1\',\'oatile2\',\'oatile3\',\'oatile4\'],\'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="https://developer.mapquest.com/content/osm/mq_logo.png">\',\'Map Quest Satellite\',19);'+"\n";

            toReplace2 = 'tiles';
        } else if (supplier == 'bing') {
            toReplace = 'jsMaps.config.bing.key = \'your-bing-key\';';
        } else if (supplier == 'here') {
            toReplace = 'jsMaps.config.here.app_id = \'here-app-id\';'+"\n"+
            'jsMaps.config.here.app_code = \'here-app-code\';'+"\n";
        }

        html += '</head><body>'+exampleCode+'</body></html>';

        html = html.replace('// PlaceHolder',toReplace);
        html = html.replace('%supplier%',supplier);
        html = html.replace("{'placeholder':1}",toReplace2);

        var writeHtml = html;
        writeHtml = writeHtml.replace('your-bing-key','AvZb3DV_bZiBacG2jm6QNHnz58WwT6X5KfCRKd0a-dnDqihgkEXaowWTasMyN6Io');
        writeHtml = writeHtml.replace('here-app-id','ycU7pzqrEYaipnlczp6c');
        writeHtml = writeHtml.replace('here-app-code','PC2xll3XVkKXM0zX324KMQ');

        var doc = document.getElementById('example-frame').contentWindow.document;
        doc.open();
        doc.write(writeHtml);
        doc.close();

        var $fullHtml = $('#fullHtml');

        $fullHtml.find('pre code').text(formatXml(html));

        var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

        var match;
        while (match = re.exec(html)) {
            if (match[1]!='') {
                $('#Javascript').find('code').html(htmlEntities($.trim(match[1])));
            }
        }

        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    },

    exampleButtons: function (exampleCode,allowedSuppliers) {
        var buttons = '';
        var suppliers = ['native','google', 'yandex', 'bing', 'here'];

        if (typeof allowedSuppliers != 'undefined' && allowedSuppliers != 'ALL') {
            suppliers = allowedSuppliers.split(' ');
        }

        for (var x in suppliers) {
            if (suppliers.hasOwnProperty(x) == false) continue;
            var active = (x == 0) ? ' active': '';
            buttons += '<button type="button" class="btn btn-primary'+active+'" data-provider="'+suppliers[x]+'" aria-pressed="false" autocomplete="off">'+suppliers[x]+'</button>';
        }

        var btnGrp = $('#suppliers-btn-group');
        btnGrp.html(buttons);

        btnGrp.find('button').click(function () {
            btnGrp.find('button.active').removeClass('active');
            $(this).addClass('active');

            var supplier = $(this).data('provider');
            ExampleLoader.exampleLoad(exampleCode, supplier);
        });

        btnGrp.find('button').first().click();
    }
};
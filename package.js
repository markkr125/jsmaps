// package metadata file for Meteor.js

/* jshint strict:false */
/* global Package:true */

Package.describe({
    name: 'mark125:jsmaps',
    summary: 'A javascript map, and also with an abstraction layer for javascript mapping apis.',
    version: '0.0.14',
    git: 'https://github.com/markkr125/jsmaps.git',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0', 'METEOR@1.2']);

    var assets = [
        'library/core.js',
        'library/core.abstract-helper.js',
        'library/core.abstract.js',
        'library/bing/core.bing.js',
        'library/bing/core.bing-geocoder.js',
        'library/bing/core.bing-staticmap.js',
        'library/google/core.google.js',
        'library/google/core.google-geocoder.js',
        'library/google/core.google-staticmap.js',
        'library/here/core.here.js',
        'library/here/core.here-geocoder.js',
        'library/here/core.here-staticmap.js',
        'library/here/core.here-vector.js',
        'library/native/core.native.css',
        'library/native/core.native.js',
        'library/native/core.native-helper.js',
        'library/native/core.native-infoWindow.js',
        'library/native/core.native-marker.js',
        'library/native/core.native-ui.js',
        'library/native/core.native-vector.js',
        'library/yandex/core.yandex.js',
        'library/yandex/core.yandex-geocoder.js',
        'library/yandex/core.yandex-staticmap.js'
    ];

    if (api.addAssets) {
        api.addAssets(assets, 'client');
    } else {
        api.addFiles(assets, 'client', { isAsset: true });
    }
});


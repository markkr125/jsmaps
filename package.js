// package metadata file for Meteor.js

/* jshint strict:false */
/* global Package:true */

Package.describe({
    name: 'mark125:jsmaps',
    summary: 'Full featured interactive slippy map, and also an abstraction layer for popular javascript mapping apis. Supported Google Maps, Bing Maps, Yandex Maps and Here maps. ',
    version: '0.0.12',
    git: 'https://github.com/markkr125/jsmaps.git',
    documentation: 'https://github.com/markkr125/jsmaps/blob/master/README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@1.0');
});
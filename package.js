// package metadata file for Meteor.js

/* jshint strict:false */
/* global Package:true */

Package.describe({
    name: 'mark125:jsmaps',
    summary: 'A javascript map, and also with an abstraction layer for javascript mapping apis.',
    version: '0.0.12',
    git: 'https://github.com/markkr125/jsmaps.git',
    documentation: 'https://github.com/markkr125/jsmaps/blob/master/README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@1.0');
});


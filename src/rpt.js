/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/10
 * Time: 下午 5:05
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs-extra'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    xmldom = require('xmldom'),
    DOMParser = xmldom.DOMParser,
    XMLSerializer = xmldom.XMLSerializer,
    ProjectSkeleton = require('./ProjectSkeleton.js'),
    ValueObjects = require('./ValueObject.js'),
    nodeFileParser = require('./Node.js'),
    CodeUtils = require('./CodeUtils.js'),
    args = process.argv.slice(2),
    ejs = require('ejs');

var Rpt = {} ;



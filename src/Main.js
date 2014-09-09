/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/8
 * Time: 下午 5:27
 * To change this template use File | Settings | File Templates.
 */
var cache = require('./fileCache.js'),
    func = require('./func.js'),
    select = require('./select.js'),
    dao = require('./dao.js'),
    trigger = require('./trigger.js'),
    args = process.argv.slice(2) ,
    CodeUtils = require('./CodeUtils.js'),
    skeleton = require('./ProjectSkeleton.js'),
    sysId = args[0];
cache.loadCache();

var funcs = func.genMD(sysId, cache);
var selects = select.genMD(sysId, cache) ;
var triggers = trigger.genMD(sysId, cache) ;
var daos = dao.genMD(sysId, cache) ;
cache.restore();

var context = {
    sysId:sysId,
    funcs:funcs,
    selects:selects,
    triggers:triggers,
    daos:daos
};

CodeUtils.genStuff('sysIndex.md', context, skeleton.getMdDir(sysId, 'index.md') ) ;

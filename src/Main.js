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
    sysId = args[0],
    overwrite = args[1];

cache.loadCache();

function buildDaotool(daos){
    return {
        db:daos,
        findTableByVO:function(voClz) {
            var len = this.db.length ;
            for(var i=0;i<len;i++){
                if (this.db[i].entity.replace(/VO$/,'')===voClz.replace(/VO$/,'')){
                    return this.db[i].table ;
                }
            }
            return voClz ;
        }
    }
}
function genMD() {
    var daos = dao.genMD(sysId, cache) ;
    process.daotool = buildDaotool(daos) ;

    var funcs = func.genMD(sysId, cache);
    func.genJava(sysId) ;
    func.genGul(sysId) ;

    var selects = select.genMD(sysId, cache) ;
    var triggers = trigger.genMD(sysId, cache) ;

    var context = {
        sysId:sysId,
        funcs:funcs,
        selects:selects,
        triggers:triggers,
        daos:daos
    };

    CodeUtils.genStuff('sysIndex.md', context, skeleton.getMdDir(sysId, 'index.md') ) ;
}

if (overwrite==='overwrite') {
    process.overwriteJava = true ;
}
genMD() ;


cache.restore();

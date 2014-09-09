/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/8
 * Time: 下午 9:46
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs-extra') ;
var db = null ;
function loadModifiedRecord() {
    if (!fs.existsSync('./.cache')) {
        return {} ;
    }
    return fs.readJsonSync('./.cache') ;
}


module.exports = {
    loadCache:function(){
        db = loadModifiedRecord() ;
    },
    isModified:function(path){
        return true ;

        var modified = fs.statSync(path) ;
        if (db[path]!= modified.mtime.toString()) {
            db[path] = modified.mtime.toString() ;
            return true ;
        }
        return false ;
    },
    restore:function(){
        fs.outputJson('./.cache', db, function(){
        });
    }
}

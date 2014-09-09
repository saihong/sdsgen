/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 下午 1:32
 * To change this template use File | Settings | File Templates.
 */
var rootPath = '..',
    mdRootPath = rootPath+'/html';

function toPath(pathEles, fileName) {
    if (fileName) {
        pathEles.push(fileName) ;
    }
    return pathEles.join('/');
}

module.exports = {
    getSdsDir: function (sysId) {
        return toPath( [rootPath, sysId, 'sds'] ) ;
    },
    getSpecRootDir: function (sysId) {
        return toPath( [rootPath, sysId, 'sds', 'spec'] ) ;
    },
    getCommonDir:function(sysId) {
        return toPath([this.getSdsDir(sysId), 'common']) ;
    },
    getTriggerDir: function (sysId, fileName) {
        return  toPath([this.getCommonDir(sysId), 'trigger'], fileName) ;
    },
    getSelectDir: function (sysId, fileName) {
        return toPath( [this.getCommonDir(sysId), 'select'], fileName );
    },
    getApiDir: function (sysId) {
        return toPath( [this.getCommonDir(sysId), 'api'] );
    },
    getSpecDir: function (sysId, specId) {
        return toPath( [this.getSpecRootDir(sysId), specId] );
    },
    getSpecImgDir:function(specId) {
        return toPath( [this.getSpecDir(specId),'img'])
    },
    getSpecGulDir:function(specId,gulFile) {
        return toPath( [this.getSpecDir(specId),'gul'], gulFile)
    },
    getSpecTestDir:function(specId) {
        return toPath( [this.getSpecDir(specId),'test'])
    },
    getSpecListPath:function(sysId) {
        return toPath( [this.getSdsDir(sysId),sysId+'-spec.txt'] ) ;
    },
    getGulDir:function(sysId, gulFile) {
        return toPath([rootPath, sysId, 'gul'], gulFile) ;
    },
    getJavaSrcDir:function(sysId) {
        return toPath([rootPath, sysId, 'src']) ;
    },
    getMdDir:function(sysId, file) {
        return toPath([mdRootPath, sysId, 'sds'], file) ;
    },
    getMdSpecRootDir:function(sysId) {
        return toPath([this.getMdDir(sysId), 'spec']) ;
    },
    getMdSpecDir:function(sysId, spec) {
        return toPath([this.getMdSpecRootDir(sysId), spec]) ;
    },
    getMdCommonDir:function(sysId) {
        return toPath([this.getMdDir(sysId), 'common']) ;
    },
    getMdTriggerFilePath:function(sysId,triggerId) {
        return toPath([this.getMdCommonDir(sysId), 'trigger'], triggerId+'.md') ;
    },
    getMdSelectDir:function(sysId) {
        return toPath([this.getMdCommonDir(sysId), 'select']) ;
    },
    getMdTableDir:function(sysId, fileName) {
        return toPath([this.getMdCommonDir(sysId), 'table'], fileName) ;
    },
    getSysDaoDir:function(sysId) {
        return toPath([rootPath, sysId, 'dao']) ;
    }
}


/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 上午 8:11
 * To change this template use File | Settings | File Templates.
 */
var CodeUtils = require('./CodeUtils.js'),
    mkdirp = require('mkdirp'),
    args = process.argv.slice(2),
    ProjectSkeleton = require('./ProjectSkeleton.js'),
    ejs = require('ejs'),
    encoding = args[1],
    fs = require('fs-extra') ;

var sysId = args[0] ;

var Table= function() {
    this.project='' ;
    this.table='' ;
    this.clz='' ;
    this.okg='' ;
    this.entity='' ;
    this.importPkg='' ;
    this.descript='' ;
    this.columns=[] ;
    this.getSysId = function(){
        return this.table.substr(5,2) ;
    }
    this.processEntity=function() {
        var datas = this.entity.split(/\s/) ;
        this.entity = datas[0].trim() ;
        if(datas.length>1){
            this.descript = datas[1].trim();
        }
    }
//    this.set=function(propertyName, propertyValue) {
//        this[propertyName]=propertyValue;
//    }
} ;

var Column= function() {
    this.name='' ;
    this.datatype='' ;
    this.key=false ;
    this.descript='' ;
    this.width='' ;
    this.format='' ;
    this.defValue='' ;
    this.isKey=function() {
        return this.key?'y':'' ;
    }
} ;

function convertKey(key) {
    var db = {
        'class':'clz',
        'import':'importPkg',
        'package':'pkg'
    } ;
    return db[key]||key ;
}

function readDao(filePath, encoding) {
    var input = fs.readFileSync(filePath).toString() ;
    var metaBlock = input.match(/#Meta([^]+)#Field/)[1],
        fieldBlock = input.match(/#name[^]+/)[0],
        metas = metaBlock.split(/\n/),
        fields = fieldBlock.split(/\n/) ;
    var table = new Table() ;
    metas.forEach(function(meta){
        if(/\-+/.test(meta)||!meta.trim()) {
            return ;
        }
        var key = meta.trim().replace(/:.*$/,'').trim() ;
        var value = meta.trim().replace(/^.*:/,'').trim() ;
        table[ convertKey(key) ] = value||'' ;
    });
    table.processEntity();


    fields.forEach(function(field){
        if(/\-+|^#/.test(field)||!field.trim()) {
            return ;
        }
        var column = new Column() ;
        var attrs = field.split(/\s+/) ;
        column.name = attrs[0] ;
        column.datatype = attrs[1] ;
        column.key = attrs[2]==='y' ;
        column.descript = attrs[3] ;
        column.width = attrs[4] ;
        column.format = attrs[5] ;
        column.defValue = attrs[6] ;
        table.columns.push(column) ;
    });
    return table ;
}

module.exports = {
    genMD:function(sysId) {
        var daoDir = ProjectSkeleton.getSysDaoDir(sysId) ;
        var files = fs.readdirSync(daoDir) ;
        var tables=[] ;
        files.forEach(function(dao){
            if (/\.dao$/.test(dao)) {
                var vo = readDao(daoDir+'/'+dao) ;
                vo.sysId=sysId ;
                tables.push(vo);
                CodeUtils.genStuff('dao.md', vo, ProjectSkeleton.getMdTableDir(sysId,vo.table+'.md')) ;
            }
        });
        CodeUtils.genStuff('daolist.md', {
            tables:tables,
            sysId:sysId
        }, ProjectSkeleton.getMdTableDir(sysId,'index.md')) ;
        return tables ;
    }
}

/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 上午 8:11
 * To change this template use File | Settings | File Templates.
 */
var CodeUtils = require('./CodeUtils.js'),
    Sql = require('./Sql.js'),
    mkdirp = require('mkdirp'),
    args = process.argv.slice(2),
    ProjectSkeleton = require('./ProjectSkeleton.js'),
    ejs = require('ejs'),
    fs = require('fs-extra'),
    nodeFileParser = require('./Node.js'),
    sysId = args[0];

//var triggerSdsFileName = args[0].replace(/\.txt$/,''),
//    sysId = triggerSdsFileName.replace(/\..+$/, '');


var Trigger = {
};




function getFullClz(clz) {
    return 'com.icsc.' + sysId + '.web.trigger.' + clz;
}

Trigger.VO = function (node) {
    var line = node.text.trim();
    this.triggerId = line.replace(/\s.+$/, '');
    this.sysId = this.triggerId.replace(/\.\w+$/, '');
    this.triggerName = this.triggerId.replace(/^\w+\./, '');
    this.triggerDescript = line.replace(/^.+\s/, '');
    this.spec = CodeUtils.parseElement(node, "spec", function (child) {
        return new CodeUtils.getStatement(child, true);
    });
    this.triggerClz = this.sysId + 'jc' + CodeUtils.capitalize(this.triggerName);
    this.fullClzName = getFullClz(this.triggerClz);
    this.pkgDir = this.fullClzName.replace(/\.[^\.]+$/, '').replace(/\./g, '/');
    this.sql = CodeUtils.parseElement(node, 'sql', function (child) {
        return new Sql(child);
    });
    this.sqlSpec = CodeUtils.parseElement(node,'sql', function(child){
       return CodeUtils.getStatement(child, true) ;
    });

    this.afterQuery = CodeUtils.parseElement(node, 'onAfterQuery', function (child) {
        return CodeUtils.getStatement(child, true) ;
    });

};


function getTriggerSDSPath(sysId, triggerId) {
    return ProjectSkeleton.getTriggerDir(sysId, triggerId);
}

function genTrigger(triggerSdsPath) {
    var triggerNode = nodeFileParser(triggerSdsPath);
    var vo = new Trigger.VO(triggerNode.firstChild());

    var triggerTmpl = fs.readFileSync('template/trigger.java', 'utf8');
    var output = ejs.render(triggerTmpl, vo);
    var javaDir = ProjectSkeleton.getJavaSrcDir(sysId) + '/' + vo.pkgDir;

    var code = CodeUtils.genStuff('trigger.java', vo, javaDir + '/' + vo.triggerClz + '.java') ;
    vo.code = code ;
    CodeUtils.genStuff('trigger.md', vo, ProjectSkeleton.getMdTriggerFilePath(sysId, vo.triggerId)) ;
    return vo;
}

module.exports = {
    genMD:function(sysId,cache) {
        var triggerDir = ProjectSkeleton.getTriggerDir(sysId);
        var files = fs.readdirSync(triggerDir),
            triggers = [];
        files.forEach(function(file){
            if (/\.txt$/.test(file)) {
                var triggerSdsPath = triggerDir + '/' + file;
                if (cache.isModified(triggerSdsPath)) {
                    var vo = genTrigger(triggerSdsPath) ;
                    triggers.push(vo) ;
                }
            }
        });

        CodeUtils.genStuff('triggerList.md', {sysId:sysId,triggers:triggers},
            ProjectSkeleton.getMdTriggerFilePath(sysId, 'index')) ;
        return triggers ;
    }
}

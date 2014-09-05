/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 上午 8:11
 * To change this template use File | Settings | File Templates.
 */
var CodeUtils = require('./CodeUtils.js'),
    args = process.argv.slice(2),
    ProjectSkeleton = require('./ProjectSkeleton.js'),
    ejs = require('ejs'),
    nodeFileParser = require('./Node.js');

var triggerId = args[0],
    sysId = triggerId.replace(/\..+$/, '');

var Trigger = {
} ;


Trigger.VO = function (node) {
    var ans = CodeUtils.exec(/([\w{2}\.\w+])\s+(.+)/, node.text);
    this.triggerId = ans[1];
    this.sysId = this.triggerId.replace(/\..+$/, '');
    this.triggerName = this.triggerId.replace(/^.+\./, '');
    this.triggerDescript = ans[2];
    this.spec = CodeUtils.parseElement(node, "spec", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.triggerClz = this.triggerId + 'jc' + CodeUtils.capitalize(this.triggerName);
    this.fullClzName = getFullClz(this.triggerClz);
    this.pkgDir = this.fullClzName.replace(/\./g,'/');

    function getFullClz(clz) {
        return 'com.icsc.' + this.sysId + '.web.trigger.' + this.triggerClz;
    }
};

Trigger.Sql = function (node) {
    this.select = CodeUtils.parseElement(node, "select", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.from = CodeUtils.parseElement(node, "from", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.where = CodeUtils.parseElement(node, "where", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.orderby = CodeUtils.parseElement(node, "order by", function (child) {
        return new Trigger.SqlSegment(child);
    });
}

Trigger.SqlSegment = function (node) {
    this.statement = node.text.trim();
}

function getTriggerSDSPath(sysId, triggerId) {
    return ProjectSkeleton.getTriggerDir(sysId, triggerId + '.txt');
}

function genTrigger() {
    var triggerNode = nodeFileParser(getTriggerSDSPath(sysId, triggerId));
    var vo = new Trigger.VO(triggerNode) ;

    var triggerTmpl = fs.readFileSync('template/trigger.java', 'utf8');
    var rslt = ejs.render(triggerTmpl, vo) ;
    var javaDir = ProjectSkeleton.getJavaSrcDir(sysId)+'/'+vo.pkgDir ;
    mkdirp(javaDir, function(err) {
        if (err) console.error(err) ;
        else {
            console.log(javaDir + ' is created!');
            fs.writeFile(javaDir + '/' + vo.fullClzName + '.java', output, 'utf8');
        }
    });
}




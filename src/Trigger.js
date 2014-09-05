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
    fs = require('fs-extra'),
    nodeFileParser = require('./Node.js');

var triggerSdsFileName = args[0],
    sysId = triggerSdsFileName.replace(/\..+$/, '');

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
    console.log('triggerName: %s', this.triggerName);
    this.triggerDescript = line.replace(/^.+\s/, '');
    this.spec = CodeUtils.parseElement(node, "spec", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.triggerClz = this.sysId + 'jc' + CodeUtils.capitalize(this.triggerName);
    this.fullClzName = getFullClz(this.triggerClz);
    this.pkgDir = this.fullClzName.replace(/\.[^\.]+$/, '').replace(/\./g, '/');
    this.sql = CodeUtils.parseElement(node, 'sql', function (child) {
        return new Trigger.Sql(child);
    });

    this.afterQuery = CodeUtils.parseElement(node, 'onAfterQuery', function (child) {
        return CodeUtils.getStatement(child) ;
    });

};

Trigger.Sql = function (node) {
    this.select = CodeUtils.parseElement(node, "select", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.from = CodeUtils.parseElement(node, "from", function (child) {
        return new Trigger.SqlSegment(child);
    });
    this.where = CodeUtils.parseElement(node, "where", function (child) {
        return new Trigger.Where(child);
    });
    this.orderby = CodeUtils.parseElement(node, "order by", function (child) {
        return new Trigger.SqlSegment(child);
    });
}

Trigger.SqlSegment = function (node) {
    this.statements = CodeUtils.getStatement(node);
    if (this.statements.length > 0) {
        this.text = this.statements[0].trim();
    }
}
Trigger.Where = function (node) {
    var txt = node.firstChild().text.trim(); // node.text is 'where'
    this.optionConds=[] ;
    this.fixedConds=[] ;
    var params = txt.match(/\$([\w_]+)/g) ;
    if (params) {
        this.qryParams = params.map(function (txt) {
            return txt.substr(1);
        });
    } else {
        console.error('[%s] has no param!', txt) ;
    }
    params = txt.match(/\[.+?\]/g) ;
    if (params) {
        this.optionConds = params.map(function (txt) {
            var state = txt.replace(/[\[\]]/g, '') ;
            return state ;
        });
    }
    params = txt.replace(/\[.+?\]/g, '') ;
    if (params) {
        this.fixedConds = params.replace(/\$([\w_]+)/g, function (m, p) {
            return '"+'+p+'+"' ;
        });
    }
}

function getTriggerSDSPath(sysId, triggerId) {
    return ProjectSkeleton.getTriggerDir(sysId, triggerId);
}

function genTrigger(triggerSdsFileName) {
    var triggerNode = nodeFileParser(getTriggerSDSPath(sysId, triggerSdsFileName));
    var vo = new Trigger.VO(triggerNode.firstChild());

    var triggerTmpl = fs.readFileSync('template/trigger.java', 'utf8');
    var output = ejs.render(triggerTmpl, vo);
    var javaDir = ProjectSkeleton.getJavaSrcDir(sysId) + '/' + vo.pkgDir;
    mkdirp(javaDir, function (err) {
        if (err) console.error(err);
        else {
            var filePath = javaDir + '/' + vo.triggerClz + '.java';
            fs.writeFile(filePath, output, 'utf8', function () {
                console.log(filePath + ' is created!');
            });
        }
    });
}

genTrigger(triggerSdsFileName);

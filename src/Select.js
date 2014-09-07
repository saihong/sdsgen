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
    Sql = require('./Sql.js'),
    ejs = require('ejs'),
    fs = require('fs-extra'),
    nodeFileParser = require('./Node.js');

var sysId = args[0],
    overwrite = args[1];

var Select = {
};


function getFullClz(clz) {
    return 'com.icsc.' + sysId + '.select.' + clz;
}

Select.VO = function (node) {
    var line = node.text.trim();
    this.selectId = line.replace(/\s.+$/, '');
    this.sysId = this.selectId.replace(/\.\w+$/, '');
    this.selectName = this.selectId.replace(/^\w+\./, '');
    this.selectDescript = line.replace(/^.+\s/, '');
    this.spec = CodeUtils.parseElement(node, "spec", function (child) {
        return new CodeUtils.getStatement(child);
    });
    this.allSpecs = CodeUtils.parseElement(node, "spec", function (child) {
        return new CodeUtils.getStatement(node);
    });
    this.selectClz = this.sysId + 'jc' + CodeUtils.capitalize(this.selectName);
    this.fullClzName = getFullClz(this.selectClz);
    this.pkgDir = this.fullClzName.replace(/\.[^\.]+$/, '').replace(/\./g, '/');
    this.sql = CodeUtils.parseElement(node, 'sql', function (child) {
        return new Sql(child);
    });
    this.options = CodeUtils.parseElement(node, 'options', function (child) {
        return CodeUtils.getStatement(child).map(function (opt) {
            return {
                value: opt.replace(/:.+$/, '').trim(),
                text: opt.replace(/^.+:/, '').trim()
            };
        });
    });

};


function getSelectSdsPath(sysId, selectId) {
    return ProjectSkeleton.getSelectDir(sysId, selectId);
}

function genSelect(selectSdsFilePath) {
    var node = nodeFileParser(selectSdsFilePath);
    var vo = new Select.VO(node.firstChild());

    var javaDir = ProjectSkeleton.getJavaSrcDir(sysId) + '/' + vo.pkgDir,
        destFile = javaDir + '/' + vo.selectClz + '.java';
    vo.code = CodeUtils.genStuff('template/select.java', vo, destFile);
    return vo;
}

var selectDir = ProjectSkeleton.getSelectDir(sysId);
var files = fs.readdirSync(selectDir),
    selects = [];
files.forEach(function (file) {
    var path = selectDir + '/' + file;
    var select = genSelect(path);
    selects.push(select);
});

var selectMdDir = ProjectSkeleton.getMdSelectFilePath(sysId);
CodeUtils.genStuff('template/select.md', {sysId: sysId, selects: selects}, selectMdDir + '/' + sysId + '-select.md');


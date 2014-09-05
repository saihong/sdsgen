/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/4
 * Time: 上午 9:04
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs-extra'),
    ProjectSkeleton = require('./ProjectSkeleton.js'),
    mkdirp = require('mkdirp'),
    args = process.argv.slice(2),
    sysId = args[0],
    inputFile = sysId + '-spec.txt',
    sdsDir = ProjectSkeleton.getSdsDir(sysId),
    inputFilePath = ProjectSkeleton.getSpecListPath(sysId);

var specText = fs.readFileSync(inputFilePath, 'utf8');
var lines = specText.split(/\n/);

lines.forEach(function (line) {
    if (line.trim()) {
        var datas = line.split(/\t/),
            specId = datas[0],
            specName = datas[1],
            sdsDir = '../' + sysId + '/';
        buildDir(specId);
    }
});

myMkdir( ProjectSkeleton.getApiDir(sysId) );
myMkdir( ProjectSkeleton.getTriggerDir(sysId) );
myMkdir( ProjectSkeleton.getSelectDir(sysId) );

function buildDir(specId) {
    myMkdir(ProjectSkeleton.getSpecImgDir(specId));
    myMkdir(ProjectSkeleton.getSpecTestDir(specId));
    myMkdir(ProjectSkeleton.getSpecGulDir(specId));
}

function myMkdir(dir) {
    if (fs.existsSync(dir)) {
        return;
    }
    console.log('build dir:' + dir);
    mkdirp.sync(dir, function (err) {
        if (!err) {
            console.log('create ' + dir + ' success.');
        }
    })

}


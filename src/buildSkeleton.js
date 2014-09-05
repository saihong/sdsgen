/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/4
 * Time: 上午 9:04
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs-extra'),
    mkdirp = require('mkdirp'),
    args = process.argv.slice(2),
    sysId = args[0],
    inputFile = sysId+'-spec.txt',
    sysDir = '../'+sysId ,
    sdsDir = sysDir+'/sds',
    inputFilePath = sdsDir+'/'+inputFile ;

var specText = fs.readFileSync(inputFilePath, 'utf8');
var lines = specText.split(/\n/) ;

lines.forEach(function(line){
    if (line.trim()){
        var datas = line.split(/\t/),
            specId = datas[0],
            specName = datas[1],
            sdsDir = '../'+sysId+'/';
        buildDir(specId) ;
    }
});

myMkdir(sdsDir+'/Common/api');
myMkdir(sdsDir+'/Common/trigger');
myMkdir(sdsDir+'/Common/select');

function buildDir(specId) {

    var specDir = sdsDir+'/'+specId,
        imgDir = specDir+'/img',
        testDir = specDir+'/test',
        gulDir = specDir+'/gul' ;
    myMkdir(imgDir);
    myMkdir(testDir);
    myMkdir(gulDir);
}

function myMkdir(dir){
    if (fs.existsSync(dir)) {
        return ;
    }
    console.log('build dir:'+dir) ;
    mkdirp.sync(dir,function(err){
        if(!err){
            console.log('create '+dir+' success.');
        }
    })

}


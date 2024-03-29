// comment for git 
var fs = require('fs-extra'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    xmldom = require('xmldom'),
    DOMParser = xmldom.DOMParser,
    XMLSerializer = xmldom.XMLSerializer,
    ProjectSkeleton = require('./ProjectSkeleton.js'),
    ValueObjects = require('./ValueObject.js'),
    nodeFileParser = require('./Node.js'),
    CodeUtils = require('./CodeUtils.js'),
    args = process.argv.slice(2),
    ejs = require('ejs');


function parseSdsObj(sdsFilePath) {
    var rootNode = nodeFileParser(sdsFilePath);
    var sdsObj = new ValueObjects.sds(rootNode);
    sdsObj.context = {
        sds: sdsObj,
        func: sdsObj.func,
        vos: sdsObj.func.getVOs(),
        spec: sdsObj.spec,
        ui: sdsObj.ui,
        colGrp: sdsObj.columnGroups,
        module: sdsObj.module
    };
    return sdsObj;
}


function genFuncJava(sysId, sdsObj) {
    var javaDir = ProjectSkeleton.getJavaSrcDir(sysId) + '/' + sdsObj.func.pkgPath  ,
        destFilePath = javaDir + '/' + sdsObj.func.clz + '.java';
    CodeUtils.genStuff('Func.java', sdsObj.context, destFilePath);
}

function genGul(sdsObj) {
    var sysId=sdsObj.spec.sysId ;
    var specId = sdsObj.spec.id;
    var gulDir = ProjectSkeleton.getSpecGulDir(sysId, specId);
    var guls = fs.readdirSync(gulDir);
    guls.forEach(function (gulPath) {
        if (/\.gul$/.test(gulPath)) {
            var gulText = fs.readFileSync(gulDir + '/' + gulPath, 'utf8');

            var doc = new DOMParser().parseFromString(gulText, 'text/xml');
            sdsObj.columnGroups.forEach(function (columnGroup) {
                if (columnGroup.groupId) {
                    var ele = doc.getElementById(columnGroup.groupId),
                        fields = ele.getElementsByTagName("field");
                    for (var i = 0; i < fields.length; i++) {
                        var field = fields.item(i),
                            label = field.getAttribute("label");
                        if (!label) {
                            continue;
                        }
                        var column = columnGroup.findColumnByLabel(label);
                        if (column) {
                            field.setAttribute('name', column.name);
                            if (column.isComboBox()) {
                                field.setAttribute('datasrc', column.getDatasrc());
                            }
                        }
                    }
                }
            });

            // assign button id
            var toolbars = doc.getElementsByTagName('toolbar');
            var mths = sdsObj.func.funcMethods.toArray();
            var voIds = [];
            var vos = sdsObj.func.vos.toArray();
            vos.forEach(function (vo) {
                voIds.push(vo.id);
            })
            for (var i = 0; i < toolbars.length; i++) {
                var btns = toolbars.item(i).getElementsByTagName('field');
                for (var j = 0; j < btns.length; j++) {
                    var btn = btns.item(j);
                    if (btn.getAttribute('type') !== 'btn' || btn.getAttribute('id')) {
                        continue;
                    }
                    var btnId = findBtnId(btn.getAttribute('label'));
                    btn.setAttribute('id', btnId);
                    btn.setAttribute('onclick', 'class:' + sdsObj.func.clz + '.' + btnId + ':' + voIds.join(','));
                }

            }

            // assign grid datasrc
            var grids = doc.getElementsByTagName('grid');
            for (var i = 0; i < grids.length; i++) {
                var grid = grids.item(i);
                var datasrc = findGridDatasrc(grid.getAttribute('id'));
                if (datasrc) {
                    grid.setAttribute('datasrc', datasrc);
                }
            }

            function findGridDatasrc(gridId) {
                for (var i = 0; i < sdsObj.columnGroups.length; i++) {
                    var colGrp = sdsObj.columnGroups[i];
                    if (colGrp.groupId === gridId) {
                        return colGrp.datasrc;
                    }
                }
                return '';
            }


            function findBtnId(label) {
                for (var i = 0, len = mths.length; i < len; i++) {
                    if (mths[i].descript === label) {
                        return mths[i].methodName;
                    }
                }
                return label + "Id";
            }

            var gulDestDir = ProjectSkeleton.getGulDir(sysId),
                gulDestPath = gulDestDir + '/' + sdsObj.ui.fileName.replace(/\.gul/, '_gen.gul');
            mkdirp(gulDestDir, function (err) {
                if (err) console.error(err)
                else {
//                    console.log(gulDestDir + ' is created!');
                }
            });
            var genGul = new XMLSerializer().serializeToString(doc);
            fs.writeFile(gulDestPath, genGul, 'utf8', function(){
                console.log('[created]'+gulDestPath);
            });

        }
    })


}

function genMarkDownList(sysId, funcs) {
    var funcContexts = funcs.map(function (ele) {
        return ele.context;
    });
    var destFile = ProjectSkeleton.getMdSpecRootDir(sysId) + '/index.md';
    CodeUtils.genStuff('sdsList.md', {funcs: funcContexts, sysId: sysId}, destFile);
}
function genMarkDownHtml(sysId, sdsObj) {
    var specDir = ProjectSkeleton.getMdSpecDir(sysId, sdsObj.spec.id);
    CodeUtils.genStuff('sds.md', sdsObj.context, specDir + '/' + sdsObj.spec.id + '.md');

//    function output(dir, fileName, output) {
//        mkdirp(dir, function(err) {
//            if (err) console.error(err)
//            else {
//                fs.writeFile(dir + '/' + fileName, output, 'utf8');
//            }
//        });
//    }
//    output(sdsdir, sdsObj.spec.id + '.md', mdOutput);
    var imgDir = ProjectSkeleton.getSpecImgDir(sysId, sdsObj.spec.id);
    var destImgDir = ProjectSkeleton.getMdSpecImgDir(sysId, sdsObj.spec.id) ;
    fs.copy(imgDir, destImgDir, function (err) {
        if (!err) {
            console.log("copy " + destImgDir + "/ success!");
        }
    });

}
var funcCache = null;
function parseFunc(sysId, cache) {
    if (funcCache !== null) {
        return funcCache;
    }
    var specDir = ProjectSkeleton.getSpecRootDir(sysId);
    var files = fs.readdirSync(specDir),
        funcs = [];
    files.forEach(function (file) {
        var sdspath = ProjectSkeleton.getSpecDir(sysId, file) + '/' + file + '.txt';

        if (fs.existsSync(sdspath) && cache.isModified(sdspath)) {
            var func = parseSdsObj(sdspath);
            funcs.push(func);
        }
    });
    funcCache = funcs;
    return funcs;
}

module.exports = {
    genMD: function (sysId, cache) {
        var funcs = parseFunc(sysId, cache);
        funcs.forEach(function (func) {
            genMarkDownHtml(sysId, func);
        });
        genMarkDownList(sysId, funcs);
        return funcs;
    },
    genGul: function (sysId) {
        var funcs = parseFunc(sysId);
        funcs.forEach(function (func) {
            genGul(func);
        });
    },
    genJava: function (sysId) {
        var funcs = parseFunc(sysId);
        funcs.forEach(function (func) {
            genFuncJava(sysId, func);
        });
        return funcs;
    }
}

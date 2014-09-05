// comment for git 
var fs = require('fs-extra'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    xmldom = require('xmldom'),
    DOMParser = xmldom.DOMParser,
    XMLSerializer = xmldom.XMLSerializer,
    ValueObjects = require('./ValueObject.js'),
    args = process.argv.slice(2),
    sdsFileName = args[0],
    sysId = sdsFileName.substring(0,2).toLowerCase(),
    specId=sdsFileName.replace(/\.txt/,''),
    sdsDir = '../'+sysId+'/sds/'+specId,
    sdsFilePath = sdsDir+'/'+sdsFileName,
    ejs = require('ejs');

function Node(txt) {
    this.text = txt;
    this.children = [];
    this.prevSibling = null;
    this.parentNode = null;
    this.values = [];
    this.attribute = "";

    this.test = function(re) {
        return re.test(this.text.trim());
    }
    this.addChild = function(node) {
        var prev = this.lastChild();
        node.prevSibling = prev;
        node.parentNode = this;
        this.children.push(node);
    };
    this.getShiftCount = function() {
        var m = this.text.match(/^(\t*)/);
        return (m === null ? 0 : m[1].length) + 1;
    };
    this.lastChild = function() {
        if (this.children.length == 0) {
            return null;
        }
        return this.children[this.children.length - 1];
    };
    this.firstChild = function() {
        if (this.children.length == 0) {
            throw new Error("node has no children");
        }
        return this.children[0];
    };
    this.removeLastChild = function() {
        this.children.pop();
    };
    this.hasChild = function() {
        return this.children.length > 0;
    }
    this.parent = function(re) {
        var pNode = this.parentNode;
        while (pNode != null && !re.test(pNode.text.trim())) {
            pNode = pNode.parentNode;
        }
        return pNode;
    };

    this.offsetParent = function(re) {
        function getRightParent(parentNode) {
            if (!parentNode) {
                return null;
            }
            if (re.test(parentNode.text.trim())) {
                return parentNode;
            } else {
                getRightParent(parentNode.parentNode);
            }
        }

        var parent = getRightParent(this.parentNode);
        if (!parent) {
            return this.getShiftCount();
        }
        console.log('parent shiftcount:' + parent.getShiftCount() + ', this.shiftCount:' + this.getShiftCount());
        return this.getShiftCount() - parent.getShiftCount();
    }
}

function parseNode(text) {
    var lines = text.split(/\n/),
        root = new Node("root"),
        parentNodes = [root];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.trim()) {
            continue;
        }
        var node = new Node(line);
        var shift = node.getShiftCount();
        parentNodes[shift] = node;
        var parentNode = parentNodes[shift - 1];
        parentNode.addChild(node);
    }
}

function parseSDS(sdsText) {
    var lines = sdsText.split(/\n/),
        root = new Node("root"),
        parentNodes = [root];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.trim()) {
            continue;
        }
        var node = new Node(line);
        var shift = node.getShiftCount();
        parentNodes[shift] = node;
        var parentNode = parentNodes[shift - 1];
        parentNode.addChild(node);
    }
    var sdsObj = new ValueObjects.sds(root);
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

function readParseSDS() {
    var sdsText = fs.readFileSync(sdsFilePath, 'utf8');
    return parseSDS(sdsText);
}


function genFuncJava(sdsObj) {
    var funcTmpl = fs.readFileSync('template/Func.java', 'utf8');
    var output = ejs.render(funcTmpl, sdsObj.context);
    var srcPath = sdsFilePath.replace(/\/[^\/]+$/, '').replace(/sds/, 'src'),
        javaDir = srcPath + '/' + sdsObj.func.pkgPath + '/';

    mkdirp(javaDir, function(err) {
        if (err) console.error(err)
        else {
            console.log(javaDir + ' is created!');
            fs.writeFile(javaDir + '/' + sdsObj.func.clz + '.java', output, 'utf8');
        }
    });

}
function genTrigger(sdsObj){
    sdsObj.func.columnGroups.forEach(function(colGrp){
        if (colGrp.datasrc){
            var info = colGrp.datasrc.split('.'),
                clz = info[0]+'jcTrigger'+info[1].substring(0,1).toUpperCase()+info[1].substring(1) ;
            var context={
                sysId:sdsObj.func.sysId,
                triggerClz:clz
            }
        }
    })
}
function genGul(sdsObj) {
    var gulText = fs.readFileSync(sdsDir+'/gul/'+specId+'.gul', 'utf8');

    var doc = new DOMParser().parseFromString(gulText, 'text/xml');
    sdsObj.columnGroups.forEach(function(columnGroup) {
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
    var toolbars = doc.getElementsByTagName('toolbar') ;
    var mths = sdsObj.func.funcMethods.toArray() ;
    var voIds=[] ;
    var vos = sdsObj.func.vos.toArray() ;
    vos.forEach(function(vo){
        voIds.push(vo.id) ;
    })
    for (var i = 0; i < toolbars.length; i++) {
        var btns = toolbars.item(i).getElementsByTagName('field') ;
        for(var j=0;j<btns.length;j++){
            var btn = btns.item(j);
            if (btn.getAttribute('type')!=='btn'||btn.getAttribute('id')) {
                continue ;
            }
            var btnId = findBtnId(btn.getAttribute('label')) ;
            btn.setAttribute('id', btnId) ;
            btn.setAttribute('onclick','class:'+sdsObj.func.clz+'.'+btnId+':'+voIds.join(',')) ;
        }

    }

    // assign grid datasrc
    var grids = doc.getElementsByTagName('grid');
    for (var i = 0; i < grids.length; i++) {
        var grid = grids.item(i);
        var datasrc = findGridDatasrc(grid.getAttribute('id')) ;
        if(datasrc){
            grid.setAttribute('datasrc',datasrc) ;
        }
    }

    function findGridDatasrc(gridId){
        for (var i = 0; i < sdsObj.columnGroups.length; i++) {
            var colGrp = sdsObj.columnGroups[i];
            if(colGrp.groupId===gridId){
                return colGrp.datasrc ;
            }
        }
        return '';
    }


    function findBtnId(label) {
        for(var i= 0,len=mths.length;i<len;i++){
            if (mths[i].descript===label){
                return mths[i].methodName ;
            }
        }
        return label+"Id";
    }

    var gulDestDir='../'+sysId+'/gul',
        gulDestPath = gulDestDir+'/'+sdsObj.ui.fileName.replace(/\.gul/,'_gen.gul') ;
    mkdirp(gulDestDir, function(err) {
        if (err) console.error(err)
        else {
            console.log(gulDestDir + ' is created!');
        }
    });
    var genGul = new XMLSerializer().serializeToString(doc);
    fs.writeFile(gulDestPath, genGul, 'utf8');
}

function genMarkDownHtml(sdsObj) {
    var mdTmpl = fs.readFileSync('template/SDS.md', 'utf8'),
        mdOutput = ejs.render(mdTmpl, sdsObj.context),
        sdsdir = '../html/' + sdsObj.spec.sysId + '/sds';

    function output(dir, fileName, output) {
        mkdirp(dir, function(err) {
            if (err) console.error(err)
            else {
                fs.writeFile(dir + '/' + fileName, output, 'utf8');
            }
        });
    }

    output(sdsdir, sdsObj.spec.id + '.md', mdOutput);
    var imgDir= sdsdir+'/img' ;
    fs.copy(imgDir, sdsdir+'/'+specId, function(err) {
        if (!err) {
            console.log("copy "+imgDir+"/ success!") ;
        }
    });

}

function layoutHtml(html) {
    return ''
}

var sdsObj = readParseSDS();
genMarkDownHtml(sdsObj);

var opt = args.length > 1 && args[1]?args[1]:'' ;
if (opt === 'java') {
    genFuncJava(sdsObj);
} else if (opt === 'gul') {
    genGul(sdsObj) ;
}
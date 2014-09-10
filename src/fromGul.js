var xmldom = require('xmldom'),
    fs = require('fs'),
    ejs = require('ejs'),

    mkdirp = require('mkdirp'),
    args = process.argv.slice(2),
    sysId = args[0].substring(0,2).toLowerCase(),
    inputArg = args[0].replace(/\\/g,'/'),
    specId = inputArg.indexOf('/')>-1?inputArg.replace(/\/.+$/,''):inputArg.replace(/\.gul$/,''),
    skeleton = require('./ProjectSkeleton.js'),
    gulName = inputArg.replace(/^.+\//,''),
    DOMParser = xmldom.DOMParser,
    XMLSerializer = xmldom.XMLSerializer,
    specDir=skeleton.getSpecDir(sysId, specId),
    filePath=specDir+'/gul/'+gulName,
    sdsTxtPath= specDir+'/'+specId+'.txt' ;

console.log('processing '+filePath+'...') ;

var gul = fs.readFileSync(filePath, 'utf8');
var doc = new DOMParser().parseFromString(gul, 'text/xml');

var UI = {},
    DomUtils = {
        parseFields: function(container) {
            return this.parseElements(container, "field", function(ele) {
            	if (!ele.getAttribute('label')||ele.getAttribute('type')==='btn') {
            		return null ;
            	}
                return new UI.field(ele);
            });
        },
        parseTabs: function(container) {
            return this.parseElements(container, "tab", function(ele) {
                return new UI.tab(ele);
            });
        },
        parseBtns: function(container) {
            return this.parseElements(container, "field", function(ele) {
            	if (ele.getAttribute("type")!=="btn") {
            		return null ;
            	}
                return new UI.btn(ele);
            });
        },
        parseWindows: function(container) {
            return this.parseElements(container, "window", function(ele) {
                return new UI.window(ele);
            });
        },
        parseForms: function(container) {
            return this.parseElements(container, "form", function(ele) {
                return new UI.form(ele);
            });
        },
        parseGrids: function(container) {
            return this.parseElements(container, "grid", function(ele) {
                return new UI.grid(ele);
            });
        },
        parseElements: function(container, tagName, genElement) {
            var eles = container.getElementsByTagName(tagName),
                rtns = [];
            for (var i = 0; i < eles.length; i++) {
            	var uiEle=genElement(eles.item(i));
            	if (uiEle!==null) {
                	rtns.push(uiEle);
            	}
            }
            return rtns;
        },
        guessBtnId:function(text){
        	var rule={
        		"create":/新增/,
        		"update":/修改/,
        		"save":/儲存/,
        		"delete":/刪除|移除/,
        		"query":/查詢/,
        		"insert":/插入|加入/,
        		"dispatch":/分配/
        	};
        	for(var r in rule) {
        		if (rule[r].test(text)) {
        			return r ;
        		}
        	}
        	return text+'的ID' ;
        }
    };

UI.page = function(rootElement) {
    this.tabs=DomUtils.parseTabs(rootElement);
    this.forms = DomUtils.parseForms(rootElement);
    this.grids = DomUtils.parseGrids(rootElement);
    this.windows = DomUtils.parseWindows(rootElement);
    this.btns=DomUtils.parseBtns(rootElement) ; 
    this.getTransacBtns=function(){
    	var btnIds=[];
    	this.btns.forEach(function(btn){
    		if (!/.*查詢|搜尋/.test(btn.label)) {
    			btnIds.push(btn.id);
    		}
    	});
    	return btnIds.join(",") ;
    }
}

UI.btn = function(ele) {
	this.label=ele.getAttribute('label');
	this.id = DomUtils.guessBtnId(this.label) ;
	ele.setAttribute('id', this.id) ;
}
UI.form = function(ele) {
    this.id = ele.getAttribute("id");
    this.fields = DomUtils.parseFields(ele);
}
UI.grid = function(ele) {
    this.id = ele.getAttribute("id");
    this.fields = DomUtils.parseFields(ele);
}
UI.tab = function(ele) {
    this.id = ele.getAttribute("id");
    this.name = ele.getAttribute("name");

    this.forms = DomUtils.parseForms(ele);
    this.grids = DomUtils.parseGrids(ele);
}
UI.window = function(ele) {
	this.id=ele.getAttribute('id') ;
	this.heading=ele.getAttribute('heading') ;
    this.forms = DomUtils.parseForms(ele);
    this.grids = DomUtils.parseGrids(ele);
    this.tabs=DomUtils.parseTabs(ele);
}
UI.field = function(ele) {
    this.type = ele.getAttribute("type");
    this.label = ele.getAttribute("label").replace(/:/,'');
    this.name = ele.getAttribute("name");
    this.id = ele.getAttribute("id");
    if (/combobox/i.test(this.type)) {
    	this.descript = "datasrc="+filePath.substring(0,2)+".XXX" ;
    } else {
    	this.descript = "欄位說明";
    }
}

function getSpecName(specId) {
    var specList = fs.readFileSync('../'+sysId+'/sds/'+sysId+'-spec.txt', 'utf8');
    var ans = new RegExp(specId+"\t(.+)") ;
    var rslt = ans.exec(specList) ;
    if (rslt) {
        return rslt[1] ;
    }
    return "name of "+specId ;
}

var docEle = doc.documentElement;
var page = new UI.page(docEle) ;

var rslt = /(\w+)\.gul$/.exec(filePath),
    spec={
        id:specId,
        name:getSpecName(specId)
    };

var context = {
	spec:spec,
    sysId:sysId,
	gul:rslt[1]+".gul",
	grids:page.grids,
	forms:page.forms,
    vos:page.grids.concat(page.forms),
	page:page,
	funcClz:specId.toLowerCase().replace(/jg/,'jc')
};
var funcTmpl = fs.readFileSync('template/Func.sds', 'utf8');

var output = ejs.render(funcTmpl, context) ;
//var sdsPath = filePath.replace(/\/[^\/]+$/,''),
//    sdsTxtPath =sdsPath + '/' + context.spec + '.txt' ;

fs.writeFile(sdsTxtPath, output, 'utf8', function(){
    console.log('writing file '+sdsTxtPath+' finish!') ;
});

// mkdirp(sdsPath, function(err) {
//     if (err) console.error(err)
//     else {
        
//         console.log('writing file '+sdsPath + '/' + context.spec + '.txt'+' finish!') ;
//     }
// });

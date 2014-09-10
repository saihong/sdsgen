var _ = require('underscore'),
    CodeUtils = require('./CodeUtils.js') ;

var ValueObjects = {} ;

ValueObjects.sds = function(node) {
    this.spec = null;
    this.ui = null;
    this.func = null;
    this.columnGroups = null;
    this.parse = function(node) {
        this.spec = CodeUtils.parseElement(node, "#spec", function(child) {
            return new ValueObjects.spec(child);
        });
        this.ui = CodeUtils.parseElement(node, "#ui", function(child) {
            return new ValueObjects.ui(child);
        });
        this.func = CodeUtils.parseElement(node, "#func", function(child) {
            return new ValueObjects.func(child);
        });
        this.columnGroups = CodeUtils.parseElement(node, "#columns", function(child) {
            var columnGroups = [];
            child.children.forEach(function(group) {
                columnGroups.push(new ValueObjects.columnGroup(group));
            })
            return columnGroups;
        });
        this.module = CodeUtils.parseElement(node, "#module", function(child) {
            return new ValueObjects.module(child);
        })
    }


    this.parse(node);

}

ValueObjects.spec = function(node) {
    this.id = "";
    this.name = "";
    this.sysId = "";
    this.statements = [];
    this.parse = function(node) {
        var re = /\((\w+)\s+(.+)\)$/; // #SPEC(FVJGLD4A 順逆側流交易已未實現彙總)
        var ans = CodeUtils.exec(re, node.text);
        this.id = ans[1];
        this.name = ans[2];
        this.sysId = this.id.substring(0, 2).toLowerCase();
        this.statements = CodeUtils.getStatement(node.firstChild());
    }
    this.parse(node);
};

ValueObjects.ui = function(node) {
    this.fileName = "";
    this.url = "";
    this.images = [];
    this.parse = function(node) {
        var re = /#UI\s+(.+)$/;
        var ans = CodeUtils.exec(re, node.text),
            me = this;
        this.fileName = ans[1];
        this.url = node.firstChild().text.trim().replace(/url\s+/, '');

        node.children[1].children.forEach(function(imgNode) {
            me.images.push(new ValueObjects.image(imgNode));
        }); //image
    }
    this.parse(node);
};

ValueObjects.image = function(node) {
    var datas = node.text.trim().split(/\s/);
    this.url = datas[0].trim();
    this.caption = datas[1].trim();
}

ValueObjects.module = function(node) {
    var Relations = function(relationsNode) {
        this.arr = [];
        for (var i = 0; i < relationsNode.children.length; i++) {
            this.arr.push(new Relation(relationsNode.children[i]));
        }
        this.toArray = function() {
            return this.arr;
        }
    }
    var Relation = function(relationNode) {
        this.expr = relationNode.text.trim();
        this.toUml = function() {
            var ans = this.expr.replace(/(\w+)\-\>(\w+)/g, function(v, p1, p2) {
                var color = adjustColor(p2);
                return "[" + p1 +adjustColor(p1)+ "]"+defineRelation(p2)+" -.->[" + p2 + adjustColor(p2) + "]";
            });
            return ans;
        }

        function adjustColor(clzName) {
            var color = CodeUtils.lookup({
                'green': /VO$/,
                'orange': /Api/i,
                'pink':/Logic/
            }, clzName);
            if (color){
                return '{bg:'+color+'}' ;
            }
            return '' ;
        }

        function defineRelation(clzName) {
            return CodeUtils.lookup({
                'uses': /VO$/,
                'link': /Api/i,
                'call':/Logic/i
            }, clzName);
        }
    }
    var Table = function(node) {
        this.expr = node.text.trim();
        this.toUml = function() {
            return this.expr ;
        }
    }
    this.relations = CodeUtils.parseElement(node, "relations", function(child) {
        return new Relations(child);
    });
    this.tables = CodeUtils.parseElement(node, "tables", function(child) {
        var arr=[] ;
        for(var i=0;i<child.children.length;i++){
            arr.push(new Table(child.children[i])) ;
        }
        return arr ;
    });
}

ValueObjects.func = function(node) {
    this.clz = null;
    this.sysId = null;
    this.vos = null;
    this.init = null;
    this.validate = null;
    this.funcMethods = null;
    this.funcEnd = null;
    this.pkg = "";
    var re = /#func\s+\(\s*(\w+)\s*\)/;
    this.parse = function(node) {
        console.log('-- parse func --' + node.text);
        var ans = CodeUtils.exec(re, node.text);
        this.clz = ans[1];
        this.sysId = this.clz.substring(0, 2);
        this.vos = new ValueObjects.funcVOs(node.firstChild());
        this.pkg = "com.icsc." + this.sysId + ".func";
        this.pkgPath = this.pkg.replace(/\./g, '/');

        console.log('-- init --');
        this.init = new ValueObjects.funcInit(node.children[1]);

        console.log('-- validate --');
        this.validate = new ValueObjects.funcValidate(node.children[2]);

        console.log('-- method --');
        this.funcMethods = new ValueObjects.funcMethods(node, 3, node.children.length - 1);

        console.log('-- end --');
        this.funcEnd = new ValueObjects.funcEnd(node.lastChild());
    }
    this.getTransacMethodPtn = function() {
        return this.funcMethods.getTransacMethodPtn();
    }
    this.getMethods = function() {
        return this.funcMethods.toArray();
    }
    this.getVOs = function() {
        return this.vos.toArray();
    }
    this.replaceParam = function(text) {
        var context = {
            BuildDao: this.vos.buildDao().replace(/\t/, ''),
            TransacMethod: this.funcMethods.getTransacMethodPtn()
        }
        return CodeUtils.merge(text, context);
    }

    this.parse(node);
};

ValueObjects.funcMethods = function(node, startChild, endChild) {
    this.methods = [];
    this.parse = function(node, startChild, endChild) {
        for (var i = startChild; i < endChild; i++) {
            this.methods.push(new ValueObjects.funcMethod(node.children[i]));
        }
    }
    this.getTransacMethodPtn = function() {
        var transMth = [],
            ptnQuery = /read\w*|query\w*|inquery\w*|inqry\w*|advQry\w*|advQuery\w*/i;
        _.each(this.methods, function(ele) {
            if (ele.isPublic() && !ptnQuery.test(ele.methodName)) {
                transMth.push(ele.methodName);
            }
        })
        return transMth.join("|");
    }
    this.toArray = function() {
        return this.methods;
    }
    this.parse(node, startChild, endChild);
}

ValueObjects.funcVOs = function(node) {
    this.vos = [];

    this.parse = function(node) {
        CodeUtils.test(/vo/, node.text);
        var vosTmp = [];
        _.each(node.children, function(ele, idx) {
            vosTmp.push(new ValueObjects.funcVO(ele));
        });
        this.vos = vosTmp;
    }
    this.toArray = function() {
        return this.vos;
    }
    this.parse(node);
}

ValueObjects.funcVO = function(node) {
    this.id = "";
    this.voClz = "";
    this.memberType="";
    this.daoClz = "";
    this.daoObj = "";
    this.multi = false;
    this.tableId = null;
    this.sysId = null ;
    this.parse = function(node) {
        var rslt = /([\w]+)\s+([\w]+)\s*(\*)?/.exec(node.text.trim());
        if (!rslt) {
            throw new Error("["+node.text + "] is not a [vo]");
        }
        this.id = rslt[1];
        this.voClz = rslt[2];
        this.daoClz = this.voClz.replace(/VO$/, "DAO");
        this.daoObj = this.daoClz.substring(4, 5).toLowerCase() + this.daoClz.substring(5);
        this.multi = rslt[3] != null;
        this.memberType = this.multi?"List<"+this.voClz+">":this.voClz ;
        this.sysId = this.voClz.substr(0,2).toLowerCase() ;
        this.tableId = process.daotool.findTableByVO(this.voClz) ;
    }

    this.getClz = function() {
        return this.multi ? "List<" + this.voClz + ">" : this.voClz;
    }
    this.infoInGetData = function() {
        if (this.multi) {
            return "infoIn.getListExp(\"" + this.id + "\")";
        } else {
            return "(" + this.voClz + ")infoIn.getVO(\"" + this.id + "\")";
        }
    }
    this.infoOutSetData = function() {
        if (this.multi) {
            return "infoOut.setList(\"" + this.id + "\", this." + this.id + ")";
        }
        return "infoOut.setVO(\"" + this.id + "\", this." + this.id + ")";
    }
    this.parse(node);
};

ValueObjects.funcInit = function(node) {
    this.statements = null;
    this.parse = function(node) {
        CodeUtils.test(/init/, node.text);
        this.statements = CodeUtils.getStatement(node);
    }
    this.parse(node);
}

ValueObjects.funcValidate = function(node) {
    this.valMths = [];
    this.validateSpec = [];
    this.parse = function(node) {
        CodeUtils.test(/validate/, node.text);
        var me = this;
        this.validateSpec = CodeUtils.getStatement(node);
        this.validateSpec.push('  ') ;
        for(var i=this.validateSpec.length;i<node.children.length;i++){
            var valMth = new ValueObjects.funcValidateMth(node.children[i]);
            me.valMths.push(valMth);
        }
    }

    this.parse(node);
}

ValueObjects.funcValidateMth = function(node) {
    this.validateTargetMethod = null;
    this.matchPtn = null;
    this.spec = null;
    this.parse = function(node) {
        CodeUtils.test(/^\w+(\s*,\s*\w+)*$/, node.text);
        this.validateTargetMethod = node.text.trim();
        this.matchPtn = this.validateTargetMethod.replace(/\s*,\s*/, '|');
        this.spec = CodeUtils.getStatement(node);
    }
    this.parse(node);
}

ValueObjects.funcEnd = function(node) {
    this.statements = [];
    this.parse = function(node) {
        CodeUtils.test(/end/, node.text);
        this.statements = CodeUtils.getStatement(node);
    }
    this.parse(node);
}

ValueObjects.funcMethod = function(node) {
    this.descript = "";
    this.modifier = "public";
    this.specification = [];
    this.rtn = "void";
    this.methodDeclaration = "";
    this.methodName = "";
    this.argus = "()" ;
    this.getModifierSymbol = function() {
        return this.modifier === 'public' ? '+' : '-';
    }
    this.parse = function(node) {
        var rslt = /^\+\s*(\w+)\s+(.+)/.exec(node.text.trim());
        if (rslt != null) {
            this.methodName = rslt[1];
            this.methodDeclaration = this.methodName + "() throws Exception ";
            this.descript = rslt[2];
        } else if (/^\-/.test(node.text.trim())) {
            this.modifier = "private";
            var privRslt = /^\-\s*([\w<>]+)\s+(\w+)([\(\)\w,<>\s]+)$/.exec(node.text.trim());
            if (privRslt) {
                this.rtn = privRslt[1];
                this.methodName = privRslt[2];
                this.methodDeclaration = this.methodName + privRslt[3];
                this.argus=privRslt[3] ;
            }
        }
        this.specification = CodeUtils.getStatement(node);
    }
    this.isPublic = function() {
        return this.modifier === 'public';
    }
    this.getFullMethodDeclaration = function() {
        return this.modifier + " " + this.rtn + " " + this.methodDeclaration;
    }
    this.parse(node);
}

ValueObjects.columnGroup = function(node) {
    var ans = CodeUtils.exec(/\-\s*(\w+)\s*\[(.*)\]\s*(datasrc=.+)?\s*\-/, node.text);
    this.groupType = ans[1];
    this.groupId = ans[2] || '';
    this.datasrc= (ans[3]||'').replace(/datasrc=|['"]/g,'').trim();

    var cols = [];
    node.children.forEach(function(col) {
        cols.push(new ValueObjects.column(col));
    });
    this.columns = cols;
    this.findColumnByLabel = function(label) {
        for (var i = 0, len = this.columns.length; i < len; i++) {
            if (this.columns[i].label === label.replace(/:/, '')) {
                return this.columns[i];
            }
        }
        return null;
    }
    this.hasDatasrc=function() {
        return this.datasrc.trim().length>0 ;
    }
};

ValueObjects.column = function(node) {
    var datas = node.text.trim().split(/\t/);
    this.label = datas[0];
    this.type = datas[1];
    this.name = datas[2];
    this.descript = processDatasrc(datas[3]) ;
    this.verifyEvent = datas.length>4?datas[4]:'' ;
    this.isComboBox = function() {
        return /^combobox$/i.test(this.type);
    }
    function processDatasrc (descript) {
        return descript.replace(/datasrc=([\w\.]+)/, function(m,grp){
            return 'datasrc=['+grp+'](wiki.html#!pb/sds/common/select/index.md#'+grp+')' ;
        }) ;
    }
};


module.exports = ValueObjects;

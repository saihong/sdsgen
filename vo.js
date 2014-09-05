var _ = require('underscore');

var ValueObjects = {},
    CodeUtils = {
        wrapJavadoc: function(title, descripts) {
            var strs = [];
            strs.push("/**");
            strs.push(" *" + title);
            strs.push(" *<pre>");
            _.each(descripts, function(ele, idx) {
                strs.push(" *" + ele.replace(/\t/, ''));
                // strs.push(" *" + ele.replace(/\t/, '').replace(/>/g,'&gt;').replace(/</g,'&lt;'));
            });
            strs.push(" *</pre>");
            strs.push(" */");
            return strs;
        },
        times: function(symbol, times) {
            var str = "";
            for (var i = 0; i < times; i++) {
                str += symbol
            }
            return str;
        },
        timesShift: function(times) {
            return this.times("\t", times);
        },
        join: function(sb, timesOfshift) {
            var shift = this.timesShift(timesOfshift);
            return shift + sb.join("\n" + shift);
        },
        getStatement: function(node) {
            var descripts = [],
                rootShift = node.getShiftCount();

            function trimRootShift(text) {
                for (var i = 0; i < rootShift; i++) {
                    text = text.replace(/^\t/, '');
                }
                return text;
            }

            function getDescript(node) {
                _.each(node.children, function(ele) {
                    var shiftTimes = ele.getShiftCount() - rootShift;
                    var shift = CodeUtils.times("\t", shiftTimes);
                    descripts.push(shift + trimRootShift(ele.text));
                    if (ele.hasChild()) {
                        getDescript(ele);
                    }
                });
            }
            getDescript(node);
            return descripts;
        },
        exec: function(re, str) {
            var ans = re.exec(str);
            if (ans == null) {
                console.log(str);
                throw new Error("str[" + str + "] not match [" + re + "]");
            }
            return ans;
        },
        test: function(re, str) {
            if (!re.test(str.trim())) {
                throw new Error("str[" + str + "] not match [" + re + "]");
            }
        },
        merge:function(txt,params){
        	return txt.replace(/\$\{(\w+)\}/g, function(m,grp){
        		return params[grp] ;
        	}) ;
        }
    },
    ValueObjectFactory = {
        judge: function(rootNode) {

        }
    };
ValueObjects.sds = function(node) {
    this.spec = null;
    this.ui = null;
    this.func = null;
    this.columns = null;

    this.parse = function(node) {
        this.func = new ValueObjects.func(node.children[2]); // func    	
    }

    this.toCode = function() {
        return this.func.toCode(0);
    }

    this.parse(node);
}

ValueObjects.spec = function(node) {
    this.id = "";
    this.name = "";
    this.statements = [];
    this.parse(node);
    this.parse = function(node) {
        var re = /\((\w+)\s+(.+)\)$/; // #SPEC(FVJGLD4A 順逆側流交易已未實現彙總)
        var ans = CodeUtils.exec(re, node.text);
        this.id = ans[1];
        this.name = ans[2];
        this.statements = CodeUtils.getStatement(node.firstChild());
    }
    this.toCode = function() {
        return CodeUtils.wrapJavadoc(this.id + " " + this.name, this.statements);
    }
};

ValueObjects.ui = function(url) {
    this.url = url;
};

ValueObjects.func = function(node) {
    this.clz = null;
    this.sysId = null;
    this.vos = null;
    this.funcInit = null;
    this.funcValidate = null;
    this.funcMethods = null;
    this.funcEnd = null;

    var re = /#func\s+\(\s*(\w+)\s*\)/;
    this.parse = function(node) {
        console.log('-- parse func --' + node.text);
        var ans = CodeUtils.exec(re, node.text);
        this.clz = ans[1];
        this.sysId= this.clz.substring(0,2);
        this.vos = new ValueObjects.funcVOs(node.firstChild());

        console.log('-- init --');
        this.funcInit = new ValueObjects.funcInit(node.children[1]);

        console.log('-- validate --');
        this.funcValidate = new ValueObjects.funcValidate(node.children[2]);

        console.log('-- method --');
        this.funcMethods = new ValueObjects.funcMethods(node, 3, node.children.length - 2) ; 

        console.log('-- end --');
        this.funcEnd = new ValueObjects.funcEnd(node.lastChild());
    }

    this.toCode = function() {
        var sb = [],
        	trnasMth=[];
        sb.push("public class " + this.clz + " extends dezcFunctionalController {");
        sb.push(this.vos.toCode(1));
        sb.push(this.funcInit.toCode(1));
        sb.push(this.toGrabInfoInCode(1));
        sb.push(this.funcValidate.toCode(1));
        sb.push(this.funcMethods.toCode(1)) ;
        sb.push(this.funcEnd.toCode(1));
        sb.push("}");

        return this.replaceParam( CodeUtils.join(sb, 0) );
    }

    this.replaceParam=function(text){
    	var context={
    		BuildDao:this.vos.buildDao().replace(/\t/, ''),
    		TransacMethod:this.funcMethods.getTransacMethodPtn() 
    	}
    	return CodeUtils.merge(text, context) ;
    }

    this.toGrabInfoInCode = function(timesOfshift) {
        var sb = [];
        sb.push("private void getInfoInData() {");
        sb.push(this.vos.getFromInfoIn(2));
        sb.push("}");
        return CodeUtils.join(sb, timesOfshift);
    }
    this.parse(node);
};

ValueObjects.funcMethods = function(node,startChild,endChild) {
	this.methods = [] ;
	this.parse=function(node,startChild,endChild){
        for (var i = startChild; i < endChild; i++) {
            this.methods.push(new ValueObjects.funcMethod(node.children[i]));
        }        
	}
	this.toCode=function(timesOfshift) {
		var sb=[] ;
		_.each(this.methods, function(ele){
			sb.push(ele.toCode(timesOfshift)) ;
		});	
		return CodeUtils.join(sb, timesOfshift) ;
	}
	this.getTransacMethodPtn=function(){
		var transMth=[],
			ptnQuery=/read\w*|query\w*|inquery\w*|inqry\w*|advQry\w*|advQuery\w*/i ;
		_.each(this.methods, function(ele) {
            if (ele.isPublic()&& !ptnQuery.test(ele.methodName)) {
            	transMth.push(ele.methodName);
            }
        })	
        return transMth.join("|") ;
	}
	this.parse(node,startChild,endChild) ;
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
    this.toCode = function(timesOfshift) {
        var sb = [];
        _.each(this.vos, function(ele) {
            sb.push(ele.toCode(0));
        });
        return CodeUtils.join(sb, timesOfshift);
    }
    this.buildDao = function() {
        var sb = [];
        _.each(this.vos, function(ele) {
            sb.push(ele.buildDao());
        });
        return sb.join("\n");
    }
    this.getFromInfoIn = function(timesOfshift) {
        var sb = [];
        _.each(this.vos, function(ele) {
            sb.push(ele.getFromInfoIn());
        });
        return CodeUtils.join(sb,timesOfshift).replace(/^\t/,'') ;
    }
    this.parse(node);
}

ValueObjects.funcVO = function(node) {
    this.id = "";
    this.voClz = "";
    this.multi = false;

    this.parse = function(node) {
        var rslt = /([\w]+)\s+([\w]+)(\*)?/.exec(node.text);
        if (!rslt) {
            throw new Error(node.text + " is not a [vo]");
        }
        this.id = rslt[1];
        this.voClz = rslt[2];
        this.multi = rslt[3] != null;
    }
    this.getClz = function() {
        return this.multi ? "List<" + this.voClz + ">" : this.voClz;
    }
    this.toCode = function(timesOfshift) {
        var sb = [];
        sb.push("private " + this.getClz() + " " + this.id + ";");
        return CodeUtils.join(sb, timesOfshift);
    }
    this.buildDao = function() {
        var daoClz = this.voClz.replace(/VO$/, "DAO"),
            obj = this.voClz.substring(4, 5).toLowerCase() + this.voClz.substring(5).replace(/VO$/, 'Dao');
        return "\t\t" + daoClz + " " + obj + "=new " + daoClz + "(dsCom, transPool);";
    }
    this.getFromInfoIn = function() {
        if (this.multi) {
            return "this." + this.id + " = infoIn.getListExp(\"" + this.id + "\");";
        } else {
            return "this." + this.id + " = (" + this.voClz + ")infoIn.getVO(\"" + this.id + "\");";
        }
    }
    this.parse(node);
};

ValueObjects.funcInit = function(node) {
    this.descripts = null;
    this.parse = function(node) {
        CodeUtils.test(/init/, node.text);
        this.descripts = CodeUtils.getStatement(node);
    }
    this.toCode = function(timesOfshift) {
        var sb = CodeUtils.wrapJavadoc("get ui data", this.descripts);
        sb.push("public void init(String method) {");
        sb.push("\tif (method.matches(\"${TransacMethod}\") {");
        sb.push("\t\tthis.getInfoInData();" );
        sb.push("\t}");
        sb.push("}");
        return CodeUtils.join(sb, timesOfshift);
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

        _.each(node.children, function(ele, idx) {
            var valMth = new ValueObjects.funcValidateMth(ele);
            me.valMths.push(valMth);
        });
    }

    this.toCode = function(timesOfshift) {
        var sb = CodeUtils.wrapJavadoc("驗證輸入值", this.validateSpec);
        sb.push("protected void validateAction(String method) {");
        _.each(this.valMths, function(ele) {
            sb.push(ele.toCode(timesOfshift));
        });
        sb.push("}");
        return CodeUtils.join(sb, timesOfshift);
    }

    this.parse(node);
}

ValueObjects.funcValidateMth = function(node) {
    this.strs = null;
    this.validateTargetMethod = null;
    this.parse = function(node) {
        CodeUtils.test(/^\w+(\s*,\s*\w+)*$/, node.text);
        this.validateTargetMethod = node.text.trim();
    }
    this.toCode = function(timesOfshift) {
        var sb = [],
            mth = this.validateTargetMethod;
        sb.push("if (method.matches(\"" + mth.replace(/\s*,\s*/g, '|') + "\") {");
        sb.push("\t\t// todo 驗證[" + mth + "]輸入值證");
        sb.push("\t};");
        return CodeUtils.join(sb, timesOfshift);
    }
    this.parse(node);
}

ValueObjects.funcEnd = function(node) {
    this.statements = [];
    this.parse = function(node) {
        CodeUtils.test(/end/, node.text);
        this.statements = CodeUtils.getStatement(node);
    }
    this.toCode = function(timesOfshift) {
        var sb = CodeUtils.wrapJavadoc("控制畫面狀態與放畫面資料", this.statements);
        sb.push("public void end(String method) {");
        sb.push("\t// todo 實作擺資料到畫面、控制UI");
        sb.push("}");
        return CodeUtils.join(sb, timesOfshift);
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
    this.parse = function(node) {
        var rslt = /^\s*\+\s*(\w+)\s+(.+)/.exec(node.text);
        if (rslt != null) {
        	this.methodName=rslt[1];
            this.methodDeclaration = this.methodName + "() throws Exception ";
            this.descript = rslt[2];
        } else if (/^\s*\-/.test(node.text)) {
            this.modifier = "private";
            var privRslt = /^\s*\-\s*([\w<>]+)\s+(\w+)([\(\)\w,<>\s]+)$/.exec(node.text);
            if (privRslt) {
                this.rtn = privRslt[1];
                this.methodName=privRslt[2];
                this.methodDeclaration = this.methodName+privRslt[3];
            }
        }
        var specification = [];

        function loadSpec(node) {
            _.each(node.children, function(ele, idx) {
                specification.push(ele.text);
                if (ele.hasChild()) {
                    loadSpec(ele);
                }
            });
        }
        loadSpec(node);
        this.specification = specification;
    }
    this.isPublic=function(){
    	return this.modifier==='public' ;
    }
    this.getFullMethodDeclaration = function() {
        return this.modifier + " " + this.rtn + " " + this.methodDeclaration;
    }
    this.toCode = function(timesOfshift) {
        var sb = CodeUtils.wrapJavadoc(this.descript, this.specification);
        sb.push(this.getFullMethodDeclaration() + " {");
        sb.push("\t// todo 實作[" + this.descript + "]");
        sb.push("\tdezcTransactionPool transPool=this.readyTransactionPool();");
        sb.push("${BuildDao}");
        sb.push("}");
        return CodeUtils.join(sb, timesOfshift).replace(/^\t/,'');
    }
    this.parse(node);
}

ValueObjects.columns = {

};

module.exports = ValueObjects;

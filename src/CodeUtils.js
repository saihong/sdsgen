/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 上午 8:09
 * To change this template use File | Settings | File Templates.
 */
var CodeUtils = {
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
    trimLeft:function(shiftTimes,str) {
        return str.replace(new RegExp('^'+this.timesShift(shiftTimes)),'') ;
    },
    getStatement: function(node) {
        var descripts = [],
            rootShift = node.getShiftCount() ;
        function trimRootShift(text, minusShift) {
            for (var i = 0; i < minusShift; i++) {
                text = text.replace(/^\t/, '');
            }
            return text;
        }
        function getDescript(node, codeChild) {
            _.each(node.children, function(ele) {
                var shiftTimes = ele.getShiftCount() - rootShift;
                var shift = CodeUtils.times("\t", shiftTimes);
                var codePtn = /(java|javascript|xml)/,
                    code = ele.test(/^\[(java|javascript|xml)\]$/) ;

                if (code) {
                    descripts.push(' ') ;
                    ele.text= ele.text.replace(codePtn,'```$1').replace(/[\[\]]/g,'') ;
                }
                if (codeChild) {
                    var pNode = ele.parent(codePtn) ;
                    if (pNode) {
                        var offset = ele.getShiftCount()-pNode.getShiftCount() ;
                        descripts.push( CodeUtils.timesShift(offset)+ele.text.trim() );
                    }
                } else {
                    var descript= CodeUtils.timesShift(ele.getShiftCount()-rootShift)+ele.text.trim(),
                        itemSymbolPtn=/^[\-\+\*]\s*[^\-\+\*]+/;
                    if (descripts.length>0){
                        if (ele.test(itemSymbolPtn) && !itemSymbolPtn.test( descripts[descripts.length-1].trim() ) ) {
                            descripts.push(" ");
                        }
                    }
                    var line = descript.replace(/\s+```(xml)?/, '```');
                    if(/warning|note|hint/i.test(line)){
                        descripts.push(' ') ;
                        descripts.push(line.trim()) ;
                        descripts.push(' ') ;
                    } else {
                        descripts.push(line);
                    }
                }
                if (ele.hasChild()) {
                    getDescript(ele, code||codeChild);
                }
                if (code){
                    descripts.push("```") ;
                }
            });
        }
        getDescript(node);

        return descripts;
    },
    exec: function(re, str) {
        var ans = re.exec(str.trim());
        if (ans == null) {
            console.log('no result in exec [' + str.trim() + ']');
            throw new Error("[" + re + "] exec no result in [" + str + "]");
        }
        return ans;
    },
    test: function(re, str) {
        if (!re.test(str.trim())) {
            throw new Error("str[" + str + "] not match [" + re + "]");
        }
    },
    merge: function(txt, params) {
        return txt.replace(/\$\{(\w+)\}/g, function(m, grp) {
            return params[grp];
        });
    },
    parseElement: function(node, ptn, builder) {
        var children = node.children,
            re = new RegExp(ptn, "i");
        for (var i = 0; i < children.length; i++) {
            if (re.test(children[i].text.trim())) {
                return builder(children[i]);
            }
        }
        return null;
    },
    lookup: function(db, target) {
        for (var k in db) {
            if (db[k].test(target)) {
                return k;
            }
        }
        return "";
    }
};

module.exports = CodeUtils ;

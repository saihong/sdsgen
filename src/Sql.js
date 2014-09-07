/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 下午 6:54
 * To change this template use File | Settings | File Templates.
 */

var CodeUtils = require('./CodeUtils.js') ;

var Sql = function (node) {
    this.select = CodeUtils.parseElement(node, "select", function (child) {
        return new SqlSegment(child);
    });
    this.from = CodeUtils.parseElement(node, "from", function (child) {
        return new SqlSegment(child);
    });
    this.where = CodeUtils.parseElement(node, "where", function (child) {
        return new Where(child);
    });
    this.orderby = CodeUtils.parseElement(node, "order by", function (child) {
        return new SqlSegment(child);
    });
}

var SqlSegment = function (node) {
    this.statements = CodeUtils.getStatement(node);
    if (this.statements.length > 0) {
        this.text = this.statements[0].trim();
    }
}

var Where = function (node) {
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

module.exports = Sql ;
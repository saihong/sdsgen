/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 上午 8:11
 * To change this template use File | Settings | File Templates.
 */
var CodeUtils = require('./CodeUtils.js') ;
var Trigger = {

}

Trigger.VO= function(node) {
    var ans = CodeUtils.exec(/([\w{2}\.\w+])\s+(.+)/,node.text) ;
    this.triggerId = ans[1] ;
    this.triggerName = ans[2] ;
    this.spec = CodeUtils.parseElement(node, "spec", function(child) {
        return new Trigger.SqlSegment(child);
    });
};

Trigger.Sql = function(node) {
    this.select = CodeUtils.parseElement(node, "select", function(child) {
        return new Trigger.SqlSegment(child);
    });
    this.from = CodeUtils.parseElement(node, "from", function(child) {
        return new Trigger.SqlSegment(child);
    });
    this.where = CodeUtils.parseElement(node, "where", function(child) {
        return new Trigger.SqlSegment(child);
    });
    this.orderby = CodeUtils.parseElement(node, "order by", function(child) {
        return new Trigger.SqlSegment(child);
    });
}

Trigger.SqlSegment = function(node) {
    this.statement = node.text.trim() ;
}

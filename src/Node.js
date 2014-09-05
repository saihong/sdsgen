/**
 * Created with JetBrains WebStorm.
 * User: I20496
 * Date: 2014/9/5
 * Time: 下午 1:00
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs-extra');

function Node(txt) {
    this.text = txt;
    this.children = [];
    this.prevSibling = null;
    this.parentNode = null;
    this.values = [];
    this.attribute = "";

    this.test = function (re) {
        return re.test(this.text.trim());
    }
    this.addChild = function (node) {
        var prev = this.lastChild();
        node.prevSibling = prev;
        node.parentNode = this;
        this.children.push(node);
    };
    this.getShiftCount = function () {
        var m = this.text.match(/^(\t*)/);
        return (m === null ? 0 : m[1].length) + 1;
    };
    this.lastChild = function () {
        if (this.children.length == 0) {
            return null;
        }
        return this.children[this.children.length - 1];
    };
    this.firstChild = function () {
        if (this.children.length == 0) {
            throw new Error("node has no children");
        }
        return this.children[0];
    };
    this.removeLastChild = function () {
        this.children.pop();
    };
    this.hasChild = function () {
        return this.children.length > 0;
    }
    this.parent = function (re) {
        var pNode = this.parentNode;
        while (pNode != null && !re.test(pNode.text.trim())) {
            pNode = pNode.parentNode;
        }
        return pNode;
    };

    this.offsetParent = function (re) {
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
    return root;
}

function parseFile(path) {
    var text = fs.readFileSync(path, 'utf8');
    return parseNode(text) ;
}

module.exports = parseFile ;

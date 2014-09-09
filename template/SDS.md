#<%=spec.id%> <%=spec.name%>

**[<%=spec.sysId%>系統目錄](wiki.html#!<%=spec.sysId%>/sds/index.md)** > [spec清單](wiki.html#!<%=spec.sysId%>/sds/spec/index.md)

## 1. SPEC 說明
--------
<%spec.statements.forEach(function(line){ -%>
<%-line.replace(/^\t/,'')%>
<% }) -%>

## 2. 畫面 <%=ui.fileName%>
--------
 - url <%=ui.url%>
<% ui.images.forEach(function(img,idx){ %>
	![](<%= img.url %> "圖 <%=idx+1%>-<%= img.caption %>")
	
	** 圖 <%=idx+1%>-<%= img.caption %> **
<%})%> 

## 3. 模組架構
### 3.1 模組關係
<% module.relations.toArray().forEach( function(relation) { %>
[gimmick:yuml]( <%-relation.toUml()%> )
<%})%>

### 3.2 資料表關係
<% module.tables.forEach( function(table) { %>
[gimmick:yuml]( <%-table.toUml()%> )
<%})%>

## 4. Controller ~<%=spec.sysId+'.func.'+func.clz%>
--------
### 4.1 涉及 VO
VO ID | VO Class | 數量 
------|----------|-------
<%vos.forEach(function(vo){ -%>
<%=vo.id%>|<%=vo.voClz%>|<%=vo.multi?'*':'1'%>
<% })%>

### 4.2 init 初始化
<%func.init.statements.forEach(function(line){ -%>
 - <%=line%>
<% })%>

### 4.3 validate 驗證輸入值

<%func.validate.validateSpec.forEach(function(line){ -%>
<%=line%>
<% })%>

<%func.getMethods().forEach(function(method, idx){ -%>
### 4.<%= idx+4 %> <%=method.getModifierSymbol()%><%=method.methodName%><%=method.argus%> <%=method.descript%>
<%method.specification.forEach(function(line){ -%>
<%- line.replace(/^\t/,'')%>
<%})%>
<%})%>

### 4.<%= 3+func.getMethods().length %> end 結束 
<% func.funcEnd.statements.forEach(function(line){ -%>
 - <%= line %>
<% }) %>

## 5. column 畫面欄位
--------
<% colGrp.forEach(function(columnGroup, idx){ -%>
### 5.<%=idx+1%> <%= columnGroup.groupType %> - <%= columnGroup.groupId %>
畫面欄位 | 欄位種類 | 欄位名稱 | 資料邏輯 | 驗證時機
---------|----------|----------|------------
<% columnGroup.columns.forEach(function(column){ -%>
<%= column.label %>|<%= column.type %>|<%= column.name %>|<%= column.descript %>|<%= column.verifyEvent %>
<%})%>
<% }) %>
#### [回spec清單](wiki.html#!<%=spec.sysId%>/sds/spec/index.md)
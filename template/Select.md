#<%=sysId%> 下拉選單
**[<%=sysId%>系統目錄](wiki.html#!<%=sysId%>/sds/index.md)**

<% selects.forEach(function(select, idx) { -%>
## <%=select.selectId%>
-----------------
### <%=(idx+1)%>. <%=select.selectDescript%>
<% select.allSpecs.forEach(function(line){ -%>
	<%-line%>
<%}) -%>

<%}) -%>
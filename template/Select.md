#<%=sysId%> 下拉選單
<% selects.forEach(function(select, idx) { -%>
## <%=(idx+1)%>. <%=select.selectId%> <%=select.selectDescript%>
-----------------
<% select.allSpecs.forEach(function(line){ -%>
	<%-line%>
<%}) -%>

<%}) -%>
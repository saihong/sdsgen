# <%= sysId %> 資料庫表格清單 (<%=tables.length%>)

##表格
表格名稱 | 表格說明 | 欄位數
-----|----------|------
<%tables.forEach(function(t) { -%>
[<%=t.table%>](<%=t.table%>.md)|<%=t.descript%> | <%=t.columns.length%>
<%}) -%>
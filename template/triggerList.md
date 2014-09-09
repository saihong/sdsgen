# <%= sysId %> 資料清單 (<%=triggers.length%>)

**[<%=sysId%>系統目錄](wiki.html#!<%=sysId%>/sds/index.md)**
##Trigger
Trigger代號 | Trigger說明
-------|----------
<%triggers.forEach(function(t) { -%>
[<%=t.triggerId%>](<%=t.triggerId%>.md)|<%=t.triggerDescript%>
<%}) -%>

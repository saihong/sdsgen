# <%= sysId %> SPEC主目錄

##SPEC (<%=funcs.length%>)
SPEC ID | SPEC 說明
-------|----------
<%funcs.forEach(function(f) { -%>
[<%=f.spec.id%>](spec/<%=f.spec.id+'/'+f.spec.id%>.md)|<%=f.spec.name%>
<%}) -%>

##清單 (<%=triggers.length%>)
Trigger代號 | Trigger說明
-------|----------
<%triggers.forEach(function(t) { -%>
[<%=t.triggerId%>](wiki.html#!<%=sysId+'/sds/common/trigger/'+t.triggerId%>.md)|<%=t.triggerDescript%>
<%}) -%>

##下拉選單 (<%=selects.length%>)
datasrc ID| datasrc 說明
-------|----------
<% selects.forEach(function(select, idx) { -%>
[<%=select.selectId%>](wiki.html#!<%=sysId%>/sds/common/select/index.md#<%=select.selectId%>)|<%=select.selectDescript%>
<%}) -%>

##資料表 (<%=daos.length%>)
Table Name| Table 說明
-------|----------
<% daos.forEach(function(dao, idx) { -%>
[<%=dao.table%>](wiki.html#!<%=sysId%>/sds/common/table/<%=dao.table%>.md)|<%=dao.descript%>
<%}) -%>

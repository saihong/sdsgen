# <%= sysId %> SPEC清單 (<%=funcs.length%>)

**[<%=sysId%>系統目錄](wiki.html#!<%=sysId%>/sds/index.md)**
##SPEC
SPEC ID | SPEC 說明
-------|----------
<%funcs.forEach(function(f) { -%>
[<%=f.spec.id%>](<%=f.spec.id+'/'+f.spec.id%>.md)|<%=f.spec.name%>
<%}) -%>
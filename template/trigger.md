#<%=triggerId%> <%=triggerDescript%>
**[<%=sysId%>系統目錄](wiki.html#!<%=sysId%>/sds/index.md)** > [trigger清單](index.md)
##spec
------
<%spec.forEach(function(line){ -%>
<%=line%>
<%}) -%>

##sql
------
```sql
<%sqlSpec.forEach(function(line){ -%>
<%-line%>
<%}) -%>
```

##欄位加工
------
<%afterQuery.forEach(function(line){ -%>
<%=line%>
<%}) -%>

##原始碼
-------
```java
<%-code%>
```
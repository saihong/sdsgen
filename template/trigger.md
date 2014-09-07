#<%=triggerId%> <%=triggerDescript%>
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
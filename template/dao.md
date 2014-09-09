# <%= table %> <%= descript %>

**[<%=sysId%>系統目錄](wiki.html#!<%=sysId%>/sds/index.md)** > [table清單](index.md)

##表格基本資料
  屬性 | 內容
------|-----
project | <%=project%>
table | <%=table%>
class | <%=clz%>
package | <%=pkg%>
entity | <%=entity%>
import | <%=importPkg%>
descript | <%=descript%>

##表格欄位
name | dataType | key | 描     述 | 長 度 | 格  式 | 預設值
-----|----------|-------|-------|-------|-------|-------
<%columns.forEach(function(f) { -%>
<%=f.name%>|<%=f.datatype%>|<%=f.isKey()%>|<%=f.descript%>|<%=f.width%>|<%=f.format%>|<%-f.defValue%>
<%}) -%>
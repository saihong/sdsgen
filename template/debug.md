## column 畫面欄位
<% sds.columnGroups.forEach(function(columnGroup){ -%>
###<%= columnGroup.groupType %> <%= columnGroup.groupId %>
畫面欄位 | 欄位種類 | 欄位名稱 | 欄位說明
---------|----------|----------|------------
<% columnGroup.columns.forEach(function(column){ -%>
<%= column.label %>|<%= column.type %>|<%= column.name %>|<%= column.descript %>
<%})%>

<% }) %>

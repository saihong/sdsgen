package com.icsc.<%=sysId%>.web.trigger;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

import com.icsc.dpms.de.*;
import com.icsc.dpms.de.dez.structs.func.dezcTransactionPool;
import com.icsc.dpms.de.dez.tag.grid.dezcGridFilter;
import com.icsc.dpms.de.dez.tag.grid.dezcGridPager;
import com.icsc.dpms.de.dez.tag.grid.dezcTriggerLayout;
import com.icsc.dpms.de.dez.tag.grid.data.dezcTriggerDataSource_sql;
import com.icsc.dpms.ds.dsjccom;

/**
<%spec.forEach(function(line){ -%>
 * <%=line%>
<%}) -%>
 */
public class <%=triggerClz%> extends dezcTriggerDataSource_sql {
	public final static String AppId = "<%=triggerClz%>";

	protected Connection getConnection(dsjccom dsCom, dejc301 de301)
			throws SQLException {
		dejcAssert.notNull(dsCom,"dsCom cannot be null");
		return new dezcTransactionPool(dsCom).getConnection(de301, "<%=sysId%>", "<%=sql.from.text%>");
	}

	public String getCountSql(dezcGridPager pager, dezcGridFilter filter) {
		return "select count(1) from <%=sql.from.text%> " + combineSQL(filter) + filter.toSqlCondition();
	}

	public String getSql(dezcGridPager pager, dezcGridFilter filter) {
		return "select <%-sql.select.text%> from <%-sql.from.text%> "
				+ combineSQL(filter) + " order by <%-sql.orderby.text%>";
	}


	/**
	 * @param filter
	 * @return
	 */
	private String combineSQL(dezcGridFilter filter) {
		dsjccom dsCom = filter.getDsCom();
		Map map = filter.getRequestMap();

<% if (sql.where.qryParams){
	sql.where.qryParams.forEach(function(param){ -%>
		String <%=param%> = (String)map.get("<%=param%>");
<%}) } %>
		StringBuffer sb = new StringBuffer() ;
		sb.append(" where ");
		sb.append("<%- sql.where.fixedConds %>");
<% sql.where.optionConds.forEach(function(cond){
	var param = cond.match(/\$[\w_]+/)[0].substr(1); -%>
		if (!dejcUtility.isNull(<%=param%>)) {
			sb.append(" <%-cond.replace(/\$([\w_]+)/g,'"+$1+"') %>");
		}
<%}) -%>
		return sb.toString();
	}
	/**
<% afterQuery.forEach(function(line){ -%>
	 * <%- line %>
<%}) -%>
	 */
	protected String[] onAfterQuery(dsjccom dsCom, String[] cellDatas) {
		// dezcTransactionPool transPool = new dezcTransactionPool(dsCom);
		try{
			// cellDatas[1] = ... 處理第一個欄位
			// cellDatas[2] = ... 處理第二個欄位
		}finally{
		//	transPool.closeAll();
		}
		return cellDatas;
	}

	public void renderLayout(dezcTriggerLayout layout) {
	}
}
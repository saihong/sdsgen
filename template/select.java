package com.icsc.<%=sysId%>.select;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.icsc.dpms.de.dejcCriteria;
import com.icsc.dpms.de.dez.tag.select.dezcSelectDataSrc;
import com.icsc.dpms.ds.dsjcCompUtil;
import com.icsc.dpms.ds.dsjccom;
import com.icsc.<%=sysId%>.dao.* ;

	/**
<% spec.forEach( function(line) { -%>
	 * <%=line%>
<%}) -%>
	 */
public class <%=selectClz%> extends dezcSelectDataSrc {
	private final static String AppId = "<%=selectClz%>" ;
 
	public void setDataSrc(dsjccom dsCom, Map infoIn) {
<%if (options) { -%>
<% options.forEach(function(opt){ -%>
		addOption("<%=opt.value%>", "<%=opt.text%>") ;
<%}) -%>
<%}else if (sql) { -%>
		setDataSrcFromSQL(dsCom, combineSQL(infoIn));
<%} -%>
	}
<% if (sql) { -%>
	private String combineSQL(Map infoIn) {
<% if (sql.where.qryParams){
	sql.where.qryParams.forEach(function(param){ -%>
		String <%=param%> = (String)infoIn.get("<%=param%>");
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
<%} -%>
}
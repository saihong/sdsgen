package com.icsc.<%=func.sysId%>.web.trigger;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

import com.icsc.dpms.de.dejc301;
import com.icsc.dpms.de.dejc308;
import com.icsc.dpms.de.dejcUtility;
import com.icsc.dpms.de.dez.structs.func.dezcTransactionPool;
import com.icsc.dpms.de.dez.tag.grid.dezcGridFilter;
import com.icsc.dpms.de.dez.tag.grid.dezcGridPager;
import com.icsc.dpms.de.dez.tag.grid.dezcTriggerLayout;
import com.icsc.dpms.de.dez.tag.grid.data.dezcTriggerDataSource_sql;
import com.icsc.dpms.ds.dsjccom;

/**
 *
 */
public class <%=triggerClz%> extends dezcTriggerDataSource_sql {
	public final static String AppId = "<%=triggerClz%>";
	public final static String CLASS_VERSION = "$Id$";

	public String getCountSql(dezcGridPager pager, dezcGridFilter filter) {
		return "select count(1) from pw.tbpw6k " + conbineSQL(filter.getDsCom(),filter.getRequestMap()) + filter.toSqlCondition();
	}

	public String getSql(dezcGridPager pager, dezcGridFilter filter) {
		return "select EMPNO_PW6K,'' as name,FRDATE_PW6K,GROUP_PW6K,FUNC_PW6K,HOLIDAY_PW6K,LUNCH_PW6K,DINNER_PW6K,UEMPNO_PW6K,UDATE_PW6K,TODATE_PW6K from pw.tbpw6k "
				+ conbineSQL(filter.getDsCom(),filter.getRequestMap()) + " order by UDATE_PW6K desc,UTIME_PW6K desc ";
	}

	protected Connection getConnection(dsjccom dsCom, dejc301 de301)
			throws SQLException {
		dejcAssert.notNull(dsCom,"dsCom cannot be null");
		dezcTransactionPool transPool = new dezcTransactionPool(dsCom);
		return transPool.getConnection(de301, "<%=sysId%>", "<%=tableName%>");
	}

	/**
	 * @param map
	 * @return
	 */
	private String conbineSQL(dsjccom dsCom,Map map) {
		String empNo = (String) map.get("empNo_qry");
		String orderDate = (String) map.get("orderDate_qry");
		if(dejcUtility.isNull(empNo) && dsCom!=null){
			dezcTransactionPool transPool = new dezcTransactionPool(dsCom);
			try{
				//dsCom紀錄的是GUSER_ID_DSPX，需轉成EMP_NO_DSPX
				empNo = new pwjcDSLink(dsCom).getEmpNoByGuserId(transPool,dsCom.user.ID);
			}finally{
				transPool.closeAll();
			}
		}
		if(dejcUtility.isNull(orderDate) ){
			orderDate = new dejc308().getCrntDateWFmt1();
		}
		String str = " Where empno_pw6k='"+empNo+"' and TODATE_PW6K>='"+orderDate+"' ";
		return str;
	}

	protected String[] onAfterQuery(dsjccom dsCom, String[] cellDatas) {
		pwjcDSLink dsLink = new pwjcDSLink(dsCom);
		dezcTransactionPool transPool = new dezcTransactionPool(dsCom);
		try{
			cellDatas[1] = dsLink.getEmpName(transPool, cellDatas[0]);//姓名
			cellDatas[2] = pwjcTool.getDateLFmt2(cellDatas[2])+"-"+pwjcTool.getDateLFmt2(cellDatas[10]);//訂餐日期
			cellDatas[4] = getFuncName(cellDatas[4]);
			cellDatas[5] = getHol(cellDatas[5]);
			cellDatas[6] = cellDatas[6].replaceAll(" ", "*");
			cellDatas[7] = cellDatas[7].replaceAll(" ", "*");
			cellDatas[8] = cellDatas[8]+" "+dsLink.getEmpName(transPool, cellDatas[8]);
			cellDatas[9] = pwjcTool.getDateLFmt2(cellDatas[9]);//日期
		}finally{
			transPool.closeAll();
		}
		return cellDatas;
	}

	private String getHol(String hol) {//HOLIDAY_PW6K。1-否，2-是
		if(hol.equals("1")){
			return "否";
		} else if(hol.equals("2")){
			return "是";
		}
		return hol;
	}

	private String getFuncName(String func) {
		//N:訂購 D:刪除
		if(func.equals("N")){
			return "訂購";
		} else if(func.equals("D")){
			return "刪除";
		}
		return func;
	}

	public void renderLayout(dezcTriggerLayout layout) {
	}
}
package com.icsc.<%=func.sysId%>.func ;
import com.icsc.<%=func.sysId%>.dao.* ;

/**
 * Controller of [<%= spec.id %>] <%= spec.name %>
 * <pre>
<%for(var i=0;i<spec.statements.length;i++){ -%>
 *<%=spec.statements[i]%>
<%} -%>
 * </pre>
 * @url  <a href="<%=ui.url%>"><%=ui.url%></a>
 * @uiFile <%=ui.fileName%> 
 */
public class <%= func.clz %> extends dezcFunctionalController {
	public final static String VERSION="$Id" ;
<% for (var i=0;i<vos.length;i++) { -%>
	private <%- vos[i].memberType %> <%= vos[i].id %> ;
<% } %>
	/**
<%for(var i=0;i<func.init.statements.length;i++){ -%> 
	 *<%=func.init.statements[i]%>
<%} -%>
	 */
	public void init(String method) {		
		if (method.matches("<%= func.getTransacMethodPtn() %>")) {
			this.getInfoInData();
		}
	}
	/**
	 *抓畫面資料
	 */
	private void getInfoInData() {
<% for (var i=0;i<vos.length;i++) { -%> 
		this.<%= vos[i].id %> = <%- vos[i].infoInGetData() %> ; 
<% } -%>
	}	
	/**
	 * 驗證輸入值
	 * <pre>
<% for(var i=0;i<func.validate.validateSpec.length;i++) { -%>
 	 * <%=func.validate.validateSpec[i]%>
<%} -%>
	 * </pre>
	 */
	protected void validateAction(String method) {
<% for(var i=0;i<func.validate.valMths.length;i++) { -%>
		if (method.matches("<%= func.validate.valMths[i].matchPtn %>")) {
<% for (var j=0;j<func.validate.valMths[i].spec.length;j++)	{ -%>
			// <%= func.validate.valMths[i].spec[j] %>
<% } -%>
		}
<% } -%>
	}
<%  var methods=func.getMethods();
	for (var i=0;i<methods.length;i++) { -%> 
	/**
	 * <%= methods[i].descript %>
	 * <pre>
<%
var states=methods[i].specification;
for(var j=0;j<states.length;j++){ -%>
 	 * <%=states[j]%>
<%} -%>
	 * </pre>
	 */
	<%=methods[i].modifier%> <%-methods[i].rtn%> <%- methods[i].methodDeclaration %> {
		dezcTransactionPool transPool=this.readyTransactionPool();
<% for (var j=0;j<vos.length;j++) { -%>
		<%= vos[j].daoClz %> <%= vos[j].daoObj %> = new <%= vos[j].daoClz %>(dsCom, transPool) ;
<% } -%>
		// todo <%= methods[i].descript %>
	}
<% } -%>

	/**
	 * 設定畫面資料
	 */
	private void setInfoOutData() {
<% vos.forEach(function(vo){ -%> 
		<%-vo.infoOutSetData()%> ;
<% }) -%>
	}

	public void end(String method){
<% func.funcEnd.statements.forEach(function(line){ -%>
	// <%= line %>
<% }) -%>
		setInfoOutData() ;
	// infoOut.enableBtns("$btnId1,$btnId2", true) ; enable 多個 btns
	}
}
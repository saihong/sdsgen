<%
var func = sds.func,
	spec = sds.spec,
	vos = func.getVOs() ;
%>
package com.icsc.<%=func.sysId%>.func ;
<% for (var i=0;i<vos.length;i++) { % 
import com.icsc.<%= func.sysId %>.dao.<%= vos[i].voClz %>;
import com.icsc.<%= func.sysId %>.dao.<%= vos[i].daoClz %>;
<% } %>
/**
 * Controller of [<%= spec.id %>] <%= spec.name %>
 * <pre>
<%for(var i=0;i<spec.statements.length;i++){%>
 * <%=spec.statements[i]%>
<%}%> 
 * </pre>
 */
public class <%= func.clz %> extends dezcFunctionalController {
	public final static String VERSION="$Id" ;
<% for (var i=0;i<vos.length;i++) {%> 
	private <%= vos[i].voClz %> <%= vos[i].id %> ;
<% } %>
	/**
<%
var states=func.init.statements;
for(var i=0;i<states.length;i++){%>
 	* <%=states[i]%>
<%}%> 
	*/
	public void init(String method) {		
		if (method.matches("<%= func.getTransacMethodPtn() %>")) {
			this.getInfoInData();
		}
	}

	private void getInfoInData() {
<% for (var i=0;i<vos.length;i++) {%> 
		this.<%= vos[i].id %>=<%= vos[i].infoInGetData() %> ;
<% } %>
	}	
	/**
	 * 驗證輸入值
	 * <pre>
<% var states=func.validate.validateSpec;
for(var i=0;i<states.length;i++){%>
 	 * <%=states[i]%>
<%}%> 	 
	 * </pre>
	 */
	protected void validateAction(String method) {
<% for(var i=0;i<func.validate.actions;i++) {%>
		if (method.matches("<%= func.validate[i].condition %>")) {
			<%= func.validate[i].spec %>
		}
<% } %>
	}

<%  var methods=func.getMethods();
	for (var i=0;i<methods.length;i++) { %> 
	/*
	 * <%= methods[i].title %>
	 * <pre>
<%
var states=methods[i].specification;
for(var i=0;i<states.length;i++){%>
 	 * <%=states[i]%>
<%}%> 
	 * </pre>
	 */
	public void <%= methods[i].declaration %> {
		dezcTransactionPool transPool=this.readyTransactionPool();
	<% for (var j=0;j<vos.length;j++) %>
		<%= vos[j].daoClz %> <%= vos[j].daoObj %> = new <%= vos[j].daoClz %>(dsCom, transPool) ;
	<% } %>
<% } %>

	/**
	 * 過去每個 action 都要寫 try { ... } catch (Exception e) {... } finally {...}，
	 * 現在都由底層做掉了，不過若 AP 想自己處理 catch(Exception e) 的區塊邏輯，可以覆寫此方法，在每個 action 的 catch 都會呼叫這個方法
	 * 傳入的 action 是當次的「方法名稱」，讓我們能依不同方法來做差別處理。
	 * @param e
	 * @param method
	 */
	protected void handleException(Exception e, String method) {
		 
	}
	/**
	 * 過去每個 action 都要寫 try { ... } catch (Exception e) {... } finally {...}，
	 * 現在都由底層做掉了，不過若 AP 想自己 Handle finally block 的內容，可以覆寫此方法，在每個 action 的 finally 都會呼叫這個方法
	 * 傳入的 action 是當次的「方法名稱」，讓我們能依不同方法來做差別處理。
	 */
	public void finallyCall(String method) {
		 if ( "delete".equals(method)) {
			 // do some stuff in method "delete"  finally block.
		 }
	}

	public void end(String method){

	}
}
package com.icsc.sc.rpt;
///////////////////////////////////////////////////////////////////////////////
// 本資料為中冠資訊專有之財產，非經書面許可，不准透露或使用本資料，亦不准
// 複印、複製或轉變成任何其它形式使用。
// The information contained herein is the exclusive property of ICSC and
// shall not be distributed, reproduced, or disclosed in whole or in part
// without prior written permission of ICSC.
// Copyright (C) 2014/9/10  InfoChamp System Co.
////////////////////////////////////////////////////////////////////////////////

import com.icsc.dpms.de.dejcAssert;
import com.icsc.dpms.de.dez.structs.func.dezcTransactionPool;
import com.icsc.dpms.dq.pool.threadPool.core.dqjcRunJob;
import com.icsc.dpms.ds.dsjccom;
import com.icsc.<%=sysId%>.link.<%=sysId%>jcLinkDR;
import org.apache.commons.beanutils.MethodUtils;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;

/**
 * User: I20496
 * Date: 2014/9/10
 * Time: 下午 03:03
 * @author: $Id$
 */
public class <%=sysId%>jcRptRunner extends dqjcRunJob {
    private final static String PARAM_RPT_CLASS = ".ReportClass";

    @Override
    public void run() { // for online submit batch
        dsjccom dsCom = getDscom();
        Map para = (Map) getObject();
        dejcAssert.notNull(para, "No param<Map> found in online submit batch!");

        String rptClz = (String) para.get(PARAM_RPT_CLASS);
        dejcAssert.notNull(rptClz, "No param[" + PARAM_RPT_CLASS + "] found in param Map.");

        dezcTransactionPool pool = new dezcTransactionPool(dsCom, rptClz);
        try {
            doMyLogic(dsCom,para, pool, rptClz);
        } finally {
            pool.closeAll();
        }
    }

    /**
     * 線上同步產製報表用
     * @param dsCom
     * @param rptClass 單純class name，不必 package name，如: <%=sysId%>jcRptB01
     */
    public File genRptFile(dsjccom dsCom,String rptClass, Map param) {
        return doGenRpt(dsCom, rptClass, param);
    }

    /**
     * 線上同步產製報表用
     * @param dsCom
     * @param rptClass
     * @return 可供下載的報表路徑
     */
    public String genRptUrl(dsjccom dsCom, String rptClass, Map param) {
        File file = doGenRpt(dsCom, rptClass, param);
        return file.getAbsolutePath().replaceFirst("^.+[\\\\/]public[\\\\/]","/erp/public/").replaceAll("\\\\","/") ;
    }

    private File doGenRpt(dsjccom dsCom, String rptClass, Map param) {
        dezcTransactionPool pool = new dezcTransactionPool(dsCom, rptClass);
        try {
            return doMyLogic(dsCom, param, pool, rptClass);
        } finally {
            pool.closeAll();
        }
    }

    private Object newInstance(String rptClass) {
        try {
            String clz = getFullRptClassName(rptClass);
            Class<?> aClass = Class.forName(clz);
            return aClass.newInstance();
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        }
    }

    private String getFullRptClassName(String rptClass) {
        return "com.icsc.<%=sysId%>.rpt." + rptClass;
    }

    // for 定時啟動
    public void run(dsjccom dsCom, String rptClass) {
        dezcTransactionPool pool = new dezcTransactionPool(dsCom, rptClass);
        try {
            doMyLogic(dsCom, null, pool, rptClass);
        } finally {
            pool.closeAll();
        }
    }

    private File doMyLogic(dsjccom dsCom, Map param, dezcTransactionPool pool, String rptClass) {
        Object rptObj = newInstance(rptClass);
        Object rtn = null ;
        try {
            if(param==null){
                rtn = MethodUtils.invokeExactMethod(rptObj, "execute", new Object[]{});
            } else {
                rtn = MethodUtils.invokeExactMethod(rptObj, "execute",new Object[]{param}, new Class[]{Map.class});
            }
            dejcAssert.notNull(rtn, rptClass + ".execute() must return a File!");
            if (!(rtn instanceof File)) {
                throw new IllegalArgumentException(rptObj.getClass().getName() + ".execute() must return File.");
            }
            File rptFile=(File) rtn ;
            <%=sysId%>jcRptInfo rptInfo = rptObj.getClass().getAnnotation(<%=sysId%>jcRptInfo.class);
            new <%=sysId%>jcLinkDR(dsCom, pool).importDR(rptInfo.rptNo(), rptFile, rptInfo.descript());
            return rptFile;
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e.getTargetException());
        } catch (Exception e) {
            throw new RuntimeException("exception in import DR:" + e);
        }

    }

}

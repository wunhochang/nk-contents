import React, { Component } from 'react';
import cookie from 'react-cookies';

import { Window, TextField, Button, Container, Grid, Panel } from '@extjs/reactor/classic';

export function createContextMenu() {
  return new Ext.menu.Menu({
          //id: 'contextmenuup',
          itemId: 'contextmenuup',
          excelName: new Object(),
          hasGrid: new Object(),
          gridstateid: new Object(),
          initialColumns: new Object(),

          listners: {
              hide: function () {
                  delete this.targetRecord;
              }
          },
          items: [
              {
                  text: '새로고침',
                  iconCls: 'fa fa-1x fa-refresh',
                  handler: function () {
                      //debugger;
                      var grid = this.up('menu').hasGrid;
                      //grid.store.load();
                      grid.getStore().reload({
                          callback: Ext.emptyFn
                      });
                      //grid.store.refresh();
                  }
              },
              // {
              //     text: '화면 엑셀다운로드',
              //     iconCls: 'fa fa-1x fa-file-excel-o',
              //     handler: function () {
              //         var grid = this.up('menu').hasGrid,
              //             stateColumns = this.up('menu').stateColumns,
              //             colManager = grid.columnManager,
              //             ct, cols;
              //         /*화면과 동일한 엑셀다운로드 설정시*/
              //         if (!stateColumns) {
              //             stateColumns = [];
              //             if (colManager && colManager.headerCt) {
              //                 ct = colManager.headerCt;
              //                 stateColumns = Ext.Array.merge(stateColumns, ct.getVisibleGridColumns());
              //             }
              //             if (colManager && colManager.secondHeaderCt) {
              //                 ct = colManager.secondHeaderCt;
              //                 stateColumns = Ext.Array.merge(stateColumns, ct.getVisibleGridColumns());
              //             }
              //         }
              //         var url = this.up('menu').url || getExcelDownloadURL(grid.store.config.proxy.url);
              //         var excelcolumns = [];
              //         var idx = 0;
              //
              //         /*Grid화면과 동일하게 보여주기위해서 getState()에서 처리한것과 동일한 방법으로 체크한다.*/
              //         var len = stateColumns.length - 1;
              //         if (len > 0) {
              //             //debugger;
              //             Ext.each(stateColumns, function (column) {
              //                 var data_index = column.dataIndex;
              //                 if (column.type == 'FILEUPLOAD' || column.type == 'BUTTON') {
              //                     column.isExcel = false;
              //                 }
              //                 if (column.dataIndex) {
              //                     if (column.isExcel) {
              //                         if (column.type == 'COMBO') {
              //                             if (data_index.toUpperCase().endsWith('_NO')) {
              //                                 data_index = data_index.substring(0, (data_index.length - '_NO'.length));
              //                             }
              //                             else if (data_index.toUpperCase().endsWith('_CODE')) {
              //                                 data_index = data_index.substring(0, (data_index.length - '_CODE'.length));
              //                             }
              //                             data_index += '_name';
              //                         }
              //                         if (data_index.toUpperCase().endsWith('_YN')
              //                             || data_index.toUpperCase().endsWith('_FLAG')
              //                             || data_index.toUpperCase().endsWith('_TYPE')
              //                         ) {
              //                             data_index += '_name';
              //                         }
              //                         var excelcolumn = {
              //                             Index: idx++,
              //                             ColumnName: column.exceltitle || strip_tags(column.text, ""),
              //                             DataIndex: data_index
              //                         };
              //                         excelcolumns.push(excelcolumn);
              //                     }
              //                 }
              //             })
              //         }
              //         else {
              //             alert("엑셀다운로드 할 정보가 없습니다.");
              //             return;
              //         }
              //
              //         var requestParams = grid.store.proxy.extraParams;
              //         /*grid의 추가 정보를 받는 부분*/
              //         var addParam = grid.up().down('form').getValues();
              //         //var addParam = new Array();
              //         if(grid.addParam != null && typeof(grid.addParam) != 'undefined'){
              //           addParam = grid.addParam;
              //         }
              //         var thisdate = Ext.Date.format(new Date(), 'ymdHis');
              //         var excelName = grid.excelName || grid.up('[region=center]').excelName|| 'data.xlsx';
              //         Ext.apply(requestParams, {
              //             excelcolumns: Ext.util.JSON.encode(excelcolumns),
              //             excelname: excelName,
              //             excelmakedate: thisdate,
              //             user_name: AuthUtil.Genone.Common.userInfo.user_name,
              //             oper_user_name: AuthUtil.Genone.Common.userInfo.user_name
              //         }, addParam);
              //         $.fileDownload(url, {
              //             httpMethod: "POST",
              //             data: requestParams,
              //             prepareCallback: function () {
              //                 //Ext.example.msg('알림', '엑셀 다운로드를 위한 데이터를 작성중입니다.');
              //             },
              //             successCallback: function () {
              //                 //Ext.example.msg('알림', '데이터 작성을 완료 하였습니다.');
              //             },
              //             failCallback: function (html) {
              //                 alert(html);
              //             }
              //         });
              //     }
              // },
              // {
              //     text: '전체 엑셀다운로드',
              //     iconCls: 'fa fa-1x fa-file-excel-o',
              //     handler: function () {
              //
              //         var grid = this.up('menu').hasGrid;
              //         var cols = this.up('menu').initialColumns;
              //         var stateColumns = this.up('menu').stateColumns;
              //         /*화면과 동일한 엑셀다운로드 설정시*/
              //         var url = this.up('menu').url || getExcelDownloadURL(grid.store.config.proxy.url);
              //         var excelcolumns = [];
              //         var columns = grid.headerCt.getVisibleGridColumns();
              //         var idx = 0;
              //         var len = cols.length;
              //         if (len > 0) {
              //             /*Locked된 컬럼 처리 부분*/
              //             for (var i = 0; i < len; i++) {
              //                 var col = cols[i];
              //                 if (col != null) {
              //                     if (typeof col.dataIndex != 'undefined' && col.dataIndex != "") {
              //                         var data_index = col.dataIndex;
              //                         if (col.type == 'FILEUPLOAD' || col.type == 'BUTTON') {
              //                             col.isExcel = false;
              //                         }
              //                         if (col.isExcel) {
              //                             if (col.type == 'COMBO') {
              //                                 if (data_index.toUpperCase().endsWith('_NO')) {
              //                                     data_index = data_index.substring(0, (data_index.length - '_NO'.length));
              //                                 }
              //                                 else if (data_index.toUpperCase().endsWith('_CODE')) {
              //                                     data_index = data_index.substring(0, (data_index.length - '_CODE'.length));
              //                                 }
              //                                 data_index += '_name';
              //                             }
              //                             if (data_index.toUpperCase().endsWith('_YN')
              //                                 || data_index.toUpperCase().endsWith('_FLAG')
              //                                 || data_index.toUpperCase().endsWith('_TYPE')
              //                             ) {
              //                                 data_index += '_name';
              //                             }
              //
              //                             var excelcolumn = {
              //                                 Index: idx++,
              //                                 ColumnName: col.exceltitle || strip_tags(col.text, ""),
              //                                 DataIndex: data_index
              //                             }
              //                             excelcolumns.push(excelcolumn);
              //                         }
              //                     }
              //                 }
              //             }
              //
              //         }
              //         else {
              //             alert("엑셀다운로드 할 정보가 없습니다.");
              //             return;
              //         }
              //
              //         var requestParams = grid.store.proxy.extraParams;
              //         /*grid의 추가 정보를 받는 부분*/
              //         //var addParam = new Array();
              //         var addParam = grid.up().down('form').getValues();
              //         if(grid.addParam != null && typeof(grid.addParam) != 'undefined'){
              //           addParam = grid.addParam;
              //         }
              //         var d = new Date();
              //         var thisdate = Ext.Date.format(new Date(), 'ymdHis');
              //         var excelName = grid.excelName || grid.up('[region=center]').excelName|| 'data.xlsx';
              //         Ext.apply(requestParams, {
              //             excelcolumns: Ext.util.JSON.encode(excelcolumns),
              //             excelname: excelName,
              //             excelmakedate: thisdate,
              //             user_name: AuthUtil.Genone.Common.userInfo.user_name,
              //             oper_user_name: AuthUtil.Genone.Common.userInfo.user_name
              //         }, addParam);
              //
              //         $.fileDownload(url, {
              //             httpMethod: "POST",
              //             data: requestParams,
              //             prepareCallback: function () {
              //                 //Ext.example.msg('알림', '엑셀 다운로드를 위한 데이터를 작성중입니다.');
              //             },
              //             successCallback: function () {
              //                 //Ext.example.msg('알림', '데이터 작성을 완료 하였습니다.');
              //             },
              //             failCallback: function (html) {
              //                 alert(html);
              //             }
              //         });
              //     }
              // },
              {
                  text: '컬럼재설정',
                  iconCls: 'fa fa-1x fa-retweet',
                  handler: function () {
                      console.log('컬럼재설정')
                      var grid = this.up('menu').hasGrid,
                          me = grid,
                          columns = Ext.clone((grid.columns || []));
                          Ext.state.Manager.clear(grid.getStateId());
                          grid.store.sorters.clear();
                          grid.reconfigure(grid.getStore(), grid.initialConfig.columns);
                          grid.getView().refresh(true);
                  }
              }]
      });
}

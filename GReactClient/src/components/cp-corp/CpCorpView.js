import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

import CpCorpFormView from './CpCorpFormView';
import CpToSpCorpGroupView from './CpToSpCorpGroupView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
var g_proxy = null;
export default class CpCorpView extends Component {
  state = {
    isOpen:false,
    isOpenSpCorp:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  storeReload = () =>{
    if(cookie.load('token') != null){
      this.setState({ Authorization: cookie.load('token') });
    }
    this.store.proxy.setHeaders({'Content-Type': 'application/json;charset=UTF-8;','Authorization': this.state.Authorization });
    this.mainDataStoreLoad();
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/CpCorp/GetList`,
        actionMethods: {
            read: "GET"
        },
        extraParams: {
        },
        paramsAsJson: true,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'count'
        },
        storeReload:this.storeReload,
        listeners: {
              exception: function(proxy, response, options){
                g_proxy = proxy;
                if(response.status == 401 && response.statusText == 'Unauthorized'){
                  var rts = refreshToken(function(status){
                      if(status=='OK'){
                        g_proxy.storeReload();
                      }
                      else{
                        cookie.remove('token', { path: '/' });
                        cookie.remove('user', { path: '/' });
                        window.location.href = `${CLIENT_ROOT_URL}/login`;
                      }
                  });
                }
                else{
                  cookie.remove('token', { path: '/' });
                  cookie.remove('user', { path: '/' });
                  window.location.href = `${CLIENT_ROOT_URL}/login`;
                }
            }
        }
    }
  });
  search_useyn_store = Ext.create('Ext.data.Store', {
          fields: [
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/CommonCode/GetComboList`,
              actionMethods: {
                  read: "GET"
              },
              paramsAsJson: true,
              reader: {
                  type: 'json',
                  rootProperty: 'data',
                  totalProperty: 'count'
              }
          },
          listeners: {
            exception: function(proxy, response, options){
            }
          }
  });
  componentWillMount(){
    this.initPrevStoreLoad();
  }
  componentDidMount(){
    this.mainDataStoreLoad();
  }
  initPrevStoreLoad = () => {
    const me = this,
          params = Ext.apply({}, {type_name:'USE_YN'});
    this.search_useyn_store.removeAll();
    this.search_useyn_store.load({
        params:{condition:JSON.stringify(params)},
        callback: function (recs, operation, success) {
          me.search_useyn_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'USE_YN'});
        }
    });
  }
  mainDataStoreLoad = () => {
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      store = grid.getStore(),
      form = header_grid.down('form'),
      formValue = form.getValues();
    const params = Ext.apply({}, formValue);
    store.getProxy().setExtraParams({condition:JSON.stringify(params)});
    store.currentPage = 1;
    this.store.load({
        params:{condition:JSON.stringify(params)},
        scope: this,
        callback: function (recs, operation, success) {
          if(success == false && operation.error.status == '401'){
            var rts = refreshToken(function(status){
                if(status=='OK'){
                  me.setState({Authorization:cookie.load('token')});
                  me.initPrevStoreLoad()
                }
            });
            me.setState({pagingtoolbar:true});
          }
          else{
            const res = operation.getResponse();
            if(res!=null){
              const ret = Ext.decode(res.responseText),
                    totalCount = ret.count,
                    counter = header_grid.down('toolbar [code=counter]');

                    counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
                    // console.log(header_grid.down('toolbar [code=counter]'));
                    if(totalCount<pageSize){
                      me.setState({pagingtoolbar:false});
                    }
                    else{
                      me.setState({pagingtoolbar:true});
                    }
            }
          }
        }
    });
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  onClickSearch = (item) =>{
    this.mainDataStoreLoad();
  }
  onClickAdd = (item) =>{
    this.setState({isOpen:true, result:null});
  }
  onClickDelete = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          selection = grid.getSelection(),
          params = [],
          promiseList = [];
          if (Ext.isEmpty(selection)) {
              alert('선택된 정보가 없습니다.');
              return;
          }
          showConfirm({
              msg: 'CP사 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.cp_corp_no == 0 || itm.data.cp_corp_no == '' || itm.data.cp_corp_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/CpCorp/Delete/`+itm.data.cp_corp_no,
                          method: 'DELETE',
                          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
                          dataType: "json",
                          callback: function () {
                              res();
                          }
                      });
                     }));
                  }
                  Ext.Promise.all(promiseList).then(function () {
                      alert('정상적으로 삭제 되었습니다.');
                      me.mainDataStoreLoad();
                  });
                });
              }
          });
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = 'CP사_목록';

      ExcelDownload(grid, ExcelName);
  }
  showDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
      view.getSelectionModel().deselectAll();
      view.getSelectionModel().select(rowIdx, true);
      this.setState({isOpen:true, result:rec});
  }
  onClickSpCorp = (view, rowIdx, colIdx, actionItem, e, rec) =>{
    view.getSelectionModel().deselectAll();
    view.getSelectionModel().select(rowIdx, true);
    this.setState({isOpenSpCorp:true, result:rec});
  }
  onBeforeItemContextMenu = (view, rec, node, idx, eOpt) => {
    const {header_grid} = this.refs,
          grid = header_grid.down('grid');
          eOpt.stopEvent();
          grid.contextMenu.hasGrid = grid;
          grid.contextMenu.initialColumns = Ext.clone(grid.columnManager.getColumns());
          grid.contextMenu.showAt(eOpt.getXY());
  }
  showDisplayRefresh = () => {
    this.setState({ result: null, isOpen:false });
    this.mainDataStoreLoad();
  }
  rowspanAsActionRenderer = (value, meta, record, rowIndex, colIndex, store) =>{
    const {header_grid} = this.refs,
          grid = header_grid.down('grid');

    try {
            var groupKey = 'cp_corp_no';
              var getId = grid.columns[colIndex].dataIndex;
              console.log(getId)
            var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
            meta.style = 'background-color:transparent !important; opacity: 0;';
            if (meta.css == 'undefined') {
                meta.css = '';
            }
            meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
            if (first) {
                var i = rowIndex + 1;
                while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                    i++;
                }
                var rowHeight = 30, padding = 12,
                    height = (rowHeight * (i - rowIndex)) + 'px',
                    lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                    lineHeight = '14px';
                    meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
            }
            else{}
            return first ? value : '';
        }
        catch (err) { }
        finally { }
  }
  nonRowspanRenderer = (value, meta, record, rowIndex, colIndex, store) => {
    try {
        meta.style = 'border-bottom: 1px solid #EDEDED;';
        return value;
    }
    catch (err) { }
    finally { }
  }
  render(){
    const { pagingtoolbar, result, isOpen, isOpenSpCorp } = this.state;

    return(
      <Panel layout="fit">
        {/*CP업체 등록/수정 Form*/}
        { isOpen && (
            <CpCorpFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, isOpen:false })}/>
        )}
      {/*CP사 SP사 매핑 팝업*/}
      { isOpenSpCorp && (
            <CpToSpCorpGroupView
              result={result}
              onClose={() => this.setState({ result: null, isOpenSpCorp:false })}/>
        )}
        <Panel
           layout='fit'
           ref={'header_grid'}
           items={[{
             xtype:'grid',
             layout:'fit',
             viewConfig:{
                 enableTextSelection:true,
                 stripeRows:false,
                 emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                 deferEmptyText: false
             },
             plugins:[
                 {
                     ptype: 'cellediting',
                     clicksToEdit: 1
                 },
                 'gridfilters'
             ],
             stateId:'service-corp-cp-view',
             stateful:false,
             enableLocking:true,
             multiColumnSort:true,
             cls: 'grid-row-span',
             rowLines: false,
             bodyStyle : "background-color: transparent",
             lockable:true,
             selModel: {
                 type: 'checkboxmodel'
             },
             store:this.store,
             contextMenu: new createContextMenu,
             listeners : {
                //rowclick : this.onRowClick,
                beforeitemcontextmenu:this.onBeforeItemContextMenu
             },
             tbar:[{
                 xtype:'component',
                 code: 'counter',
                 html: '<strong>총: 0건</strong>'
               },'->',
               {
                 xtype:'button',
                 text:'<font color=white>조회</font>',
                 cls:'base-button-round',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickSearch
               },
               {
                 xtype:'button',
                 text:'<font color=white>등록</font>',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickAdd
               },
               {
                 xtype:'button',
                 text:'<font color=white>삭제</font>',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickDelete
               },
               {
                 xtype:'button',
                 text:'<font color=white>엑셀다운로드</font>',
                 tooltip:'엑셀다운로드',
                 //iconCls: 'fa fa-sign-out',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickExcelDownload
               }],
               columns:[
                 {
                   text: 'CP사 고유번호',
                   dataIndex: 'cp_corp_no',
                   type: 'TEXT',
                   width: 10,
                   hidden: true,
                   hideable: false,
                   isExcel: true,
                   align: 'center',
                   sortable:true,
                   style:'text-align:center',
                   filter: {
                       type: 'string'
                   }
                 },
                 {
                   text: 'CP사 특이사항고유번호',
                   dataIndex: 'cp_corp_no',
                   type: 'TEXT',
                   width: 10,
                   hidden: true,
                   hideable: false,
                   isExcel: true,
                   align: 'center',
                   sortable:true,
                   style:'text-align:center',
                   filter: {
                       type: 'string'
                   }
                 },
                 {
                    xtype: 'actioncolumn',
                    dataIndex: 'action_no',
                    text: '관리',
                    width: 50,
                    menuDisabled: true,
                    type: 'BUTTON',
                    tooltip: '열람 및 수정',
                    locked: true,
                    editable: false,
                    required:false,
                    align: 'center',
                    items: [{
                        iconCls: 'grid-edit-task',
                        handler: this.showDetailWindow
                    }]
                 },
                 {
                  xtype: 'actioncolumn',
                  dataIndex: 'action_no',
                  text: 'SP설정',
                  width: 65,
                  menuDisabled: true,
                  type: 'BUTTON',
                  tooltip: 'SP사 설정',
                  locked: true,
                  editable: false,
                  required:false,
                  align: 'center',
                  items: [{
                      iconCls: 'grid-edit-task',
                      handler: this.onClickSpCorp
                  }]
               },
                 {
                     text: '업체명',
                     dataIndex: 'cp_corp_name',
                     type: 'TEXT',
                     width: 200,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, meta, record, rowIndex, colIndex, store) {
                        var groupKey = 'cp_corp_no';
                        var getId="cp_corp_name";
                        var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                        last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
                        meta.style = 'background-color:transparent !important; opacity: 0;';
                        if (meta.css == 'undefined') {
                          meta.css = '';
                        }
                        meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
                        if (first) {
                          var i = rowIndex + 1;
                          while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                            i++;
                          }
                          var rowHeight = 30, padding = 12,
                          height = (rowHeight * (i - rowIndex)) + 'px',
                          lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                          lineHeight = '14px';
                          meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
                        }
                        else{}
                        var deviceDetail = record.get('cp_corp_name');
                        meta.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return first ? value : '';

                     }
                 },
                 {
                     text: '특이사항',
                     dataIndex: 'cp_corp_detail_name',
                     type: 'TEXT',
                     width: 200,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('cp_corp_detail_name');
                       metaData.style = 'border-bottom: 1px solid #EDEDED;';
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     }
                 },
                 {
                  text:'정산기준(총매출)',
                  align: 'center',
                  style:'text-align:center',
                  columns:[{
                      text: 'CP매출',
                      dataIndex: 'total_sales',
                      type: 'TEXT',
                      width: 80,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('total_sales');
                        metaData.style = 'border-bottom: 1px solid #EDEDED;';
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      }
                  },
                  {
                      text: 'NK매출',
                      dataIndex: 'nk_sales',
                      type: 'TEXT',
                      width: 80,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('nk_sales');
                        metaData.style = 'border-bottom: 1px solid #EDEDED;';
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      }
                  }]
              },
                 {
                     text:'계약요율(NK매출)',
                     align: 'center',
                     style:'text-align:center',
                     columns:[{
                         text: 'CP',
                         dataIndex: 'cp_contract_rate',
                         type: 'TEXT',
                         width: 80,
                         isExcel: true,
                         align: 'center',
                         style:'text-align:center',
                         renderer: function(value, metaData, record) {
                           var deviceDetail = record.get('cp_contract_rate');
                           metaData.style = 'border-bottom: 1px solid #EDEDED;';
                           metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                           return value;
                         }
                     },
                     {
                         text: 'NK',
                         dataIndex: 'nk_contract_rate',
                         type: 'TEXT',
                         width: 80,
                         isExcel: true,
                         align: 'center',
                         style:'text-align:center',
                         renderer: function(value, metaData, record) {
                           var deviceDetail = record.get('nk_contract_rate');
                           metaData.style = 'border-bottom: 1px solid #EDEDED;';
                           metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                           return value;
                         }
                     }]
                 },
                 {
                     text:'계약기간',
                     align: 'center',
                     xtype: 'datecolumn',
                     style:'text-align:center',
                     columns:[{
                         text: '계약시작일',
                         dataIndex: 'contract_st_date',
                         type: 'TEXT',
                         width: 120,
                         isExcel: true,
                         align: 'center',
                         style:'text-align:center',
                         renderer: function(value, metaData, record) {
                           var formated = Ext.util.Format.date(value, 'Y-m-d');
                           metaData.style = 'border-bottom: 1px solid #EDEDED;';
                           metaData.tdAttr = 'data-qtip="' + formated + '"';
                           return formated;
                         },
                         format: 'Y-m-d'
                     },
                     {
                         text: '계약종료일',
                         dataIndex: 'contract_ed_date',
                         xtype: 'datecolumn',
                         type: 'TEXT',
                         width: 120,
                         isExcel: true,
                         align: 'center',
                         style:'text-align:center',
                         renderer: function(value, metaData, record) {
                           var formated = Ext.util.Format.date(value, 'Y-m-d');
                           metaData.style = 'border-bottom: 1px solid #EDEDED;';
                           metaData.tdAttr = 'data-qtip="' + formated + '"';
                           return formated;
                         },
                         format: 'Y-m-d'
                     }]
                 },
                 {
                     text: '연장조건',
                     dataIndex: 'extend_condition',
                     type: 'TEXT',
                     width: 200,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('cp_corp_name');
                       metaData.style = 'border-bottom: 1px solid #EDEDED;';
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     }
                 },
                 {
                     text: '사업자명',
                     dataIndex: 'biz_operator_name',
                     type: 'TEXT',
                     width: 200,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, meta, record, rowIndex, colIndex, store) {
                       var groupKey = 'cp_corp_no';
                       var getId="biz_operator_name";
                       var deviceDetail = record.get('biz_operator_name');
                       var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                       last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
                       meta.style = 'background-color:transparent !important; opacity: 0;';
                       if (meta.css == 'undefined') {
                         meta.css = '';
                       }
                       meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
                       if (first) {
                         var i = rowIndex + 1;
                         while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                           i++;
                         }
                         var rowHeight = 30, padding = 12,
                         height = (rowHeight * (i - rowIndex)) + 'px',
                         lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                         lineHeight = '14px';
                         meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
                       }
                       else{}
                       meta.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return first ? value : '';
                     }
                 },
                 {
                     text: '사업자번호',
                     dataIndex: 'biz_operator_no',
                     type: 'TEXT',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, meta, record, rowIndex, colIndex, store) {
                       var groupKey = 'cp_corp_no';
                       var getId="biz_operator_no";
                       var deviceDetail = record.get('biz_operator_no');
                       var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                       last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
                       meta.style = 'background-color:transparent !important; opacity: 0;';
                       if (meta.css == 'undefined') {
                         meta.css = '';
                       }
                       meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
                       if (first) {
                         var i = rowIndex + 1;
                         while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                           i++;
                         }
                         var rowHeight = 30, padding = 12,
                         height = (rowHeight * (i - rowIndex)) + 'px',
                         lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                         lineHeight = '14px';
                         meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
                       }
                       else{}
                       meta.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return first ? value : '';
                     }
                 },
                 {
                     text: '대표자명',
                     dataIndex: 'representative_name',
                     type: 'TEXT',
                     width: 120,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, meta, record, rowIndex, colIndex, store) {
                       var groupKey = 'cp_corp_no';
                       var getId="representative_name";
                       var deviceDetail = record.get('representative_name');
                       var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                       last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
                       meta.style = 'background-color:transparent !important; opacity: 0;';
                       if (meta.css == 'undefined') {
                         meta.css = '';
                       }
                       meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
                       if (first) {
                         var i = rowIndex + 1;
                         while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                           i++;
                         }
                         var rowHeight = 30, padding = 12,
                         height = (rowHeight * (i - rowIndex)) + 'px',
                         lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                         lineHeight = '14px';
                         meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
                       }
                       else{}
                       meta.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return first ? value : '';
                     }
                 },
                 {
                      text: '사업장주소',
                      dataIndex: 'biz_operator_address',
                      type: 'TEXT',
                      width: 300,
                      isExcel: true,
                      align: 'left',
                      style:'text-align:center',
                      renderer: function(value, meta, record, rowIndex, colIndex, store) {
                        var groupKey = 'cp_corp_no';
                        var getId="biz_operator_address";
                        var deviceDetail = record.get('biz_operator_address');
                        var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                        last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
                        meta.style = 'background-color:transparent !important; opacity: 0;';
                        if (meta.css == 'undefined') {
                          meta.css = '';
                        }
                        meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
                        if (first) {
                          var i = rowIndex + 1;
                          while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                            i++;
                          }
                          var rowHeight = 30, padding = 12,
                          height = (rowHeight * (i - rowIndex)) + 'px',
                          lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                          lineHeight = '14px';
                          meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
                        }
                        else{}
                        meta.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return first ? value : '';
                      }
                 },
                 {
                     text: '세금계산서 EMAIL',
                     dataIndex: 'tax_email',
                     type: 'TEXT',
                     width: 160,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, meta, record, rowIndex, colIndex, store) {
                       var groupKey = 'cp_corp_no';
                       var getId="tax_email";
                       var deviceDetail = record.get('tax_email');
                       var first = !rowIndex || value !== store.getAt(rowIndex - 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex - 1).get(groupKey),
                       last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get(getId) || record.get(groupKey) !== store.getAt(rowIndex + 1).get(groupKey);
                       meta.style = 'background-color:transparent !important; opacity: 0;';
                       if (meta.css == 'undefined') {
                         meta.css = '';
                       }
                       meta.css += 'row-span' + (first ? ' row-span-first' : '') + (last ? ' row-span-last' : '');
                       if (first) {
                         var i = rowIndex + 1;
                         while (i < store.getCount() && value === store.getAt(i).get(getId) && record.get(groupKey) === store.getAt(i).get(groupKey)) {
                           i++;
                         }
                         var rowHeight = 30, padding = 12,
                         height = (rowHeight * (i - rowIndex)) + 'px',
                         lineHeight = (rowHeight * (i - rowIndex) - padding) + 'px';
                         lineHeight = '14px';
                         meta.style = 'height:' + height + ';line-height:' + lineHeight + ';';
                       }
                       else{}
                       meta.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return first ? value : '';
                     }
                 },
                 {
                     text: '사용여부',
                     dataIndex: 'use_yn_name',
                     type: 'TEXT',
                     width: 80,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('use_yn_name');
                       metaData.style = 'border-bottom: 1px solid #EDEDED;';
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     }
                 },
                 {
                     text: '등록자',
                     dataIndex: 'insert_user_no_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('insert_user_no_name');
                       metaData.style = 'border-bottom: 1px solid #EDEDED;';
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     }
                 },
                 {
                     text: '등록일시',
                     dataIndex: 'insert_date',
                     type: 'DATE',
                     dateFormat: 'Y-m-d H:i:s',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return value.replaceAll('T',' ');
                     }
                 },
                 {
                     text: '수정자',
                     dataIndex: 'update_user_no_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('update_user_no_name');
                       metaData.style = 'border-bottom: 1px solid #EDEDED;';
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     }
                 },
                 {
                     text: '수정일시',
                     dataIndex: 'update_date',
                     type: 'DATE',
                     dateFormat: 'Y-m-d H:i:s',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return value.replaceAll('T',' ');
                     }
                 }
               ],
               dockedItems:[
                 {
                     xtype: 'form',
                     dock: 'top',
                     width: '100%',
                     bodyPadding: '10 10 10 10',
                     border: false,
                     bodyStyle: 'background-color:#F1F1F1;;width:100%',
                     layout: {
                         type: 'vbox',
                         align: 'stretch'
                     },
                     items: [
                       {
                         xtype:'container',
                         layout: {
                             type: 'hbox',
                             align: 'stretch'
                         },
                         defaults: {
                             labelAlign: 'right',
                             labelWidth: 65,
                             //margin: '0 0 5 0'
                         },
                         items:[
                           {
                               xtype: 'textfield',
                               fieldLabel: '검색어',
                               emptyText: '업체명/특이사항/사업장명/사업자번호/대표자명',
                               flex:3,
                               name: 'searchtxt',
                               listeners:{
                                 specialkey:this.onSpecialKeySearch
                               }
                           },
                           {
                               xtype: 'combo',
                               fieldLabel: '사용여부',
                               flex:1,
                               name: 'use_yn',
                               displayField: 'type_data',
                               valueField: 'type_code',
                               hidden: false,
                               queryMode: 'local',
                               typeAhead: false,
                               emptyText: '선택',
                               editable: true,
                               forceSelection: false,
                               triggerAction: 'all',
                               selectOnFocus: true,
                               enableKeyEvents: true,
                               store:this.search_useyn_store
                           }
                         ]
                       }
                     ]
                 },
                 {
                   xtype: 'pagingtoolbar',
                   dock: 'bottom',
                   store:this.store,
                   displayInfo: true,
                   hidden:!pagingtoolbar
                 }
               ]
           }]}/>
      </Panel>
    )
  }
}

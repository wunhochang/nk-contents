import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

import UserFormView from './UserFormView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
export default class UserView extends Component {
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'user_no', type:'number' },
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/User/GetList`,
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
          }
  });
  user_confirm_yn_store = Ext.create('Ext.data.Store', {
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
          params1 = Ext.apply({}, {type_name:'USE_YN'}),
          params2 = Ext.apply({}, {type_name:'USER_CONFIRM_YN'});
    this.search_useyn_store.load({
        params:{condition:JSON.stringify(params1)},
        callback: function (recs, operation, success) {
          me.search_useyn_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'USE_YN'});
        }
    });
    this.user_confirm_yn_store.load({
        params:{condition:JSON.stringify(params2)},
        callback: function (recs, operation, success) {
          me.user_confirm_yn_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'USE_YN'});
        }
    });

  }
  mainDataStoreLoad = () => {
    const me = this,
      {header_grid} = this.refs,
      form = header_grid.down('form'),
      grid = header_grid.down('grid'),
      store = grid.getStore(),
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
  onClickInitPasswd = (item) =>{
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
              msg: '선택하신 사용자에 대한 비밀번호를 초기화 하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.user_no == 0 || itm.data.user_no == '' || itm.data.user_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/User/InitPasswd`,
                          method: 'POST',
                          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
                          params : paramsPostHandler(itm.data),
                          dataType: "json",
                          callback: function () {
                              res();
                          }
                      });
                     }));
                  }
                  Ext.Promise.all(promiseList).then(function () {
                      alert('정상적으로 비밀번호가 초기화 되었습니다.');
                      me.mainDataStoreLoad();
                  });
                });
              }
          });
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
              msg: '사용자 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.user_no == 0 || itm.data.user_no == '' || itm.data.user_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/User/Delete/`+itm.data.user_no,
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
      ExcelName = '사용자목록';

      ExcelDownload(grid, ExcelName);
  }
  showDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
      view.getSelectionModel().deselectAll();
      view.getSelectionModel().select(rowIdx, true);
      this.setState({isOpen:true, result:rec});
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
  render(){
    const { pagingtoolbar, result, isOpen, isOpenTag } = this.state;

    return(
      <Panel layout="fit">
        {/*사용자 등록/수정 Form*/}
        { isOpen && (
            <UserFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, isOpen:false })}/>
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
             stateId:'system-user-view',
             stateful:false,
             enableLocking:true,
             multiColumnSort:true,
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
                 text:'<font color=white>비밀번호초기화</font>',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickInitPasswd
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
                   text: '일련번호',
                   dataIndex: 'user_no',
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
                    type: 'BUTTON',
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
                     text: '아이디',
                     dataIndex: 'user_id',
                     type: 'TEXT',
                     width: 250,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('user_id');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                      text: '이름',
                      dataIndex: 'user_name',
                      type: 'TEXT',
                      width: 100,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('user_name');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                        type: 'string'
                      }
                 },
                 {
                     text: '연락처',
                     dataIndex: 'user_tel',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('user_tel11');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: 'Email',
                     dataIndex: 'user_email',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('user_email');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '역할명',
                     dataIndex: 'role_name',
                     type: 'TEXT',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('role_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '승인여부',
                     dataIndex: 'confirm_yn_name',
                     type: 'TEXT',
                     width: 80,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('confirm_yn_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
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
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
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
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '등록일시',
                     dataIndex: 'insert_datetime',
                     type: 'DATE',
                     dateFormat: 'Y-m-d H:i:s',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('insert_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'date'
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
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '수정일시',
                     dataIndex: 'update_datetime',
                     type: 'DATE',
                     dateFormat: 'Y-m-d H:i:s',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('update_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'date'
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
                               emptyText: '아이디/이름/연락처/Email',
                               flex:3,
                               name: 'searchtxt',
                               listeners:{
                                 specialkey:this.onSpecialKeySearch
                               }
                           },
                           {
                               xtype: 'combo',
                               fieldLabel: '승인여부',
                               flex:1,
                               name: 'confirm_yn',
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
                               store:this.user_confirm_yn_store
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

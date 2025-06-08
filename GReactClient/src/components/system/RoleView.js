import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
export default class RoleView extends Component {
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'role_no', type:'number' },
      { name: 'role_name', type:'string' },
      { name: 'role_code', type:'string' },
      { name: 'role_desc', type:'string' },
      { name: 'admin_flag', type:'boolean' },
      { name: 'output_order', type:'number', defaultValue:1 },
      { name: 'use_yn', type:'string', defaultValue:'Y' },
      { name: 'use_yn_name', type:'string' },
      //{ name: 'insert_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'insert_user_no', type:'string' },
      { name: 'insert_user_no_name', type:'string' },
      //{ name: 'update_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'update_user_no', type:'string' },
      { name: 'update_user_no_name', type:'string' }
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/Role/GetList`,
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

  grid_useyn_store = Ext.create('Ext.data.Store', {
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
          params = Ext.apply({}, {type_name:'USE_YN'});
    this.search_useyn_store.load({
        params:{condition:JSON.stringify(params)},
        callback: function (recs, operation, success) {
          me.search_useyn_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'USE_YN'});
        }
    });
    this.grid_useyn_store.load({
        params:{condition:JSON.stringify(params)},
        callback: function (recs, operation, success) {
        }
    });
  }
  mainDataStoreLoad = () => {
    //console.log(this.state.Authorization);
    const me = this,
      {header_grid} = this.refs,
      form = header_grid.down('form'),
      grid = header_grid.down('grid'),
      store = grid.getStore(),
      formValue = form.getValues();
    const params = Ext.apply({}, formValue);
    // var extraparams = [],
    //     params = Ext.apply({}, form.getValues(), values);
    store.getProxy().setExtraParams({condition:JSON.stringify(params)});
    store.currentPage = 1;
    store.load({
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
                      // console.log(header_grid)
                    // console.log(header_grid.down('toolbar [code=counter]'));
                    if(totalCount<pageSize){
                      me.setState({pagingtoolbar:true});
                    }
                    else{
                      me.setState({pagingtoolbar:false});
                    }
            }
          }
        }
    });
  }
  onClickSearch = (item) => {
    this.mainDataStoreLoad();
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  onClickAdd = (item) => {
    this.store.insert(0, this.store.createModel({}));
    // const {header_grid} = this.refs,
    //   grid = header_grid.down('grid'),
    //   store = grid.getStore();
    //   store.insert(0, store.createModel({}));
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = '공통코드목록';

      ExcelDownload(grid, ExcelName);
  }
  onClickSave = (item) => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          process_store = store.getModifiedRecords();

    var promiseList = [],
        params = [],
        errorCheck1 = 0;

        if(process_store.length == 0){
          alert('저장할 데이터가 없습니다.');
          return;
        }
        else{
          Ext.each(process_store, function (itm) {
            if(itm.phantom == true || itm.dirty == true){
              if(itm.data.role_name ==''){
                errorCheck1++;
              }
              if(itm.data.admin_flag==true){
                itm.data.admin_flag='Y';
              }
              else{
                itm.data.admin_flag='N';
              }
              params.push(itm);
            }
          });
          if(errorCheck1>0){
            alert('역할명을 입력해주세요.');
            return;
          }

          showConfirm({
            msg: '작성하신 역할 정보를 저장하시겠습니까?',
            title:'확인',
            callback: function () {
              Ext.each(params, function (itm) {
                promiseList.push(new Ext.Promise(function (res) {
                  Ext.Ajax.request({
                      url: `${API_URL}/Role/Save`,
                      method: 'POST',
                      headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
                      params : paramsPostHandler(itm.data),
                      dataType: "json",
                      callback: function () {
                          res();
                      }
                  });
                 }));
              });
              Ext.Promise.all(promiseList).then(function () {
                  alert('정상적으로 저장되었습니다.');
                  me.mainDataStoreLoad();
              });
            }
          });
        }
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
              msg: '역할 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.role_no == 0 || itm.data.role_no == '' || itm.data.role_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/Role/Delete/`+itm.data.role_no,
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
  onClickDownload = (item) => {
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

  rendererUse = (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.grid_useyn_store.findExact('type_code', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.grid_useyn_store.getAt(recordIndex).get('type_data');
  }
  render(){
    const { pagingtoolbar, result, isOpen } = this.state;

    return(
      <Panel layout="fit">
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
             stateId:'master-role-view',
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
                 text:'<font color=white>추가</font>',
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
                 text:'<font color=white>저장</font>',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickSave
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
                   dataIndex: 'role_no',
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
                     text: '<font color=red>*</font><font color=blue>역할명</font>',
                     dataIndex: 'role_name',
                     type: 'TEXT',
                     width: 140,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     required: true,
                     editor: {
                          allowBlank: true
                     },
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
                      text: '<font color=blue>역할코드</font>',
                      dataIndex: 'role_code',
                      type: 'TEXT',
                      width: 140,
                      isExcel: true,
                      align: 'left',
                      style:'text-align:center',
                      editor: {
                           allowBlank: true
                      },
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('role_code');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                        type: 'string'
                      }
                 },
                 {
                     text: '관리자여부',
                     xtype: 'checkcolumn',
                     dataIndex: 'admin_flag',
                     width: 100,
                     editable: false,
                     align: 'center',
                     isExcel: true,
                     stopSelection: false,
                     inputValue: 'Y',
                     uncheckedValue: 'N',
                     disabled:false
                 },
                 {
                     text: '<font color=blue>사용여부</font>',
                     dataIndex: 'use_yn',
                     type: 'COMBO',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     value: 'Y',
                     style:'text-align:center',
                     editor: {
                          xtype: 'combobox',
                          emptyText: '선택',
                          displayField: 'type_data',
                          valueField: 'type_code',
                          queryMode: 'local',
                          typeAhead: false,
                          editable: true,
                          enableKeyEvents: true,
                          forceSelection: false,
                          triggerAction: 'all',
                          selectOnFocus: false,
                          store:this.grid_useyn_store
                     },
                     renderer: this.rendererUse
                 },
                 {
                      text: '<font color=blue>정렬</font>',
                      dataIndex: 'output_order',
                      type: 'NUMBER',
                      width: 100,
                      isExcel: true,
                      editable: true,
                      align: 'right',
                      style:'text-align:center',
                      editor: {
                          xtype: 'numberfield'
                      }
                  },
                  {
                     text: '<font color=blue>비고</font>',
                     style: 'text-align:center;',
                     dataIndex: 'role_desc',
                     type: 'TEXT',
                     editable: true,
                     width: 200,
                     required: false,
                     isExcel: true,
                     editor: {
                         allowBlank: true
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
                     dataIndex: 'insert_date',
                     //type: 'DATE',
                     //dateFormat: 'Y-m-d H:i:s',
                     type:'TEXT',
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
                     dataIndex: 'update_date',
                     //type: 'DATE',
                     //dateFormat: 'Y-m-d H:i:s',
                     type:'TEXT',
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
                               emptyText: '역할명/역할코드 ',
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

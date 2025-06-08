import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';

import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {monthfield} from '../../utils/MonthPicker';

import {createContextMenu} from '../../utils/GridContextMenu';

import AccountingUploadFormView from './AccountingUploadFormView';
import AccountingVerifyFormView from './AccountingVerifyFormView';
import AccountingEndDateFormView from './AccountingEndDateFormView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);

export default class AccountingUploadView extends Component {
  state = {
    isOpen:false,
    isOpenVerify:false,
    isOpenAccountingEndDate:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true,
    accounting_end_date : '마감일자 정보가 없습니다.'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'settlement_summary_no', type:'number' },
      { name: 'sp_corp_detail_no', type:'number' },
      { name: 'settlement_title', type:'string' },
      { name: 'settlement_date', type:'string' },
      { name: 'status', type:'string' },
      { name: 'total_sales_price', type:'string' },
      { name: 'accounting_rates', type:'string' },
      { name: 'total_accounting_price', type:'string' },
      { name: 'total_accounting_cp_price', type:'string' },
      { name: 'use_yn', type:'string' },
      { name: 'use_yn_name', type:'string' },
      //{ name: 'insert_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'insert_user_no', type:'string' },
      { name: 'insert_user_no_name', type:'string' },
      //{ name: 'updaet_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'updaet_user_no', type:'string' },
      { name: 'updaet_user_no_name', type:'string' }
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/AccountingSummary/GetList`,
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
  search_settlement_process_store= Ext.create('Ext.data.Store', {
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
  search_accounting_type_store= Ext.create('Ext.data.Store', {
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
  accounting_end_date_store = Ext.create('Ext.data.Store', {
        fields: [
        ],
        pageSize: null,
        remoteSort : true,
        proxy: {
            type: 'ajax',
            method: 'GET',
            headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
            url: `${API_URL}/AccountingEndDate/GetTop1List`,
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
    const me = this,
      params = Ext.apply({}, {type_name:'SETTLEMENT_PROCESS_TYPE'}),
      params1 = Ext.apply({}, {type_name:'ACCOUNTING_TYPE'});
    this.search_settlement_process_store.load({
        params:{condition:JSON.stringify(params)},
        callback: function (recs, operation, success) {
          me.search_settlement_process_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'SETTLEMENT_PROCESS_TYPE'});
        }
    });
    this.search_accounting_type_store.load({
        params:{condition:JSON.stringify(params1)},
        callback: function (recs, operation, success) {
          me.search_accounting_type_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'ACCOUNGINT_TYPE'});
        }
    });
  }
  componentDidMount(){
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          param = Ext.apply({}, {gubun:'SP'});
    this.accounting_end_date_store.load({
        params:{condition:JSON.stringify(param)},
        callback: function (recs, operation, success) {
          const res = operation.getResponse();
          if(res!=null){
            const ret = Ext.decode(res.responseText);
            if(ret.data.length>0){
              me.setState({accounting_end_date:ret.data[0].end_date});
              var accounting_end_date = header_grid.down('toolbar [code=accounting_end_date]');
              accounting_end_date.setHtml('<span style="color:#4dbd74"><strong>최종정산마감연월 : ' + ret.data[0].end_date + '</strong></style> ');

            }
          }
        }
    });
    this.mainDataStoreLoad();
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
              msg: '정산업로드 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.accounting_summary_no == 0 || itm.data.accounting_summary_no == '' || itm.data.accounting_summary_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/AccountingSummary/Delete/`+itm.data.accounting_summary_no,
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
      ExcelName = '정산업로드목록';

      ExcelDownload(grid, ExcelName);
  }
  onClickAccountingEndDate = (item) =>{
    this.setState({isOpenAccountingEndDate:true, result:null});
  }
  showDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
    view.getSelectionModel().deselectAll();
    view.getSelectionModel().select(rowIdx, true);
    this.setState({isOpenVerify:true, result:rec});
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
    this.setState({ result: null, isOpen:false, isOpenVerify:false, isOpenAccountingEndDate:false });
    this.mainDataStoreLoad();
  }
  render(){
    const { pagingtoolbar, result, isOpen, isOpenVerify, isOpenAccountingEndDate } = this.state;

    return(
      <Panel
             layout='fit'
             scrollable={false}>
             {/*정산마감년월팝업처리*/}
             { isOpenAccountingEndDate && (
                 <AccountingEndDateFormView
                     result={result}
                     showDisplayRefresh={this.showDisplayRefresh}
                     onClose={() => this.setState({ result: null, isOpenAccountingEndDate:false })}
                 />
             ) }
             {/*정산파일 업로드 팝업 처리 부분*/}
             { isOpen && (
                 <AccountingUploadFormView
                     result={result}
                     showDisplayRefresh={this.showDisplayRefresh}
                     onClose={() => this.setState({ result: null, isOpen:false })}
                 />
             ) }
             { isOpenVerify && (
                 <AccountingVerifyFormView
                     result={result}
                     showDisplayRefresh={this.showDisplayRefresh}
                     onClose={() => this.setState({ result: null, isOpenVerify:false })}
                 />
             ) }

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
                    stateId:'service-settlement-view',
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
                        xtype:'component',
                        code: 'accounting_end_date',
                        html: '<span style="color:#4dbd74"><strong>최종정산마감연월 : </strong></style>'
                      },
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
                      },
                      {
                        xtype:'button',
                        text:'<font color=white>정산연월마감</font>',
                        tooltip:'정산년월마감',
                        //iconCls: 'fa fa-sign-out',
                        style: {
                            'font-size': '14px',
                            'background-color':'#4dbd74',
                            'border-color':'#4dbd74',
                            'padding':'5px 7px 4px 7px',
                            'text-decoration': 'none',
                            'border-radius': '4px 4px 4px 4px'
                        },
                        handler:this.onClickAccountingEndDate
                      }],
                      columns:[
                        {
                          text: '일련번호',
                          dataIndex: 'settlement_summary_no',
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
                            header: '매출월',
                            dataIndex: 'sales_date',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('sales_date');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: '정산월',
                            dataIndex: 'settlement_date',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('settlement_date');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: '처리상태',
                            dataIndex: 'status_name',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('status_name');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: '정산서종류',
                            dataIndex: 'accounting_type_name',
                            type: 'TEXT',
                            width: 120,
                            isExcel: true,
                            align: 'center',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('accounting_type_name');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: 'SP사',
                            dataIndex: 'sp_corp_name',
                            type: 'TEXT',
                            width: 140,
                            isExcel: true,
                            align: 'left',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('sp_corp_name');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: '하위업체명',
                            dataIndex: 'sp_corp_detail_name',
                            type: 'TEXT',
                            width: 160,
                            isExcel: true,
                            align: 'left',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('sp_corp_detail_name');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        // {
                        //     header: '정산서명',
                        //     dataIndex: 'settlement_title',
                        //     type: 'TEXT',
                        //     width: 160,
                        //     isExcel: true,
                        //     align: 'center',
                        //     sortable:true,
                        //     style:'text-align:center',
                        //     hidden:true,
                        //     renderer: function(value, metaData, record) {
                        //       var deviceDetail = record.get('settlement_title');
                        //       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        //       return value;
                        //     },
                        //     filter: {
                        //         type: 'string'
                        //     }
                        // },
                        {
                            header: '총매출',
                            dataIndex: 'total_sales_price',
                            type: 'TEXT',
                            width: 120,
                            isExcel: true,
                            align: 'right',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('total_sales_price');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return Ext.util.Format.number(value, '0,000');
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: '정산율',
                            dataIndex: 'accounting_rates',
                            type: 'TEXT',
                            width: 120,
                            isExcel: true,
                            align: 'right',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('accounting_rates');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return Ext.util.Format.number(value, '0,000');
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            header: '정산금액',
                            dataIndex: 'total_accounting_price',
                            type: 'TEXT',
                            width: 120,
                            isExcel: true,
                            align: 'right',
                            sortable:true,
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('total_accounting_price');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return Ext.util.Format.number(value, '0,000');
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        // {
                        //     header: 'CP사 정산금',
                        //     dataIndex: 'total_accounting_cp_price',
                        //     type: 'TEXT',
                        //     width: 160,
                        //     isExcel: true,
                        //     align: 'right',
                        //     sortable:true,
                        //     style:'text-align:center',
                        //     renderer: function(value, metaData, record) {
                        //       var deviceDetail = record.get('total_accounting_cp_price');
                        //       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        //       return Ext.util.Format.number(value, '0,000');
                        //     },
                        //     filter: {
                        //         type: 'string'
                        //     }
                        // },
                        {
                            text: '정산확정자',
                            dataIndex: 'confirm_user_no_name',
                            type: 'TEXT',
                            width: 100,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('confirm_user_no_name');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            }
                        },
                        {
                            text: '정산확정일시',
                            dataIndex: 'confirm_date',
                            type: 'DATE',
                            dateFormat: 'Y-m-d H:i:s',
                            width: 140,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('confirm_date');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'date'
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
                                      xtype:'container',
                                      layout: {
                                          type: 'hbox',
                                          align: 'stretch'
                                      },
                                      flex:2,
                                      items:[
                                        {
                                            xtype: 'label',
                                            cls: 'mylabel',
                                            padding:'7 2 0 0',
                                            width:60,
                                            style:'text-align:right',
                                            text: '정산기간:'
                                        },
                                        {
                                          xtype:'monthfield',
                                          name: 'st_date',
                                          flex:1,
                                          format: 'Y-m',
                                          padding:'0 5 0 0',
                                          value: new Date((new Date()).getTime() - 180 * 24 * 60 * 60 * 1000)
                                        },
                                        {
                                            xtype: 'label',
                                            cls: 'mylabel',
                                            padding:'7 2 0 2',
                                            text: '~'
                                        },
                                        {
                                          xtype:'monthfield',
                                          name: 'end_date',
                                          flex:1,
                                          format: 'Y-m',
                                          padding:'0 5 0 0',
                                          value: new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000)
                                        }
                                      ]
                                  },

                                  {
                                      xtype: 'textfield',
                                      fieldLabel: '검색어',
                                      emptyText: '업체명/하위업체명',
                                      flex:3,
                                      name: 'searchtxt',
                                      listeners:{
                                        specialkey:this.onSpecialKeySearch
                                      }
                                  },
                                  {
                                      xtype: 'combo',
                                      fieldLabel: '정산서종류',
                                      flex:1,
                                      name: 'accounting_type',
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
                                      store:this.search_accounting_type_store
                                  },
                                  ,
                                  {
                                      xtype: 'combo',
                                      fieldLabel: '처리상태',
                                      flex:1,
                                      name: 'status',
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
                                      store:this.search_settlement_process_store
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

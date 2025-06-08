import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*',
  'Ext.window.Window'
]);

export default class NkBillingReportView extends Component {
  state = {
    Authorization:cookie.load('token'),
    pagingtoolbar:true,
    searchtxt:''
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
    ],
    pageSize: null,
    remoteSort : false,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/CpAccountingReport/GetList`,
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

  cp_corp_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'cp_corp_no', type:'number' },
            { name: 'cp_corp_name', type:'string' },
            { name: 'use_yn', type:'string' }
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/CpCorp/GetComboList`,
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
  }
  componentDidMount(){
    const me = this;
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.cp_corp_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.cp_corp_store.insert(0, {cp_corp_no:null, cp_corp_name:'선택'});
      //me.mainDataStoreLoad();
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
            }
          }
        }
    });
  }
  onClickSearch = (item) => {
    this.mainDataStoreLoad();
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = 'NK사 정산서상세내역',
      url = '';

      ExcelDownload(grid, ExcelName,url);
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  render(){
    const { pagingtoolbar, result, isOpen } = this.state;
    return(
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
               deferEmptyText: false,
               getRowClass: function(record, index) {
                 console.log('getRowClass')
                  var c = record.get('depth');
                  if (c == 2) {
                      return 'grid-sum-node';
                  } else if (c == 3) {
                      return 'grid-sum-node';
                  }
              }
           },
           plugins:[
               {
                   ptype: 'cellediting',
                   clicksToEdit: 1
               },
               'gridfilters'
           ],
           stateId:'master-common-code-view',
           stateful:false,
           enableLocking:true,
           multiColumnSort:false,
           lockable:true,
          //  selModel: {
          //      type: 'checkboxmodel'
          //  },
           store:this.store,
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
                   header: '정산월',
                   dataIndex: 'settlement_date',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'center',
                   sortable:true,
                   style:'text-align:center'
               },
               {
                   header: 'CP사',
                   dataIndex: 'cp_corp_name',
                   type: 'TEXT',
                   width: 160,
                   isExcel: true,
                   align: 'left',
                   sortable:true,
                   style:'text-align:center'
               },
               {
                   header: '업체명',
                   dataIndex: 'cp_corp_detail_name',
                   type: 'TEXT',
                   width: 200,
                   isExcel: true,
                   align: 'left',
                   sortable:true,
                   style:'text-align:center'
               },
               {
                   header: '정산코드',
                   dataIndex: 'publication_code',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'left',
                   hidden:true,
                   sortable:true,
                   style:'text-align:center'
               },
               {
                   header: '영화명',
                   dataIndex: 'movie_name',
                   type: 'TEXT',
                   width: 300,
                   isExcel: true,
                   align: 'left',
                   sortable:true,
                   style:'text-align:center'
               },
               {
                   header: '총매출',
                   dataIndex: 'sales_price',
                   type: 'TEXT',
                   width: 140,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000.00');
                   }
               },
               {
                header: 'R/S<br>(총매출기준)',
                dataIndex: 'nk_sales',
                type: 'TEXT',
                width: 120,
                isExcel: true,
                align: 'right',
                sortable:true,
                style:'text-align:center'
               },
               {
                header: 'NK유통수수료<br>(총매출기준)',
                dataIndex: 'nkk_pay_price',
                type: 'TEXT',
                width: 180,
                isExcel: true,
                align: 'right',
                sortable:true,
                style:'text-align:center',
                renderer: function(value, metaData, record) {
                  return Ext.util.Format.number(value, '0,000.00');
                }
               },
               {
                   header: '정산율',
                   dataIndex: 'accounting_rates',
                   type: 'TEXT',
                   width: 80,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     //return Ext.util.Format.number(value, '0,000');
                     return value;
                   }
               },
               {
                   header: '플랫폼<br>정산금액',
                   dataIndex: 'accounting_price',
                   type: 'TEXT',
                   width: 140,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000.00');
                   }
               },
               {
                   header: 'R/S',
                   dataIndex: 'nk_contract_rate',
                   type: 'TEXT',
                   width: 80,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center'
               },
               {
                   header: 'NK유통<br>수수료',
                   dataIndex: 'nk_pay_price',
                   type: 'TEXT',
                   width: 140,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000.00');
                   }
               },
               {
                   header: '비고',
                   dataIndex: 'remark',
                   type: 'TEXT',
                   width: 300,
                   isExcel: true,
                   align: 'left',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function (value, metaData, record) {
                       return value == "" ? "" : value.replace(/\n/g, '<br />');
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
                           xtype:'hiddenfield',
                           name:'report_type',
                           value:'movie_sale_report'
                         },
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
                                 value: new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000)
                               },
                               {
                                   xtype: 'label',
                                   cls: 'mylabel',
                                   padding:'7 2 0 2',
                                   text: '~'
                               },
                               {
                                 xtype:'monthfield',
                                 name: 'ed_date',
                                 flex:1,
                                 format: 'Y-m',
                                 padding:'0 5 0 0',
                                 value: new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000)
                               }
                             ]
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: 'CP사',
                             flex:3,
                             name: 'cp_corp_no',
                             displayField: 'cp_corp_name',
                             valueField: 'cp_corp_no',
                             hidden: false,
                             queryMode: 'local',
                             typeAhead: false,
                             emptyText: '선택',
                             editable: true,
                             forceSelection: false,
                             triggerAction: 'all',
                             selectOnFocus: true,
                             enableKeyEvents: true,
                             store:this.cp_corp_store
                         }

                       ]
                     }
                   ]
               }
             ]
         }]}/>

    )

  }
}

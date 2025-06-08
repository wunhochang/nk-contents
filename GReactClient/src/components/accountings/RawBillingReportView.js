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

export default class RawBillingReportView extends Component {
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
        url: `${API_URL}/AccountingSummary/GetRawBillingPaperReport`,
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

  componentWillMount(){
  }
  componentDidMount(){
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
      ExcelName = '법무법인 정산서내역',
      url = 'GetRawBillingPaperReportExcelDownload';

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
                   dataIndex: 'sp_cor_accounting_date',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'center',
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
                   header: '입금액',
                   dataIndex: 'accounting_price',
                   type: 'TEXT',
                   width: 120,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000');
                   }
               },
               {
                   header: 'NK',
                   dataIndex: 'raw_nk_price',
                   type: 'TEXT',
                   width: 120,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000');
                   }
               },
               {
                   header: '모니터링업체',
                   dataIndex: 'raw_monitor_price',
                   type: 'TEXT',
                   width: 120,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000');
                   }
               },
               {
                   header: '법무법인',
                   dataIndex: 'raw_price',
                   type: 'TEXT',
                   width: 120,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000');
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
                             xtype: 'textfield',
                             fieldLabel: '검색어',
                             emptyText: '영화명',
                             flex:3,
                             name: 'searchtxt',
                             listeners:{
                               specialkey:this.onSpecialKeySearch
                             }
                         },

                       ]
                     }
                   ]
               }
             ]
         }]}/>

    )

  }
}

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

export default class CpCorpSalesReportView extends Component {
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
        url: `${API_URL}/CpAccountingReport/GetCpAccountingReport`,
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
  search_year_list_store = Ext.create('Ext.data.Store', {
          fields: [
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/AccountingSummary/GetYearList`,
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
  cp_corp_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'cp_copr_no', type:'number' },
            { name: 'cp_copr_name', type:'string' },
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
        me.search_year_list_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.cp_corp_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.cp_corp_store.insert(0, {cp_corp_no:null, cp_corp_name:'선택'});
      me.mainDataStoreLoad();
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
                    me.onReconfigure(res);
            }
          }
        }
    });
  }
  onReconfigure = (res) => {
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      form = header_grid.down('form'),
      formValue = form.getValues(),
      store = grid.getStore(),
      this_year = Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'Y'),
      this_month = Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'm');
      //store.removeAll();
      var model = [],
          ret = Ext.decode(res.responseText);
    if(ret.count>0){
      model.push(
        {
          text: 'CP사명',
          dataIndex: 'cp_corp_name',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'center',
          style:'text-align:center'
        },
        {
          text: '하위업체명',
          dataIndex: 'cp_corp_detail_name',
          type: 'TEXT',
          width: 200,
          isExcel: true,
          sortable:true,
          align: 'left',
          style:'text-align:center'
        }
      );
      model.push(
        {
          text: '~' + (parseInt(formValue.st_date)-1) + '년<br>누적지급금액',
          exceltitle:'~' + (parseInt(formValue.st_date)-1) + '년 누적지급금액',
          dataIndex: 'add_sale_price',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );

      for(var i=1; i<=12; i++){
        if(parseInt(this_year) == parseInt(formValue.st_date)){
          if(i<=parseInt(this_month)){
            model.push(
              {
                text: i + '월',
                dataIndex: 'col_'+i,
                type: 'TEXT',
                width: 80,
                isExcel: true,
                sortable:true,
                align: 'right',
                style:'text-align:center',
                renderer: function(value, metaData, record) {
                  return Ext.util.Format.number(value, '0,000');
                }
              }
            );
          }
        }
        else{
          model.push(
            {
              text: i + '월',
              dataIndex: 'col_'+i,
              type: 'TEXT',
              width: 80,
              isExcel: true,
              sortable:true,
              align: 'right',
              style:'text-align:center',
              renderer: function(value, metaData, record) {
                return Ext.util.Format.number(value, '0,000');
              }
            }
          );
        }
      }
      model.push(
        {
          text: formValue.st_date + '년<br>누적지급금액',
          exceltitle:formValue.st_date + '년 누적지급금액',
          dataIndex: 'sub_tot_sum',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );
      model.push(
        {
          text: '총지급금액',
          exceltitle:'총지급금액',
          dataIndex: 'total_sum',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );
      grid.reconfigure(store, model);
      grid.getView().refresh(true);
    }
  }
  onClickSearch = (item) => {
    this.mainDataStoreLoad();
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = 'CP사정산지급액현황',
      url = 'GetCpAccountingReportExcelDownload';

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
           enableLocking:false,
           multiColumnSort:false,
           lockable:false,
           columnLines: false,
           rowLines: true,
           enableColumnHide: false,
           enableColumnMove: false,
           enableColumnResize: true,
           sortableColumns: false,
           trackMouseOver: false,
           bodyStyle: "border-top:1 solid #eeeeee",
           style: "border-top:1 solid #eeeeee",
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
                             xtype: 'combo',
                             fieldLabel: '정산연도',
                             flex:1,
                             name: 'st_date',
                             displayField: 'c_year',
                             valueField: 'c_year',
                             hidden: false,
                             queryMode: 'local',
                             typeAhead: false,
                             emptyText: '선택',
                             editable: true,
                             forceSelection: false,
                             triggerAction: 'all',
                             selectOnFocus: true,
                             enableKeyEvents: true,
                             value: Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'Y'),
                             store:this.search_year_list_store
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: 'CP사명',
                             flex:2,
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

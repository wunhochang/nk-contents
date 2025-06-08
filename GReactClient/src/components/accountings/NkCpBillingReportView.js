import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';

import NkAccountsMailFormView from './NkAccountsMailFormView';
import NkPrepayFormView from './NkPrepayFormView';



Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*',
  'Ext.window.Window'
]);

export default class NkCpBillingReportView extends Component {
  state = {
    Authorization:cookie.load('token'),
    pagingtoolbar:true,
    searchtxt:''
  }
  store = Ext.create('Ext.data.Store', {
    fields: [

      { name: 'cp_accounting_report_no', type:'number' },
      { name: 'cp_corp_detail_no', type:'number' },
      { name: 'cp_corp_no', type:'number' },
      { name: 'cp_corp_detail_name', type:'string' },
      { name: 'nk_contract_rate', type:'number' },
      { name: 'cp_contract_rate', type:'number' },
      { name: 'movie_no', type:'number' },
      { name: 'settlement_date', type:'string' },
      { name: 'sales_price', type:'number' },
      { name: 'nk_sales', type:'number' },
      { name: 'accounting_rates', type:'number' },
      { name: 'accounting_price', type:'number' },
      { name: 'movie_name', type:'string' },
      { name: 'cp_corp_name', type:'string' },
      { name: 'remark', type:'string' },
      { name: 'cp_confirm_yn_name', type:'string' }
    ],
    pageSize: null,
    remoteSort : false,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/AccountingSummary/GetBillingPaperReport`,
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
            { name: 'tax_email', type:'string' },
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
    cp_corp_detail_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'cp_corp_no', type:'number' },
            { name: 'cp_corp_name', type:'string' },
            { name: 'cp_corp_detail_no', type:'number' },
            { name: 'cp_corp_detail_name', type:'string' },
            { name: 'use_yn', type:'string' }
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/CpCorpDetail/GetComboList`,
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
      }),
      new Ext.Promise(function (res) {
        me.cp_corp_detail_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.cp_corp_store.insert(0, {cp_corp_no:null, cp_corp_name:'선택'});
      me.cp_corp_detail_store.insert(0, {cp_corp_detail_no:null, cp_corp_detail_name:'선택'});
      //me.mainDataStoreLoad();
    });
  }
  showDisplayRefresh = () => {
    this.setState({ result: null, iisOpen:false });
    this.mainDataStoreLoad();
  }
  mainDataStoreLoad = () => {
    const me = this,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          formValue = form.getValues();

          if(formValue.cp_corp_detail_no == 0 || formValue.cp_corp_detail_no == ''){
            alert('CP사 업체명을 선택해주세요.')
            return;
          }
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
  onClickCpAccountingEnd = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          formValues = form.getValues(),
          store = grid.getStore();
    var cp_accounting_report = [],
        cp_confirm_yn_count = 0;
    if(store.count()>0){
      for(var i=0; i<store.count(); i++){ 
        var rec = store.data.items[i];
        if(rec.data.cp_confirm_yn=='Y'){
          cp_confirm_yn_count++;
        }
        rec.data.cp_contract_rate = null;
        rec.data.nk_contract_rate = null;
        rec.data.cp_pay_price = null;
        rec.data.nk_pay_price = null;
        cp_accounting_report.push(rec.data);
      }
    }
    else{
        alert('정산마감할 데이터가 없습니다.');
        return;
    }
    if(cp_confirm_yn_count>0){
      alert('해당건은 이미 CP사 정산이 완료된 건입니다.<br>해당건에 대한 정산을 다시 하시려면, CP사정산상세내역을 먼저 삭제하고 다시 해주세요.');
      return;
    }
    var end_type="total";
    
    formValues.cp_accounting_report = cp_accounting_report;

    //formValues.cp_accounting_report["cp_contract_rate"] = null;
   // formValues.cp_accounting_report["nk_contract_rate"] = null;

    console.log('tttt ' + JSON.stringify(formValues, null, 2));
    //console.log('change value The selected value id is '+formValues)
    const params = paramsPostHandler(formValues);
    //return;
    showConfirm({
    msg: '작성하신 정산서에 대해서 총매출기준 마감처리를 하시겠습니까?',
    title:'확인',
    callback: function () {
      Ext.Ajax.request({
          url: `${API_URL}/CpAccountingReport/Save`,
          method: 'POST',
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
          params : params,
          dataType: "json",
          success: function(response, request) {
            alert('정상적으로 저장되었습니다.');
            me.mainDataStoreLoad();
          },
          failure: function(response, request) {
            console.log(response);
          }
      });
    }});
  }

  onClickCpAccountingEndNk = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          formValues = form.getValues(),
          store = grid.getStore();
    var cp_accounting_report = [],
        cp_confirm_yn_count = 0;
    if(store.count()>0){
      for(var i=0; i<store.count(); i++){
        var rec = store.data.items[i];
        if(rec.data.cp_confirm_yn=='Y'){
          cp_confirm_yn_count++;
        }
        rec.data.total_sales = null;
        rec.data.nk_sales = null;
        rec.data.total_pay_price = null;
        rec.data.nkk_pay_price = null;

        console.log('778777 ' + rec.data.accounting_price);

        cp_accounting_report.push(rec.data);
      }
    }
    else{
        alert('정산마감할 데이터가 없습니다.');
        return;
    }
    if(cp_confirm_yn_count>0){
      alert('해당건은 이미 CP사 정산이 완료된 건입니다.<br>해당건에 대한 정산을 다시 하시려면, CP사정산상세내역을 먼저 삭제하고 다시 해주세요.');
      return;
    }
    var end_type="total";
    
    formValues.cp_accounting_report = cp_accounting_report;

    //formValues.cp_accounting_report["cp_contract_rate"] = null;
   // formValues.cp_accounting_report["nk_contract_rate"] = null;

    console.log('tttt ' + JSON.stringify(formValues, null, 2));
    //console.log('change value The selected value id is '+formValues)
    const params = paramsPostHandler(formValues);
    showConfirm({
    msg: '작성하신 정산서에 대해서 NK매출기준 마감처리를 하시겠습니까?',
    title:'확인',
    callback: function () {
      Ext.Ajax.request({
          url: `${API_URL}/CpAccountingReport/Save`,
          method: 'POST',
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
          params : params,
          dataType: "json",
          success: function(response, request) {
            alert('정상적으로 저장되었습니다.');
            me.mainDataStoreLoad();
          },
          failure: function(response, request) {
          }
      });
    }});
  }

  onClickAccountingEndDate = (item) =>{
    this.setState({isOpenAccountingEndDate:true, result:null});
  }
  onClickSendMail = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          formValues = form.getValues(),
          store = grid.getStore();
        var cp_accounting_report = [],
        cp_confirm_yn_count = 0;

        
        if(store.count()>0){
          for(var i=0; i<store.count(); i++){
            var rec = store.data.items[i];
            if(rec.data.cp_confirm_yn=='Y'){
              cp_confirm_yn_count++;
            }
            cp_accounting_report.push(rec.data);
          }
        }
        else{
            alert('정산마감할 데이터가 없습니다.');
            return;
        }
        if(cp_confirm_yn_count<=0){
          alert('메일발송을 위한 정산 데이터가 없습니다.먼저 정산마감을 해주세요');
          return;
        }
        else{
          this.setState({ result: formValues, isOpen:true });
        }   

    // if(store.count()<=0){
    //   alert('메일발송을 위한 정산 데이터가 없습니다.');
    //   return;
    // }
    // else{
    //   this.setState({ result: null, isOpen:true });
    // }      
    
  }
  onClickPrepay = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          formValues = form.getValues(),
          store = grid.getStore();
    if(store.count()<=0){
      alert('먼저 데이터를 검색하세요.');
      return;
    }
    else{
      this.setState({ result: formValues, iisOpen:true });
    }      
    
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = 'NK사 정산서내역',
      url = 'GetBillingPaperReportExcelDownload';

      ExcelDownload(grid, ExcelName,url);
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  onCpCorpChange = () => {
      const me  = this,
            {header_grid} = this.refs,
            form = header_grid.down('form'),
            grid = header_grid.down('grid'),
            store = grid.getStore(),
            //formCorpValue = form.get .getraw .cp_corp_no.displayField.getValues(),
            formValue = form.getValues();
            //console.log('combo display value',form.cp_corp_no.getDisplayValue());
        //    store.data

       // this.cp_corp_store.filterBy(function (rec) {
       //   form.getForm().findField('tax_email').setValue(rec.get('tax_email'));
         // return (rec.get('cp_corp_no') == formValue.cp_corp_no) || (rec.get('cp_corp_no') == 0);
     // });
        form.getForm().findField('cp_corp_detail_no').setValue(null);
        //form.getForm().findField('cp_corp_name').setValue(this.getDisplayValue());
        if(formValue.cp_corp_no == '' || formValue.cp_corp_no == null || formValue.cp_corp_no == 0){
            this.cp_corp_detail_store.clearFilter(true);
        }
        else{
            this.cp_corp_detail_store.clearFilter(true);
            this.cp_corp_detail_store.filterBy(function (rec) {
                return (rec.get('cp_corp_no') == formValue.cp_corp_no) || (rec.get('cp_corp_no') == 0);
            });
        }
  }
  render(){
    const { pagingtoolbar, result, isOpen, iisOpen } = this.state;
    return(
      <Panel layout="fit">
        { isOpen && (
            <NkAccountsMailFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, isOpen:false })}/>
        )}
        { iisOpen && (
            <NkPrepayFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, iisOpen:false })}/>
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
               deferEmptyText: false,
               getRowClass: function(record, index) {
                  var c = record.get('depth');
                  if (c == 2) {
                      return 'grid-sum-node';
                  } else if (c == 3) {
                      return 'grid-sum-node';
                  }
              }
           },
           features: [{
               ftype: 'summary'
           }],
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
              text:'<font color=white>선급금</font>',
              cls:'base-button-round',
              style: {
                  'font-size': '14px',
                  'background-color':'#4dbd74',
                  'border-color':'#4dbd74',
                  'padding':'5px 7px 4px 7px',
                  'text-decoration': 'none',
                  'border-radius': '4px 4px 4px 4px'
              },
              handler:this.onClickPrepay
             },
             {
              xtype:'button',
              text:'<font color=white>메일발송</font>',
              cls:'base-button-round',
              style: {
                  'font-size': '14px',
                  'background-color':'#4dbd74',
                  'border-color':'#4dbd74',
                  'padding':'5px 7px 4px 7px',
                  'text-decoration': 'none',
                  'border-radius': '4px 4px 4px 4px'
              },
              handler:this.onClickSendMail
             },
             {
               xtype:'button',
               text:'<font color=white>정산마감(총매출기준)</font>',
               cls:'base-button-round',
               style: {
                   'font-size': '14px',
                   'background-color':'#4dbd74',
                   'border-color':'#4dbd74',
                   'padding':'5px 7px 4px 7px',
                   'text-decoration': 'none',
                   'border-radius': '4px 4px 4px 4px'
               },
               handler:this.onClickCpAccountingEnd
             },
             {
              xtype:'button',
              text:'<font color=white>정산마감(NK매출기준)</font>',
              cls:'base-button-round',
              style: {
                  'font-size': '14px',
                  'background-color':'#4dbd74',
                  'border-color':'#4dbd74',
                  'padding':'5px 7px 4px 7px',
                  'text-decoration': 'none',
                  'border-radius': '4px 4px 4px 4px'
              },
              handler:this.onClickCpAccountingEndNk
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
                   header: '영화명',
                   dataIndex: 'movie_name',
                   type: 'TEXT',
                   width: 300,
                   isExcel: true,
                   align: 'left',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return value;
                   },
                   summaryType: 'count',
                   summaryRenderer: function (value, summaryData, dataIndex) {
                       return '합계'
                   }
               },
               {
                header: 'SP하위업체명',
                dataIndex: 'sp_corp_detail_name',
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
                   sortable:true,
                   hidden:true,
                   style:'text-align:center'
               },
               {
                   header: 'CP사<br>정산마감여부',
                   exceltitle:'CP사 정산마감여부',
                   dataIndex: 'cp_confirm_yn_name',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'center',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     if(value == '마감완료'){
                       return '<font color=red>'+value+'</font>';
                   }
                     else{
                       return value;
                     }
                   }
               },
               {
                   header: '총매출', //'<font color=blue>총매출</font>'
                   dataIndex: 'sales_price',
                   type: 'TEXT',
                   width: 140,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   renderer: function(value, metaData, record) {
                     return Ext.util.Format.number(value, '0,000');
                   },
                   summaryType: 'sum',
                   summaryRenderer : function(value, summaryData, dataIndex) {
                       return Ext.util.Format.number(parseInt(value), '0,000');
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
                     return Ext.util.Format.number(value, '0,000');
                   },
                   summaryType: 'max',
                   summaryRenderer : function(value, summaryData, dataIndex) {
                       return Ext.util.Format.number(parseInt(value), '0,000');
                   }
               },
               {
                   header: '<font color=blue>플랫폼<br>정산금액</font>',
                   exceltitle:'플랫폼 정산금액',
                   dataIndex: 'accounting_price',
                   type: 'TEXT',
                   width: 140,
                   isExcel: true,
                   align: 'right',
                   sortable:true,
                   style:'text-align:center',
                   editor: {
                       xtype: 'numberfield'
                   },
                   renderer: function(value, metaData, record) {
                     var sales_price = record.data.sales_price||0;
                     var cp_corp_detail_no = record.data.cp_corp_detail_no||0;
                     var accounting_price = record.data.accounting_price||0;
                     var cp_contract_rate = record.data.cp_contract_rate||0;
                     var nk_contract_rate = record.data.nk_contract_rate||0;
                     if(cp_contract_rate=='30000'){
                        record.data.cp_pay_price = parseFloat(accounting_price)*parseFloat(cp_contract_rate)/100;
                        record.data.nk_pay_price = parseFloat(accounting_price)*parseFloat(nk_contract_rate)/100;
                     }
                     else{
                        record.data.cp_pay_price = parseFloat(accounting_price)*parseFloat(cp_contract_rate)/100;
                        record.data.nk_pay_price = parseFloat(accounting_price)*parseFloat(nk_contract_rate)/100;
                     }
                     //console.log(record);
                     return Ext.util.Format.number(value, '0,000.00');
                   },
                   summaryType: 'sum',
                   summaryRenderer : function(value, summaryData, dataIndex) {
                       return Ext.util.Format.number(parseInt(value), '0,000.00');
                   }
               },
               {
                header: 'CP사 정산(총매출기준)',
                columns:[
                  {
                      header: '<font color=blue>R/S</font>',
                      dataIndex: 'total_sales',
                      type: 'TEXT',
                      width: 80,
                      isExcel: true,
                      align: 'right',
                      sortable:true,
                      style:'text-align:center',
                      editor: {
                          xtype: 'numberfield',
                          listeners: {
                            change: function(field, value, record) {
                              var  grid = field.up('grid');
                              var row = grid.getSelection()[0]; //현재 행
                              var cost = value;       //현재 행의 COST값
                              var salesRate = 100-value;
                              row.set("nk_sales",salesRate);    
                            }
                        }
                      },
                      renderer: function(value, metaData, record) {
                          var sales_price = record.data.sales_price||0;
                          var cp_corp_detail_no = record.data.cp_corp_detail_no||0;
                          var sales_price = record.data.sales_price||0;
                          var total_sales = record.data.total_sales||0;
                          var nk_sales = record.data.nk_sales||0;
                          if(cp_corp_detail_no==30000){
                              record.data.total_pay_price = parseFloat(sales_price)*parseFloat(total_sales)/100;
                              record.data.nkk_pay_price = parseFloat(sales_price)*parseFloat(nk_sales)/100;
                          }
                          else{
                              record.data.total_pay_price = parseFloat(sales_price)*parseFloat(total_sales)/100;
                              record.data.nkk_pay_price = parseFloat(sales_price)*parseFloat(nk_sales)/100;
                          }
                          return Ext.util.Format.number(parseInt(value), '0,000');
                      },
                      summaryType: 'max',
                      summaryRenderer : function(value, summaryData, dataIndex) {
                          //return Ext.util.Format.number(parseInt(value), '0,000');
                          return value;
                      }
                  },
                  {
                      header: '정산 지급액',
                      dataIndex: 'total_pay_price',
                      type: 'TEXT',
                      width: 140,
                      isExcel: true,
                      align: 'right',
                      sortable:true,
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        return Ext.util.Format.number(value, '0,000.00');
                      },
                      summaryType: 'sum',
                      summaryRenderer : function(value, summaryData, dataIndex) {
                          return Ext.util.Format.number(parseInt(value), '0,000.00');
                      }
                  }
                ]
             },
             {
                header: 'NK(총매출기준)',
                columns:[
                  {
                      header: '<font color=blue>R/S</font>',
                      dataIndex: 'nk_sales',
                      type: 'TEXT',
                      width: 80,
                      isExcel: true,
                      align: 'right',
                      sortable:true,
                      style:'text-align:center',
                      editor: {
                          xtype: 'numberfield',
                          listeners: {
                            change: function(field, value, record) {
                              var  grid = field.up('grid');
                              var row = grid.getSelection()[0]; //현재 행      //현재 행의 COST값
                              var salesRate = 100-value;
                              row.set("total_sales",salesRate);    
                            }
                        }
                      },
                      renderer: function(value, metaData, record) {
                          var sales_price = record.data.sales_price||0;
                          var cp_corp_detail_no = record.data.cp_corp_detail_no||0;
                          var accounting_price = record.data.accounting_price||0;
                          var total_sales = record.data.total_sales||0;
                          var nk_sales = record.data.nk_sales||0;
                          if(cp_corp_detail_no==30000){
                            record.data.total_pay_price = parseFloat(sales_price)*parseFloat(total_sales)/100;
                            record.data.nkk_pay_price = parseFloat(sales_price)-parseFloat(record.data.total_pay_price);//parseFloat(sales_price)*parseFloat(nk_sales)/100;
                          }
                          else{
                              if(nk_sales =='0' || nk_sales==null){
                                record.data.nkk_pay_price = null;
                              }else
                              {
                              record.data.total_pay_price = parseFloat(sales_price)*parseFloat(total_sales)/100;
                              record.data.nkk_pay_price = parseFloat(sales_price)-parseFloat(record.data.total_pay_price);//record.data.nkk_pay_price = parseFloat(sales_price)*parseFloat(nk_sales)/100;
                             }
                            }
                          //console.log(record);
                          return Ext.util.Format.number(parseInt(value), '0,000');
                      },
                      summaryType: 'max',
                      summaryRenderer : function(value, summaryData, dataIndex) {
                          //return Ext.util.Format.number(parseInt(value), '0,000.00');
                          return value;
                      }
                  },
                  {
                      header: 'NK유통<br>수수료',
                      dataIndex: 'nkk_pay_price',
                      type: 'TEXT',
                      width: 140,
                      isExcel: true,
                      align: 'right',
                      sortable:true,
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        
                        return Ext.util.Format.number(value, '0,000.00');
                      },
                      summaryType: 'sum',
                      summaryRenderer : function(value, summaryData, dataIndex) {
                          return Ext.util.Format.number(parseInt(value), '0,000.00');
                      }
                  }
                ]
             },
               {
                  header: 'CP사 정산(NK매출기준)',
                  columns:[
                    {
                        header: '<font color=blue>R/S</font>',
                        dataIndex: 'cp_contract_rate',
                        type: 'TEXT',
                        width: 80,
                        isExcel: true,
                        align: 'right',
                        sortable:true,
                        style:'text-align:center',
                        editor: {
                            xtype: 'numberfield',
                            listeners: {
                              change: function(field, value, record) {
                                var  grid = field.up('grid');
                                var row = grid.getSelection()[0]; //현재 행      //현재 행의 COST값
                                var salesRate = 100-value;
                                row.set("nk_contract_rate",salesRate);    
                              }
                          }
                        },
                        renderer: function(value, metaData, record) {
                            var sales_price = record.data.sales_price||0;
                            var cp_corp_detail_no = record.data.cp_corp_detail_no||0;
                            var accounting_price = record.data.accounting_price||0;
                            var cp_contract_rate = record.data.cp_contract_rate||0;
                            var nk_contract_rate = record.data.nk_contract_rate||0;
                            if(cp_corp_detail_no==3){
                                record.data.cp_pay_price = parseFloat(accounting_price)*parseFloat(cp_contract_rate)/100;
                                record.data.nk_pay_price = parseFloat(accounting_price)*parseFloat(nk_contract_rate)/100;
                            }
                            else{
                                record.data.cp_pay_price = parseFloat(accounting_price)*parseFloat(cp_contract_rate)/100;
                                record.data.nk_pay_price = parseFloat(accounting_price)*parseFloat(nk_contract_rate)/100;
                            }
                            //console.log(record);
                            
                            return value;
                        },
                        summaryType: 'max',
                        summaryRenderer : function(value, summaryData, dataIndex) {
                            //return Ext.util.Format.number(parseInt(value), '0,000');
                            return value;
                        }
                    },
                    {
                        header: '정산 지급액',
                        dataIndex: 'cp_pay_price',
                        type: 'TEXT',
                        width: 140,
                        isExcel: true,
                        align: 'right',
                        sortable:true,
                        style:'text-align:center',
                        renderer: function(value, metaData, record) {
                          return Ext.util.Format.number(value, '0,000.00');
                        },
                        summaryType: 'sum',
                        summaryRenderer : function(value, summaryData, dataIndex) {
                            return Ext.util.Format.number(parseInt(value), '0,000.00');
                        }
                    }
                  ]
               },
               {
                  header: 'NK',
                  columns:[
                    {
                        header: '<font color=blue>R/S</font>',
                        dataIndex: 'nk_contract_rate',
                        type: 'TEXT',
                        width: 80,
                        isExcel: true,
                        align: 'right',
                        sortable:true,
                        style:'text-align:center',
                        editor: {
                            xtype: 'numberfield',
                            listeners: {
                              change: function(field, value, record) {
                                var  grid = field.up('grid');
                                var row = grid.getSelection()[0]; //현재 행      //현재 행의 COST값
                                var salesRate = 100-value;
                                row.set("cp_contract_rate",salesRate);    
                              }
                          }
                        },
                        renderer: function(value, metaData, record) {
                            var sales_price = record.data.sales_price||0;
                            var cp_corp_detail_no = record.data.cp_corp_detail_no||0;
                            var accounting_price = record.data.accounting_price||0;
                            var cp_contract_rate = record.data.cp_contract_rate||0;
                            var nk_contract_rate = record.data.nk_contract_rate||0;
                            if(cp_corp_detail_no==3){
                                record.data.cp_pay_price = parseFloat(accounting_price)*parseFloat(cp_contract_rate)/100;
                                record.data.nk_pay_price = parseFloat(accounting_price)*parseFloat(nk_contract_rate)/100;
                            }
                            else{
                                record.data.cp_pay_price = parseFloat(accounting_price)*parseFloat(cp_contract_rate)/100;
                                record.data.nk_pay_price = parseFloat(accounting_price)*parseFloat(nk_contract_rate)/100;
                            }
                            //console.log(record);
                            return value;
                        },
                        summaryType: 'max',
                        summaryRenderer : function(value, summaryData, dataIndex) {
                            //return Ext.util.Format.number(parseInt(value), '0,000.00');
                            return value;
                        }
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
                        },
                        summaryType: 'sum',
                        summaryRenderer : function(value, summaryData, dataIndex) {
                            return Ext.util.Format.number(parseInt(value), '0,000.00');
                        }
                    }
                  ]
               },
               {
                header: '영화별칭',
                dataIndex: 'movie_tag_name',
                type: 'TEXT',
                width: 100,
                isExcel: true,
                align: 'left',
                sortable:true,
                hidden:true,
                style:'text-align:center'
               },
               {
                   header: '<font color=blue>비고</font>',
                   dataIndex: 'remark',
                   type: 'TEXT',
                   width: 260,
                   isExcel: true,
                   align: 'left',
                   sortable:true,
                   style:'text-align:center',
                   editor: {
                        xtype: 'textarea',
                        height: 80,
                        allowBlank: true
                   },
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
                          xtype: 'hiddenfield',
                          fieldLabel: 'CP사숨김',
                          name: 'cp_corp_name',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true
                         },
                         {
                          xtype: 'hiddenfield',
                          fieldLabel: '계산서메일',
                          name: 'tax_email',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true
                         },
                         {
                          xtype: 'hiddenfield',
                          fieldLabel: '업체명숨김',
                          name: 'cp_corp_detail_name',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true
                         },
                         {
                          xtype: 'hiddenfield',
                          fieldLabel: '업체명숨김',
                          name: 'excelname',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true
                         },
                         {
                           xtype:'monthfield',
                           fieldLabel: '정산년월',
                           name: 'st_date',
                           flex:1,
                           format: 'Y-m',
                           padding:'0 5 0 0',
                           value: new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000)
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: 'CP사',
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
                             store:this.cp_corp_store,
                             listeners: {
                              select: this.onCpCorpChange,
                              change: function(){
                                  //console.log('change value' , 'The selected value id is '+this.getDisplayValue())
                                  var cdata = this.findRecordByValue(this.getValue()).data;
                                 // console.log('combo display value',cdata.tax_email);     
                                  var form1= this.up().up().getForm();
                                  
                                  form1.findField('cp_corp_name').setValue(this.getDisplayValue());
                                  form1.findField('tax_email').setValue(cdata.tax_email);
                              }
                          }
                          //    listeners: {
                          //     select: function(){   
                          //       this.onCpCorpChange;
                          //       //console.log('combo display value',this.getDisplayValue());             
                          //   }
                          // }
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: '업체명',
                             flex:3,
                             name: 'cp_corp_detail_no',
                             displayField: 'cp_corp_detail_name',
                             valueField: 'cp_corp_detail_no',
                             hidden: false,
                             queryMode: 'local',
                             typeAhead: false,
                             emptyText: '선택',
                             editable: true,
                             forceSelection: false,
                             triggerAction: 'all',
                             selectOnFocus: true,
                             enableKeyEvents: true,
                             store:this.cp_corp_detail_store,
                             listeners: {
                              change: function(){
                                  //console.log('change value' , 'The selected value id is '+this.getDisplayValue())
                                  var form1= this.up().up().getForm();
                                  form1.findField('cp_corp_detail_name').setValue(this.getDisplayValue());
                              }
                          }
                         }
                       ]
                     }
                   ]
               }
             ]
         }]}/>
</Panel>
    )

  }
}

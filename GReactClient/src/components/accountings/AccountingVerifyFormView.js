import React, { Component } from 'react';
import cookie from 'react-cookies';

import { Window, TextField, Button, Container, Grid, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import BtnFileUpload from '../../utils/BtnFileUpload';
import {monthfield} from '../../utils/MonthPicker';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';
import MovieSearchView from './MovieSearchView';

export default class AccountingVerifyFormView extends Component {
  state = {
    isOpen:false,
    sp_corp_detail_no : 0,
    sp_corp_detail_name : '',
    result:[],
    model:[],
    Authorization:cookie.load('token')
  }
  /*영화정보 체크용 정보 관리 store*/
  grid_movie_tag_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'movie_no', type:'number' },
            { name: 'movie_code', type:'string' },
            { name: 'movie_name', type:'string' },
            { name: 'base_price', type:'string' },
            { name: 'movie_tag_name', type:'string' }
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/MovieTag/GetComboList`,
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
  grid_movie_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'movie_no', type:'number' },
            { name: 'movie_code', type:'string' },
            { name: 'movie_name', type:'string' }
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/Movie/GetComboList`,
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
  /*vod service 업체 정보 관리 store*/
  sp_corp_detail_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'sp_copr_detail_no', type:'number' },
            { name: 'sp_copr_detail_no_name', type:'string' },
            { name: 'use_yn', type:'string' }
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/SpCorpDetail/GetComboList`,
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
  /*판권구분*/
  sp_sales_kind_store = Ext.create('Ext.data.Store', {
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
  /*유통업체 distribution_enterprise_type*/
  sp_distribution_enterprise_type_store = Ext.create('Ext.data.Store', {
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
  /*upload 정산서 정보 관리 store*/
  grid_store = Ext.create('Ext.data.Store',{
  fields : [
    { name: 'accounting_rawdata_no', type:'number' },
    { name: 'accounting_summary_no', type:'number' },
    { name: 'sp_corp_detail_no', type:'number' },
    { name: 'sp_sales_date', type:'date', dateFormat: 'Y-m' },
    { name: 'sp_cor_accounting_date', type:'date', dateFormat: 'Y-m' },
    { name: 'movie_tag_name', type:'string' },
    { name: 'up_sp_corp_name', type:'string' },
    { name: 'sales_price', type:'number' },
    { name: 'accounting_rates', type:'string' },
    { name: 'accounting_price', type:'number' },
    { name: 'raw_nk_price', type:'number' },
    { name: 'raw_monitor_price', type:'number' },
    { name: 'raw_price', type:'number' },
    { name: 'accounting_cp_price', type:'number' },
    { name: 'movie_no', type:'number' },
    { name: 'movie_check', type:'string' },
    { name: 'tag_flag', type:'string' },
    { name: 'output_order', type:'number' },
    { name: 'sales_kind', type:'string' },
    { name: 'sales_kind_name', type:'string' },
    { name: 'distribution_enterprise_type', type:'string' },
    { name: 'distribution_enterprise_type_name', type:'string' },
    { name: 'accounting_type', type:'string' },
    { name: 'contract_st_date', type:'date', dateFormat: 'Y-m-d' },
    { name: 'contract_ed_date', type:'date', dateFormat: 'Y-m-d' },
    { name: 'monopoly_yn', type:'boolean' },
    { name: 'degree', type:'number' },
    { name: 'verify_yn', type:'string' },
    { name: 'confirm_yn', type:'string' },
    { name: 'use_yn', type:'string' },
    { name: 'insert_user_no', type:'string' },
    { name: 'insert_date', type:'string' },
    { name: 'update_user_no', type:'string' },
    { name: 'update_date', type:'string' }
  ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/AccountingRawdata/GetList`,
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
    const me = this,
          {header_grid, reqform, btn_save_apply, btn_save, btn_add, btn_delete} = this.refs,
          {result} = this.props,
          form = reqform.down('form'),
          formValues = form.getForm(),
          params = Ext.apply({}, {accounting_summary_no:result.data.accounting_summary_no}),
          params1 = Ext.apply({}, {type_name:'SALES_KIND'}),
          params2 = Ext.apply({}, {type_name:'DISTRIBUTION_ENTERPRISE_TYPE'});
          formValues.setValues(result.data);

    if(result == null || result.length == 0){
      this.onReconfigure('A')
    }
    else{
      if(result.data.status =='C'){
        btn_save_apply.setHidden(true);
        btn_save.setHidden(true);
        btn_add.setHidden(true);
        btn_delete.setHidden(true);
      }
      else{
        btn_save_apply.setHidden(false);
        btn_save.setHidden(false);
        btn_add.setHidden(false);
        btn_delete.setHidden(false);
      }
      this.onReconfigure(result.data.accounting_type)
    // if(result == null || result.length == 0){
    //   this.onReconfigure('A')
    // }
    // else{
    //   if(result.data.status =='C'){
    //     btn_save_apply.setHidden(true);
    //     btn_save.setHidden(true);
    //   }
    //   else{
    //     btn_save_apply.setHidden(false);
    //     btn_save.setHidden(false);
    //   }
    //   this.onReconfigure(result.data.accounting_type)
    }
    Ext.Promise.all([

      new Ext.Promise(function (res) {
        me.grid_movie_tag_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.grid_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.sp_sales_kind_store.load({
            params:{condition:JSON.stringify(params1)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.sp_distribution_enterprise_type_store.load({
            params:{condition:JSON.stringify(params2)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.sp_corp_detail_store.load({
            //params:{condition:JSON.stringify(params)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.grid_store.load({
          params:{condition:JSON.stringify(params)},
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
    });



  }
  uploadSuccess = (res) => {
    //console.log('uploadSuccess');
    const me = this,
          {header_grid, reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();
          this.grid_store.removeAll();
          console.log(formValues);
    if(res != null && res.data != null){
      for(var i=0; i<res.data.length; i++){
        var itm = res.data[i],
            movie_no = 0,
            movie_name = '',
            movie_check = 'X',
            tag_flag = 'N',
            sales_kind='',
            sales_kind_name='',
            distribution_enterprise_type='',
            distribution_enterprise_type_name='',
            recordIndex = me.grid_movie_tag_store.findExact('movie_tag_name', itm.col_04);
            //console.log(itm);
            if(recordIndex == -1){
              movie_name = '';
              movie_no = 0;
              movie_check = 'X';
              tag_flag = 'N';
            }
            else{
              movie_no = me.grid_movie_tag_store.getAt(recordIndex).get('movie_no');
              movie_name = me.grid_movie_tag_store.getAt(recordIndex).get('movie_name');
              movie_check = 'O';
              tag_flag = 'Y';
            }
            /*기본, 법무법인*/
            if(formValues.accounting_type == 'A' || formValues.accounting_type == 'C'){
              var ridx = me.sp_sales_kind_store.findExact('type_data', itm.col_08);
              if(ridx == -1){
                sales_kind = '';
                sales_kind_name = '';
              }
              else{
                sales_kind = me.sp_sales_kind_store.getAt(ridx).get('type_code');
                sales_kind_name = itm.col_08;
              }
            }
            /*핑크영화*/
            else if(formValues.accounting_type == 'B'){
              var ridx = me.sp_distribution_enterprise_type_store.findExact('type_data', itm.col_08);
              if(ridx == -1){
                distribution_enterprise_type = '';
                distribution_enterprise_type_name = '';
              }
              else{
                distribution_enterprise_type = me.sp_distribution_enterprise_type_store.getAt(ridx).get('type_code');
                distribution_enterprise_type_name = itm.col_08;
              }
            }

            var movie_info = {
              accounting_rawdata_no:0,
              accounting_type:formValues.accounting_type,
              sp_sales_date:itm.col_01,
              sp_cor_accounting_date:itm.col_02,
              movie_tag_name:itm.col_04,
              up_sp_corp_name:itm.col_03,
              sales_price:itm.col_05,
              accounting_rates:itm.col_06,
              accounting_price:itm.col_07,
              sales_kind:sales_kind,
              sales_kind_name:sales_kind_name,
              distribution_enterprise_type:distribution_enterprise_type,
              distribution_enterprise_type_name:distribution_enterprise_type_name,
              movie_check:movie_check,
              movie_name:movie_name,
              movie_no:movie_no,
              tag_flag:tag_flag
            }
            me.grid_store.add(movie_info);
      }
    }
  }
  onRowClick = (view, rec, node, rowIdx, eOpt, e) =>{
    var fieldName = view.getGridColumns()[eOpt.position.colIdx].dataIndex;
    if(fieldName == 'movie_check'){
      this.showMovieSearch(rec);
        //this.setState({isOpen:true, result:rec});
        // if(rec.data.movie_check == 'X'){
        // }
        // else{
        //   alert('정상적인 영화정보입니다.');
        //   return;
        // }
    }
  }
  showMovieSearch = (rec) => {
    const {movie_panel, moviesearchview} = this.refs;
    movie_panel.setHidden(false);
  }
  hiddenMovieSearch = () => {
    const {movie_panel, moviesearchview} = this.refs;
    movie_panel.setHidden(true);
  }
  onChange = (resp) => {
  }
  onSelectSettlementType = (rec) =>{
  }
  onReconfigure = () => {
  }
  setMoviewInfo = (result) =>{
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          selection = grid.getSelection();
          //console.log('setMoviewInfo=='+result)
          if (!Ext.isEmpty(selection)) {
            var tab_flag = 'N';
            if(result.data.tag_flag==true){
              tab_flag = 'Y';
            }
            for(var i=0; i<selection.length; i++){
              selection[i].set('movie_no',result.data.movie_no);
              selection[i].set('movie_name',result.data.movie_name);
              selection[i].set('movie_check','O');
              selection[i].set('tag_flag',tab_flag);
            }
          }
          me.setState({isOpen:false,result:null});

  }
  onSelectSpCorpDetail = (rec) =>{
    const me = this,
          {reqform} = this.refs,
          form = reqform.down('form'),
          sp_corp_name = reqform.down('form combo[name=sp_corp_detail_no]').selection.data.sp_corp_name,
          sp_corp_detail_name = reqform.down('form combo[name=sp_corp_detail_no]').selection.data.sp_corp_detail_name,
          settlement_title = reqform.down('form [name=settlement_title]'),
          title = sp_corp_name + '-' + sp_corp_detail_name + ' 정산내역';
          settlement_title.setValue(title);
          this.grid_store.removeAll();
          this.setState({sp_corp_detail_no:rec.data.sp_corp_detail_no, sp_corp_name:rec.data.sp_corp_detail_name});
  }
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  onClickSettleConfirm = () => {
    this.onSaveProcess('C');
  }
  onSave = () => {
    this.onSaveProcess('A');
  }
  onSaveProcess = (status) => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {model} = this.state,
          {header_grid, reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues(),
          grid = header_grid.down('grid'),
          store = grid.getStore();
    var accounting_rawdata_list = [],
        sales_date = '',
        settlement_date = '',
        total_sales_price = 0,            /* 총매출*/
        accounting_rates = '',             /* 정산율*/
        total_accounting_price = 0,       /* 정산금액*/
        total_accounting_cp_price = 0,    /*CP사 정산금액*/
        movie_no_check_count = 0;         /* 영화코드 매핑되지 않은 정산정보 개수 */
    if(store.count()>0){
        for(var i=0; i<store.count(); i++){
          var rec = store.data.items[i];
          if(i==0){
            sales_date = Ext.util.Format.date(rec.data.sp_sales_date, 'Y-m');
            settlement_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
            accounting_rates = rec.data.accounting_rates;
          }
          total_sales_price = total_sales_price + rec.data.sales_price||0;
          total_accounting_price = total_accounting_price + rec.data.accounting_price||0;
          total_accounting_cp_price = total_accounting_cp_price + rec.data.accounting_cp_price||0;
          rec.data.output_order = (i+1);
          if(rec.data.movie_no  == '' || rec.data.movie_no == '0' || rec.data.movie_no == null){
            movie_no_check_count++;
          }
          /*단매일경우*/
          if(result.data.accounting_type == 'D'){
            if(i==0){
              sales_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
              settlement_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
              accounting_rates = 0;
              rec.data.sp_sales_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
              rec.data.accounting_rates = 0;
            }
            rec.data.sp_corp_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
            rec.data.sp_cor_accounting_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
            rec.data.contract_st_date = Ext.util.Format.date(rec.data.contract_st_date, 'Y-m-d');
            rec.data.contract_ed_date = Ext.util.Format.date(rec.data.contract_ed_date, 'Y-m-d');
            rec.data.accounting_type = formValues.accounting_type;
            var ridx = me.grid_movie_store.findExact('movie_no', rec.data.movie_no);
            if(ridx == -1){
              rec.data.movie_tag_name = '';
              rec.data.movie_check = 'X';
              rec.data.tag_flag = 'N';
            }
            else{
              rec.data.movie_tag_name = me.grid_movie_store.getAt(ridx).get('movie_name');
              rec.data.movie_check = 'O';
              rec.data.tag_flag = 'N';
            }
            ridx = me.sp_corp_detail_store.findExact('sp_corp_detail_no', formValues.sp_corp_detail_no);
            if(ridx != -1){
                rec.data.up_sp_corp_name = me.sp_corp_detail_store.getAt(ridx).get('sp_corp_detail_name');
            }
            ridx = me.sp_sales_kind_store.findExact('type_code', rec.data.sales_kind);
            if(ridx != -1){
                rec.data.sales_kind_name = me.sp_sales_kind_store.getAt(ridx).get('type_data');
            }
          }
          else{
            rec.data.sp_sales_date = Ext.util.Format.date(rec.data.sp_sales_date, 'Y-m');
            rec.data.sp_corp_date = Ext.util.Format.date(rec.data.sp_corp_date, 'Y-m');
            rec.data.sp_cor_accounting_date = Ext.util.Format.date(rec.data.sp_cor_accounting_date, 'Y-m');
          }
          accounting_rawdata_list.push(rec.data);
        }
        if(movie_no_check_count>0){
          alert('정산데이터에 영화정보가 매칭되지 않은 정보가 있습니다. 다시 확인해주세요.');
          return;
        }
        /*정산 요약정보 생성*/
        formValues.sales_date                   = sales_date;
        formValues.settlement_date              = settlement_date;
        formValues.accounting_rates             = accounting_rates;
        formValues.total_sales_price            = total_sales_price;
        formValues.total_accounting_price       = total_accounting_price;
        formValues.total_accounting_cp_price    = total_accounting_cp_price;
        formValues.status                       = status;
        if(accounting_rawdata_list.length>0){
          formValues.accounting_rawdata_list = accounting_rawdata_list;
        }
        else{
          formValues.accounting_rawdata_list = '';
        }
        if(result != null){
          formValues.accounting_summary_no = result.data.accounting_summary_no;
          formValues.sp_corp_detail_no = result.data.sp_corp_detail_no;
          formValues.sales_date = result.data.sales_date;
          formValues.accounting_type = result.data.accounting_type;
          formValues.settlement_date = result.data.settlement_date;
        }
        var msg = '작성하신 정산서 정보를 저장하시겠습니까?';
        if(status =='C'){
          msg = '작성하신 정산서 정보를 정산적용 하시겠습니까?';
        }
        else{
          status = 'A';
        }
        /*저장처리부분*/
        const params = paramsPostHandler(formValues);

        showConfirm({
        msg: msg,
        title:'확인',
        callback: function () {
          Ext.Ajax.request({
              url: `${API_URL}/AccountingSummary/Save`,
              method: 'POST',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
              params : params,
              dataType: "json",
              success: function(response, request) {
                alert('정상적으로 저장되었습니다.');
                const ret = Ext.decode(response.responseText);
                //console.log(ret.newID)
                //console.log(request)
                showDisplayRefresh(ret.newID);
              },
              failure: function(response, request) {

              }
          });
        }});
    }
    else{
      alert('저장할 데이터가 없습니다.');
      return;
    }
  }
  onAccountingReportChange = (checkbox, newValue, oldValue, eOpts ) =>{
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {btn_file_upload, btn_add, btn_delete} = this.refs,
          {model} = this.state,
          {header_grid, reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues(),
          grid = header_grid.down('grid'),
          store = grid.getStore();
          store.removeAll();
          //console.log(btn_file_upload)
          if(newValue.accounting_type == 'D'){
            btn_file_upload.setHidden(true);
            btn_add.setHidden(false);
            btn_delete.setHidden(false);
          }
          else{
            btn_file_upload.setHidden(false);
            btn_add.setHidden(true);
            btn_delete.setHidden(true);
          }
          this.onReconfigure(newValue.accounting_type);
  }
  onReconfigure = (accounting_type ) =>{
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {model} = this.state,
          {header_grid, reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues(),
          grid = header_grid.down('grid'),
          store = grid.getStore();

    var grid_model = [];
    grid_model.push(
      {
        text: '일련번호',
        dataIndex: 'accounting_rawdata_no',
        type: 'TEXT',
        width: 10,
        hidden: true,
        hideable: false,
        isExcel: true,
        align: 'center',
        sortable:true,
        style:'text-align:center'
      }
    );
    /*법무정산*/
    if(accounting_type == 'A' || accounting_type == 'B' || accounting_type == 'E'){
      grid_model.push(
        {
            header: '<font color=blue>서비스월</font>',
            dataIndex: 'sp_sales_date',
            type: 'TEXT',
            width: 100,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              var formated = Ext.util.Format.date(value, 'Y-m');
              return formated;
            },
            format: 'Y-m',
            editor: {
              xtype: 'monthfield',
              allowBlank: true,
              format: 'Y-m'
            }
        },
        {
            header: '<font color=blue>매출월</font>',
            dataIndex: 'sp_cor_accounting_date',
            type: 'TEXT',
            width: 100,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              var formated = Ext.util.Format.date(value, 'Y-m');
              return formated;
            },
            format: 'Y-m',
            editor: {
              xtype: 'monthfield',
              allowBlank: true,
              format: 'Y-m'
            }
        },
        {
            header: '업체명',
            dataIndex: 'up_sp_corp_name',
            type: 'TEXT',
            width: 180,
            isExcel: true,
            align: 'left',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return value;
            }
        },
        {
            header: '업로드영화명',
            dataIndex: 'movie_tag_name',
            type: 'TEXT',
            width: 300,
            isExcel: true,
            align: 'left',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return value;
            }
        },
        {
            header: '<font color=red>*</font>NK영화명',
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
            header: 'NK영화일련번호',
            dataIndex: 'movie_no',
            type: 'TEXT',
            width: 300,
            isExcel: true,
            align: 'left',
            sortable:true,
            style:'text-align:center',
            hidden:true
        },
        {
            header: '영화명<br>검증결과',
            dataIndex: 'movie_check',
            type: 'TEXT',
            width: 80,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            cls:'grid-header-color-f86c6b',
            renderer: function(value, metaData, record) {
              if(value=='X'){
                return '<span style="font-weight:bold;cursor:pointer;color:red">' + value + '</span>';
              }
              else{
                return '<span style="cursor:pointer">' + value + '</span>';
              }
            }
        },
        {
            header: '영화Tag<br>적용여부',
            dataIndex: 'tag_flag',
            type: 'TEXT',
            width: 80,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return value;
            }
        },
        {
            header: '<font color=blue>총매출</font>',
            dataIndex: 'sales_price',
            type: 'TEXT',
            width: 140,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.00');
            },
            editor: {
                 xtype:'numberfield',
                 allowBlank: true
            },
            summaryType: 'sum',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,000.00');
            }
        },
        {
            header: '<font color=blue>정산율</font>',
            dataIndex: 'accounting_rates',
            type: 'TEXT',
            width: 100,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.000');
            },
            editor: {
                 allowBlank: true
            },
            summaryType: 'max',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,000.000');
            }
        },
        {
            header: '<font color=blue>정산금액</font>',
            dataIndex: 'accounting_price',
            type: 'TEXT',
            width: 140,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.00');
            },
            editor: {
                 xtype:'numberfield',
                 allowBlank: true
            },
            summaryType: 'sum',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,000.00');
            }
        }
      );
    }
    /*기본정산, 핑크정산*/
    if(accounting_type == 'C'){
      grid_model.push(
        {
            header: '<font color=blue>매출월</font>',
            dataIndex: 'sp_cor_accounting_date',
            type: 'TEXT',
            width: 100,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              var formated = Ext.util.Format.date(value, 'Y-m');
              return formated;
            },
            format: 'Y-m',
            editor: {
              xtype: 'monthfield',
              allowBlank: true,
              format: 'Y-m'
            }
        },
        {
            header: '업로드영화명',
            dataIndex: 'movie_tag_name',
            type: 'TEXT',
            width: 300,
            isExcel: true,
            align: 'left',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return value;
            }
        },
        {
            header: 'NK영화명',
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
            header: 'NK영화일련번호',
            dataIndex: 'movie_no',
            type: 'TEXT',
            width: 300,
            isExcel: true,
            align: 'left',
            sortable:true,
            style:'text-align:center',
            hidden:true
        },
        {
            header: '영화명<br>검증결과',
            dataIndex: 'movie_check',
            type: 'TEXT',
            width: 80,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            cls:'grid-header-color-f86c6b',
            renderer: function(value, metaData, record) {
              if(value=='X'){
                return '<span style="font-weight:bold;cursor:pointer;color:red">' + value + '</span>';
              }
              else{
                return '<span style="cursor:pointer">' + value + '</span>';
              }
            }
        },
        {
            header: '영화Tag<br>적용여부',
            dataIndex: 'tag_flag',
            type: 'TEXT',
            width: 80,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return value;
            }
        },
        {
            header: '<font color=blue>입금액</font>',
            dataIndex: 'accounting_price',
            type: 'TEXT',
            width: 140,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.00');
            },
            editor: {
                 xtype:'numberfield',
                 allowBlank: true
            },
            summaryType: 'sum',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,000.00');
            }
        },
        {
            header: '<font color=blue>NK</font>',
            dataIndex: 'raw_nk_price',
            type: 'TEXT',
            width: 140,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.00');
            },
            editor: {
                 xtype:'numberfield',
                 allowBlank: true
            },
            summaryType: 'sum',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,.00');
            }
        },
        {
            header: '<font color=blue>모니터링업체</font>',
            dataIndex: 'raw_monitor_price',
            type: 'TEXT',
            width: 140,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.00');
            },
            editor: {
                 xtype:'numberfield',
                 allowBlank: true
            },
            summaryType: 'sum',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,000.00');
            }
        },
        {
            header: '<font color=blue>법무법인</font>',
            dataIndex: 'raw_price',
            type: 'TEXT',
            width: 140,
            isExcel: true,
            align: 'right',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              return Ext.util.Format.number(value, '0,000.00');
            },
            editor: {
                 xtype:'numberfield',
                 allowBlank: true
            },
            summaryType: 'sum',
            summaryRenderer : function(value, summaryData, dataIndex) {
                return Ext.util.Format.number(parseFloat(value), '0,000.00');
            }
        }
      );
    }

    /*판권구분 : 기본 */
    if(accounting_type == 'A' || accounting_type == 'B' || accounting_type == 'E'){
      grid_model.push(
        {
            text: '<font color=blue>판권구분</font>',
            dataIndex: 'sales_kind',
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
                 store:this.sp_sales_kind_store
            },
            renderer: this.rendererSalesKind
        }
      )
    }
    /*유통업체*/
    if(accounting_type == 'B'){
      grid_model.push(
        {
            text: '<font color=blue>유통업체</font>',
            dataIndex: 'distribution_enterprise_type',
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
                 store:this.sp_distribution_enterprise_type_store
            },
            renderer: this.rendererDistributionEnterType
        }
      )
    }
    /*단매등록*/
    if(accounting_type == 'D'){
      grid_model.push(
        {
            header: '<font color=blue>판매월</font>',
            dataIndex: 'sp_cor_accounting_date',
            type: 'TEXT',
            width: 120,
            isExcel: true,
            align: 'center',
            sortable:true,
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              var formated = Ext.util.Format.date(value, 'Y-m');
              return formated;
            },
            format: 'Y-m',
            editor: {
              xtype: 'monthfield',
              allowBlank: true,
              format: 'Y-m'
            }
        },
        // {
        //     text: '<font color=blue>업체명</font>',
        //     dataIndex: 'sp_corp_detail_no',
        //     type: 'COMBO',
        //     width: 200,
        //     isExcel: true,
        //     align: 'left',
        //     style:'text-align:center'
        //     // editor: {
        //     //      xtype: 'combobox',
        //     //      emptyText: '선택',
        //     //      displayField: 'sp_corp_detail_name',
        //     //      valueField: 'sp_corp_detail_no',
        //     //      queryMode: 'local',
        //     //      typeAhead: false,
        //     //      editable: true,
        //     //      enableKeyEvents: true,
        //     //      forceSelection: false,
        //     //      triggerAction: 'all',
        //     //      selectOnFocus: false,
        //     //      store:this.sp_corp_detail_store
        //     // },
        //     // renderer: this.rendererSpCorpDetail
        // },
        {
            text: '<font color=blue>영화명</font>',
            dataIndex: 'movie_no',
            type: 'COMBO',
            width: 300,
            isExcel: true,
            align: 'left',
            style:'text-align:center',
            editor: {
                 xtype: 'combobox',
                 emptyText: '선택',
                 displayField: 'movie_name',
                 valueField: 'movie_no',
                 queryMode: 'local',
                 typeAhead: false,
                 editable: true,
                 enableKeyEvents: true,
                 forceSelection: false,
                 triggerAction: 'all',
                 selectOnFocus: false,
                 store:this.grid_movie_store
            },
            renderer: this.rendererMovie,
            summaryType: 'count',
            summaryRenderer: function (value, summaryData, dataIndex) {
                return '합계'
            }
        },
        {
             text: '<font color=blue>판매금액</font>',
             dataIndex: 'accounting_price',
             type: 'NUMBER',
             width: 100,
             isExcel: true,
             editable: true,
             align: 'right',
             style:'text-align:center',
             renderer: function(value, metaData, record) {
               return Ext.util.Format.number(value, '0,000.00');
             },
             editor: {
                 xtype: 'numberfield'
             },
             summaryType: 'sum',
             summaryRenderer : function(value, summaryData, dataIndex) {
                 return Ext.util.Format.number(parseFloat(value), '0,000.00');
             }
         },
        {
            text: '<font color=blue>판권구분</font>',
            dataIndex: 'sales_kind',
            type: 'COMBO',
            width: 200,
            isExcel: true,
            align: 'left',
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
                 store:this.sp_sales_kind_store
            },
            renderer: this.rendererSalesKind
        },
        {
            text: '<font color=blue>계약시작일</font>',
            dataIndex: 'contract_st_date',
            xtype: 'datecolumn',
            type: 'TEXT',
            width: 120,
            isExcel: true,
            align: 'center',
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              var formated = Ext.util.Format.date(value, 'Y-m-d');
              return formated;
            },
            format: 'Y-m-d',
            editor: {
              xtype: 'datefield',
              allowBlank: true,
              format: 'Y-m-d'
            }
        },
        {
            text: '<font color=blue>계약종료일</font>',
            dataIndex: 'contract_ed_date',
            xtype: 'datecolumn',
            type: 'TEXT',
            width: 120,
            isExcel: true,
            align: 'center',
            style:'text-align:center',
            renderer: function(value, metaData, record) {
              var formated = Ext.util.Format.date(value, 'Y-m-d');
              return formated;
            },
            format: 'Y-m-d',
            editor: {
              xtype: 'datefield',
              allowBlank: true,
              format: 'Y-m-d'
            }
        },
        {
            text: '독점여부',
            xtype: 'checkcolumn',
            dataIndex: 'monopoly_yn',
            type: 'TEXT',
            width: 80,
            isExcel: true,
            align: 'center',
            style:'text-align:center'
        }
      );
    }
    grid.reconfigure(store, grid_model);
    grid.getView().refresh(true);

  }
  rendererSalesKind = (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.sp_sales_kind_store.findExact('type_code', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.sp_sales_kind_store.getAt(recordIndex).get('type_data');
  }
  rendererDistributionEnterType = (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.sp_distribution_enterprise_type_store.findExact('type_code', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.sp_distribution_enterprise_type_store.getAt(recordIndex).get('type_data');
  }
  rendererSpCorpDetail= (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.sp_corp_detail_store.findExact('sp_corp_detail_no', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.sp_corp_detail_store.getAt(recordIndex).get('sp_corp_detail_name');
  }
  rendererMovie = (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.grid_movie_store.findExact('movie_no', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.grid_movie_store.getAt(recordIndex).get('movie_name');
  }
  onClickAdd = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore();
          store.insert(0, store.createModel({movie_check:'X',tag_flag:'N'}));
  }
  onClickDelete = (item) => {
    const me = this,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          //selection = grid.getSelection(),
          selection = grid.getSelectionModel(),
          params = [],
          promiseList = [];
          if (Ext.isEmpty(selection)) {
              alert('선택된 정보가 없습니다.');
              return;
          }

          showConfirm({
              msg: '선택하신 정산 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                 var indexes = [], i = 0;
                 for (var i = store.getCount() - 1; i >= 0; i--) {
                   if (selection.isSelected(i)) {
                     store.remove(store.getAt(i));
                   }
                   //store.remove(selection[i].data);
                 }
                 //alert('정상적으로 삭제 되었습니다.');
              }
          });
  }
  render(){
    const me = this,
          {isOpen} = this.state,
          { result, onClose } = this.props,
          sp_corp_detail_defaults = {
            sp_corp_no:this.state.sp_corp_no,
            sp_corp_name:this.state.sp_corp_name
          },
          radioProps = {
              name: 'radios'
          }
    return(
      <Window
          key={'excelupload_key'}
          id={'settlement_upload_form'}
          width={900}
          height={650}
          minwidth={800}
          minHeight={500}
          title="SP사 정산서 Upload 관리"
          autoShow={true}
          modal={true}
          draggable={true}
          resizable={false}
          layout={'fit'}
          align={'center'}
          bodyPadding={7}
          closable={false}
          maximizable={true}
          scrollable={false}
          maximized={true}
          listeners={[{
            show: function(){
              //console.log('show')
              this.removeCls("x-unselectable");
           }
          }]}
          onClose={onClose}>
          <Panel
              layout={'fit'}>
              <Panel
                  layout="border"
                  bodyBorder ={false}
                  bodyPadding={0}
                  padding={0}
                  border={false}
                  frame={false}
                  scrollable={false}
                  fullscreen={true}>
                  <Panel
                      region={'north'}
                      height={40}
                      bodyBorder ={false}
                      bodyPadding={0}
                      border={false}
                      frame={false}
                      style={{borderBottom:'1px solid #d0d0d0'}}
                      fullscreen={true}>
                      <Container
                          layout={'hbox'}
                          border={false}
                          flex={1}>
                          <Panel
                              layout={[{
                                type: 'hbox',
                                align: 'stretch'
                              }]}
                              border={false}
                              flex={2}
                              ref={'reqform'}
                              items={[
                                {
                                    xtype: 'form',
                                    border: false,
                                    layout: {
                                      type: 'vbox',
                                      align: 'stretch'
                                    },
                                    items: [
                                      {
                                          xtype: 'container',
                                          defaultType: 'textfield',
                                          layout: {
                                          type: 'hbox',
                                          align: 'stretch'
                                          },
                                          defaults: {
                                              labelAlign: 'right',
                                              labelWidth: 85,
                                              margin: '0 0 2 0'
                                          },
                                          items:[
                                            {
                                                xtype : 'displayfield',
                                                fieldLabel: '<font color=red>*</font>정산서종류',
                                                //style : 'background-color:#FF0000',
                                                name:'accounting_type_name',
                                                value : ''
                                            },
                                            {
                                                xtype : 'displayfield',
                                                fieldLabel: '<font color=red>*</font>정산업체명',
                                                //style : 'background-color:#FF0000',
                                                name:'sp_corp_detail_name',
                                                value : ''
                                            },
                                            {
                                              xtype:'textfield',
                                              fieldLabel: '<font color=red>*</font>정산서명',
                                              labelAlign: 'right',
                                              labelWidth: 85,
                                              margin: '0 0 2 0',
                                              name:'settlement_title',
                                              hidden:true,
                                              flex:1
                                            }
                                          ]
                                      }
                                    ]
                                }
                              ]}/>

                          <Container
                              layout={'hbox'}
                              bodyPadding={7}
                              flex={1}>
                                <Button
                                  ref={'btn_add'}
                                  text={'추가'}
                                  hidden={true}
                                  style={{'font-size': '14px','background-color':'#4783AE','border-color':'#4783AE','padding':'5px 7px 4px 7px','border-radius': '4px 4px 4px 4px'}}
                                  margin={'2 5 0 5'}
                                  onClick={this.onClickAdd}/>
                              <Button
                                  ref={'btn_delete'}
                                  text={'삭제'}
                                  hidden={true}
                                  style={{'font-size': '14px','background-color':'#4783AE','border-color':'#4783AE','padding':'5px 7px 4px 7px','border-radius': '4px 4px 4px 4px'}}
                                  margin={'2 5 0 5'}
                                  onClick={this.onClickDelete}/>
                              <Button
                                  ref={'btn_save_apply'}
                                  text={'정산적용'}
                                  hidden={false}
                                  style={{'font-size': '14px','background-color':'#4783AE','border-color':'#4783AE','padding':'5px 7px 4px 7px','border-radius': '4px 4px 4px 4px'}}
                                  margin={'2 5 0 5'}
                                  onClick={this.onClickSettleConfirm}/>
                              <Button
                                  ref={'btn_save'}
                                  text={'저장'}
                                  hidden={false}
                                  style={{'font-size': '14px','background-color':'#4783AE','border-color':'#4783AE','padding':'5px 7px 4px 7px','border-radius': '4px 4px 4px 4px'}}
                                  margin={'2 5 0 5'}
                                  onClick={this.onSave}/>
                              <Button
                                  ref={'btn_close'}
                                  text={'닫기'}
                                  hidden={false}
                                  style={{'font-size': '14px','background-color':'#4783AE','border-color':'#4783AE','padding':'5px 7px 4px 7px','border-radius': '4px 4px 4px 4px'}}
                                  margin={'2 5 0 5'}
                                  onClick={this.close}/>
                          </Container>
                      </Container>
                  </Panel>
                  <Panel
                      region={'center'}
                      collapsible={false}
                      layout="fit">
                      <Panel
                          layout="border"
                          bodyBorder ={false}
                          bodyPadding={0}
                          padding={0}
                          border={false}
                          frame={false}
                          fullscreen={true}>
                          <Panel
                              region={'center'}
                              layout={'fit'}
                              ref={'header_grid'}
                              split={true}
                              flex={1}
                              items={[
                                {
                                  xtype:'grid',
                                  layout:'fit',
                                  plugins:[
                                      {
                                          ptype: 'cellediting',
                                          clicksToEdit: 1
                                      },
                                      'gridfilters'
                                  ],
                                  stateId:'service-settlement-upload-form',
                                  stateful:false,
                                  resizable: false,
                                  columnLines: false,
                                  rowLines: true,
                                  lockable:true,
                                  enableLocking:true,
                                  enableColumnHide: true,
                                  enableColumnMove: true,
                                  enableColumnResize: true,
                                  sealedColumns: false,
                                  sortableColumns: false,
                                  trackMouseOver: false,
                                  scrollable:true,
                                  selModel: {
                                      type: 'checkboxmodel'
                                  },
                                  features: [{
                                      ftype: 'summary'
                                  }],
                                  viewConfig:{
                                      enableTextSelection:true,
                                      stripeRows:false,
                                      emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                                      deferEmptyText: false
                                  },
                                  listeners:{
                                    rowclick : this.onRowClick
                                  },
                                  tbar:[{
                                    xtype:'component',
                                    code: 'counter',
                                    html: '<strong>총: 0건</strong>'
                                  }],
                                  // tbar:[{
                                  //   xtype:'component',
                                  //   flex:1,
                                  //   html:'※ SP사 정산서를 업로드 하시면, 업로드한 영화명과 등록된 영화명이 틀릴경우 수정이 가능합니다.'
                                  // },'->',{
                                  //   xtype:'button',
                                  //   text:'<font color=white>추가</font>',
                                  //   style: {
                                  //       'font-size': '14px',
                                  //       'background-color':'#4783AE',
                                  //       'border-color':'#4783AE',
                                  //       'padding':'5px 7px 4px 7px',
                                  //       'text-decoration': 'none',
                                  //       'border-radius': '4px 4px 4px 4px'
                                  //   },
                                  //   handler:this.onClickAdd
                                  // },
                                  // {
                                  //   xtype:'button',
                                  //   text:'<font color=white>삭제</font>',
                                  //   style: {
                                  //       'font-size': '14px',
                                  //       'background-color':'#4783AE',
                                  //       'border-color':'#4783AE',
                                  //       'padding':'5px 7px 4px 7px',
                                  //       'text-decoration': 'none',
                                  //       'border-radius': '4px 4px 4px 4px'
                                  //   },
                                  //   handler:this.onClickDelete
                                  // }],
                                  store:this.grid_store,
                                  columns:[
                                  ]
                                }
                              ]}/>
                          <Panel
                              region={'east'}
                              layout={'fit'}
                              ref={'movie_panel'}
                              split={true}
                              hidden={true}
                              width={540}>
                              <MovieSearchView
                                ref={'moviesearchview'}
                                result={result}
                                setMoviewInfo={this.setMoviewInfo.bind(this)}
                                onClose={() => this.hiddenMovieSearch()}/>
                          </Panel>
                      </Panel>
                  </Panel>
              </Panel>
          </Panel>
      </Window>
    )
  }
}

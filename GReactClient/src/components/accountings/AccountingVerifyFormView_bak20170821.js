import React, { Component } from 'react';
import cookie from 'react-cookies';

import { Window, TextField, Button, Container, Grid, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

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
    btnHidden:true,
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
  /*upload 정산서 정보 관리 store*/
  grid_store = Ext.create('Ext.data.Store',{
    fields : [
      { name: 'accounting_rawdata_no', type:'number' },
      { name: 'accounting_summary_no', type:'number' },
      { name: 'sp_corp_detail_no', type:'number' },
      { name: 'sp_sales_date', type:'string' },
      { name: 'sp_cor_accounting_date', type:'string' },
      { name: 'movie_tag_name', type:'string' },
      { name: 'movie_name', type:'string' },
      { name: 'up_sp_corp_name', type:'string' },
      { name: 'sales_price', type:'number' },
      { name: 'accounting_rates', type:'number' },
      { name: 'accounting_price', type:'number' },
      { name: 'accounting_cp_price', type:'number' },
      { name: 'movie_no', type:'number' },
      { name: 'movie_check', type:'string' },
      { name: 'tag_flag', type:'string' },
      { name: 'output_order', type:'number' },
      { name: 'degree', type:'number' },
      { name: 'verify_yn', type:'string' },
      { name: 'confirm_yn', type:'string' },
      { name: 'use_yn', type:'string' }
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
    const me = this;
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.grid_movie_tag_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.sp_corp_detail_store.load({
          //params:{condition:JSON.stringify(params)},
          callback: function (recs, operation, success) {
            //me.onSelectedAddStore();
          }
      });
    });
  }
  componentDidMount(){
    const me = this,
      {header_grid, reqform} = this.refs,
      {result} = this.props,
      form = reqform.down('form'),
      formValues = form.getForm(),
      params = Ext.apply({}, {accounting_summary_no:result.data.accounting_summary_no});
      formValues.setValues(result.data);

      // var btn_save = header_grid.down('grid button [code=save]'),
      // btn_salesconfirm = header_grid.down('grid button [code=salesconfirm]');
      console.log('result.data.status=='+result.data.status);
      if(result != null){
        if(result.data.status =='C'){
          this.setState({btnHidden:true});
          // btn_save.setHidden('true');
          // btn_salesconfirm.setHidden('true');
        }
        else{
          this.setState({btnHidden:false});
          // btn_save.setHidden('false');
          // btn_salesconfirm.setHidden('false');
        }
      }
      this.grid_store.load({
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
  }
  uploadSuccess = (res) => {
    //console.log('uploadSuccess');
    const me = this;
    this.grid_store.removeAll();
    if(res != null && res.data != null){
      for(var i=0; i<res.data.length; i++){
        var itm = res.data[i],
            movie_no = 0,
            movie_name = '',
            movie_check = 'X',
            tag_flag = 'N',
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
            var movie_info = {
              accounting_rawdata_no:0,
              sp_sales_date:itm.col_01,
              sp_cor_accounting_date:itm.col_02,
              movie_tag_name:itm.col_04,
              up_sp_corp_name:itm.col_03,
              sales_price:itm.col_05,
              accounting_rates:itm.col_06,
              accounting_price:itm.col_07,
              accounting_cp_price:itm.col_08,
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
    const {result} = this.props;
    if(result.data.status != 'C'){
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
            selection[0].set('movie_no',result.data.movie_no);
            selection[0].set('movie_name',result.data.movie_name);
            selection[0].set('movie_check','O');
            selection[0].set('tag_flag',tab_flag);
          }
          me.setState({isOpen:false,result:null});

  }
  onSelectSpCorpDetail = (rec) =>{
    const me = this,
          {reqform, header_grid} = this.refs,
          form = header_grid.down('form'),
          sp_corp_name = header_grid.down('form combo[name=sp_corp_detail_no]').selection.data.sp_corp_name,
          sp_corp_detail_name = header_grid.down('form combo[name=sp_corp_detail_no]').selection.data.sp_corp_detail_name,
          settlement_title = header_grid.down('form [name=settlement_title]'),
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
            sales_date = rec.data.sp_sales_date;
            settlement_date = rec.data.sp_cor_accounting_date;
            accounting_rates = rec.data.accounting_rates;
          }
          total_sales_price = total_sales_price + rec.data.sales_price||0;
          total_accounting_price = total_accounting_price + rec.data.accounting_price||0;
          total_accounting_cp_price = total_accounting_cp_price + rec.data.accounting_cp_price||0;
          rec.data.output_order = (i+1);
          if(rec.data.movie_no  == '' || rec.data.movie_no == '0' || rec.data.movie_no == null){
            movie_no_check_count++;
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
  render(){
    const me = this,
          {isOpen, btnHidden} = this.state,
          { result, onClose } = this.props;
          console.log('btnHidden==' + btnHidden)
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
                      height={60}
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
                                              flex:1
                                            }
                                          ]
                                      }
                                    ]
                                }
                              ]}/>


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
                                  stateId:'accounting_verify-form-view',
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
                                  },'->',
                                  {
                                    xtype:'button',
                                    text:'<font color=white>검증완료</font>',
                                    cls:'base-button-round',
                                    hidden:true,
                                    style: {
                                        'font-size': '14px',
                                        'background-color':'#4783AE',
                                        'border-color':'#4783AE',
                                        'padding':'5px 7px 4px 7px',
                                        'text-decoration': 'none',
                                        'border-radius': '4px 4px 4px 4px'
                                    },
                                    //handler:this.onClickVerifyConfirm
                                  },
                                  {
                                    xtype:'button',
                                    text:'<font color=white>정산적용</font>',
                                    cls:'base-button-round',
                                    style: {
                                        'font-size': '14px',
                                        'background-color':'#4783AE',
                                        'border-color':'#4783AE',
                                        'padding':'5px 7px 4px 7px',
                                        'text-decoration': 'none',
                                        'border-radius': '4px 4px 4px 4px'
                                    },
                                    code:'salesconfirm',
                                    hidden:this.state.btnHidden,
                                    handler:this.onClickSettleConfirm
                                  },
                                  {
                                    xtype:'button',
                                    text:'<font color=white>저장</font>',
                                    cls:'base-button-round',
                                    style: {
                                        'font-size': '14px',
                                        'background-color':'#4783AE',
                                        'border-color':'#4783AE',
                                        'padding':'5px 7px 4px 7px',
                                        'text-decoration': 'none',
                                        'border-radius': '4px 4px 4px 4px'
                                    },
                                    code:'save',
                                    hidden:btnHidden,
                                    handler:this.onSave
                                  },
                                  {
                                    xtype:'button',
                                    text:'<font color=white>닫기</font>',
                                    cls:'base-button-round',
                                    style: {
                                        'font-size': '14px',
                                        'background-color':'#4783AE',
                                        'border-color':'#4783AE',
                                        'padding':'5px 7px 4px 7px',
                                        'text-decoration': 'none',
                                        'border-radius': '4px 4px 4px 4px'
                                    },
                                    handler:this.close
                                  }],
                                  store:this.grid_store,
                                  columns:[
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
                                      style:'text-align:center',
                                      filter: {
                                          type: 'string'
                                      }
                                    },
                                    {
                                        header: '매출월',
                                        dataIndex: 'sp_sales_date',
                                        type: 'TEXT',
                                        width: 100,
                                        isExcel: true,
                                        align: 'center',
                                        sortable:true,
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('sp_sales_date');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return value;
                                        },
                                        filter: {
                                            type: 'string'
                                        }
                                    },
                                    {
                                        header: '정산월',
                                        dataIndex: 'sp_cor_accounting_date',
                                        type: 'TEXT',
                                        width: 100,
                                        isExcel: true,
                                        align: 'center',
                                        sortable:true,
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('sp_cor_accounting_date');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return value;
                                        },
                                        filter: {
                                            type: 'string'
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
                                          var deviceDetail = record.get('up_sp_corp_name');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return value;
                                        },
                                        filter: {
                                            type: 'string'
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
                                          var deviceDetail = record.get('movie_tag_name');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return value;
                                        },
                                        filter: {
                                            type: 'string'
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
                                          var deviceDetail = record.get('movie_name');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return value;
                                        },
                                        filter: {
                                            type: 'string'
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
                                        header: '총매출',
                                        dataIndex: 'sales_price',
                                        type: 'TEXT',
                                        width: 140,
                                        isExcel: true,
                                        align: 'right',
                                        sortable:true,
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('sales_price');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return Ext.util.Format.number(value, '0,000');
                                        },
                                        editor: {
                                             xtype:'numberfield',
                                             allowBlank: true
                                        },
                                        filter: {
                                            type: 'string'
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
                                        width: 100,
                                        isExcel: true,
                                        align: 'right',
                                        sortable:true,
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('accounting_rates');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return Ext.util.Format.number(value, '0,000');
                                        },
                                        editor: {
                                             allowBlank: true
                                        },
                                        filter: {
                                            type: 'string'
                                        },
                                        summaryType: 'max',
                                        summaryRenderer : function(value, summaryData, dataIndex) {
                                            return Ext.util.Format.number(parseInt(value), '0,000');
                                        }
                                    },
                                    {
                                        header: '정산금액',
                                        dataIndex: 'accounting_price',
                                        type: 'TEXT',
                                        width: 140,
                                        isExcel: true,
                                        align: 'right',
                                        sortable:true,
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('accounting_price');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return Ext.util.Format.number(value, '0,000');
                                        },
                                        editor: {
                                             xtype:'numberfield',
                                             allowBlank: true
                                        },
                                        filter: {
                                            type: 'string'
                                        },
                                        summaryType: 'sum',
                                        summaryRenderer : function(value, summaryData, dataIndex) {
                                            return Ext.util.Format.number(parseInt(value), '0,000');
                                        }
                                    },
                                    {
                                        header: 'CP사 정산금',
                                        dataIndex: 'accounting_cp_price',
                                        type: 'TEXT',
                                        width: 140,
                                        isExcel: true,
                                        align: 'right',
                                        sortable:true,
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('accounting_cp_price');
                                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                          return Ext.util.Format.number(value, '0,000');
                                        },
                                        editor: {
                                             xtype:'numberfield',
                                             allowBlank: true
                                        },
                                        filter: {
                                            type: 'string'
                                        },
                                        summaryType: 'sum',
                                        summaryRenderer : function(value, summaryData, dataIndex) {
                                            return Ext.util.Format.number(parseInt(value), '0,000');
                                        }
                                    }
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

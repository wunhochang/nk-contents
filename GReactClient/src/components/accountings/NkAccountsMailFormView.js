import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';


import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class NkAccountsMailFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '정산자료 메일발송'
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
      { name: 'accounting_rates', type:'number' },
      { name: 'accounting_price', type:'number' },
      { name: 'movie_name', type:'string' },
      { name: 'movie_name2', type:'string' },
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
  cc_mail_store = Ext.create('Ext.data.Store', {
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
  cp_report_store = Ext.create('Ext.data.Store', {
          fields: [
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/CpCorp/GetReportComboList`,
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
    this.cp_report_store.load({
        callback: function (recs, operation, success) {
          me.cp_report_store.insert(0, {report_no:null, report_name:'선택'});
        }
    });
  }
  componentDidMount(){

    const me = this,

          {result,result2, showDisplayRefresh} = this.props,
        //  {result2} = this.props,
        //  {result2} = this.props,
          {header_grid} = this.refs,
          {reqform} = this.refs,
         // form = reqform.down('form'),
          form = header_grid.down('form'),
          formValues = form.getValues();
          //params = Ext.apply({}, {type_name:'SETTLEMENT_CC'});
          console.log(formValues);
          Ext.getCmp('st_date').setValue(result.st_date);
          Ext.getCmp('cp_corp_no').setValue(result.cp_corp_no);
          Ext.getCmp('cp_corp_detail_no').setValue(result.cp_corp_detail_no);
          Ext.getCmp('cp_corp_name').setValue(result.cp_corp_name);

          var txtremark=formValues.remark;
          txtremark = txtremark.replace('@0000년',Ext.util.Format.substr(result.st_date, 0, 4)+'년');
          txtremark = txtremark.replace('@00월',Ext.util.Format.substr(result.st_date, 5, 2)+'월');
          Ext.getCmp('to_email').setValue(result.tax_email);// .hide();
          Ext.getCmp('remark').setValue(txtremark);// .hide();
          Ext.getCmp('remark_html').setHtml("txtremark");

          Ext.getCmp('title_html').setHtml('제 목 : '+'[NK]'+result.cp_corp_name+' '+Ext.util.Format.substr(result.st_date, 0, 4)+'년 '+Ext.util.Format.substr(result.st_date, 5, 2)+'월 정산서<p>');

          console.log('tttt ' + JSON.stringify(result, null, 2));
          this.onIDCheck();
          
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.cc_mail_store.load({
            params:{condition:JSON.stringify(result)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.cp_report_store.load({
            params:{condition:JSON.stringify(result)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
     // const me = this,
     
    // this.mainDataStoreLoad();
         // {reqform} = this.refs;
          //params = Ext.apply({}, {type_name:'PROFIT_LOSS_MOVIE_GUBUN'});
      if(result2 !=null){

        console.log('8888 ' + JSON.stringify(result2, null, 2));
        //reqform.down('form').getForm().setValues(result.data);
        //form.findField('user_name').focus();
        //form.findField('settlement_date').setValue(result.data.settlement_date);
        reqform.down('form').getForm().setValues(result2.data);
      }
      else{
        //form.findField('user_id').focus();
      }
      //this.onIDCheck();
    });
  }
  onIDCheck = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {header_grid} = this.refs,
          {reqform} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();

    Ext.Ajax.request({
       // url: `${API_URL}/CommonCode/GetComboList?type_name=SETTLEMENT_CC`,
        url: `${API_URL}/User/MailCheck/SETTLEMENT_CC`,
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;' },
        dataType: "json",
        success: function(response, request) {
          if(response.status ==200){
             var ret = Ext.decode(response.responseText);
             if(ret.data.length>0 && ret.success == true){
               if(ret.data[0].cnt == 0){
                // me.setState({user_id_check:true, old_user_id:formValues.user_id});
                 alert('메일참조자가 없습니다.');
               }
               else{
                Ext.getCmp('cc_email').setValue(ret.data[0].type_data);
               }
             }
             else{
               //me.setState({user_id_check:false, old_user_id:''});
               alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
             }
          }
          else{
            //m//e.setState({user_id_check:false, old_user_id:''});
            alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
          }
        },
        failure: function(response, request) {
          alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
        }
    });
  }
  preview = (item) => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
          console.log(formValues);

          if(formValues.report_no == null || formValues.report_no == '0' || formValues.report_no == ''){
            alert('정산서를 선택하세요.');
            return;
          }

          Ext.getCmp('tax_publish_date').hide();
          Ext.getCmp('tax_end_date').hide();
          Ext.getCmp('report_no').hide();
          Ext.getCmp('remark_html').setHtml(formValues.remark);
          Ext.getCmp('remark').hide();
          Ext.getCmp('remark_html').show();

          //Ext.getCmp('to_email_html').

          Ext.getCmp('to_email').hide();
          Ext.getCmp('cc_email').hide();
          Ext.getCmp('to_email_html').setHtml('수신자 : '+formValues.to_email+'<p>');
          Ext.getCmp('to_email_html').show();
          Ext.getCmp('cc_email_html').setHtml('참조자 : '+formValues.cc_email+'<p>');
          Ext.getCmp('cc_email_html').show();
          Ext.getCmp('title_html').show();

          this.onClickExcelDownload(item);
  }
  cancel = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
          console.log(formValues);

          Ext.getCmp('tax_publish_date').show();
          Ext.getCmp('tax_end_date').show();
          Ext.getCmp('report_no').show();
          Ext.getCmp('remark_html').setHtml('');
          Ext.getCmp('remark').show();
          Ext.getCmp('remark_html').hide();
          Ext.getCmp('to_email').show();
          Ext.getCmp('to_email_html').hide();
          Ext.getCmp('cc_email').show();
          Ext.getCmp('cc_email_html').hide();
          Ext.getCmp('title_html').hide();
  }

  onClickExcelDownload = (item) =>{
    const me = this,
    {result, showDisplayRefresh} = this.props,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      form = header_grid.down('form'),
      ExcelName = result.cp_corp_name+'['+result.st_date+']'+ Ext.Date.format(new Date(), "his")+' 정산서',
      formValues = form.getValues(),
      url = 'GetAccountMailExcelDownload';

      Ext.getCmp('excelname').setValue(result.cp_corp_name+'['+result.st_date+']'+ Ext.Date.format(new Date(), "his")+' 정산서'); 
      //Ext.getCmp('excelname').show();
      //console.log('GRID '+grid);
      //console.log('GRID ' + JSON.stringify(grid, null, 2));
      result.excelname = ExcelName;
      ExcelDownload(grid, ExcelName,url);

      return;
  }

  send = (item) => {

    //alert(Ext.Date.format(new Date(), "Ymdhiss"))
    //return;
    
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
         // console.log('tttt9999 ' + JSON.stringify(Ext.getCmp('excel_filename'), null, 2));

          if(formValues.to_email == null || formValues.to_email == ''){
            alert('메일수신자가 없습니다.이메일을 입력해주세요.');
            return;
          }
        
          if(formValues.report_no == null || formValues.report_no == '0' || formValues.report_no == ''){
             alert('정산서를 선택하세요.');
             return;
          }      
          //Ext.getCmp('remark_html').setv .hidden(false);// .setReadOnly(true);
          // Ext.getCmp('tax_publish_date').setReadOnly(true);
         // Ext.getCmp('remark_html') .setVisble(true);// .addCls("xphidden");

          // Ext.getCmp('tax_end_date').setReadOnly(true);;
          Ext.getCmp('tax_publish_date').hide();
          Ext.getCmp('tax_end_date').hide();
          Ext.getCmp('report_no').hide();
          Ext.getCmp('remark_html').setHtml(formValues.remark);
          Ext.getCmp('remark').hide();
          Ext.getCmp('remark_html').show();

          Ext.getCmp('to_email').hide();
          Ext.getCmp('cc_email').hide();
          Ext.getCmp('to_email_html').setHtml('수신자 : '+formValues.to_email+'<p>');
          Ext.getCmp('to_email_html').show();
          Ext.getCmp('cc_email_html').setHtml('참조자 : '+formValues.cc_email+'<p>');
          Ext.getCmp('cc_email_html').show();
          Ext.getCmp('title_html').show();

          Ext.getCmp('mail_title').setValue('[NK]'+result.cp_corp_name+' '+Ext.util.Format.substr(result.st_date, 0, 4)+'년 '+Ext.util.Format.substr(result.st_date, 5, 2)+'월 정산서');
          //Ext.getCmp('remark').hide();
          //Ext.getCmp('remark_html').show();

    

    this.onClickExcelDownload(item);

    

    formValues.mail_title = '[NK]'+result.cp_corp_name+' '+Ext.util.Format.substr(result.st_date, 0, 4)+'년 '+Ext.util.Format.substr(result.st_date, 5, 2)+'월 정산서';
    formValues.remark = Ext.util.Format.htmlEncode(formValues.remark);
    formValues.excelname = result.excelname;//result.excel_filename;
    //console.log('fdsfa '+formValues.excel_filename);

    const params = paramsPostHandler(formValues);
    console.log('tttt9999 ' + JSON.stringify(params, null, 2));
    showConfirm({
      msg: '선택하신 정산월의 자료를 메일 전송 하시겠습니까?',
      title:'확인',
      callback: function () {
        Ext.Ajax.request({
            url: `${API_URL}/CpAccountingReport/MailSend`,
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
            params : params,
            dataType: "json",
            success: function(response, request) {
              alert('정상적으로 전송되었습니다.');
              const ret = Ext.decode(response.responseText);
             // this.close;
            },
            failure: function(response, request) {

            }
        });
      }
    });
  }
  setpub = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
          console.log(formValues);


    var txtremark=formValues.remark;
        txtremark = txtremark.replace('- 세금계산서 발행일 :','- 세금계산서 발행일 : '+ formValues.tax_publish_date);

        Ext.getCmp('remark').setValue(txtremark);// .hide();
          Ext.getCmp('remark_html').setHtml(txtremark);
       
  }
  setend = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
          console.log(formValues);

    var txtremark=formValues.remark;
        txtremark = txtremark.replace('- 세금계산서 마감일 :','- 세금계산서 마감일 : '+ formValues.tax_end_date);

        Ext.getCmp('remark').setValue(txtremark);// .hide();
        Ext.getCmp('remark_html').setHtml(txtremark);

        //Ext.getCmp('title').setValue(formValues.title_html);// .hide();
        //Ext.getCmp('remark_html').setHtml(txtremark);
  }
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const { result, onClose } = this.props,
          {widgetTitle} = this.state;
          return(
            <Window
                key={'cp_accounts_cancel_form_key'}
                id={'cp_accounts_cancel_form'}
                width={750}
                height={780}
                minwidth={300}
                minHeight={200}
                title="정산자료 메일발송"
                autoShow={true}
                modal={true}
                draggable={true}
                resizable={false}
                layout={'fit'}
                align={'center'}
                bodyPadding={7}
                closable={false}
                maximizable={false}
                scrollable={false}
                maximized={false}
                listeners={[{
                  show: function(){
                    //console.log('show')
                    this.removeCls("x-unselectable");
                 }
                }]}
                onClose={onClose}
                buttons={[{
                    text:'<font color=white>미리보기</font>',
                    cls:'base-button-round',
                    style: {
                        'font-size': '14px',
                        'background-color':'#4783AE',
                        'border-color':'#4783AE',
                        'padding':'5px 7px 4px 7px',
                        'text-decoration': 'none',
                        'border-radius': '4px 4px 4px 4px'
                    },
                    handler: this.preview
                },{
                  text:'<font color=white>발송</font>',
                  cls:'base-button-round',
                  style: {
                      'font-size': '14px',
                      'background-color':'#4783AE',
                      'border-color':'#4783AE',
                      'padding':'5px 7px 4px 7px',
                      'text-decoration': 'none',
                      'border-radius': '4px 4px 4px 4px'
                  },
                  handler: this.send
                },{
                  text:'<font color=white>취소</font>',
                  cls:'base-button-round',
                  style: {
                      'font-size': '14px',
                      'background-color':'#4783AE',
                      'border-color':'#4783AE',
                      'padding':'5px 7px 4px 7px',
                      'text-decoration': 'none',
                      'border-radius': '4px 4px 4px 4px'
                  },
                  handler: this.cancel
                },{
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
                    handler: this.close
                }]}>
                <Panel
                    layout='fit'
                    scrollable={false}
                    ref={'header_grid'}
                    items={[{
                        xtype:'grid',
                        layout:'fit',
                        viewConfig:{
                            enableTextSelection:true,
                            stripeRows:false,
                            //emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                            deferEmptyText: false
                        },
                        plugins:[
                            {
                                ptype: 'cellediting',
                                clicksToEdit: 1
                            },
                            'gridfilters'
                        ],
                        stateId:'cp-corp-form-view',
                        stateful:false,
                        enableLocking:true,
                        multiColumnSort:true,
                        lockable:true,
                        store:this.store,
                        tbar:[{
                            xtype:'component',
                            code: 'counter'
                          },'->',
                          {
                            xtype:'button',
                            hidden:true,
                            text:'<font color=white>추가</font>',
                            style: {
                                'font-size': '14px',
                                'background-color':'#4783AE',
                                'border-color':'#4783AE',
                                'padding':'5px 7px 4px 7px',
                                'text-decoration': 'none',
                                'border-radius': '4px 4px 4px 4px'
                            }
                          },
                          {
                            xtype:'button',
                            hidden:true,
                            text:'<font color=white>삭제</font>',
                            style: {
                                'font-size': '14px',
                                'background-color':'#4783AE',
                                'border-color':'#4783AE',
                                'padding':'5px 7px 4px 7px',
                                'text-decoration': 'none',
                                'border-radius': '4px 4px 4px 4px'
                            }
                          }],
                          columns:[
                            {
                              header: '정산월',
                              dataIndex: 'settlement_date',
                              type: 'TEXT',
                              width: 100,
                              isExcel: true,
                              align: 'center',
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
                              hidden:true,
                              sortable:true,
                              style:'text-align:center'
                            },
                            {
                              header: '플랫폼',
                              dataIndex: 'sp_corp_detail_name',
                              type: 'TEXT',
                              width: 200,
                              isExcel: true,
                              align: 'left',
                              hidden:true,
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
                              hidden:true,
                              sortable:true,
                              style:'text-align:center'
                            },
                            {
                              header: 'R/S',
                              dataIndex: 'cp_contract_rate',
                              type: 'TEXT',
                              width: 80,
                              isExcel: true,
                              hidden:true,
                              align: 'right',
                              sortable:true,
                              style:'text-align:center',
                            },
                            {
                              text: '정산금액',
                              dataIndex: 'cp_pay_price',
                              type: 'TEXT',
                              width: 80,
                              isExcel: true,
                              hidden:true,
                              align: 'right',
                              sortable:true,
                              style:'text-align:center',
                             },
                             {
                              header: '컨텐츠명',
                              dataIndex: 'movie_name2',
                              type: 'TEXT',
                              width: 300,
                              isExcel: true,
                              align: 'left',
                              hidden:true,
                              sortable:true,
                              style:'text-align:center'
                            },
                             {
                               text: '전월잔액',
                               dataIndex: 'carryover_amt',
                               type: 'TEXT',
                               width: 80,
                               isExcel: true,
                               hidden:true,
                               align: 'right',
                               sortable:true,
                               style:'text-align:center',
                              }
                          ],
                          dockedItems:[
                            {
                              xtype: 'form',
                              dock: 'top',
                              width: '100%',
                              bodyPadding: '10 10 0 10',
                              border: false,
                              bodyStyle: 'background-color:#FFFFFF;;width:100%',
                              layout: {
                                  type: 'vbox',
                                  align: 'stretch'
                              },
                              defaults: {
                                  labelAlign: 'right',
                                  labelWidth: 120,
                                  margin: '0 0 2 0'
                              },
                              items:[
                                {
                                  xtype:'hiddenfield',
                                  fieldLabel: 'cp사번호 ',
                                  name: 'cp_corp_no',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'cp_corp_no',
                                  value: ''
                                },
                                {
                                  xtype:'hiddenfield',
                                  fieldLabel: 'cp사명 ',
                                  name: 'cp_corp_name',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'cp_corp_name',
                                  value: ''
                                },
                                {
                                  xtype:'hiddenfield',
                                  fieldLabel: '하위업체번호 ',
                                  name: 'cp_corp_detail_no',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'cp_corp_detail_no',
                                  value: ''
                                },
                                {
                                  xtype:'textfield',
                                  fieldLabel: '정산월 ',
                                  name: 'st_date',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'st_date',
                                  hidden : true,
                                  value: ''
                                },
                                {
                                  xtype:'textfield',
                                  fieldLabel: '메일수신자 ',
                                  name: 'to_email',
                                  regex : /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+\/=?\^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([a-za-z]){2,6}$/,
                                  allowblank: false,
                                  maxRows: 4,
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'to_email',
                                  value: ''
                                },
                                {
                                  xtype:'textfield',
                                  fieldLabel: '메일참조자 ',
                                  name: 'cc_email',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'cc_email',
                                  value: ''
                                },
                                {
                                  xtype:'hiddenfield',
                                  fieldLabel: '제목 ',
                                  name: 'mail_title',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'mail_title',
                                  value: ''
                                },
                                {
                                  xtype:'hiddenfield',
                                  fieldLabel: '파일명 ',
                                  name: 'excelname',
                                  flex:1,
                                  padding:'0 5 0 0',
                                  id: 'excelname',
                                },
                                {
                                  xtype:'datefield',
                                  fieldLabel: '세금계산서 발행일 ',
                                  name: 'tax_publish_date',
                                  flex:1,
                                  format: 'Y-m-d',
                                  padding:'0 5 0 0',
                                  id: 'tax_publish_date',
                                  value: new Date((new Date()).getTime() - 0 * 24 * 60 * 60 * 1000),
                                  listeners: {
                                    select: this.setpub
                                  }
                                },
                                {
                                    xtype:'datefield',
                                    fieldLabel: '세금계산서 마감일 ',
                                    name: 'tax_end_date',
                                    flex:1,
                                    format: 'Y-m-d',
                                    padding:'0 5 0 0',
                                    id: 'tax_end_date',
                                    value: new Date((new Date()).getTime() - 0 * 24 * 60 * 60 * 1000),
                                    listeners: {
                                      select: this.setend
                                    }
                                },
                                {
                                    xtype: 'combo',
                                    fieldLabel: '정산서 ',
                                    flex:1,
                                    name: 'report_no',
                                    id: 'report_no',
                                    displayField: 'report_name',
                                    valueField: 'report_no',
                                    hidden: false,
                                    queryMode: 'local',
                                    typeAhead: false,
                                    emptyText: '선택',
                                    editable: true,
                                    forceSelection: false,
                                    triggerAction: 'all',
                                    selectOnFocus: true,
                                    enableKeyEvents: true,
                                    store:this.cp_report_store
                                },
                                {
                                    xtype:'htmleditor',
                                    fieldLabel: '내용 ',
                                    value:'<font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">안녕하세요, 엔케이컨텐츠입니다.</span></font><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">@0000년 @00월 정산서를 전달드립니다.&nbsp;</span></font><br></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;"><br></span></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">첨부 드린 정산서 확인하신 후 세금계산서 발행 금액이 있는 업체는 세금계산서 발행 부탁드립니다.</span><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;"><br></span></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">[엔케이컨텐츠 정보]</span><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">- 사업자 번호 : 211-88-91322 (주) 엔케이컨텐츠 / 대표자명 : 남기호</span><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;"><br></span></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">[세금계산서 일정]</span><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">- 세금계산서 발행일 :&nbsp;</span><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">- 세금계산서 마감일 :&nbsp;</span><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;"><br></span></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><br><span style="font-size: 13px;">본 메일은 발신전용 메일로, 문의사항이 있으실 경우 아래 메일주소로 문의 부탁드립니다.</span><br><span style="font-size: 13px;">bb_ok@nkcontents.co.kr</span><br><br></font></div><div style=""><font color="#141823" face="Open Sans, Helvetica Neue, helvetica, arial, verdana, sans-serif"><span style="font-size: 13px;">감사합니다.</span><br></font></div>',
                                    name: 'remark',
                                    id: 'remark',
                                    height : 500,
                                    flex:1,
                                    padding:'0 5 0 0'
                                },
                                {        
                                    xtype: 'label',      
                                    frame : false,      
                                    flex : 1,             
                                    hidden : true,
                                    name: 'title_html',
                                    id: 'title_html'
                                },,
                                {        
                                    xtype: 'label',      
                                    frame : false,      
                                    flex : 1,             
                                    hidden : true,
                                    name: 'to_email_html',
                                    id: 'to_email_html'
                                },
                                {        
                                    xtype: 'label',               
                                    frame : false,      
                                    flex : 1,             
                                    hidden : true,
                                    name: 'cc_email_html',
                                    id: 'cc_email_html'
                                },
                                {        
                                    xtype: 'label',               
                                    frame : false,      
                                    flex : 1,             
                                    hidden : true,
                                    name: 'remark_html',
                                    id: 'remark_html',
                                    html: ''
                                }    
                              ]
                          }
                          ]
                    }]}/>
            </Window>
          );

  }
}

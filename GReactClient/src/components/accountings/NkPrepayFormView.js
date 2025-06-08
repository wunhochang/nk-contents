import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class NkPrepayFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '선급금관리'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'cp_corp_no', type:'number' },
      { name: 'cp_corp_detail_no', type:'number' },
      { name: 'prepay_date', type:'date', dateFormat: 'Y-m-d' },
      { name: 'settlement_amt', type:'string' },
      { name: 'remark', type:'string' },
      { name: 'output_order', type:'number', defaultValue:1 },
      { name: 'insert_user_no', type:'string' },
      { name: 'insert_user_no_name', type:'string' },
      { name: 'update_user_no', type:'string' },
      { name: 'update_user_no_name', type:'string' }
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/CpPrePay/GetList`,
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
  search_movie_store = Ext.create('Ext.data.Store', {
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
        url: `${API_URL}/TelevisingRight/GetMyMovieComboList`,
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
  }
  componentDidMount(){
    const me = this,
                {result} = this.props,
                {header_grid} = this.refs,
                form = header_grid.down('form'),
                grid = header_grid.down('grid'),
                formValues = form.getValues();
        //if(result !=null){
          console.log('4 ' + result.cp_corp_detail_no);
          const params  = Ext.apply({}, {type_name:'USE_YN',cp_corp_no:result.cp_corp_no,cp_corp_detail_no:result.cp_corp_detail_no});
        //}
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.grid_useyn_store.load({
            params:{condition:JSON.stringify(params)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.search_movie_store.load({
            params:{condition:JSON.stringify(params)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.mainDataStoreLoad();
    });
  }
  mainDataStoreLoad = () => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          formValues = form.getValues();

          console.log('tttt ' + JSON.stringify(result, null, 2));
          
          if(result !=null){
            //form.getForm().setValues(result.data);
            form.getForm().setValues(result);
            console.log('333 '+result.cp_corp_detail_no);
            //form.getForm().findField('cp_corp_no').focus();
            const params = Ext.apply({}, {cp_corp_no:result.cp_corp_no,cp_corp_detail_no:result.cp_corp_detail_no});
            store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {
                }
            });
          }
          else{
            form.getForm().findField('cp_corp_no').focus();
          }
  }
  onClickSearch = (item) => {
    alert('데이터가 없습니다.');
    return;
  }
  onClickAdd = (item) => {
    const me = this,
          {result} = this.props;

    this.store.insert(0, [{cp_corp_no: result.cp_corp_no, cp_corp_detail_no: result.cp_corp_detail_no}]);
    // const {header_grid} = this.refs,
    //   grid = header_grid.down('grid'),
    //   store = grid.getStore();
    //   store.insert(0, store.createModel({}));
  }
  onClickDelete = (item) => {
    const me = this,
          {header_grid} = this.refs,
          {result, showDisplayRefresh} = this.props,
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
              msg: 'CP사 계약정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.cp_corp_detail_no == 0 || itm.data.cp_corp_detail_no == '' || itm.data.cp_corp_detail_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/CpCorpDetail/Delete/`+itm.data.cp_corp_detail_no,
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
                      me.mainDataStoreLoad();
                      alert('정상적으로 삭제 되었습니다.');
                  });
                });
              }
          });
  }
  rendererUse = (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.grid_useyn_store.findExact('type_code', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.grid_useyn_store.getAt(recordIndex).get('type_data');
  }
  fieldCheck = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.save();
    }
  }
  save = () => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();

          if(formValues.cp_corp_name ==''){
              alert('업체명을 입력해주세요.');
              return false;
          }
          showConfirm({
          msg: '작성하신 선급금정보를 저장하시겠습니까?',
          title:'확인',
          callback: this.fn
      });
  }
  fn = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          process_store = store.getModifiedRecords(),
          formValues = form.getValues(),
          promiseList=[];

          //console.log('4 ' + result);
          

          // if(result !=null){
          //   formValues.cp_corp_no = result.data.cp_corp_no;
          // }
          // else{
          //   formValues.cp_corp_no = 0;
          // }
          if(process_store.length>0){
            Ext.each(process_store, function (itm) {
             // if(itm.phantom == true || itm.dirty == true){
                //itm.data.cp_corp_no = formValues.cp_corp_no;

                // if(itm.data.prepay_date != null && itm.data.prepay_date != ''){
                   //itm.data.prepay_date = Ext.Date.format(itm.data.prepay_date, 'Y-m-d')
                // }
                promiseList.push(itm.data);
              //}
            });
            formValues.detail_list = promiseList;
          }
          else{
            formValues.detail_list = '';
          }

          console.log('77 ' + JSON.stringify(formValues.detail_list, null, 2));
          //return;


          const params = paramsPostHandler(formValues);
          Ext.Ajax.request({
              url: `${API_URL}/CpPrePay/Save`,
              method: 'POST',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
              params : params,
              dataType: "json",
              success: function(response, request) {
                alert('정상적으로 저장되었습니다.');
                const ret = Ext.decode(response.responseText);
                showDisplayRefresh(ret.newID);
              },
              failure: function(response, request) {
                alert('정상적으로 처리되지 않았습니다. 다시 시도해주세요.');
              }
          });
  }
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const { result, onClose } = this.props,
          {widgetTitle} = this.state;
    const radioProps = {
        name: 'radios'
    }
    return(
      <Window
        width={860}
        height={560}
        minwidth={300}
        minHeight={300}
        title={widgetTitle}
        autoShow={true}
        modal={true}
        layout="fit"
        bodyPadding={7}
        closable={false}
        maximizable={true}
        scrollable={false}
        maximized={false}
        listeners={[{
          show: function(){
            this.removeCls("x-unselectable");
         }
        }]}
        onClose={onClose}
        buttons={[{
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
            handler: this.save
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
                    code: 'counter',
                    html: '<strong>선금지급내역</strong>'
                  },'->',
                  {
                    xtype:'button',
                    text:'<font color=white>조회</font>',
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
                  }],
                  columns:[
                    {
                      text: 'CPpay 일련번호',
                      dataIndex: 'cp_pre_pay_no',
                      type: 'TEXT',
                      width: 100,
                      hidden: true,
                      isExcel: false,
                      align: 'center',
                      sortable:true,
                      style:'text-align:center',
                      filter: {
                          type: 'string'
                      }
                    },
                    {
                      text: 'CP사 일련번호',
                      dataIndex: 'cp_corp_no',
                      type: 'TEXT',
                      width: 100,
                      hidden: true,
                      isExcel: false,
                      align: 'center',
                      sortable:true,
                      style:'text-align:center',
                      filter: {
                          type: 'string'
                      }
                    },
                    {
                      text: 'CP사 일련번호',
                      dataIndex: 'cp_corp_detail_no',
                      type: 'TEXT',
                      width: 100,
                      hidden: true,
                      isExcel: false,
                      align: 'center',
                      sortable:true,
                      style:'text-align:center',
                      filter: {
                          type: 'string'
                      }
                    },
                    {
                        text:'선급금',
                        align: 'center',
                        xtype: 'datecolumn',
                        style:'text-align:center',
                        columns:[{
                            text: '<font color=blue>선급지급일</font>',
                            dataIndex: 'prepay_date',
                            type: 'TEXT',
                            width: 200,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var formated = Ext.util.Format.date(value, 'Y-m-d');
                              metaData.tdAttr = 'data-qtip="' + formated + '"';
                              return formated;
                            },
                            filter: {
                                type: 'date'
                            },
                            format: 'Y-m-d',
                            editor: {
                              xtype: 'datefield',
                              allowBlank: true,
                              format: 'Y-m-d'
                            }
                        },
                        {
                            text: '<font color=blue>선급지급액</font>',
                            dataIndex: 'settlement_amt',
                            type: 'NUMBER',
                            editable: true,
                            width: 200,
                            isExcel: true,
                            align: 'right',
                            editor: {
                              xtype: 'numberfield'
                            },
                            renderer: function (value, metaData, record) {
                              return Ext.util.Format.number(value, '0,000');
                            }
                            // style:'text-align:center',
                            // renderer: function(value, metaData, record) {
                            //   var formated = Ext.util.Format.date(value, 'Y-m-d');
                            //   metaData.tdAttr = 'data-qtip="' + formated + '"';
                            //   return formated;
                            // },
                            // filter: {
                            //     type: 'string'
                            // }
                        }]
                    },
                    {
                        text: '<font color=blue>사용여부</font>',
                        dataIndex: 'use_yn',
                        type: 'COMBO',
                        width: 100,
                        hidden: true,
                        isExcel: false,
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
                         width: 80,
                         hidden: true,
                         isExcel: false,
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
                        dataIndex: 'remark',
                        type: 'TEXT',
                        editable: true,
                        width: 400,
                        required: false,
                        isExcel: true,
                        editor: {
                            allowBlank: true
                        },
                        filter: {
                            type: 'string'
                        }
                    }
                  ],
                  dockedItems:[
                      {
                          xtype: 'form',
                          dock: 'top',
                          width: '100%',
                          bodyPadding: '10 10 0 10',
                          border: false,
                          bodyStyle: 'background-color:#F1F1F1;;width:100%',
                          layout: {
                              type: 'vbox',
                              align: 'stretch'
                          },
                          defaults: {
                              labelAlign: 'right',
                              labelWidth: 80,
                              margin: '0 0 2 0'
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
                                  labelWidth: 80
                              },
                              items:[
                                {
                                    xtype: 'textfield',
                                    fieldLabel: 'CP사',
                                    name: 'cp_corp_name',
                                    allowBlank: false,
                                    flex:1,
                                    readOnly: true,
                                    enableKeyEvents:true,
                                    listeners:{
                                      specialkey:function(field, events){
                                        var form = this.up().up().getForm();
                                        if (events.getKey() == Ext.EventObject.ENTER) {
                                          form.findField('biz_operator_no').focus();
                                        }
                                      }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: '업체명',
                                    labelWidth: 120,
                                    name: 'cp_corp_detail_name',
                                    allowBlank: true,
                                    flex:1,
                                    enableKeyEvents:true,
                                    listeners:{
                                      specialkey:function(field, events){
                                        var form = this.up().up().getForm();
                                        if (events.getKey() == Ext.EventObject.ENTER) {
                                          form.findField('representative_name').focus();
                                        }
                                      }
                                    }
                                }
                              ]
                            },
                            {
                              xtype:'container',
                              layout: {
                                  type: 'hbox',
                                  align: 'stretch'
                              },
                              defaults: {
                                  labelAlign: 'right',
                                  labelWidth: 80
                              },
                              items:[
                                {
                                  xtype: 'combo',
                                  fieldLabel: '<font color=red>*</font>영화명',
                                  flex:1,
                                  name: 'movie_no',
                                  displayField: 'movie_name',
                                  valueField: 'movie_no',
                                  hidden: true,
                                  queryMode: 'local',
                                  typeAhead: false,
                                  emptyText: '선택',
                                  editable: true,
                                  forceSelection: false,
                                  triggerAction: 'all',
                                  selectOnFocus: true,
                                  enableKeyEvents: true,
                                  store:this.search_movie_store
                                },
                              ]
                            }
                          ]
                      }
                  ]
            }]}/>
      </Window>
    );
  }
}

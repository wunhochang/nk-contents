import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class CpCorpFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : 'CP사 등록'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'cp_corp_detail_no', type:'number' },
      { name: 'cp_corp_no', type:'number' },
      { name: 'cp_corp_detail_name', type:'string' },
      { name: 'nk_contract_rate', type:'string' },
      { name: 'cp_contract_rate', type:'string' },
      { name: 'total_sales', type:'string' },
      { name: 'nk_sales', type:'string' },
      { name: 'contract_st_date', type:'date', dateFormat: 'Y-m-d' },
      { name: 'contract_st_date', type:'date', dateFormat: 'Y-m-d' },
      { name: 'extend_condition', type:'string' },
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
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/CpCorpDetail/GetList`,
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
          params = Ext.apply({}, {type_name:'USE_YN'});
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.grid_useyn_store.load({
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


          if(result !=null){
            header_grid.down('form').getForm().setValues(result.data);
            form.getForm().findField('cp_corp_name').focus();
            const params = Ext.apply({}, {cp_corp_no:result.data.cp_corp_no});
            store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {
                }
            });
          }
          else{
            form.getForm().findField('cp_corp_name').focus();
          }
  }
  onClickAdd = (item) => {
    this.store.insert(0, this.store.createModel({}));
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
          msg: '작성하신 CP업체정보를 저장하시겠습니까?',
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

          if(result !=null){
            formValues.cp_corp_no = result.data.cp_corp_no;
          }
          else{
            formValues.cp_corp_no = 0;
          }
          if(process_store.length>0){
            Ext.each(process_store, function (itm) {
              if(itm.phantom == true || itm.dirty == true){
                itm.data.cp_corp_no = formValues.cp_corp_no;
                if(itm.data.contract_st_date != null && itm.data.contract_st_date != ''){
                  itm.data.contract_st_date = Ext.Date.format(itm.data.contract_st_date, 'Y-m-d')
                }
                if(itm.data.contract_ed_date != null && itm.data.contract_ed_date != ''){
                  itm.data.contract_ed_date = Ext.Date.format(itm.data.contract_ed_date, 'Y-m-d')
                }
                promiseList.push(itm.data);
              }
            });
            formValues.detail_list = promiseList;
          }
          else{
            formValues.detail_list = '';
          }

          const params = paramsPostHandler(formValues);
          Ext.Ajax.request({
              url: `${API_URL}/CpCorp/Save`,
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
                selModel: {
                    type: 'checkboxmodel'
                },
                store:this.store,
                tbar:[{
                    xtype:'component',
                    code: 'counter',
                    html: '<strong>세부계약내역</strong>'
                  },'->',
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
                  }],
                  columns:[
                    {
                      text: 'CP사 서브정보일련번호',
                      dataIndex: 'cp_corp_detail_no',
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
                      text: 'CP사 일련번호',
                      dataIndex: 'sp_corp_no',
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
                        text: '<font color=blue>특이사항</font>',
                        dataIndex: 'cp_corp_detail_name',
                        type: 'TEXT',
                        width: 200,
                        isExcel: true,
                        align: 'left',
                        style:'text-align:center',
                        renderer: function(value, metaData, record) {
                          var deviceDetail = record.get('cp_corp_detail_name');
                          metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                          return value;
                        },
                        filter: {
                            type: 'string'
                        },
                        editor: {
                            allowBlank: true
                        },
                    },
                    {
                      text: '<font color=blue>담당자이메일</font>',
                      dataIndex: 'cp_corp_user_email',
                      type: 'TEXT',
                      width: 200,
                      isExcel: false,
                      hidden:true,
                      align: 'left',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('cp_corp_user_email');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                          type: 'string'
                      },
                      editor: {
                          allowBlank: true
                      },
                  },
                    {
                      text:'총매출기준',
                      align: 'center',
                      style:'text-align:center',
                      columns:[{
                          text: '<font color=blue>CP</font>', //총매출
                          dataIndex: 'total_sales',
                          type: 'TEXT',
                          width: 80,
                          isExcel: true,
                          align: 'center',
                          style:'text-align:center',
                          renderer: function(value, metaData, record) {
                            var deviceDetail = record.get('total_sales');
                            metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                            return value;
                          },
                          filter: {
                              type: 'string'
                          },
                          editor: {
                              allowBlank: true
                          }
                      },
                      {
                          text: '<font color=blue>NK</font>', //NK매출
                          dataIndex: 'nk_sales',
                          type: 'TEXT',
                          width: 80,
                          isExcel: true,
                          align: 'center',
                          style:'text-align:center',
                          renderer: function(value, metaData, record) {
                            var deviceDetail = record.get('nk_sales');
                            metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                            return value;
                          },
                          filter: {
                              type: 'string'
                          },
                          editor: {
                              allowBlank: true
                          }
                      }]
                  },
                    {
                        text:'계약요율(NK매출기준)',
                        align: 'center',
                        style:'text-align:center',
                        columns:[{
                            text: '<font color=blue>CP</font>',
                            dataIndex: 'cp_contract_rate',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('cp_contract_rate');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            },
                            editor: {
                                allowBlank: true
                            }
                        },
                        {
                            text: '<font color=blue>NK</font>',
                            dataIndex: 'nk_contract_rate',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('nk_contract_rate');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            filter: {
                                type: 'string'
                            },
                            editor: {
                                allowBlank: true
                            }
                        }]
                    },
                    {
                        text:'계약기간',
                        align: 'center',
                        xtype: 'datecolumn',
                        style:'text-align:center',
                        columns:[{
                            text: '<font color=blue>계약시작일</font>',
                            dataIndex: 'contract_st_date',
                            type: 'TEXT',
                            width: 120,
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
                        }]
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
                         width: 80,
                         isExcel: true,
                         editable: true,
                         align: 'right',
                         style:'text-align:center',
                         editor: {
                             xtype: 'numberfield'
                         }
                     },
                     {
                        text: '<font color=blue>연장조건</font>',
                        style: 'text-align:center;',
                        dataIndex: 'extend_condition',
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
                                xtype: 'textfield',
                                fieldLabel: '<font color=red>*</font>업체명',
                                name: 'cp_corp_name',
                                allowBlank: true,
                                flex:1,
                                enableKeyEvents:true,
                                listeners:{
                                  specialkey:function(field, events){
                                    var form = this.up().getForm();
                                    if (events.getKey() == Ext.EventObject.ENTER) {
                                      if(field.value ==''){
                                        alert('업체명을 입력해주세요.');
                                      }
                                      else{
                                        form.findField('biz_operator_name').focus();
                                      }
                                    }
                                  }
                                }
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
                                    xtype: 'textfield',
                                    fieldLabel: '사업자명',
                                    name: 'biz_operator_name',
                                    allowBlank: true,
                                    flex:1,
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
                                    fieldLabel: '사업자번호',
                                    labelWidth: 120,
                                    name: 'biz_operator_no',
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
                                    xtype: 'textfield',
                                    fieldLabel: '대표자명',
                                    name: 'representative_name',
                                    allowBlank: true,
                                    flex:1,
                                    enableKeyEvents:true,
                                    listeners:{
                                      specialkey:function(field, events){
                                        var form = this.up().up().getForm();
                                        if (events.getKey() == Ext.EventObject.ENTER) {
                                          form.findField('tax_email').focus();
                                        }
                                      }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: '세금계산서EMAIL',
                                    labelWidth: 120,
                                    name: 'tax_email',
                                    allowBlank: true,
                                    flex:1,
                                    enableKeyEvents:true,
                                    listeners:{
                                      specialkey:function(field, events){
                                        var form = this.up().up().getForm();
                                        if (events.getKey() == Ext.EventObject.ENTER) {
                                          form.findField('biz_operator_address').focus();
                                        }
                                      }
                                    }
                                }
                              ]
                            },
                            {
                                xtype: 'textfield',
                                fieldLabel: '주소',
                                name: 'biz_operator_address',
                                allowBlank: true,
                                flex:1,
                                enableKeyEvents:true,
                                listeners:{
                                  specialkey:this.fieldCheck
                                }
                            },
                            {
                              xtype:'container',
                              layout: 'vbox',
                              defaults: {
                                  labelAlign: 'right',
                                  labelWidth: 80
                              },
                              items:[
                                {
                                    xtype: 'radiogroup',
                                    fieldLabel: '사용여부',
                                    width:250,
                                    //flex:1,
                                    defaults: {
                                        name: 'use_yn'
                                    },
                                    items: [{
                                        inputValue: 'Y',
                                        boxLabel: '사용',
                                        checked:true
                                    }, {
                                        inputValue: 'N',
                                        boxLabel: '미사용'
                                    }],
                                    listeners: {
                                        //select: 'onSmpCompetitorChange'
                                    }
                                  }
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

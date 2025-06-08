import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class SpCorpFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : 'SP사 등록'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'sp_corp_detail_no', type:'number' },
      { name: 'sp_corp_no', type:'number' },
      { name: 'sp_corp_detail_name', type:'string' },
      { name: 'sales_kind', type: 'string', convert:function(v, record){if(typeof v =="string") return v.split(",");  else return v; }},
      //{ name: 'sales_kind', type:'string' },
      { name: 'sales_kind_name', type:'string' },
      //{ name: 'contact_type', type:'string' },
      { name: 'contact_type', type: 'string', convert:function(v, record){if(typeof v =="string") return v.split(",");  else return v; }},
      { name: 'contact_type_name', type:'string' },
      { name: 'general_rate', type:'string' },
      { name: 'premium_rate', type:'string' },
      { name: 'first_open_rate', type:'string' },
      { name: 'new_open_rate', type:'string' },
      { name: 'old_open_rate', type:'string' },
      { name: 'double_feature_rate', type:'string' },
      { name: 'pink_rate', type:'string' },
      { name: 'agency_rate', type:'string' },
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
        url: `${API_URL}/SpCorpDetail/GetList`,
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

  manager_store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'sp_corp_manager_no', type:'number' },
      { name: 'sp_corp_no', type:'number' },
      { name: 'sp_corp_manager_name', type:'string' },
      { name: 'sp_corp_manager_position', type:'string' },
      { name: 'sp_corp_manager_tel1', type:'string' },
      { name: 'sp_corp_manager_tel2', type:'string' },
      { name: 'sp_corp_manager_email', type:'string' },
      { name: 'output_order', type:'number', defaultValue:1 },
      { name: 'use_yn', type:'string', defaultValue:'Y' },
      { name: 'use_yn_name', type:'string' },
      //{ name: 'sales_kind', type: 'string', convert:function(v, record){if(typeof v =="string") return v.split(",");  else return v; }},
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
        url: `${API_URL}/SpCorpManager/GetList`,
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
  grid_contact_rate_store = Ext.create('Ext.data.Store', {
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
  grid_sales_kind_store = Ext.create('Ext.data.Store', {
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
  grid_contact_type_store = Ext.create('Ext.data.Store', {
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
          params = Ext.apply({}, {type_name:'USE_YN'}),
          params1 = Ext.apply({}, {type_name:'CONTACT_RATE'}),
          params2 = Ext.apply({}, {type_name:'SALES_KIND'}),
          params3 = Ext.apply({}, {type_name:'CONTACT_TYPE'});
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
        me.grid_contact_rate_store.load({
            params:{condition:JSON.stringify(params1)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.grid_sales_kind_store.load({
            params:{condition:JSON.stringify(params2)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.grid_contact_type_store.load({
            params:{condition:JSON.stringify(params3)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      //me.grid_contact_rate_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'CONTACT_RATE'});
      //me.grid_sales_kind_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'SALES_KIND'});
      //me.grid_contact_type_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'CONTACT_TYPE'});
      me.mainDataStoreLoad();
    });
  }
  mainDataStoreLoad = () => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();

          if(result !=null){
            header_grid.down('form').getForm().setValues(result.data);
            form.getForm().findField('sp_corp_name').focus();
            const params = Ext.apply({}, {sp_corp_no:result.data.sp_corp_no});
            this.store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {
                }
            });
            this.manager_store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {
                }
            });
          }
          else{
            form.getForm().findField('sp_corp_name').focus();
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
              msg: 'SP사 계약정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.sp_corp_detail_no == 0 || itm.data.sp_corp_detail_no == '' || itm.data.sp_corp_detail_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/SpCorpDetail/Delete/`+itm.data.sp_corp_detail_no,
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
  onClickAddManager= (item) => {
    this.manager_store.insert(0, this.manager_store.createModel({}));
    // const {header_grid} = this.refs,
    //   grid = header_grid.down('grid'),
    //   store = grid.getStore();
    //   store.insert(0, store.createModel({}));
  }
  onClickDeleteManager = (item) => {
    const me = this,
          {header_grid} = this.refs,
          {result, showDisplayRefresh} = this.props,
          grid = header_grid.down('tabpanel').items.items[1].down('grid'),
          store = grid.getStore(),
          selection = grid.getSelection(),
          params = [],
          promiseList = [];
          if (Ext.isEmpty(selection)) {
              alert('선택된 정보가 없습니다.');
              return;
          }
          showConfirm({
              msg: 'SP사 담당자 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.sp_corp_manager_no == 0 || itm.data.sp_corp_manager_no == '' || itm.data.sp_corp_manager_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/SpCorpManager/Delete/`+itm.data.sp_corp_manager_no,
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
          if(formValues.sp_corp_name ==''){
              alert('업체명을 입력해주세요.');
              return false;
          }
          showConfirm({
          msg: '작성하신 SP업체정보를 저장하시겠습니까?',
          title:'확인',
          callback: this.fn
      });
  }
  fn = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          process_store = this.store.getModifiedRecords(),
          process_store1 = this.manager_store.getModifiedRecords(),
          formValues = form.getValues(),
          promiseList=[],
          promiseList1=[];
          if(result !=null){
            formValues.sp_corp_no = result.data.sp_corp_no;
          }
          else{
            formValues.sp_corp_no = 0;
          }
          /*계약내역*/
          if(process_store.length>0){
            Ext.each(process_store, function (itm) {
              if(itm.phantom == true || itm.dirty == true){
                itm.data.sp_corp_no = formValues.sp_corp_no;
                /*판권구분*/
                if(typeof(itm.data.sales_kind) != 'undefined' && itm.data.sales_kind != null ){
                  if(itm.data.sales_kind.length>0){
                    var temp ='';
                    for(var j=0; j<itm.data.sales_kind.length; j++){
                      if(j==0){
                        temp = itm.data.sales_kind[j];
                      }
                      else{
                        temp = temp + ',' +itm.data.sales_kind[j];
                      }
                    }
                    itm.data.sales_kind=temp;
                  }
                  else{
                    itm.data.sales_kind="";
                  }
                }
                else{
                  itm.data.sales_kind="";
                }
                /*계약방식*/
                if(typeof(itm.data.contact_type) != 'undefined' && itm.data.contact_type != null){
                  if(itm.data.contact_type.length>0){
                    var temp ='';
                    for(var j=0; j<itm.data.contact_type.length; j++){
                      if(j==0){
                        temp = itm.data.contact_type[j];
                      }
                      else{
                        temp = temp + ',' +itm.data.contact_type[j];
                      }
                    }
                    itm.data.contact_type=temp;
                  }
                  else{
                    itm.data.contact_type="";
                  }
                }
                else{
                  itm.data.contact_type="";
                }
                promiseList.push(itm.data);
              }
            });
            formValues.detail_list = promiseList;
          }
          else{
            formValues.detail_list = '';
          }
          /*SP담당자*/
          if(process_store1.length>0){
            Ext.each(process_store1, function (itm) {
              if(itm.phantom == true || itm.dirty == true){
                itm.data.sp_corp_no = formValues.sp_corp_no;
                promiseList1.push(itm.data);
              }
            });
            formValues.user_list = promiseList1;
          }
          else{
            formValues.user_list = '';
          }

          const params = paramsPostHandler(formValues);
          Ext.Ajax.request({
              url: `${API_URL}/SpCorp/Save`,
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
  renderSalesKind = (value, metaData, record, row, col, store, view) => {
    console.log(value)
    if(value==null){
      return null;
    }
    else{
      var r = '';
      for(var i=0; i<value.length; i++){
        var recordIndex = this.grid_sales_kind_store.findExact('type_code', value[i]);
        if (recordIndex === -1) {
        }
        else{
          if(r.length==0){
            //r = this.grid_sales_kind_store.getAt(recordIndex).get('type_code') + '.' + this.grid_sales_kind_store.getAt(recordIndex).get('type_data');
            r = this.grid_sales_kind_store.getAt(recordIndex).get('type_data');
          }
          else{
            //r = r + ', ' + this.grid_sales_kind_store.getAt(recordIndex).get('type_code') + '.' + this.grid_sales_kind_store.getAt(recordIndex).get('type_data');
            r = r + ', ' + this.grid_sales_kind_store.getAt(recordIndex).get('type_data');
          }
        }
      }
      //record.set('sales_kind_name',r);
      record.data.sales_kind_name = r;
      return r;

      //return this.grid_sales_kind_store.getById(value).get('type_data');
    }
  }
  renderContactType = (value, metaData, record, row, col, store, view) => {
    //console.log(value)
    if(value==null){
      return null;
    }
    else{
      var r = '';
      for(var i=0; i<value.length; i++){
        var recordIndex = this.grid_contact_type_store.findExact('type_code', value[i]);
        if (recordIndex === -1) {
        }
        else{
          if(r.length==0){
            //r = this.grid_contact_type_store.getAt(recordIndex).get('type_code') + '.' + this.grid_contact_type_store.getAt(recordIndex).get('type_data');
            r = this.grid_contact_type_store.getAt(recordIndex).get('type_data');
          }
          else{
            //r = r + ', ' + this.grid_contact_type_store.getAt(recordIndex).get('type_code') + '.' + this.grid_contact_type_store.getAt(recordIndex).get('type_data');
            r = r + ', ' + this.grid_contact_type_store.getAt(recordIndex).get('type_data');
          }
        }

      }
      record.data.contact_type_name = r
      //record.set('contact_type_name',r);
      return r;

      //return this.grid_sales_kind_store.getById(value).get('type_data');
    }
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
            layout={{
                type: 'vbox',
                align: 'stretch'
            }}
            scrollable={false}
            ref={'header_grid'}
            dockedItems={[
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
                          name: 'sp_corp_name',
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
            }
            items={[
              {
                  xtype: 'tabpanel',
                  bodyPadding: '10 10 0 10',
                  scrollable: 'y',
                  reference: 'smprivalcmpreport',
                  flex: 1,
                  maximizable: true,
                  fullscreen: true,
                  maximized: true,
                  plain: false,
                  tabBar: {
                      defaults: {},
                      dock: 'top'
                  },
                  items:[
                    {
                      xtype:'panel',
                      title:'세부계약내역',
                      layout:'fit',
                      items:[
                        {
                            xtype:'grid',
                            layout:'fit',
                            itemId:'sp_corp_detail_grid',
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
                            stateId:'sp-corp-form-view',
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
                                  text: 'SP사 서브정보일련번호',
                                  dataIndex: 'sp_corp_detail_no',
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
                                  text: 'SP사 일련번호',
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
                                    text: '<font color=blue>하위업체명</font>',
                                    dataIndex: 'sp_corp_detail_name',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sp_corp_detail_name');
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
                                    text: '<font color=blue>판권구분</font>',
                                    dataIndex: 'sales_kind',
                                    type: 'COMBO',
                                    width: 300,
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
                                         lazyRender: true,
                                         multiSelect: true,
                                         store:this.grid_sales_kind_store
                                    },
                                    renderer:this.renderSalesKind
                                    // renderer: function(value, metaData, record, row, col, store, view) {
                                    //     return this.grid_sales_kind_store.getById(value).get('type_data');
                                    // }
                                },
                                {
                                    text: '판권구분명',
                                    dataIndex: 'sales_kind_name',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    hidden:true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sales_kind_name');
                                      metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                      return value;
                                    }
                                },
                                {
                                    text: '<font color=blue>계약방식</font>',
                                    dataIndex: 'contact_type',
                                    type: 'COMBO',
                                    width: 200,
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
                                         lazyRender: true,
                                         multiSelect: true,
                                         store:this.grid_contact_type_store
                                    },
                                    renderer:this.renderContactType
                                    // renderer: function(value, metaData, record, row, col, store, view) {
                                    //     return this.grid_sales_kind_store.getById(value).get('type_data');
                                    // }
                                },
                                {
                                    text: '계약방식',
                                    dataIndex: 'contact_type_name',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    hidden:true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('contact_type_name');
                                      metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                                      return value;
                                    }
                                },
                                {
                                    text:'계약요율',
                                    align: 'center',
                                    style:'text-align:center',
                                    columns:[{
                                        text: '<font color=blue>일반</font>',
                                        dataIndex: 'general_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('general_rate');
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
                                        text: '<font color=blue>프리미엄</font>',
                                        dataIndex: 'premium_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('premium_rate');
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
                                        text: '<font color=blue>최초개봉</font>',
                                        dataIndex: 'first_open_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('first_open_rate');
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
                                        text: '<font color=blue>구작</font>',
                                        dataIndex: 'old_open_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('old_open_rate');
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
                                        text: '<font color=blue>신작</font>',
                                        dataIndex: 'new_open_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('new_open_rate');
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
                                        text: '<font color=blue>극장동시</font>',
                                        dataIndex: 'double_feature_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('double_feature_rate');
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
                                        text: '<font color=blue>은밀한가족</font>',
                                        dataIndex: 'pink_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('pink_rate');
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
                                        text: '<font color=blue>대행</font>',
                                        dataIndex: 'agency_rate',
                                        type: 'TEXT',
                                        width: 80,
                                        isExcel: true,
                                        align: 'center',
                                        style:'text-align:center',
                                        renderer: function(value, metaData, record) {
                                          var deviceDetail = record.get('agency_rate');
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
                                 }
                              ]
                        }
                      ]
                    },
                    {
                      xtype:'panel',
                      title:'담당자현황',
                      layout:'fit',
                      items:[
                        {
                            xtype:'grid',
                            itemId:'sp_corp_manager_grid',
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
                              stateId:'sp-corp-form-manager-view',
                              stateful:false,
                              enableLocking:true,
                              multiColumnSort:true,
                              lockable:true,
                              selModel: {
                                  type: 'checkboxmodel'
                              },
                              store:this.manager_store,
                              tbar:[{
                                  xtype:'component',
                                  code: 'counter',
                                  html: '<strong>담당자목록</strong>'
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
                                  handler:this.onClickAddManager
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
                                  handler:this.onClickDeleteManager
                              }],
                              columns:[
                                {
                                  text: 'SP사 담당자일련번호',
                                  dataIndex: 'sp_corp_manager_no',
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
                                  text: 'SP사 일련번호',
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
                                    text: '<font color=blue>담당자명</font>',
                                    dataIndex: 'sp_corp_manager_name',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sp_corp_manager_name');
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
                                    text: '<font color=blue>담당자직위</font>',
                                    dataIndex: 'sp_corp_manager_position',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sp_corp_manager_position');
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
                                    text: '<font color=blue>전화번호1</font>',
                                    dataIndex: 'sp_corp_manager_tel1',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sp_corp_manager_tel1');
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
                                    text: '<font color=blue>전화번호2</font>',
                                    dataIndex: 'sp_corp_manager_tel2',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sp_corp_manager_tel2');
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
                                    text: '<font color=blue>이메일주소</font>',
                                    dataIndex: 'sp_corp_manager_email',
                                    type: 'TEXT',
                                    width: 200,
                                    isExcel: true,
                                    align: 'left',
                                    style:'text-align:center',
                                    renderer: function(value, metaData, record) {
                                      var deviceDetail = record.get('sp_corp_manager_email');
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
                                 }
                              ]
                          }
                      ]
                    }
                  ]
              }
            ]}
            />
      </Window>
    );
  }
}

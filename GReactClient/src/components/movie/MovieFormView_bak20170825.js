import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class MovieFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '영화정보관리'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'movie_publiction_info', type:'number' },
      { name: 'movie_no', type:'number' },
      { name: 'theater_yn', type:'boolean'},
      { name: 'cabletv_yn', type:'boolean'},
      { name: 'ground_wave_yn', type:'boolean'},
      { name: 'satellite_tv_yn', type:'boolean'},
      { name: 'iptv_vod_yn', type:'boolean'},
      { name: 'internet_down_yn', type:'boolean'},
      { name: 'internet_stream_yn', type:'boolean'},
      { name: 'hotel_yn', type:'boolean'},
      { name: 'ship_yn', type:'boolean'},
      { name: 'flight_yn', type:'boolean'},
      { name: 'mobile_yn', type:'boolean'},
      { name: 'dvd_yn', type:'boolean'},
      { name: 'blu_ray_yn', type:'boolean'},
      { name: 'remark', type:'string' },
      { name: 'confirm_items', type:'string' },
      //{ name: 'insert_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'insert_user_no', type:'string' },
      { name: 'insert_user_no_name', type:'string' },
      //{ name: 'updaet_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'updaet_user_no', type:'string' },
      { name: 'updaet_user_no_name', type:'string' }
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/MoviePublictionInfo/GetDetail`,
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
  sp_corp_store = Ext.create('Ext.data.Store', {
          fields: [
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/SpCorp/GetComboList`,
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
  movie_gubun_store = Ext.create('Ext.data.Store', {
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
  movie_service_type_store = Ext.create('Ext.data.Store', {
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
  movie_sales_kind_store = Ext.create('Ext.data.Store', {
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
    const me = this,
          params1 = Ext.apply({}, {type_name:'MOVIE_GUBUN'}),
          params2 = Ext.apply({}, {type_name:'MOVIE_SERVICE_TYPE'}),
          params3 = Ext.apply({}, {type_name:'MOVIE_SALES_KIND'});

    this.cp_corp_detail_store.load({
        callback: function (recs, operation, success) {
          me.cp_corp_detail_store.insert(0, {cp_corp_detail_no:null, cp_corp_detail_name:'선택'});
        }
    });
    this.sp_corp_store.load({
        callback: function (recs, operation, success) {
          me.sp_corp_store.insert(0, {sp_corp_no:null, sp_corp_name:'선택'});
        }
    });

    this.movie_gubun_store.load({
        params:{condition:JSON.stringify(params1)},
        callback: function (recs, operation, success) {
          me.movie_gubun_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'MOVIE_GUBUN'});
        }
    });
    this.movie_service_type_store.load({
        params:{condition:JSON.stringify(params2)},
        callback: function (recs, operation, success) {
          me.movie_service_type_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'MOVIE_SERVICE_TYPE'});
        }
    });
    this.movie_sales_kind_store.load({
        params:{condition:JSON.stringify(params3)},
        callback: function (recs, operation, success) {
          //me.movie_sales_kind_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'MOVIE_SALES_KIND'});
        }
    });
  }
  componentDidMount(){
    const {result} = this.props,
          {header_grid} = this.refs,
          me = this;
          /*result가 null이 아니면 해당 데이터 조회처리*/
          if(result !=null){
            const params = Ext.apply({}, {movie_no:result.data.movie_no});

            header_grid.down('form').getForm().setValues(result.data);
            this.store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {
                  console.log(recs);
                  const res = operation.getResponse();
                  if(res!=null){
                    const ret = Ext.decode(res.responseText);
                    if(ret.count==0){
                      me.store.insert(0, me.store.createModel({}));
                    }
                  }
                  else{
                    me.store.insert(0, me.store.createModel({}));
                  }
                }
            });
          }
          else{
            this.store.insert(0, this.store.createModel({}));
          }
          var form = header_grid.down('form').getForm();
          form.findField('movie_name').focus();
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

          if(formValues.movie_name ==''){
              alert('영화정보를 입력해주세요.');
              return false;
          }
          showConfirm({
          msg: '작성하신 영화정보를 저장하시겠습니까?',
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
          formValues = form.getValues(),
          promiseList=[];

          if(result !=null){
            formValues.movie_no = result.data.movie_no;
            formValues.old_movie_name = result.data.movie_name;
          }
          else{
            formValues.movie_no = 0;
          }
console.log('save debugger');
          if(formValues.publication_kind.length>0 && formValues.publication_kind != 'undefined'){
            var temp='';
            for(var i=0; i<formValues.publication_kind.length; i++){
              if(i==0){
                temp = formValues.publication_kind[i];
              }
              else{
                temp = temp + ',' + formValues.publication_kind[i];
              }
            }
            formValues.publication_kind = temp;
          }

          if(typeof(formValues.pink_movie_yn) == 'undefined'){
            formValues.pink_movie_yn = 'N';
          }
          if(typeof(formValues.mg_yn) =='undefined'){
            formValues.mg_yn = 'N';
          }
          // formValues.pink_movie_yn = formValues.pink_movie_yn=='on'?'Y':'N';
          // formValues.mg_yn = formValues.mg_yn=='on'?'Y':'N';

          // formValues.publication_st_date = Ext.Date.format(formValues.publication_st_date, 'Y-m-d');
          // formValues.publication_ed_date = Ext.Date.format(formValues.publication_ed_date, 'Y-m-d');
          // formValues.service_open_date = Ext.Date.format(formValues.service_open_date, 'Y-m-d');
          // formValues.double_feature_date = Ext.Date.format(formValues.double_feature_date, 'Y-m-d');
          // formValues.first_open_date = Ext.Date.format(formValues.first_open_date, 'Y-m-d');
          // formValues.premium_open_date = Ext.Date.format(formValues.premium_open_date, 'Y-m-d');
          // formValues.first_new_open_date = Ext.Date.format(formValues.first_new_open_date, 'Y-m-d');
          // formValues.new_open_date = Ext.Date.format(formValues.new_open_date, 'Y-m-d');
          // formValues.old_open_date = Ext.Date.format(formValues.old_open_date, 'Y-m-d');
          if(store.count()>0){
            Ext.each(store.data.items, function (itm) {
              itm.data.movie_no = formValues.movie_no;
              itm.data.theater_yn = itm.data.theater_yn==true?'Y':'N';
              itm.data.cabletv_yn = itm.data.cabletv_yn==true?'Y':'N';
              itm.data.ground_wave_yn = itm.data.ground_wave_yn==true?'Y':'N';
              itm.data.satellite_tv_yn = itm.data.satellite_tv_yn==true?'Y':'N';
              itm.data.iptv_vod_yn = itm.data.iptv_vod_yn==true?'Y':'N';
              itm.data.internet_down_yn = itm.data.internet_down_yn==true?'Y':'N';
              itm.data.internet_stream_yn = itm.data.internet_stream_yn==true?'Y':'N';
              itm.data.hotel_yn = itm.data.hotel_yn==true?'Y':'N';
              itm.data.ship_yn = itm.data.ship_yn==true?'Y':'N';
              itm.data.flight_yn = itm.data.flight_yn==true?'Y':'N';
              itm.data.mobile_yn = itm.data.mobile_yn==true?'Y':'N';
              itm.data.dvd_yn = itm.data.dvd_yn==true?'Y':'N';
              itm.data.blu_ray_yn = itm.data.blu_ray_yn==true?'Y':'N';
              itm.data.use_yn = 'Y';
              promiseList.push(itm.data);
            });
            formValues.publiction_info=promiseList;
          }
          else{
            formValues.publiction_info='';
          }
          const params = paramsPostHandler(formValues);
          Ext.Ajax.request({
              url: `${API_URL}/Movie/Save`,
              method: 'POST',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
              params : params,
              dataType: "json",
              success: function(response, request) {
                alert('정상적으로 저장되었습니다.');
                const ret = Ext.decode(response.responseText);
                console.log(ret.newID)
                console.log(request)
                showDisplayRefresh(ret.newID);
              },
              failure: function(response, request) {

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
        width={910}
        height={540}
        minwidth={300}
        minHeight={300}
        title={widgetTitle}
        autoShow={true}
        modal={true}
        layout="fit"
        bodyPadding={7}
        maximizable={true}
        scrollable={false}
        maximized={false}
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
                layout={'fit'}
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
                        items:[
                          {
                            xtype:'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            defaults: {
                                labelAlign: 'right',
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                              {
                                  xtype: 'combo',
                                  fieldLabel: '구분',
                                  flex:1,
                                  name: 'movie_gubun',
                                  displayField: 'type_data',
                                  valueField: 'type_code',
                                  hidden: false,
                                  queryMode: 'local',
                                  typeAhead: false,
                                  emptyText: '선택',
                                  editable: true,
                                  forceSelection: false,
                                  triggerAction: 'all',
                                  selectOnFocus: true,
                                  enableKeyEvents: true,
                                  //value:'A',
                                  store:this.movie_gubun_store,
                                  listeners: {
                                    change: function (combo, newValue, oldValue, eOpts) {
                                        var form = this.up('form').getForm();
                                        if(newValue === 'A'){
                                            form.findField('service_type').setDisabled(false);
                                        }else{
                                            //form.setValues({'service_type':''});
                                            form.findField('service_type').setValue('');
                                            form.findField('service_type').setDisabled(true);
                                        }
                                    }
                                  }
                              },
                              {
                                  xtype: 'combo',
                                  fieldLabel: '서비스유형',
                                  flex:1,
                                  name: 'service_type',
                                  displayField: 'type_data',
                                  valueField: 'type_code',
                                  hidden: false,
                                  queryMode: 'local',
                                  typeAhead: false,
                                  emptyText: '선택',
                                  editable: true,
                                  forceSelection: false,
                                  triggerAction: 'all',
                                  selectOnFocus: true,
                                  enableKeyEvents: true,
                                  disabled:false,
                                  store:this.movie_service_type_store
                              },
                              {
                                  xtype: 'combo',
                                  fieldLabel: 'CP사',
                                  flex:1,
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
                                  store:this.cp_corp_detail_store
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
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                              {
                                  xtype: 'textfield',
                                  fieldLabel: '<font color=red>*</font>영화명',
                                  name: 'movie_name',
                                  allowBlank: true,
                                  flex:2,
                                  enableKeyEvents:true,
                                  // listeners:{
                                  //   specialkey:function(field, events){
                                  //     var form = this.up().up().getForm();
                                  //     if (events.getKey() == Ext.EventObject.ENTER) {
                                  //       if(field.value ==''){
                                  //         alert('영화명 입력해주세요.');
                                  //       }
                                  //       // else{
                                  //       //   form.findField('movie_code').focus();
                                  //       // }
                                  //     }
                                  //   }
                                  // }
                              },
                              {
                                  xtype: 'combo',
                                  fieldLabel: 'SP사',
                                  flex:1,
                                  name: 'sp_corp_no',
                                  displayField: 'sp_corp_name',
                                  valueField: 'sp_corp_no',
                                  hidden: false,
                                  queryMode: 'local',
                                  typeAhead: false,
                                  emptyText: '선택',
                                  editable: true,
                                  forceSelection: false,
                                  triggerAction: 'all',
                                  selectOnFocus: true,
                                  enableKeyEvents: true,
                                  store:this.sp_corp_store
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
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                              {
                                  xtype:'hiddenfield',
                                  name:'publication_kind_name'
                              },
                              {
                                  xtype: 'combo',
                                  fieldLabel: '판권종류',
                                  flex:1,
                                  name: 'publication_kind',
                                  displayField: 'type_data',
                                  valueField: 'type_code',
                                  hidden: false,
                                  queryMode: 'local',
                                  typeAhead: false,
                                  emptyText: '선택',
                                  editable: true,
                                  forceSelection: false,
                                  triggerAction: 'all',
                                  selectOnFocus: true,
                                  enableKeyEvents: true,
                                  lazyRender: true,
                                  multiSelect: true,
                                  store:this.movie_sales_kind_store,
                                  listeners:{
                                    change: function (combo, newValue, oldValue, eOpts, a, b, c) {
                                      var form = this.up('form').getForm();
                                      var temp = '';
                                      console.log(newValue)
                                      if(newValue.length>0){
                                        for(var i=0; i<newValue.length;i++){
                                          var recordIndex = combo.store.findExact('type_code', newValue[i]);
                                          if (recordIndex === -1) {
                                          }
                                          else{
                                              if(temp.length==0){
                                                temp = combo.store.getAt(recordIndex).get('type_data');
                                              }
                                              else{
                                                temp = temp + ', ' + combo.store.getAt(recordIndex).get('type_data');
                                              }
                                          }
                                        }
                                      }
                                      form.findField('publication_kind_name').setValue(temp);
                                    }
                                  }
                              },
                              {
                                  xtype: 'textfield',
                                  fieldLabel: '정산코드',
                                  name: 'publication_code',
                                  allowBlank: true,
                                  flex:1,
                                  enableKeyEvents:true,
                                  // listeners:{
                                  //   specialkey:function(field, events){
                                  //     var form = this.up().up().getForm();
                                  //     if (events.getKey() == Ext.EventObject.ENTER) {
                                  //       form.findField('grade').focus();
                                  //     }
                                  //   }
                                  // }
                              },
                              {
                                  xtype: 'numberfield',
                                  fieldLabel: 'MG금액',
                                  name: 'mg_price',
                                  allowBlank: true,
                                  flex:1,
                                  value:0,
                                  enableKeyEvents:true,
                                  // listeners:{
                                  //   specialkey:this.fieldCheck
                                  // }
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
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '판권시작일',
                                    name: 'publication_st_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '판권종료일',
                                    name: 'publication_ed_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '서비스개시일',
                                    name: 'service_open_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
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
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '동시상영',
                                    name: 'double_feature_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '최초개봉',
                                    name: 'first_open_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '프리미엄',
                                    name: 'premium_open_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
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
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '최신작',
                                    name: 'first_new_open_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '신작',
                                    name: 'new_open_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: '구작',
                                    name: 'old_open_date',
                                    format: 'Y-m-d',
                                    flex:1,
                                    editable: true,
                                    //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
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
                                labelWidth: 80,
                                margin: '0 0 2 0'
                            },
                            items:[
                                {
                                    xtype:'checkbox',
                                    flex:1,
                                    fieldLabel: '핑크영화여부',
                                    inputValue: 'Y',
                                    name: 'pink_movie_yn'
                                },
                                {
                                    xtype:'checkbox',
                                    flex:1,
                                    fieldLabel: 'MG영화여부',
                                    inputValue: 'Y',
                                    name: 'mg_yn'
                                },
                                {
                                    xtype:'container',
                                    layout: 'vbox',
                                    flex:1,
                                    defaults: {
                                        labelAlign: 'right',
                                        labelWidth: 80
                                    },
                                    items:[
                                      {
                                          xtype: 'radiogroup',
                                          fieldLabel: '<font color=red>*</font>사용여부',
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
                ]}
                items={[
                    {
                      xtype:'grid',
                      layout:'fit',
                      viewConfig:{
                          enableTextSelection:true,
                          stripeRows:false,
                          emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                          deferEmptyText: false
                      },
                      plugins:[
                          {
                              ptype: 'cellediting',
                              clicksToEdit: 1
                          },
                          'gridfilters'
                      ],
                      stateId:'service-movie-sales-form-view-grid',
                      stateful:false,
                      enableLocking:true,
                      multiColumnSort:true,
                      lockable:true,
                      store:this.store,
                      tbar:[{
                          xtype:'component',
                          code: 'counter',
                          html: '<strong>영화판권설정정보</strong>'
                      }],
                      columns:[
                        {
                          text: '영화일련번호',
                          dataIndex: 'movie_no',
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
                          text: '영화판권일련번호',
                          dataIndex: 'movie_publiction_info',
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
                            text: '<font color=blue>극장</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'theater_yn',
                            type: 'TEXT',
                            width: 60,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>케이블TV</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'cabletv_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>지상파TV</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'ground_wave_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>위성TV</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'satellite_tv_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>IPTV/VOD</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'iptv_vod_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>인터넷<br>(다운로드)</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'internet_down_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>인터넷<br>(스트리밍)</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'internet_stream_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>호텔</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'hotel_yn',
                            type: 'TEXT',
                            width: 60,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>선박</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'ship_yn',
                            type: 'TEXT',
                            width: 60,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>항공</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'flight_yn',
                            type: 'TEXT',
                            width: 60,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>모바일</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'mobile_yn',
                            type: 'COMBO',
                            width: 60,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>DVD</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'dvd_yn',
                            type: 'TEXT',
                            width: 60,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>BLU-RAY</font>',
                            xtype: 'checkcolumn',
                            dataIndex: 'blu_ray_yn',
                            type: 'TEXT',
                            width: 80,
                            isExcel: true,
                            align: 'center',
                            style:'text-align:center'
                        },
                        {
                            text: '<font color=blue>비고</font>',
                            dataIndex: 'remark',
                            type: 'TEXT',
                            width: 140,
                            isExcel: true,
                            align: 'left',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('remark');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            editor: {
                                allowBlank: true
                            }
                        },
                        {
                            text: '<font color=blue>확인사항</font>',
                            dataIndex: 'confirm_items',
                            type: 'TEXT',
                            width: 200,
                            isExcel: true,
                            align: 'left',
                            style:'text-align:center',
                            renderer: function(value, metaData, record) {
                              var deviceDetail = record.get('confirm_items');
                              metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                              return value;
                            },
                            editor: {
                                allowBlank: true
                            }
                        }
                      ]
                    }
                ]}
            />
      </Window>
    )
  }
}

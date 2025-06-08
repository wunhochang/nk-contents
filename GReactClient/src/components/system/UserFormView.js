import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class UserFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    inputReadOnly:false,
    buttonIDCheck:true,
    user_id_check:false,
    old_user_id:'',
    result:[],
    widgetTitle : '사용자정보관리'
  }
  role_store = Ext.create('Ext.data.Store', {
    fields: [
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/Role/GetComboList`,
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
    const {result} = this.props,
          me = this;
          if(result !=null){
            me.setState({inputReadOnly:true, buttonIDCheck:true, user_id_check:true, old_user_id:result.data.user_id});
          }
          else{
            me.setState({inputReadOnly:false, buttonIDCheck:false, user_id_check:false, old_user_id:''});
          }
  }
  componentDidMount(){
    const {result} = this.props,
          {reqform} = this.refs,
          me = this;

          Ext.Promise.all([
            new Ext.Promise(function (res) {
              me.role_store.load({
                  callback: function (recs, operation, success) {
                    res();
                  }
              });
            })
          ]).then(function () {
            /*result가 null이 아니면 해당 데이터 조회처리*/
            var form = reqform.down('form').getForm();
            if(result !=null){
              reqform.down('form').getForm().setValues(result.data);
              form.findField('user_name').focus();
            }
            else{
              form.findField('user_id').focus();
            }
          });
  }
  fieldCheck = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.save();
    }
  }
  save = () => {
    const me = this,
          {result} = this.props,
          {user_id_check, old_user_id} = this.state,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();

          if(formValues.user_id ==''){
              alert('아이디를 입력해주세요.');
              return false;
          }
          if(user_id_check==false){
            alert('아이디체크를 먼저해주세요.');
            return false;
          }
          if(formValues.user_id != old_user_id){
            alert('아이디 정보가 변경되었습니다. 아이디체크를 다시 해주세요.');
            return false;
          }
          if(formValues.user_name ==''){
              alert('이름을 입력해주세요.');
              return false;
          }
          if(formValues.role_no =='' || formValues.role_no =='0' || formValues.role_no == null){
              alert('역할을 선택해주세요.');
              return false;
          }
          showConfirm({
          msg: '작성하신 사용자정보를 저장하시겠습니까?',
          title:'확인',
          callback: this.fn
      });
  }
  fn = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();

          if(result !=null){
            formValues.user_no = result.data.user_no;
          }
          else{
            formValues.user_no = 0;
          }

          const params = paramsPostHandler(formValues);
          Ext.Ajax.request({
              url: `${API_URL}/User/Save`,
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
  onIDCheck = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();

    if(formValues.user_id == ''){
      alert('아이디를 입력해주세요.');
      return false;
    }
    Ext.Ajax.request({
        url: `${API_URL}/User/IDCheck/`+formValues.user_id,
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;' },
        dataType: "json",
        success: function(response, request) {
          if(response.status ==200){
             var ret = Ext.decode(response.responseText);
             if(ret.data.length>0 && ret.success == true){
               if(ret.data[0].cnt == 0){
                 me.setState({user_id_check:true, old_user_id:formValues.user_id});
                 alert('사용 가능한 아이디입니다.');
               }
               else{
                 me.setState({user_id_check:false, old_user_id:''});
                 alert('이미 사용중인 아이디입니다. 다른 아이디를 사용해주세요.');
               }
             }
             else{
               me.setState({user_id_check:false, old_user_id:''});
               alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
             }
          }
          else{
            me.setState({user_id_check:false, old_user_id:''});
            alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
          }
        },
        failure: function(response, request) {
          alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
        }
    });
  }
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const me = this,
          { result, onClose } = this.props,
          {widgetTitle, inputReadOnly, buttonIDCheck} = this.state;
    const radioProps = {
        name: 'radios'
    }
    return(
      <Window
        width={560}
        height={380}
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
        <Container
            scrollable={true}
            layout={[{
                 type: 'vbox',
                 align: 'stretch'
             }]}
             ref={'reqform'}
             bodyBorder={false}
             items={[{
                xtype:'form',
                bodyBorder:false,
                style: 'background-color: #ffffff',
                items:[
                  {
                    xtype: 'container',
                    defaultType: 'textfield',
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
                            labelWidth: 80,
                            margin: '0 0 2 0'
                        },
                        items:[
                          {
                              xtype: 'textfield',
                              fieldLabel: '<font color=red>*</font>아아디',
                              name: 'user_id',
                              allowBlank: true,
                              flex:1,
                              enableKeyEvents:true,
                              readOnly:inputReadOnly,
                              listeners:{
                                specialkey:function(field, events){
                                  console.log('specialkey')
                                  var form = this.up().up().up().getForm();
                                  if (events.getKey() == Ext.EventObject.ENTER) {
                                    if(field.value ==''){
                                      alert('아이디를 입력해주세요.');
                                    }
                                    else{
                                      form.findField('user_name').focus();
                                    }
                                  }
                                }
                              }
                          },
                          {
                            xtype:'button',
                            text:'아이디확인',
                            hidden:buttonIDCheck,
                            handler:this.onIDCheck
                          }
                        ]
                      },

                      {
                          xtype: 'textfield',
                          fieldLabel: '<font color=red>*</font>이름',
                          name: 'user_name',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true,
                          listeners:{
                            specialkey:function(field, events){
                              var form = this.up().up().getForm();
                              if (events.getKey() == Ext.EventObject.ENTER) {
                                if(field.value ==''){
                                  alert('이름을 입력해주세요.');
                                }
                                else{
                                  form.findField('user_tel').focus();
                                }
                              }
                            }
                          }
                      },
                      {
                          xtype: 'textfield',
                          fieldLabel: '연락처',
                          name: 'user_tel',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true,
                          listeners:{
                            specialkey:function(field, events){
                              var form = this.up().up().getForm();
                              if (events.getKey() == Ext.EventObject.ENTER) {
                                form.findField('user_email').focus();
                              }
                            }
                          }
                      },
                      {
                          xtype: 'textfield',
                          fieldLabel: 'Email',
                          name: 'user_email',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true,
                          listeners:{
                            specialkey:function(field, events){
                              var form = this.up().up().getForm();
                              if (events.getKey() == Ext.EventObject.ENTER) {
                                //form.findField('user_email').focus();
                              }
                            }
                          }
                      },
                      {
                          xtype: 'combo',
                          fieldLabel: '<font color=red>*</font>역할',
                          flex:1,
                          name: 'role_no',
                          displayField: 'role_name',
                          valueField: 'role_no',
                          hidden: false,
                          queryMode: 'local',
                          typeAhead: false,
                          emptyText: '선택',
                          editable: true,
                          forceSelection: false,
                          triggerAction: 'all',
                          selectOnFocus: true,
                          enableKeyEvents: true,
                          store:this.role_store
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
                              fieldLabel: '<font color=red>*</font>승인여부',
                              width:250,
                              //flex:1,
                              defaults: {
                                  name: 'confirm_yn'
                              },
                              items: [{
                                  inputValue: 'Y',
                                  boxLabel: '승인',
                                  checked:true
                              }, {
                                  inputValue: 'N',
                                  boxLabel: '미승인'
                              }],
                              listeners: {
                                  //select: 'onSmpCompetitorChange'
                              }
                            }
                        ]
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
              }]}/>
      </Window>
    )
  }
}

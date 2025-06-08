import React, { Component } from 'react';
import cookie from 'react-cookies';

import { Window, TextField, Button, Container, Grid, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import BtnFileUpload from '../../utils/BtnFileUpload';
import {monthfield} from '../../utils/MonthPicker';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';
import MovieSearchView from './MovieSearchView';

export default class AccountingEndDateFormView extends Component {
  state = {
    accounting_end_date : '마감일자 정보가 없습니다.',
    Authorization:cookie.load('token')
  }
  accounting_end_date_store = Ext.create('Ext.data.Store', {
        fields: [
        ],
        pageSize: null,
        remoteSort : true,
        proxy: {
            type: 'ajax',
            method: 'GET',
            headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
            url: `${API_URL}/AccountingEndDate/GetTop1List`,
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
          {reqform} = me.refs,
          form = reqform.down('form'),
          accounting_end_date = reqform.down('form [name=accounting_end_date]'),
          formValues = form.getValues(),
          param = Ext.apply({}, {gubun:'SP'});
          this.accounting_end_date_store.load({
              params:{condition:JSON.stringify(param)},
              callback: function (recs, operation, success) {
                const res = operation.getResponse();
                if(res!=null){
                  const ret = Ext.decode(res.responseText);
                  if(ret.data.length>0){
                    me.setState({accounting_end_date:ret.data[0].end_date});
                    accounting_end_date.setValue('최종마감년월 : ' + ret.data[0].end_date);
                  }

                }
              }
          });
  }
  save = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {accounting_end_date} = this.state,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues(),
          end_date = formValues.end_date;
          formValues.gubun = 'SP';
          //console.log('save');
          if(accounting_end_date != '마감일자 정보가 없습니다.'){
            if(parseInt(accounting_end_date.replaceAll('-','')) > parseInt(end_date.replaceAll('-',''))){
              alert('선택하신 SP사 정산 마감년월이 최종 마감년월 이전입니다. 다시 선택해주세요.')
              return;
            }
          }
          const params = paramsPostHandler(formValues);
          Ext.Ajax.request({
              url: `${API_URL}/AccountingEndDate/CheckEndDate`,
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
              params:{condition:JSON.stringify(formValues)},
              dataType: "json",
              success: function(response, request) {
                if(Ext.decode(response.responseText).count ==0){
                  showConfirm({
                    msg: '지정하신 년월에 대한 SP사 정산마감 처리를 하시겠습니까?',
                    title:'확인',
                    callback: function () {
                      Ext.Ajax.request({
                          url: `${API_URL}/AccountingEndDate/Save`,
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

                          }
                      });
                    }
                  });
                }
                else{
                  alert('이미 등록된 년월입니다.');
                }
              },
              failure: function(response, request) {
                alert(response);
              }
          });


  }
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const me = this,
          { accounting_end_date } = this.state,
          { result, onClose } = this.props;
    return(
      <Window
          key={'excelupload_key'}
          id={'settlement_upload_form'}
          width={300}
          height={200}
          minwidth={300}
          minHeight={200}
          title="SP사 정산 마감일자 설정"
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
              layout="fit"
              scrollable={false}
              ref={'reqform'}
              dockedItems={[
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
                        labelWidth: 80,
                        margin: '0 0 2 0'
                    },
                    items:[
                      {
                          xtype : 'textfield',
                          name:'accounting_end_date',
                          flex:1,
                          readOnly:true,
                          style : 'border:0px',
                          fieldStyle: 'background:none',
                          inputWrapCls: '',
                          triggerWrapCls: '',
                          value : accounting_end_date
                      },
                      {
                        xtype:'monthfield',
                        fieldLabel: '정산마감년월',
                        name: 'end_date',
                        flex:1,
                        format: 'Y-m',
                        padding:'0 5 0 0',
                        value: new Date((new Date()).getTime() - 0 * 24 * 60 * 60 * 1000)
                      }

                    ]
                }
              ]}
              />
      </Window>
    );
  }
}

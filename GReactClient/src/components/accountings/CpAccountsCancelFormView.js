import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class CpAccountsCancelFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : 'CP사 정산취소'
  }
  cp_corp_store = Ext.create('Ext.data.Store', {
          fields: [
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
    const me = this;
    this.cp_corp_store.load({
        callback: function (recs, operation, success) {
          me.cp_corp_store.insert(0, {cp_corp_no:null, cp_corp_name:'선택'});
        }
    });
    this.cp_corp_detail_store.load({
        callback: function (recs, operation, success) {
          me.cp_corp_detail_store.insert(0, {cp_corp_detail_no:null, cp_corp_detail_name:'선택'});
        }
    });      
  }
  componentDidMount(){
  }
  onCpCorpChange = () => {
      const me  = this,
            {reqform} = this.refs,
            form = reqform.down('form'),
            formValue = form.getValues();

        form.getForm().findField('cp_corp_detail_no').setValue(null);
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
  save = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();
          console.log(formValues);
    if(formValues.settlement_date == null || formValues.settlement_date == ''){
      alert('정산월을 선택해주세요.');
      return;
    }
    if(formValues.cp_corp_detail_no == null || formValues.cp_corp_detail_no == '0' || formValues.cp_corp_detail_no == ''){
      alert('CP사 업체명을 선택해주세요.');
      return;
    }
    const params = paramsPostHandler(formValues);
    showConfirm({
      msg: '선택하신 정산월에 대한 CP사 정산을 취소 처리를 하시겠습니까?',
      title:'확인',
      callback: function () {
        Ext.Ajax.request({
            url: `${API_URL}/CpAccountingReport/Cancel`,
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
                width={450}
                height={260}
                minwidth={300}
                minHeight={200}
                title="CP사 업체별 정산취소"
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
                              labelWidth: 55,
                              margin: '0 0 2 0'
                          },
                          items:[
                            {
                              xtype:'monthfield',
                              fieldLabel: '정산월',
                              name: 'settlement_date',
                              flex:1,
                              format: 'Y-m',
                              padding:'0 5 0 0',
                              value: new Date((new Date()).getTime() - 0 * 24 * 60 * 60 * 1000)
                            },
                            {
                                xtype: 'combo',
                                fieldLabel: 'CP사',
                                flex:1,
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
                                      select: this.onCpCorpChange
                                }
                            },
                            {
                                xtype: 'combo',
                                fieldLabel: '업체명',
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
                      }
                    ]}
                    />
            </Window>
          );

  }
}

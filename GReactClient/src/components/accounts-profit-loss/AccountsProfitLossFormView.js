import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class AccountsProfitLossFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '영화 손익 정보 등록'
  }
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
              url: `${API_URL}/TelevisingRight/GetMovieComboList`,
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
  componentWillMount(){
  }
  componentDidMount(){
    const me = this,
          {result} = this.props,
          {reqform} = this.refs,
          params = Ext.apply({}, {type_name:'PROFIT_LOSS_MOVIE_GUBUN'});
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.search_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.movie_gubun_store.load({
            params:{condition:JSON.stringify(params)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.movie_gubun_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'MOVIE_GUBUN'});
      me.search_movie_store.insert(0, {movie_name:'선택'});
      var form = reqform.down('form').getForm();
      if(result !=null){
        reqform.down('form').getForm().setValues(result.data);
        //form.findField('user_name').focus();
      }
      else{
        //form.findField('user_id').focus();
      }
    });
  }
  save = () => {
    const me = this,
          {result} = this.props,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();

          if(formValues.movie_no ==''){
              alert('영화명을 선택해주세요.');
              return false;
          }
          showConfirm({
          msg: '작성하신 영화손익 정보를 저장하시겠습니까?',
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
          formValues.theater_price=0;
          formValues.etc_price=0;
          if(result != null){
            formValues.accounts_profit_loss_no = result.data.accounts_profit_loss_no;
          }
          else{
            formValues.accounts_profit_loss_no = 0;
          }
    const params = paramsPostHandler(formValues);
    Ext.Ajax.request({
        url: `${API_URL}/AccountsProfitLoss/Save`,
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
        width={560}
        height={260}
        minwidth={560}
        minHeight={260}
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
        <Container
            scrollable={true}
            layout={[{
                 type: 'vbox',
                 align: 'stretch'
             }]}
             ref={'reqform'}
             bodyBorder={false}
             items={[
               {
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
                          labelWidth: 65,
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
                              labelWidth: 65,
                              margin: '0 0 2 0'
                          },
                          items:[
                            {
                              xtype: 'numberfield',
                              fieldLabel: '전체비용',
                              name: 'total_price',
                              allowBlank: true,
                              flex:1,
                              enableKeyEvents:true,
                              value:0
                            },
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
                                store:this.movie_gubun_store
                            }
                          ]
                        },
                        {
                            xtype: 'combo',
                            fieldLabel: '<font color=red>*</font>영화명',
                            flex:1,
                            name: 'movie_no',
                            displayField: 'movie_name',
                            valueField: 'movie_no',
                            hidden: false,
                            queryMode: 'local',
                            typeAhead: false,
                            emptyText: '선택',
                            editable: true,
                            forceSelection: false,
                            triggerAction: 'all',
                            selectOnFocus: true,
                            enableKeyEvents: true,
                            store:this.search_movie_store
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

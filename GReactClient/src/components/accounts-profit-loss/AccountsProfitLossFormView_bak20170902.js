import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class AccountsProfitLossFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '손익 정보 등록'
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
          msg: '작성하신 손익계산 정보를 저장하시겠습니까?',
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
  onComboChange = (ele, rec, idx) =>{
    const me = this,
          {result} = me.props,
          {reqform} = me.refs,
          form = reqform.down('form'),
          formValues = form.getValues();
    if(formValues.movie_no != null && formValues.movie_no != 0 && formValues.movie_no != ''){
      const params = Ext.apply({}, formValues);
      Ext.Ajax.request({
          url: `${API_URL}/AccountsProfitLoss/GetMovieRawPrice`,
          method: 'GET',
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
          params:{condition:JSON.stringify(params)},
          dataType: "json",
          success: function(response, request) {
            if(response.status==200){
              const ret = Ext.decode(response.responseText);
              if(ret.data.length>0){
                form.getForm().findField('addition_publication_price').setValue(ret.data[0].addition_publication_price);
                form.getForm().findField('raw_price').setValue(ret.data[0].raw_price);
              }
              else{
                form.getForm().findField('addition_publication_price').setValue(0);
                form.getForm().findField('raw_price').setValue(0);
              }
            }
            me.CheckAccountsProfitLossField();
          },
          failure: function(response, request) {
          }
      });
    }
    else{
      form.getForm().findField('addition_publication_price').setValue(0);
      form.getForm().findField('raw_price').setValue(0);
    }
  }

  SpecialAccountsProfitLoss = (field, events) => {
    const me = this,
          {reqform} = me.refs,
          form = reqform.down('form');
          if (events.getKey() == Ext.EventObject.ENTER) {
            if(field.name == 'total_price'){
              form.getForm().findField('theater_price').focus();
            }
            else if(field.name == 'theater_price'){
              form.getForm().findField('etc_price').focus();
            }
          }
          else{
            this.CheckAccountsProfitLossField();
          }
  }
  CalAccountsProfitLoss = () =>{
    this.CheckAccountsProfitLossField();
  }
  CheckAccountsProfitLossField = () =>{
    const me = this,
          {result} = me.props,
          {reqform} = me.refs,
          form = reqform.down('form'),
          formValues = form.getValues();
    var total_price = formValues.total_price||0;
    var addition_publication_price = formValues.addition_publication_price||0;
    var raw_price = formValues.raw_price||0;
    var theater_price = formValues.theater_price||0;
    var etc_price = formValues.etc_price||0;
    var total_sales_price = 0; /* 전체매출 */
    var profit_loss_rate = '0%'; /* 손익율 */
    var profit_loss_price = 0; /* 손익액 */
    total_sales_price = parseFloat(addition_publication_price) + parseFloat(raw_price) + parseFloat(theater_price) + parseFloat(etc_price);
    profit_loss_price = parseFloat(total_sales_price) - parseFloat(total_price);
    if(total_price==0){
      profit_loss_rate = 100;
    }
    else{
      profit_loss_rate = Math.round(parseFloat(profit_loss_price) / parseFloat(total_price)*100,0);
    }
    form.getForm().findField('total_sales_price').setValue(total_sales_price);
    form.getForm().findField('profit_loss_rate').setValue(profit_loss_rate+'%');
    form.getForm().findField('profit_loss_price').setValue(profit_loss_price);

    //console.log('CalAccountsProfitLoss')
  }
  onComboSelect = (ele, rec, idx) =>{
    alert('onComboSelect')
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
        width={760}
        height={420}
        minwidth={560}
        minHeight={420}
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
                          labelWidth: 100,
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
                              labelWidth: 100,
                              margin: '0 0 2 0'
                          },
                          items:[
                            {
                                xtype:'monthfield',
                                fieldLabel: '<font color=red>*</font>연월',
                                name: 'settlement_date',
                                flex:1,
                                format: 'Y-m',
                                padding:'0 5 0 0',
                                width:100,
                                value: new Date((new Date()).getTime() - 0 * 24 * 60 * 60 * 1000),
                                listeners:{
                                  select:this.onComboChange
                                }
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
                            },
                            {
                                xtype:'component',
                                flex:1,
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
                            store:this.search_movie_store,
                            listeners:{
                                select:this.onComboChange
                              // select:function(checkbox, newValue, oldValue, eOpts){
                              //   alert('11111');
                              // }
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
                              labelWidth: 100,
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
                              value:0,
                              listeners:{
                                keyup:this.CalAccountsProfitLoss,
                                specialkey:this.SpecialAccountsProfitLoss
                                // keypress:this.CalAccountsProfitLoss,
                                // specialkey:function(field, events){
                                //   var form = this.up().up().up().getForm();
                                //   if (events.getKey() == Ext.EventObject.ENTER) {
                                //     form.findField('theater_price').focus();
                                //   }
                                // }
                              }
                            },
                            {
                              xtype: 'numberfield',
                              fieldLabel: '극장매출',
                              name: 'theater_price',
                              allowBlank: true,
                              flex:1,
                              enableKeyEvents:true,
                              value:0,
                              listeners:{
                                keyup:this.CalAccountsProfitLoss,
                                specialkey:this.SpecialAccountsProfitLoss
                                // keypress:this.CalAccountsProfitLoss,
                                // specialkey:function(field, events){
                                //   var form = this.up().up().up().getForm();
                                //   if (events.getKey() == Ext.EventObject.ENTER) {
                                //     form.findField('etc_price').focus();
                                //   }
                                // }
                              }
                            },
                            {
                              xtype: 'numberfield',
                              fieldLabel: '기획전/기타매출',
                              name: 'etc_price',
                              allowBlank: true,
                              flex:1,
                              enableKeyEvents:true,
                              value:0,
                              listeners:{
                                keyup:this.CalAccountsProfitLoss,
                                specialkey:this.SpecialAccountsProfitLoss
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
                              labelWidth: 100,
                              margin: '0 0 2 0'
                          },
                          items:[
                            {
                              xtype: 'numberfield',
                              fieldLabel: '부가판권매출',
                              name: 'addition_publication_price',
                              readOnly:true,
                              flex:1,
                              style : 'border:0px',
                              fieldStyle: 'background:none',
                              inputWrapCls: '',
                              triggerWrapCls: '',
                              value:0
                            },
                            {
                              xtype: 'numberfield',
                              fieldLabel: '법무법인매출',
                              name: 'raw_price',
                              readOnly:true,
                              flex:1,
                              style : 'border:0px',
                              fieldStyle: 'background:none',
                              inputWrapCls: '',
                              triggerWrapCls: '',
                              value:0
                            },
                            {
                                xtype:'component',
                                flex:1
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
                              labelWidth: 100,
                              margin: '0 0 2 0'
                          },
                          items:[
                            {
                              xtype: 'numberfield',
                              fieldLabel: '전체매출',
                              name: 'total_sales_price',
                              readOnly:true,
                              flex:1,
                              style : 'border:0px',
                              fieldStyle: 'background:none',
                              inputWrapCls: '',
                              triggerWrapCls: '',
                              value:0
                            },
                            {
                              xtype: 'textfield',
                              fieldLabel: '손익율',
                              name: 'profit_loss_rate',
                              readOnly:true,
                              flex:1,
                              style : 'border:0px',
                              fieldStyle: 'background:none',
                              inputWrapCls: '',
                              triggerWrapCls: '',
                              value:0
                            },
                            {
                              xtype: 'numberfield',
                              fieldLabel: '손익액',
                              name: 'profit_loss_price',
                              readOnly:true,
                              flex:1,
                              style : 'border:0px',
                              fieldStyle: 'background:none',
                              inputWrapCls: '',
                              triggerWrapCls: '',
                              value:0
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

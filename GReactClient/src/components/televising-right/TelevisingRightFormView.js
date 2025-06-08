import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

Ext.override(Ext.form.NumberField, {
    //all allowed chars with dot and comma
    baseChars: "-0123456789,.",
    setValue: function(v){
        v = typeof v == 'number' ? v : String(v).replace(",", ".").replace(/,/g, "");

        var parseString = '00';
        if(this.decimalPrecision>0) {
            parseString =+ '.';

            for(var i=0;i<this.decimalPrecision;i++)
                parseString =+ '0';
        }
        //so provide parseString like 00.000 for decimalPrecision==3
        v = Ext.util.Format.number(this.fixPrecision(String(v)), parseString);

        this.setRawValue(this.fixPrecision(v));
        return Ext.form.NumberField.superclass.setValue.call(this, v);
    },
    fixPrecision: function(value){
        var nan = isNaN(value);
        if (!this.allowDecimals || this.decimalPrecision == -1 || nan || !value) {
            return nan ? '' : value;
        }
        return parseFloat(value).toFixed(this.decimalPrecision);
    },
    validateValue: function(value){
        if (!Ext.form.NumberField.superclass.validateValue.call(this, value)) {
            return false;
        }
        if (value.length < 1) {
            return true;
        }
        value = String(value).replace(",", ".").replace(/,/g, "");
        if (isNaN(value)) {
            this.markInvalid(String.format(this.nanText, value));
            return false;
        }
        var num = this.parseValue(value);
        if (num < this.minValue) {
            this.markInvalid(String.format(this.minText, this.minValue));
            return false;
        }
        if (num > this.maxValue) {
            this.markInvalid(String.format(this.maxText, this.maxValue));
            return false;
        }
        return true;
    },
    parseValue: function(value){
        value = parseFloat(String(value).replace(",", ".").replace(/,/g, ""));
        return isNaN(value) ? '' : value;
    }
});

export default class TelevisingRightFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '방영권 정보 등록'
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
  televising_right_store = Ext.create('Ext.data.Store', {
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
          params = Ext.apply({}, {type_name:'TELEVISING_RIGHT_MOVIE_GUBUN'});
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.search_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.televising_right_store.load({
            params:{condition:JSON.stringify(params)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
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

          if(formValues.sales_gubun ==''){
              alert('판매구분을 선택해주세요.');
              return false;
          }
          if(formValues.movie_no ==''){
              alert('영화명을 선택해주세요.');
              return false;
          }
          showConfirm({
          msg: '작성하신 반영권 저장하시겠습니까?',
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
            formValues.televising_right_no = result.data.televising_right_no;
          }
          else{
            formValues.televising_right_no = 0;
          }
    const params = paramsPostHandler(formValues);
    Ext.Ajax.request({
        url: `${API_URL}/TelevisingRight/Save`,
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
  onNumberFieldComma = () => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          form = reqform.down('form'),
          formValues = form.getValues();
          console.log(Ext.util.Format.number(formValues.sales_price, '0,000'));
          form.getForm().findField('sales_price').setValue(Ext.util.Format.number(formValues.sales_price, '0,000'));
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
        width={660}
        height={420}
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
                          labelWidth: 80,
                          margin: '0 0 2 0'
                      },
                      items: [
                        {
                            xtype: 'combo',
                            fieldLabel: '<font color=red>*</font>판매여부',
                            flex:1,
                            name: 'sales_gubun',
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
                            store:this.televising_right_store
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
                        },
                        {
                          xtype: 'textfield',
                          fieldLabel: 'SP명',
                          name: 'sp_corp_name',
                          allowBlank: true,
                          flex:1,
                          enableKeyEvents:true,
                          listeners:{
                            specialkey:function(field, events){
                              // var form = this.up().up().getForm();
                              // if (events.getKey() == Ext.EventObject.ENTER) {
                              //   if(field.value ==''){
                              //     alert('SP사를 입력해주세요.');
                              //   }
                              //   else{
                              //     form.findField('user_tel').focus();
                              //   }
                              // }
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
                              labelWidth: 80,
                              margin: '0 0 2 0'
                          },
                          items:[
                            {
                                xtype: 'datefield',
                                fieldLabel: '계약시작일',
                                name: 'sales_st_date',
                                format: 'Y-m-d',
                                flex:1,
                                editable: true,
                                //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                            },
                            {
                                xtype: 'datefield',
                                fieldLabel: '계약종료일',
                                name: 'sales_ed_date',
                                format: 'Y-m-d',
                                flex:1,
                                editable: true,
                                //value: new Date((new Date()).getTime() + (-7) * 24 * 60 * 60 * 1000)
                            },
                            {
                              xtype: 'textfield',
                              fieldLabel: '판매기간',
                              name: 'sales_period',
                              allowBlank: true,
                              flex:1,
                              enableKeyEvents:true
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
                              xtype: 'numberfield',
                              fieldLabel: '판매금액',
                              name: 'sales_price',
                              allowBlank: true,
                              flex:1,
                              enableKeyEvents:true,
                              // listeners:{
                              //   keyup:this.onNumberFieldComma,
                              //   specialkey:this.onNumberFieldComma
                              // }
                            },
                            {
                              xtype: 'textfield',
                              fieldLabel: '구분',
                              name: 'gubun',
                              allowBlank: true,
                              flex:2,
                              enableKeyEvents:true
                            }
                          ]
                        },
                        {
                          xtype: 'textarea',
                          fieldLabel: '비고',
                          name: 'remark',
                          allowBlank: true,
                          flex:1,
                          height:140,
                          enableKeyEvents:true
                        }
                        // ,
                        // {
                        //   xtype:'container',
                        //   layout: 'vbox',
                        //   defaults: {
                        //       labelAlign: 'right',
                        //       labelWidth: 80
                        //   },
                        //   items:[
                        //     {
                        //         xtype: 'radiogroup',
                        //         fieldLabel: '사용여부',
                        //         width:250,
                        //         //flex:1,
                        //         defaults: {
                        //             name: 'use_yn'
                        //         },
                        //         items: [{
                        //             inputValue: 'Y',
                        //             boxLabel: '사용',
                        //             checked:true
                        //         }, {
                        //             inputValue: 'N',
                        //             boxLabel: '미사용'
                        //         }],
                        //         listeners: {
                        //             //select: 'onSmpCompetitorChange'
                        //         }
                        //       }
                        //   ]
                        // }
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

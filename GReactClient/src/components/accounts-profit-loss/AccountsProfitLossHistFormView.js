import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class AccountsProfitLossHistFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    widgetTitle : '영화 손익 정보 관리'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'accounts_profit_loss_hist_no', type:'number' },
      { name: 'accounts_profit_loss_no', type:'number' },
      { name: 'settlement_date', type:'date', dateFormat: 'Y-m', defaultValue: Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'Y-m')},
      { name: 'theater_price', type:'number', defaultValue:0 },
      { name: 'etc_price', type:'number', defaultValue:0 },
      { name: 'use_yn', type:'string', defaultValue:'Y' },
      { name: 'use_yn_name', type:'string' }
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/AccountsProfitLossHist/GetList`,
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
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          params = Ext.apply({}, {type_name:'PROFIT_LOSS_MOVIE_GUBUN'});

          Ext.Promise.all([
            // new Ext.Promise(function (res) {
            //   me.search_movie_store.load({
            //       callback: function (recs, operation, success) {
            //         res();
            //       }
            //   });
            // }),
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
            //me.search_movie_store.insert(0, {movie_name:'선택'});
            form.getForm().setValues(result.data);
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
          formValue = form.getValues();
          formValue.accounts_profit_loss_no = result.data.accounts_profit_loss_no;
    const params = Ext.apply({}, formValue);

    store.getProxy().setExtraParams({condition:JSON.stringify(params)});
    store.currentPage = 1;
    this.store.load({
        params:{condition:JSON.stringify(params)},
        scope: this,
        callback: function (recs, operation, success) {
          if(success == false && operation.error.status == '401'){
            var rts = refreshToken(function(status){
                if(status=='OK'){
                  me.setState({Authorization:cookie.load('token')});
                  me.initPrevStoreLoad()
                }
            });
            me.setState({pagingtoolbar:true});
          }
          else{
            const res = operation.getResponse();
            if(res!=null){
              const ret = Ext.decode(res.responseText),
                    totalCount = ret.count,
                    counter = header_grid.down('toolbar [code=counter]');
              counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
            }
          }
        }
    });
  }
  save = () => {
    const me = this,
          {result} = me.props,
          {header_grid} = me.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          store = grid.getStore(),
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
          {header_grid} = me.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          store = grid.getStore(),
          formValues = form.getValues(),
          accounts_profit_loss_list = [];

          formValues.accounts_profit_loss_no = result.data.accounts_profit_loss_no;
    var total_price = formValues.total_price||0;
    var addition_publication_price = formValues.addition_publication_price||0;
    var raw_price = formValues.raw_price||0;
    var theater_price = 0;
    var etc_price = 0;
    var total_sales_price = 0; /* 전체매출 */
    var profit_loss_rate = '0%'; /* 손익율 */
    var profit_loss_price = 0; /* 손익액 */

    for(var i=0; i<store.count(); i++){
        var item = store.data.items[i].data;
        if(typeof(item.theater_price) != 'undefined'
          && item.theater_price != ''
          && item.theater_price != null){
            theater_price = theater_price + parseFloat(item.theater_price||0);
        }
        if(typeof(item.etc_price) != 'undefined'
          && item.etc_price != ''
          && item.etc_price != null){
            etc_price = etc_price + parseFloat(item.etc_price||0);
        }
        item.settlement_date = Ext.util.Format.date(item.settlement_date, 'Y-m');
        item.accounts_profit_loss_no = result.data.accounts_profit_loss_no;
        accounts_profit_loss_list.push(item);
    }
    total_sales_price = parseFloat(addition_publication_price)
                        + parseFloat(raw_price)
                        + parseFloat(theater_price)
                        + parseFloat(etc_price);
    profit_loss_price = parseFloat(total_sales_price) - parseFloat(total_price);
    if(total_price==0){
      profit_loss_rate = -100;
    }
    else{
      profit_loss_rate = Math.round(parseFloat(profit_loss_price) / parseFloat(total_price)*100,0);
    }
    formValues.total_sales_price = total_sales_price;
    formValues.theater_price = theater_price;
    formValues.etc_price = etc_price;
    formValues.profit_loss_rate = profit_loss_rate;
    formValues.profit_loss_price = profit_loss_price;

    if(store.count()>0){
      formValues.accounts_profit_loss_list = accounts_profit_loss_list;
    }
    else{
      formValues.accounts_profit_loss_list = '';
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

  renderEtcPrice = (value, metaData, record) =>{
    this.OnCalAccountsPrice();
    return Ext.util.Format.number(value, '0,000');
  }
  renderTheaterPrice = (value, metaData, record) =>{
    this.OnCalAccountsPrice();
    return Ext.util.Format.number(value, '0,000');
  }

  OnCalAccountsPrice = () => {
    const me = this,
          {result} = me.props,
          {header_grid} = me.refs,
          grid = header_grid.down('grid'),
          form = header_grid.down('form'),
          store = grid.getStore(),
          formValues = form.getValues();
    var total_price = formValues.total_price||0;
    var addition_publication_price = formValues.addition_publication_price||0;
    var raw_price = formValues.raw_price||0;
    var theater_price = 0;
    var etc_price = 0;
    var total_sales_price = 0; /* 전체매출 */
    var profit_loss_rate = '0%'; /* 손익율 */
    var profit_loss_price = 0; /* 손익액 */

    for(var i=0; i<store.count(); i++){
        var item = store.data.items[i].data;
        if(typeof(item.theater_price) != 'undefined'
          && item.theater_price != ''
          && item.theater_price != null){
            theater_price = theater_price + parseFloat(item.theater_price||0);
        }
        if(typeof(item.etc_price) != 'undefined'
          && item.etc_price != ''
          && item.etc_price != null){
            etc_price = etc_price + parseFloat(item.etc_price||0);
        }
    }
    total_sales_price = parseFloat(addition_publication_price)
                        + parseFloat(raw_price)
                        + parseFloat(theater_price)
                        + parseFloat(etc_price);
    profit_loss_price = parseFloat(total_sales_price) - parseFloat(total_price);
    if(total_price==0){
      profit_loss_rate = -100;
    }
    else{
      profit_loss_rate = Math.round(parseFloat(profit_loss_price) / parseFloat(total_price)*100,0);
    }
    form.getForm().findField('total_sales_price').setValue(total_sales_price);
    form.getForm().findField('theater_price').setValue(theater_price);
    form.getForm().findField('etc_price').setValue(etc_price);
    form.getForm().findField('profit_loss_rate').setValue(profit_loss_rate+'%');
    form.getForm().findField('profit_loss_price').setValue(profit_loss_price);
  }
  onClickAdd = (item) => {
    this.store.insert(0, this.store.createModel({}));
  }
  onClickDelete = (item) => {
    const me = this,
          {header_grid} = this.refs,
          {result, showDisplayRefresh} = this.props,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          selmodels = grid.getSelectionModel(),
          selection = grid.getSelection(),
          rowlength = store.getCount(),
          params = [],
          promiseList = [];
          if (Ext.isEmpty(selection)) {
              alert('선택된 정보가 없습니다.');
              return;
          }
          showConfirm({
              msg: '선택하신 손익 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                for (var i = rowlength - 1; i >= 0; i--) {
                   if (selmodels.isSelected(i)) {

                     var item = store.getAt(i);
                     console.log(item.data.accounts_profit_loss_hist_no);
                        if(!(item.data.accounts_profit_loss_hist_no == 0
                          || item.data.accounts_profit_loss_hist_no == ''
                          || item.data.accounts_profit_loss_hist_no ==  null)){
                            promiseList.push(new Ext.Promise(function (res) {
                              Ext.Ajax.request({
                                  url: `${API_URL}/AccountsProfitLossHist/Delete/`+item.data.accounts_profit_loss_hist_no,
                                  method: 'DELETE',
                                  headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
                                  dataType: "json",
                                  callback: function () {
                                      res();
                                  }
                              });
                             }));
                        }
                        store.remove(store.getAt(i));
                   }
                }
                Ext.Promise.all(promiseList).then(function () {
                    alert('정상적으로 삭제 되었습니다.');
                    //me.mainDataStoreLoad();
                    me.OnCalAccountsPrice();
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
    const radioProps = {
        name: 'radios'
    }
    return(
      <Window
        width={760}
        height={560}
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
        }]}
        >
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
                    html: '<strong>총: 0건</strong>'
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
                        text: '<font color=blue>연월</font>',
                        dataIndex: 'settlement_date',
                        type: 'TEXT',
                        width: 120,
                        isExcel: true,
                        align: 'center',
                        style:'text-align:center',
                        format: 'Y-m',
                        editor: {
                          xtype: 'monthfield',
                          allowBlank: true,
                          format: 'Y-m'
                        },
                        renderer: function(value, metaData, record) {
                          return Ext.util.Format.date(value, 'Y-m');
                        }
                    },
                    {
                        text: '<font color=blue>극장매출</font>',
                        dataIndex: 'theater_price',
                        type: 'TEXT',
                        width: 160,
                        isExcel: true,
                        align: 'right',
                        style:'text-align:center',
                        renderer:this.renderTheaterPrice,
                        // renderer: function(value, metaData, record) {
                        //   return Ext.util.Format.number(value, '0,000');
                        // },
                        editor: {
                            xtype: 'numberfield'
                            // ,
                            // listeners : {
                            //   change:this.OnCalAccountsPrice
                            //     // change : function(field, newVal, oldVal) {
                            //     //     console.log('field==='+field);
                            //     //     //field.up('grid').fireEvent("gridcellchanging", field, newVal, oldVal);
                            //     // }
                            // }
                        }
                    },
                    {
                        text: '<font color=blue>기획전/기타 매출</font>',
                        dataIndex: 'etc_price',
                        type: 'TEXT',
                        width: 160,
                        isExcel: true,
                        align: 'right',
                        style:'text-align:center',
                        renderer:this.renderEtcPrice,
                        // renderer: function(value, metaData, record) {
                        //   return Ext.util.Format.number(value, '0,000');
                        // },
                        editor: {
                            xtype: 'numberfield'
                            // ,
                            // listeners : {
                            //   change:this.OnCalAccountsPrice
                            //     // change : function(field, newVal, oldVal) {
                            //     //     console.log('field==='+field);
                            //     //     //field.up('grid').fireEvent("gridcellchanging", field, newVal, oldVal);
                            //     // }
                            // }
                        }
                    }
                  ],
                  dockedItems:[
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
                                   xtype: 'numberfield',
                                   fieldLabel: '전체비용',
                                   name: 'total_price',
                                   allowBlank: true,
                                   flex:1,
                                   enableKeyEvents:true,
                                   value:0,
                                   listeners:{
                                     keyup:this.OnCalAccountsPrice,
                                     specialkey:this.OnCalAccountsPrice
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
                                   flex:1
                                 }
                               ]
                             },
                             {
                               xtype: 'hiddenfield',
                               fieldLabel: '영화명',
                               name: 'movie_no',
                               readOnly:true,
                               flex:1
                             },
                             {
                               xtype: 'textfield',
                               fieldLabel: '영화명',
                               name: 'movie_name',
                               readOnly:true,
                               flex:1
                             }
                            //  {
                            //      xtype: 'combo',
                            //      fieldLabel: '<font color=red>*</font>영화명',
                            //      flex:1,
                            //      name: 'movie_no',
                            //      displayField: 'movie_name',
                            //      valueField: 'movie_no',
                            //      hidden: false,
                            //      queryMode: 'local',
                            //      typeAhead: false,
                            //      emptyText: '선택',
                            //      editable: false,
                            //      forceSelection: false,
                            //      triggerAction: 'all',
                            //      selectOnFocus: true,
                            //      enableKeyEvents: true,
                            //      store:this.search_movie_store
                            //  }
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
                               fieldStyle: 'background:none;background-color:#F1F1F1',
                               inputWrapCls: '',
                               triggerWrapCls: '',
                               value:0
                             },
                             {
                               xtype: 'numberfield',
                               fieldLabel: '부가판권매출',
                               name: 'addition_publication_price',
                               readOnly:true,
                               flex:1,
                               style : 'border:0px',
                               fieldStyle: 'background:none;',
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
                               xtype: 'textfield',
                               fieldLabel: '극장매출',
                               name: 'theater_price',
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
                               fieldLabel: '기획전/기타매출',
                               name: 'etc_price',
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
                             },
                             {
                                 xtype:'component',
                                 flex:1
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

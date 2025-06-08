import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*',
  'Ext.window.Window'
]);

export default class ServiceCorpFormView extends Component {
  state = {
    Authorization:cookie.load('token'),
    pagingtoolbar:true,
    searchtxt:''
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'movie_no', type:'number' },
      { name: 'movie_code', type:'string' },
      { name: 'movie_name', type:'string' },
      { name: 'grade', type:'string' },
      { name: 'service_open_date', type:'string' },
      { name: 'base_price', type:'number' },
      { name: 'use_yn', type:'string' },
      { name: 'use_yn_name', type:'string' },
      { name: 'tag_flag', type:'boolean' },
      //{ name: 'insert_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'insert_user_no', type:'string' },
      { name: 'insert_user_no_name', type:'string' },
      //{ name: 'updaet_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'updaet_user_no', type:'string' },
      { name: 'updaet_user_no_name', type:'string' }
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/Movie/GetList`,
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
  componentWillMount(){
  }
  componentDidMount(){
    //console.log('moviesearchview_key')
    // const me = this,
    //       {result} = this.props,
    //       {movie_grid} = this.refs,
    //       form = movie_grid.down('form'),
    //       grid = movie_grid.down('grid'),
    //       store = grid.getStore(),
    //       formValue = form.getValues();

          //form.getForm().setValues({searchtxt:result.data.movie_tag_name});
  }
  onSetSearch = (searchtxt) => {
    this.setState({searchtxt:searchtxt});
  }
  mainDataStoreLoad = () => {
    const me = this,
      {movie_grid} = this.refs,
      form = movie_grid.down('form'),
      grid = movie_grid.down('grid'),
      store = grid.getStore(),
      formValue = form.getValues();
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
                    counter = movie_grid.down('toolbar [code=counter]');

                    counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
                    // console.log(movie_grid.down('toolbar [code=counter]'));
                    if(totalCount<pageSize){
                      me.setState({pagingtoolbar:false});
                    }
                    else{
                      me.setState({pagingtoolbar:true});
                    }
            }
          }
        }
    });
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  onClickSearch = (item) =>{
    this.mainDataStoreLoad();
  }
  save = () => {
    const me = this,
          {movie_grid} = this.refs,
          grid = movie_grid.down('grid'),
          store = grid.getStore(),
          selection = grid.getSelection();
          if (Ext.isEmpty(selection)) {
              alert('선택된 정보가 없습니다.');
              return false;
          }
          if(selection.length !=1){
            alert('적용할 정보 1개만 선택해주세요.');
            return false;
          }
          this.props.setMoviewInfo(selection[0]);
  }
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const { result, onClose } = this.props,
          { pagingtoolbar, searchtxt } = this.state;
    return(
          <Panel
           layout='fit'
           ref={'movie_grid'}
           items={[{
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
             stateId:'service-movie-search-grid',
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
                 text:'<font color=white>조회</font>',
                 cls:'base-button-round',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickSearch
               },
               {
                   text:'<font color=white>적용</font>',
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
               }],
               columns:[
                 {
                   text: '일련번호',
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
                     text: '영화Tag<br/>추가여부',
                     xtype: 'checkcolumn',
                     dataIndex: 'tag_flag',
                     width: 100,
                     editable: false,
                     align: 'center',
                     isExcel: true,
                     stopSelection: false,
                     inputValue:'Y',
                     uncheckedValue: 'N'
                 },
                 {
                     text: '영화명',
                     dataIndex: 'movie_name',
                     type: 'TEXT',
                     //width: 250,
                     flex:1,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('movie_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                    }
                    //  {
                    //       text: '영화Tag추가여부',
                    //       dataIndex: 'movie_code',
                    //       type: 'TEXT',
                    //       width: 100,
                    //       isExcel: true,
                    //       align: 'center',
                    //       style:'text-align:center',
                    //       renderer: function(value, metaData, record) {
                    //         var deviceDetail = record.get('movie_code');
                    //         metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                    //         return value;
                    //       },
                    //       filter: {
                    //         type: 'string'
                    //       }
                    //  },
                //  {
                //      text: '등급',
                //      dataIndex: 'grade_name',
                //      type: 'TEXT',
                //      width: 100,
                //      isExcel: true,
                //      align: 'center',
                //      style:'text-align:center',
                //      renderer: function(value, metaData, record) {
                //        var deviceDetail = record.get('grade_name');
                //        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                //        return value;
                //      },
                //      filter: {
                //          type: 'string'
                //      }
                //  },
                //  {
                //      text: '서비스개시일',
                //      dataIndex: 'service_open_date',
                //      type: 'TEXT',
                //      width: 160,
                //      isExcel: true,
                //      align: 'center',
                //      style:'text-align:center',
                //      renderer: function(value, metaData, record) {
                //        var deviceDetail = record.get('service_open_date');
                //        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                //        return value;
                //      },
                //      filter: {
                //          type: 'string'
                //      }
                //  },
                //  {
                //      text: '단가',
                //      dataIndex: 'base_price',
                //      type: 'TEXT',
                //      width: 100,
                //      isExcel: true,
                //      align: 'right',
                //      style:'text-align:center',
                //      renderer: function(value, metaData, record) {
                //        var deviceDetail = record.get('base_price');
                //        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                //        return value;
                //      },
                //      filter: {
                //          type: 'string'
                //      }
                //  }
               ],
               dockedItems:[
                 {
                     xtype: 'form',
                     dock: 'top',
                     width: '100%',
                     bodyPadding: '10 10 10 10',
                     border: false,
                     bodyStyle: 'background-color:#F1F1F1;;width:100%',
                     layout: {
                         type: 'vbox',
                         align: 'stretch'
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
                             //margin: '0 0 5 0'
                         },
                         items:[
                           {
                               xtype: 'textfield',
                               fieldLabel: '검색어',
                               emptyText: '영화명/영화코드/등급',
                               flex:3,
                               name: 'searchtxt',
                               value:searchtxt,
                               listeners:{
                                 specialkey:this.onSpecialKeySearch
                               }
                           }
                         ]
                       }
                     ]
                 },
                 {
                   xtype: 'pagingtoolbar',
                   dock: 'bottom',
                   store:this.store,
                   displayInfo: true,
                   hidden:!pagingtoolbar
                 }
               ]
           }]}/>

    )
  }
}

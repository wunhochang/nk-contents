import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL,  pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

import AccountsProfitLossFormView from './AccountsProfitLossFormView';
import AccountsProfitLossHistFormView from './AccountsProfitLossHistFormView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
var g_proxy = null;
export default class AccountsProfitLossView extends Component {
  state = {
    isOpen:false,
    isOpenHist:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  storeReload = () =>{
    if(cookie.load('token') != null){
      this.setState({ Authorization: cookie.load('token') });
    }
    this.store.proxy.setHeaders({'Content-Type': 'application/json;charset=UTF-8;','Authorization': this.state.Authorization });
    this.mainDataStoreLoad();
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/AccountsProfitLoss/GetList`,
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
        },
        storeReload:this.storeReload,
        listeners: {
              exception: function(proxy, response, options){
                g_proxy = proxy;
                if(response.status == 401 && response.statusText == 'Unauthorized'){
                  var rts = refreshToken(function(status){
                      if(status=='OK'){
                        g_proxy.storeReload();
                      }
                      else{
                        cookie.remove('token', { path: '/' });
                        cookie.remove('user', { path: '/' });
                        window.location.href = `${CLIENT_ROOT_URL}/login`;
                      }
                  });
                }
                else{
                  cookie.remove('token', { path: '/' });
                  cookie.remove('user', { path: '/' });
                  window.location.href = `${CLIENT_ROOT_URL}/login`;
                }
            }
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
  componentWillMount(){
  }
  componentDidMount(){
    const me = this;
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.search_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.search_movie_store.insert(0, {movie_no:null, movie_name:'선택'});
      me.mainDataStoreLoad();
    });
  }


  
  mainDataStoreLoad = () => {
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      store = grid.getStore(),
      form = header_grid.down('form'),
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
                    counter = header_grid.down('toolbar [code=counter]');

                    counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
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
  onClickAdd = (item) =>{
    this.setState({isOpen:true, result:null});
  }
  onClickDelete = (item) =>{
    const me = this,
          {header_grid} = this.refs,
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
              msg: '선택하신 손익계산 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.accounts_profit_loss_no == 0 || itm.data.accounts_profit_loss_no == '' || itm.data.accounts_profit_loss_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/AccountsProfitLoss/Delete/`+itm.data.accounts_profit_loss_no,
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
                      alert('정상적으로 삭제 되었습니다.');
                      me.mainDataStoreLoad();
                  });
                });
              }
          });
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = '손익_리스트_목록';

      ExcelDownload(grid, ExcelName);
  }
  showDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
      view.getSelectionModel().deselectAll();
      view.getSelectionModel().select(rowIdx, true);
      this.setState({isOpen:false, isOpenHist:true, result:rec});
  }
  onBeforeItemContextMenu = (view, rec, node, idx, eOpt) => {
    const {header_grid} = this.refs,
          grid = header_grid.down('grid');
          eOpt.stopEvent();
          grid.contextMenu.hasGrid = grid;
          grid.contextMenu.initialColumns = Ext.clone(grid.columnManager.getColumns());
          grid.contextMenu.showAt(eOpt.getXY());
  }
  showDisplayRefresh = () => {
    this.setState({ result: null, isOpen:false, isOpenHist:false });
    this.mainDataStoreLoad();
  }

  render(){
    const { pagingtoolbar, result, isOpen, isOpenHist } = this.state;

    return(
      <Panel layout="fit">
        { isOpen && (
            <AccountsProfitLossFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, isOpen:false, isOpenHist:false })}/>
        )}
        { isOpenHist && (
            <AccountsProfitLossHistFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, isOpen:false, isOpenHist:false })}/>
        )}

        <Panel
           layout='fit'
           ref={'header_grid'}
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
             stateId:'service-television-right-view',
             stateful:false,
             enableLocking:true,
             multiColumnSort:true,
             lockable:true,
             selModel: {
                 type: 'checkboxmodel'
             },
             store:this.store,
             contextMenu: new createContextMenu,
             listeners : {
                //rowclick : this.onRowClick,
                beforeitemcontextmenu:this.onBeforeItemContextMenu
             },
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
                 xtype:'button',
                 text:'<font color=white>등록</font>',
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
               },
               {
                 xtype:'button',
                 text:'<font color=white>엑셀다운로드</font>',
                 tooltip:'엑셀다운로드',
                 //iconCls: 'fa fa-sign-out',
                 style: {
                     'font-size': '14px',
                     'background-color':'#4783AE',
                     'border-color':'#4783AE',
                     'padding':'5px 7px 4px 7px',
                     'text-decoration': 'none',
                     'border-radius': '4px 4px 4px 4px'
                 },
                 handler:this.onClickExcelDownload
               }],
               columns:[
                 {
                    xtype: 'actioncolumn',
                    dataIndex: 'action_no',
                    text: '관리',
                    width: 50,
                    menuDisabled: true,
                    type: 'BUTTON',
                    tooltip: '열람 및 수정',
                    locked: true,
                    editable: false,
                    required:false,
                    align: 'center',
                    items: [{
                        iconCls: 'grid-edit-task',
                        handler: this.showDetailWindow
                    }]
                 },
                 {
                     text: '서비스연도',
                     dataIndex: 'service_open_date_year',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                 },
                 {
                     text: '타이틀',
                     dataIndex: 'movie_name',
                     type: 'TEXT',
                     width: 200,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center'
                 },
                 {
                     text: '서비스시작일',
                     dataIndex: 'service_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center'
                 },
                 {
                     text: '구분',
                     dataIndex: 'movie_gubun_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center'
                 },
                 {
                     text: '전체비용',
                     dataIndex: 'total_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '부가판권<br>매출',
                     exceltitle:'부가판권 매출',
                     dataIndex: 'addition_publication_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '법무법인<br>매출',
                     exceltitle:'법무법인 매출',
                     dataIndex: 'raw_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '극장<br>매출',
                     exceltitle:'극장 매출',
                     dataIndex: 'theater_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '기획전/기타<br>매출',
                     exceltitle:'기획전/기타 매출',
                     dataIndex: 'etc_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '전체 매출',
                     exceltitle:'전체 매출',
                     dataIndex: 'total_sales_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '손익율',
                     dataIndex: 'profit_loss_rate',
                     type: 'TEXT',
                     width: 160,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                 },
                 {
                     text: '손익액',
                     dataIndex: 'profit_loss_price',
                     type: 'TEXT',
                     width: 180,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return Ext.util.Format.number(value, '0,000');
                     }
                 },
                 {
                     text: '등록자',
                     dataIndex: 'insert_user_no_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center'
                 },
                 {
                     text: '등록일시',
                     dataIndex: 'insert_date',
                     type: 'DATE',
                     dateFormat: 'Y-m-d H:i:s',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return value.replaceAll('T',' ');
                     }
                 },
                 {
                     text: '수정자',
                     dataIndex: 'update_user_no_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center'
                 },
                 {
                     text: '수정일시',
                     dataIndex: 'update_date',
                     type: 'DATE',
                     dateFormat: 'Y-m-d H:i:s',
                     width: 140,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       return value.replaceAll('T',' ');
                     }
                 }
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
                            xtype:'monthfield',
                            fieldLabel: '매출기준',
                            name: 'st_date',
                            flex:1,
                            format: 'Y-m',
                            padding:'0 5 0 0',
                            value: new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000)
                          },
                           {
                               xtype: 'combo',
                               fieldLabel: '영화명',
                               flex:4,
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
      </Panel>
    )
  }

}

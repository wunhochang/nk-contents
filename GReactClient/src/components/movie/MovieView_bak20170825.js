import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

import MovieFormView from './MovieFormView';
import MovieTagView from './MovieTagView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);

export default class MovieView extends Component {
  state = {
    isOpen:false,
    isOpenTag:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'movie_no', type:'number' },
      { name: 'movie_code', type:'string' },
      { name: 'movie_name', type:'string' },
      { name: 'grade', type:'string' },
      { name: 'service_open_date', type:'string' },
      { name: 'movie_price', type:'number' },
      { name: 'service_type', type:'string' },
      { name: 'publication_kind', type:'string', convert:function(v, record){if(typeof v =="string") return v.split(",");  else return v; }},
      { name: 'publication_st_date', type:'string' },
      { name: 'publication_ed_date', type:'string' },
      { name: 'publication_code', type:'string' },
      { name: 'use_yn', type:'string' },
      { name: 'use_yn_name', type:'string' },
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
  search_yesno_store = Ext.create('Ext.data.Store', {
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
  search_useyn_store = Ext.create('Ext.data.Store', {
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
  componentWillMount(){
    this.initPrevStoreLoad();
  }
  componentDidMount(){
    // const me = this,
    //   {header_grid} = this.refs,
    //   grid = header_grid.down('grid');
      this.mainDataStoreLoad();
  }
  initPrevStoreLoad = () => {
    const me = this,
          params = Ext.apply({}, {type_name:'USE_YN'}),
          params1 = Ext.apply({}, {type_name:'YES_NO'}),
          params2 = Ext.apply({}, {type_name:'MOVIE_GUBUN'}),
          params3 = Ext.apply({}, {type_name:'MOVIE_SERVICE_TYPE'});
    this.search_useyn_store.load({
        params:{condition:JSON.stringify(params)},
        callback: function (recs, operation, success) {
          me.search_useyn_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'USE_YN'});
        }
    });
    this.search_yesno_store.load({
        params:{condition:JSON.stringify(params1)},
        callback: function (recs, operation, success) {
          me.search_yesno_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'YES_NO'});
        }
    });
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
        params:{condition:JSON.stringify(params2)},
        callback: function (recs, operation, success) {
          me.movie_gubun_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'MOVIE_GUBUN'});
        }
    });
    this.movie_service_type_store.load({
        params:{condition:JSON.stringify(params3)},
        callback: function (recs, operation, success) {
          me.movie_service_type_store.insert(0, {common_code_no:null, type_code:null, type_data:'선택', type_name:'MOVIE_SERVICE_TYPE'});
        }
    });
  }
  mainDataStoreLoad = () => {
    const me = this,
      {header_grid} = this.refs,
      form = header_grid.down('form'),
      grid = header_grid.down('grid'),
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
                    counter = header_grid.down('toolbar [code=counter]');

                    counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
                    // console.log(header_grid.down('toolbar [code=counter]'));
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
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = '영화목록';

      ExcelDownload(grid, ExcelName);
  }
  showDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
      view.getSelectionModel().deselectAll();
      view.getSelectionModel().select(rowIdx, true);
      this.setState({isOpen:true, result:rec});
  }
  showTagDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
      view.getSelectionModel().deselectAll();
      view.getSelectionModel().select(rowIdx, true);
      this.setState({isOpenTag:true, result:rec});
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
    this.setState({ result: null, isOpen:false });
    this.mainDataStoreLoad();
  }
  render(){
    const { pagingtoolbar, result, isOpen, isOpenTag } = this.state;

    return(
      <Panel layout="fit">
        {/*서비스업체 등록/수정 Form*/}
        { isOpen && (
            <MovieFormView
              result={result}
              showDisplayRefresh={this.showDisplayRefresh}
              onClose={() => this.setState({ result: null, isOpen:false })}/>
        )}
        {/*영화tag관리 팝업*/}
        { isOpenTag && (
            <MovieTagView
              result={result}
              onClose={() => this.setState({ result: null, isOpenTag:false })}/>
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
             stateId:'service-movie-view',
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
                   text: '일련번호',
                   dataIndex: 'movie_no',
                   type: 'TEXT',
                   width: 10,
                   hidden: true,
                   hideable: true,
                   isExcel: true,
                   align: 'center',
                   sortable:true,
                   style:'text-align:center',
                   filter: {
                       type: 'string'
                   }
                 },
                 {
                    xtype: 'actioncolumn',
                    dataIndex: 'action_no',
                    type: 'BUTTON',
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
                    xtype: 'actioncolumn',
                    dataIndex: 'action1_no',
                    type: 'BUTTON',
                    text: 'Tag',
                    width: 50,
                    menuDisabled: true,
                    type: 'BUTTON',
                    tooltip: '영화Tag리스트',
                    locked: true,
                    editable: false,
                    required:false,
                    align: 'center',
                    items: [{
                        iconCls: 'grid-edit-task',
                        handler: this.showTagDetailWindow
                    }]
                 },
                 {
                      text: '구분',
                      dataIndex: 'movie_gubun_name',
                      type: 'TEXT',
                      width: 60,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('movie_gubun_name');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                        type: 'string'
                      }
                 },
                 {
                      text: '서비스유형',
                      dataIndex: 'service_type_name',
                      type: 'TEXT',
                      width: 100,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('service_type_name');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                        type: 'string'
                      }
                 },
                 {
                      text: 'CP사',
                      dataIndex: 'cp_corp_detail_no_name',
                      type: 'TEXT',
                      width: 120,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('cp_corp_detail_no_name');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                        type: 'string'
                      }
                 },
                 {
                      text: 'SP사',
                      dataIndex: 'sp_corp_no_name',
                      type: 'TEXT',
                      width: 140,
                      isExcel: true,
                      align: 'center',
                      style:'text-align:center',
                      renderer: function(value, metaData, record) {
                        var deviceDetail = record.get('sp_corp_no_name');
                        metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                        return value;
                      },
                      filter: {
                        type: 'string'
                      }
                 },
                 {
                     text: '영화명',
                     dataIndex: 'movie_name',
                     type: 'TEXT',
                     width: 250,
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
                 },

                 {
                     text: '정산코드',
                     dataIndex: 'publication_code',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('publication_code');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: 'MG여부',
                     dataIndex: 'mg_yn_name',
                     type: 'TEXT',
                     width: 80,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('mg_yn_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: 'MG금액',
                     dataIndex: 'mg_price',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'right',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('mg_price');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return Ext.util.Format.number(value, '0,000');
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '핑크여부',
                     dataIndex: 'pink_movie_yn_name',
                     type: 'TEXT',
                     width: 80,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('pink_yn_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '판권종류',
                     dataIndex: 'publication_kind_name',
                     type: 'TEXT',
                     width: 160,
                     isExcel: true,
                     align: 'left',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('publication_kind_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '판권시작일',
                     dataIndex: 'publication_st_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('publication_st_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '판권종료일',
                     dataIndex: 'publication_ed_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('publication_ed_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '서비스개시일',
                     exceltitle:'서비스개시일',
                     dataIndex: 'service_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('service_open_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '최초개봉<br>개시일일',
                     exceltitle:'최초개봉개시일',
                     dataIndex: 'first_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('service_open_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '프리미엄<br>개시일',
                     exceltitle:'프리미엄개시일',
                     dataIndex: 'premium_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('service_open_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '최신작<br>개시일',
                     exceltitle:'최신작개시일',
                     dataIndex: 'first_new_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('service_open_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '신작<br>개시일',
                     exceltitle:'신작개시일',
                     dataIndex: 'new_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('service_open_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '구작<br>개시일',
                     exceltitle:'구작개시일',
                     dataIndex: 'old_open_date',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('service_open_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '사용여부',
                     dataIndex: 'use_yn_name',
                     type: 'TEXT',
                     width: 80,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('use_yn_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
                 },
                 {
                     text: '등록자',
                     dataIndex: 'insert_user_no_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('insert_user_no_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
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
                       var deviceDetail = record.get('insert_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'date'
                     }
                 },
                 {
                     text: '수정자',
                     dataIndex: 'update_user_no_name',
                     type: 'TEXT',
                     width: 100,
                     isExcel: true,
                     align: 'center',
                     style:'text-align:center',
                     renderer: function(value, metaData, record) {
                       var deviceDetail = record.get('update_user_no_name');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'string'
                     }
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
                       var deviceDetail = record.get('update_date');
                       metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                       return value;
                     },
                     filter: {
                         type: 'date'
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
                             labelWidth: 80,
                             margin: '0 0 5 0'
                         },
                         items:[
                           {
                               xtype: 'textfield',
                               fieldLabel: '검색어',
                               emptyText: '영화명/정산코드/판권종류',
                               flex:2,
                               name: 'searchtxt',
                               listeners:{
                                 specialkey:this.onSpecialKeySearch
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
                               //value:'A',
                               store:this.movie_gubun_store,
                               listeners: {
                                 change: function (combo, newValue, oldValue, eOpts) {
                                     var form = this.up('form').getForm();
                                     if(newValue === 'A'){
                                         form.findField('service_type').setDisabled(false);
                                     }else{
                                         //form.setValues({'service_type':''});
                                         form.findField('service_type').setDisabled(true);
                                         form.findField('service_type').setValue(null);
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
                             //margin: '0 0 5 0'
                         },
                         flex:2,
                         items:[
                           {
                               xtype: 'combo',
                               fieldLabel: 'CP사',
                               flex:3,
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
                           },
                           {
                               xtype: 'combo',
                               fieldLabel: 'SP사',
                               flex:2,
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
                           },

                           {
                               xtype: 'combo',
                               fieldLabel: '핑크영화여부',
                               flex:1,
                               name: 'pink_movie_yn',
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
                               store:this.search_yesno_store
                           },
                           {
                               xtype: 'combo',
                               fieldLabel: 'MG여부',
                               flex:1,
                               name: 'mg_yn',
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
                               store:this.search_yesno_store
                           },
                           {
                               xtype: 'combo',
                               fieldLabel: '사용여부',
                               flex:1,
                               name: 'use_yn',
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
                               store:this.search_useyn_store
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

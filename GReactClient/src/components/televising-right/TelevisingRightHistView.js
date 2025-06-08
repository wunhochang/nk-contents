import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, ExcelDownload} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
var g_proxy = null;
export default class TelevisingRightHistView extends Component {
  state = {
    result:[],
    Authorization:cookie.load('token'),
    widgetTitle : '방영권 이력내역',
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
    pageSize: null,
    remoteSort : false,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/TelevisingRightHist/GetList`,
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
  componentWillMount(){
  }
  componentDidMount(){
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs;
    if(result !=null){
      header_grid.down('form').getForm().setValues({televising_right_no:result.data.televising_right_no});
    }
    this.mainDataStoreLoad();
  }
  mainDataStoreLoad = () => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          params = Ext.apply({}, {televising_right_no:result.data.televising_right_no});

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
  onClickDelete = (item) =>{
    this.setState({isOpen:true, result:null});
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = '반영권_이력_목록';

      ExcelDownload(grid, ExcelName);
  }
  showDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
      view.getSelectionModel().deselectAll();
      view.getSelectionModel().select(rowIdx, true);
      this.setState({isOpen:true, result:rec});
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
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const { result, onClose } = this.props,
          {widgetTitle} = this.state;

    return(
      <Window
        width={660}
        height={420}
        minwidth={660}
        minHeight={420}
        title={widgetTitle}
        autoShow={true}
        modal={true}
        layout="fit"
        bodyPadding={7}
        closable={false}
        maximizable={true}
        scrollable={false}
        maximized={true}
        listeners={[{
          show: function(){
            this.removeCls("x-unselectable");
         }
        }]}
        onClose={onClose}>
        <Panel layout="fit">
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
               stateId:'service-television-right-hist-view',
               stateful:false,
               enableLocking:false,
               multiColumnSort:false,
               lockable:false,
               store:this.store,
               tbar:[
                  {
                    xtype:'component',
                    code: 'counter',
                    html: '<strong>총: 0건</strong>'
                  },'->',
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
                  },
                  {
                      xtype:'button',
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
                      handler:this.close
                  }
                 ],
                 columns:[
                    {
                        xtype: 'rownumberer'
                    },
                   {
                       text: '판매여부',
                       dataIndex: 'sales_gubun_name',
                       type: 'TEXT',
                       width: 100,
                       isExcel: true,
                       align: 'center',
                       style:'text-align:center'
                   },
                   {
                       text: '영화명',
                       dataIndex: 'movie_name',
                       type: 'TEXT',
                       width: 200,
                       isExcel: true,
                       align: 'left',
                       style:'text-align:center'
                   },
                   {
                       text: '원판권 종료일',
                       dataIndex: 'publication_ed_date',
                       type: 'TEXT',
                       width: 120,
                       isExcel: true,
                       align: 'center',
                       style:'text-align:center'
                   },
                   {
                       text: 'SP사',
                       dataIndex: 'sp_corp_name',
                       type: 'TEXT',
                       width: 200,
                       isExcel: true,
                       align: 'left',
                       style:'text-align:center'
                   },
                   {
                       text: '판매기간',
                       dataIndex: 'sales_period',
                       type: 'TEXT',
                       width: 100,
                       isExcel: true,
                       align: 'center',
                       style:'text-align:center'
                   },
                   {
                       text: '계약시작일',
                       dataIndex: 'sales_st_date',
                       type: 'TEXT',
                       width: 120,
                       isExcel: true,
                       align: 'center',
                       style:'text-align:center',
                       format: 'Y-m-d'
                   },
                   {
                       text: '계약종료일',
                       dataIndex: 'sales_ed_date',
                       xtype: 'datecolumn',
                       type: 'TEXT',
                       width: 120,
                       isExcel: true,
                       align: 'center',
                       style:'text-align:center',
                       format: 'Y-m-d'
                   },
                   {
                       text: '판매금액',
                       dataIndex: 'sales_price',
                       type: 'TEXT',
                       width: 140,
                       isExcel: true,
                       align: 'right',
                       style:'text-align:center',
                       renderer: function(value, metaData, record) {
                         return Ext.util.Format.number(value, '0,000')
                       }
                   },
                   {
                       text: '구분',
                       dataIndex: 'gubun',
                       type: 'TEXT',
                       width: 160,
                       isExcel: true,
                       align: 'center',
                       style:'text-align:center'
                   },
                   {
                       text: '비고',
                       dataIndex: 'remark',
                       type: 'TEXT',
                       width: 200,
                       isExcel: true,
                       align: 'left',
                       style:'text-align:center'
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
                       style:'text-align:center'
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
                       style:'text-align:center'
                   }
                 ],
                 dockedItems:[
                   {
                       xtype: 'form',
                       dock: 'top',
                       width: '100%',
                       bodyPadding: '0 0 0 0',
                       border: false,
                       bodyStyle: 'background-color:#FFFFFF;;width:100%',
                       layout: {
                           type: 'vbox',
                           align: 'stretch'
                       },
                       items: [
                         {
                           xtype:'hiddenfield',
                           name:'televising_right_no'
                         }
                       ]
                    }
                 ]
             }]}/>
        </Panel>

      </Window>
    )
  }

}

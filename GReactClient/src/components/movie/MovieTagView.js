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
  'Ext.util.*'
]);

export default class MovieTagView extends Component {
  state = {
    widgetTitle : '영화에 대한 관련 영화명 관리',
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name:'movie_tag_no', type:'auto' },
      { name:'movie_no', type:'auto' },
      { name:'movie_tag_name', type:'string' },
      { name:'use_yn', type:'string' },
      { name:'del_yn', type:'string' },
      { name:'insert_date', type:'string' },
      { name:'insert_user_no', type:'string' },
      { name:'update_date', type:'string' },
      { name:'update_user_no', type:'string' },
      { name:'delete_date', type:'string' },
      { name:'delete_user_no', type:'string' }
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/MovieTag/GetList`,
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
    const {result} = this.props;
    this.setState({widgetTitle:'<span style="font-weight:bold;color:yellow">' + result.data.movie_name + '</span>에 대한 관련 영화명 관리'});
  }
  componentDidMount(){
    this.mainDataStoreLoad();
  }
  mainDataStoreLoad = () => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          params = Ext.apply({}, {movie_no:result.data.movie_no, list_type:'EXCEL'});
          store.getProxy().setExtraParams({condition:JSON.stringify(params)});
          store.currentPage = 1;
          store.load({
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
                            me.setState({pagingtoolbar:true});
                          }
                          else{
                            me.setState({pagingtoolbar:false});
                          }
                  }
                }
              }
          });
  }
  onClickSearch = (item) => {
    this.mainDataStoreLoad();
  }
  onClickAdd = (item) => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore();
    store.insert(0, store.createModel({}));
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = '영화TAG목록';

      ExcelDownload(grid, ExcelName);
  }
  onClickSave = (item) => {
    const me = this,
          {result} = this.props,
          {header_grid} = this.refs,
          grid = header_grid.down('grid'),
          store = grid.getStore(),
          process_store = store.getModifiedRecords();

    var promiseList = [],
        params = [],
        errorCheck = 0;

        if(process_store.length == 0){
          alert('저장할 데이터가 없습니다.');
          return;
        }
        else{
          Ext.each(process_store, function (itm) {
            itm.data.movie_no = result.data.movie_no;
            if(itm.phantom == true || itm.dirty == true){
              if(itm.data.movie_tag_name ==''){
                errorCheck++;
              }
              else{
                params.push(itm);
              }
            }
          });
          if(errorCheck>0){
            alert('영화 TAG명을 입력해주세요.');
            return;
          }
          showConfirm({
            msg: '작성하신 영화Tag 정보를 저장하시겠습니까?',
            title:'확인',
            callback: function () {
              Ext.each(params, function (itm) {
                promiseList.push(new Ext.Promise(function (res) {
                  Ext.Ajax.request({
                      url: `${API_URL}/MovieTag/Save`,
                      method: 'POST',
                      headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
                      params : paramsPostHandler(itm.data),
                      dataType: "json",
                      callback: function () {
                          res();
                      }
                  });
                 }));
              });
              Ext.Promise.all(promiseList).then(function () {
                  alert('정상적으로 저장되었습니다.');
                  me.mainDataStoreLoad();
              });
            }
          });
        }
  }
  onClickDelete = (item) => {
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
              msg: '영화 Tag명 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.movie_tag_no == 0 || itm.data.movie_tag_no == '' || itm.data.movie_tag_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/MovieTag/Delete/`+itm.data.movie_tag_no,
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
  close = () => {
    const { result, onClose } = this.props;
    onClose();
  }
  render(){
    const { onClose, result } = this.props,
          { pagingtoolbar, widgetTitle } = this.state;
    return(
      <Window
        width={860}
        height={520}
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
        onClose={onClose}
        >
        <Panel
          layout={'fit'}
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
            stateId:'movie-tag-view-grid',
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
              },
              {
                xtype:'button',
                text:'<font color=white>저장</font>',
                style: {
                    'font-size': '14px',
                    'background-color':'#4783AE',
                    'border-color':'#4783AE',
                    'padding':'5px 7px 4px 7px',
                    'text-decoration': 'none',
                    'border-radius': '4px 4px 4px 4px'
                },
                handler:this.onClickSave
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
              },
              {
                xtype:'button',
                text:'<font color=white>닫기</font>',
                tooltip:'닫기',
                //iconCls: 'fa fa-sign-out',
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
                  text: '일련번호',
                  dataIndex: 'movie_tag_no',
                  type: 'TEXT',
                  width: 10,
                  hidden: true,
                  hideable: false,
                  isExcel: true,
                  align: 'center',
                  sortable:true,
                  style:'text-align:center'
                },
                {
                    text: '<font color=red>*</font><font color=blue>영화 Tag명</font>',
                    dataIndex: 'movie_tag_name',
                    type: 'TEXT',
                    //width: 140,
                    flex:1,
                    isExcel: true,
                    align: 'left',
                    style:'text-align:center',
                    required: true,
                    editor: {
                         allowBlank: true
                    },
                    renderer: function(value, metaData, record) {
                      var deviceDetail = record.get('movie_tag_name');
                      metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                      return value;
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
                    }
                },
                {
                    text: '등록일시',
                    dataIndex: 'insert_date',
                    //type: 'DATE',
                    //dateFormat: 'Y-m-d H:i:s',
                    type:'TEXT',
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
                    style:'text-align:center',
                    renderer: function(value, metaData, record) {
                      var deviceDetail = record.get('update_user_no_name');
                      metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                      return value;
                    }
                },
                {
                    text: '수정일시',
                    dataIndex: 'update_date',
                    //type: 'DATE',
                    //dateFormat: 'Y-m-d H:i:s',
                    type:'TEXT',
                    width: 140,
                    isExcel: true,
                    align: 'center',
                    style:'text-align:center',
                    renderer: function(value, metaData, record) {
                      return value.replaceAll('T',' ');
                    }
                }
              ],
              dockedItems:[{
                  xtype: 'form',
                  dock: 'top',
                  width: '100%',
                  bodyPadding: '10 10 10 10',
                  border: false,
                  bodyStyle: 'background-color:#F1F1F1;;width:100%',
                  hidden:true,
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
                            xtype: 'hiddenfield',
                            name: 'movie_no',
                            value:result.data.movie_no
                        }
                      ]
                    }
                  ]
              }]
          }]}/>

      </Window>
    );
  }
}

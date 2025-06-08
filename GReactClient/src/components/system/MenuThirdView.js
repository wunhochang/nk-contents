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
export default class MenuThirdView extends Component {
  constructor(props) {
      super(props);
      this.thirdMenuCall = this.thirdMenuCall.bind(this);
  }
  thirdMenuCall = (result) => {

  }
  state = {
    isOpen:false,
    result:[],
    parent_menu_no:null,
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'menu_no', type:'number', defaultValue:0 },
      { name: 'menu_code', type:'string' },
      { name: 'menu_name', type:'string' },
      { name: 'icon', type:'string', defaultValue:'x-fa fa-angle-double-right' },
      { name: 'path', type:'string' },
      { name: 'component', type:'string', defaultValue:'#' },
      { name: 'option1', type:'string' },
      { name: 'option2', type:'string' },
      { name: 'option3', type:'string' },
      { name: 'parent_menu_no', type:'number', defaultValue:0 },
      { name: 'depth', type:'number' },
      { name: 'remark', type:'string' },
      { name: 'output_order', type:'number', defaultValue:1 },
      { name: 'use_yn', type:'string', defaultValue:'Y' },
      { name: 'use_yn_name', type:'string' },
      //{ name: 'insert_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'insert_user_no', type:'string' },
      { name: 'insert_user_no_name', type:'string' },
      //{ name: 'update_date', type: 'date', dateFormat: 'Y-m-d H:i:s' },
      { name: 'update_user_no', type:'string' },
      { name: 'update_user_no_name', type:'string' }
    ],
    pageSize: pageSize,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/Menu/GetList`,
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
  grid_useyn_store = Ext.create('Ext.data.Store', {
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
    //this.mainDataStoreLoad();
    // const me = this,
    //   {third_grid} = this.refs,
    //   form = third_grid.down('form'),
    //   grid = third_grid.down('grid'),
    //   store = grid.getStore(),
    //   formValue = {depth:1},
    //   //formValue = form.getValues();
    //   params = Ext.apply({}, formValue),
    //   initParams = Ext.apply({}, {type_name:'USE_YN'});
    //
    // Ext.Promise.all([
    //   new Ext.Promise(function (res) {
    //     me.grid_useyn_store.load({
    //         params:{condition:JSON.stringify(initParams)},
    //         callback: function (recs, operation, success) {
    //           res();
    //         }
    //     });
    //   })
    // ]).then(function () {
    //   me.mainDataStoreLoad();
    // });
  }
  initPrevStoreLoad = () => {
    const me = this,
          params = Ext.apply({}, {type_name:'USE_YN'});
    this.grid_useyn_store.load({
        params:{condition:JSON.stringify(params)},
        callback: function (recs, operation, success) {
        }
    });
  }
  onAutoProcessMenu = (result) => {
    const {third_grid} = this.refs,
          counter = third_grid.down('toolbar [code=counter]');
          if(result == null){
            this.setState({parent_menu_no:null});
            this.store.removeAll();
            this.store.refresh();
            counter.setHtml('<strong>총 0건</strong> ');
          }
          else{
            this.setState({parent_menu_no:result.data.menu_no});
            this.mainDataStoreLoad();
          }
  }
  mainDataStoreLoad = () => {
    const me = this,
      {third_grid} = this.refs,
      form = third_grid.down('form'),
      grid = third_grid.down('grid'),
      store = grid.getStore(),
      formValue = {depth:3, parent_menu_no:this.state.parent_menu_no};
      //formValue = form.getValues();
    const params = Ext.apply({}, formValue);
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
                    counter = third_grid.down('toolbar [code=counter]');
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
    if(this.state.parent_menu_no != null && this.state.parent_menu_no != '0' && this.state.parent_menu_no != '' ){
      this.mainDataStoreLoad();
    }
    else{
      alert('2차메뉴를 먼저 선택해주세요.');
      return;
    }
  }
  onClickAdd = (item) => {
    if(this.state.parent_menu_no != null && this.state.parent_menu_no != '0' && this.state.parent_menu_no != '' ){
      this.store.insert(0, this.store.createModel({}));
    }
    else{
      alert('2차메뉴를 먼저 선택해주세요.');
      return;
    }
  }
  onClickSave = (item) => {
    const me = this,
          {result} = this.props,
          {third_grid} = this.refs,
          grid = third_grid.down('grid'),
          store = grid.getStore(),
          process_store = store.getModifiedRecords();

    var promiseList = [],
        params = [],
        errorCheck1 = 0,
        errorCheck2 = 0;

        if(process_store.length == 0){
          alert('저장할 데이터가 없습니다.');
          return;
        }
        else{
          Ext.each(process_store, function (itm) {
            if(itm.phantom == true || itm.dirty == true){
              if(itm.data.menu_name ==''){
                errorCheck1++;
              }
              if(itm.data.component ==''){
                errorCheck2++;
              }
              itm.data.depth = 3;
              itm.data.parent_menu_no = me.state.parent_menu_no;
              params.push(itm);
            }
          });
          if(errorCheck1>0){
            alert('메뉴명을 입력해주세요.');
            return;
          }
          if(errorCheck2>0){
            alert('객체명을 입력해주세요.');
            return;
          }
          showConfirm({
            msg: '작성하신 메뉴정보를 저장하시겠습니까?',
            title:'확인',
            callback: function () {
              Ext.each(params, function (itm) {
                promiseList.push(new Ext.Promise(function (res) {
                  Ext.Ajax.request({
                      url: `${API_URL}/Menu/Save`,
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
          {third_grid} = this.refs,
          grid = third_grid.down('grid'),
          store = grid.getStore(),
          selection = grid.getSelection(),
          params = [],
          promiseList = [];
          if (Ext.isEmpty(selection)) {
              alert('선택된 정보가 없습니다.');
              return;
          }
          showConfirm({
              msg: '메뉴정보를 정보를 삭제하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.each(selection, function (itm) {
                  if(!(itm.data.menu_no == 0 || itm.data.menu_no == '' || itm.data.menu_no ==  null)){
                    promiseList.push(new Ext.Promise(function (res) {
                      Ext.Ajax.request({
                          url: `${API_URL}/Menu/Delete/`+itm.data.menu_no,
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
  onBeforeItemContextMenu = (view, rec, node, idx, eOpt) => {
    const {third_grid} = this.refs,
          grid = third_grid.down('grid');
          eOpt.stopEvent();
          grid.contextMenu.hasGrid = grid;
          grid.contextMenu.initialColumns = Ext.clone(grid.columnManager.getColumns());
          grid.contextMenu.showAt(eOpt.getXY());
  }
  onRowClick = (view, rec, node, rowIdx, eOpt, e) =>{
    const {third_grid} = this.refs,
          grid = third_grid.down('grid'),
          selection = grid.getSelection();

          if(selection.length == 1){
            console.log(rec.data);
          }
  }
  rendererUse = (v, ctx, rowRec, rowIdx, cellIdx, store, view) => {
      var recordIndex = this.grid_useyn_store.findExact('type_code', v);
      if (recordIndex === -1) {
        return '';
      }
      return this.grid_useyn_store.getAt(recordIndex).get('type_data');
  }
  render(){
    const { pagingtoolbar, result, isOpen } = this.state;
    return(
      <Panel
        layout={'fit'}
        ref={'third_grid'}
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
          stateId:'master-menu-second-view',
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
             rowclick : this.onRowClick,
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
            }
          ],
          columns:[
            {
                text: '일련번호',
                dataIndex: 'menu_no',
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
                  text: '<font color=red>*</font><font color=blue>메뉴명</font>',
                  dataIndex: 'menu_name',
                  type: 'TEXT',
                  width: 160,
                  isExcel: true,
                  align: 'left',
                  style:'text-align:center',
                  required: true,
                  editor: {
                       allowBlank: true
                  },
                  renderer: function(value, metaData, record) {
                    var deviceDetail = record.get('menu_name');
                    metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                    return value;
                  },
                  filter: {
                      type: 'string'
                  }
              },
              {
                   text: '<font color=red>*</font><font color=blue>객체명</font>',
                   dataIndex: 'component',
                   type: 'TEXT',
                   width: 160,
                   isExcel: true,
                   align: 'left',
                   style:'text-align:center',
                   editor: {
                        allowBlank: true
                   },
                   renderer: function(value, metaData, record) {
                     var deviceDetail = record.get('component');
                     metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                     return value;
                   },
                   filter: {
                     type: 'string'
                   }
              },
              {
                   text: '<font color=blue>메뉴아이콘</font>',
                   dataIndex: 'icon',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'left',
                   style:'text-align:center',
                   editor: {
                        allowBlank: true
                   },
                   renderer: function(value, metaData, record) {
                     var deviceDetail = record.get('icon');
                     metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                     return value;
                   },
                   filter: {
                     type: 'string'
                   }
              },
              {
                   text: '<font color=blue>메뉴경로</font>',
                   dataIndex: 'path',
                   type: 'TEXT',
                   width: 160,
                   isExcel: true,
                   align: 'left',
                   style:'text-align:center',
                   editor: {
                        allowBlank: true
                   },
                   renderer: function(value, metaData, record) {
                     var deviceDetail = record.get('path');
                     metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                     return value;
                   },
                   filter: {
                     type: 'string'
                   }
              },
              {
                   text: '<font color=blue>정렬</font>',
                   dataIndex: 'output_order',
                   type: 'NUMBER',
                   width: 100,
                   isExcel: true,
                   editable: true,
                   align: 'right',
                   style:'text-align:center',
                   editor: {
                       xtype: 'numberfield'
                   }
               },
               {
                   text: '<font color=blue>사용여부</font>',
                   dataIndex: 'use_yn',
                   type: 'COMBO',
                   width: 100,
                   isExcel: true,
                   align: 'center',
                   value: 'Y',
                   style:'text-align:center',
                   editor: {
                        xtype: 'combobox',
                        emptyText: '선택',
                        displayField: 'type_data',
                        valueField: 'type_code',
                        queryMode: 'local',
                        typeAhead: false,
                        editable: true,
                        enableKeyEvents: true,
                        forceSelection: false,
                        triggerAction: 'all',
                        selectOnFocus: false,
                        store:this.grid_useyn_store
                   },
                   renderer: this.rendererUse
               },
              {
                   text: '<font color=blue>외부변수1</font>',
                   dataIndex: 'option1',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'left',
                   style:'text-align:center',
                   editor: {
                        allowBlank: true
                   },
                   renderer: function(value, metaData, record) {
                     var deviceDetail = record.get('option1');
                     metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                     return value;
                   },
                   filter: {
                     type: 'string'
                   }
              },
              {
                   text: '<font color=blue>외부변수2</font>',
                   dataIndex: 'option2',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'left',
                   style:'text-align:center',
                   editor: {
                        allowBlank: true
                   },
                   renderer: function(value, metaData, record) {
                     var deviceDetail = record.get('option2');
                     metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                     return value;
                   },
                   filter: {
                     type: 'string'
                   }
              },
              {
                   text: '<font color=blue>외부변수3</font>',
                   dataIndex: 'option3',
                   type: 'TEXT',
                   width: 100,
                   isExcel: true,
                   align: 'left',
                   style:'text-align:center',
                   editor: {
                        allowBlank: true
                   },
                   renderer: function(value, metaData, record) {
                     var deviceDetail = record.get('option3');
                     metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                     return value;
                   },
                   filter: {
                     type: 'string'
                   }
              },
              {
                 text: '<font color=blue>비고</font>',
                 style: 'text-align:center;',
                 dataIndex: 'remark',
                 type: 'TEXT',
                 editable: true,
                 width: 200,
                 required: false,
                 isExcel: true,
                 editor: {
                     allowBlank: true
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
                 //type: 'DATE',
                 //dateFormat: 'Y-m-d H:i:s',
                 type:'TEXT',
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
                 //type: 'DATE',
                 //dateFormat: 'Y-m-d H:i:s',
                 type:'TEXT',
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
              xtype: 'pagingtoolbar',
              dock: 'bottom',
              store:this.store,
              displayInfo: true,
              hidden:!pagingtoolbar
            }
          ]
        }]}>

      </Panel>
    )
  }
}

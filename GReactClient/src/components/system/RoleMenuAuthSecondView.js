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
export default class RoleMenuAuthSecondView extends Component {
  constructor(props) {
      super(props);
  }
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  onAutoProcessMenu = (result) => {
    const me = this,
          {second_grid} = this.refs,
          grid = second_grid.down('treepanel'),
          store = grid.getStore();
          this.setState({result:result});
    if(result != null){
      const params = Ext.apply({}, {role_no:result.data.role_no});
      store.getProxy().setExtraParams({condition:JSON.stringify(params)});
      store.currentPage = 1;
      store.load({
          params:{condition:JSON.stringify(params)},
          callback: function (recs, operation, success) {
            //console.log(recs);
            second_grid.down('treepanel').expandAll();
            const res = operation.getResponse();
            if(res!=null){
              const ret = Ext.decode(res.responseText),
                    //totalCount = ret.count,
                    totalCount = ret.data.length,
                    counter = second_grid.down('toolbar [code=counter]');
                    counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
                    if(totalCount<pageSize){
                      me.setState({pagingtoolbar:true});
                    }
                    else{
                      me.setState({pagingtoolbar:false});
                    }
              }
          }
      });
    }
  }
  componentWillMount(){
  }
  componentDidMount(){
  }
  onClickSave = (item) => {
    const me = this,
          {result} = this.state,
          {second_grid} = this.refs,
          grid = second_grid.down('treepanel'),
          store = grid.getStore(),
          process_store = store.getModifiedRecords(),
          rowlength = store.getCount(),
          saveCount=0,
          itemList = [];
          console.log('aaa');
    if(rowlength == 0){
      alert('저장할 데이터가 없습니다.');
      return;
    }
    else{
      // Ext.each(process_store, function (itm) {
      //   if(itm.phantom == true || itm.dirty == true){
      //     itm.data.role_no = result.data.role_no;
      //     if(itm.data.auth_type == true){
      //       itm.data.auth_type = 'Y';
      //     }
      //     else{
      //       itm.data.auth_type = 'N';
      //     }
      //     itemList.push(itm.data);
      //   }
      // });
      for(var i=0; i<rowlength; i++){
        var item = store.data.items[i].data,
            rec = [];
            if(item.auth_type == true){
              rec ={
                auth_type:'Y',
                menu_no:item.menu_no,
                role_no:result.data.role_no
              };
            }
            else{
              rec = {
                auth_type:'N',
                menu_no:item.menu_no,
                role_no:result.data.role_no
              };
            }
            itemList.push(rec);
      }

      var params = Ext.apply({});
          params.role_no = result.data.role_no;
          params.itemlist = itemList,
          params = paramsPostHandler(params);
      showConfirm({
        msg: '작성하신 메뉴권한정보를 저장하시겠습니까?',
        title:'확인',
        callback: function () {
          Ext.Ajax.request({
              url: `${API_URL}/RoleMenuAuth/Save`,
              method: 'POST',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
              params : params,
              dataType: "json",
              success: function(response, request) {
                alert('정상적으로 저장되었습니다.');
                // const ret = Ext.decode(response.responseText);
                // console.log(ret.newID)
                // console.log(request)
                // showDisplayRefresh(ret.newID);
              },
              failure: function(response, request) {
              }
          });
        }
      });
    }
  }
  render(){
      const { pagingtoolbar, result, isOpen } = this.state;
      return(
        <Panel
          layout={'fit'}
          ref={'second_grid'}
          reference={'second_grid'}
          items={[{
            xtype:'treepanel',
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
            stateId:'master-role-menu-auth-second-view',
            stateful:false,
            columnLines: true,
            enableLocking: true,
            multiColumnSort: true,
            useArrows: true,
            rootVisible: false,
            multiSelect: true,
            singleExpand: false,
            // selModel: {
            //     type: 'checkboxmodel'
            // },
            store: Ext.create('Ext.data.TreeStore', {
                fields:[
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
                  { name: 'update_user_no_name', type:'string' },
                  { name: 'role_no', type:'string' },
                  { name: 'auth_type', type:'boolean' }
                ],
                root: {
                },
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
                    url: `${API_URL}/RoleMenuAuth/GetList`,
                    actionMethods: {
                        read: "GET"
                    },
                    extraParams: {
                    },
                    paramsAsJson: true,
                    reader: {
                        type: 'json',
                        transform: function (ret) {
                          var r = ret.data;
                              r.expaned = true;
                          return r;
                          // ret.data.expanded = true;
                          // return ret.data;
                          // return ret.children[0];
                        }
                    }
                }
            }),
            tbar:[{
                xtype:'component',
                code: 'counter',
                html: '<strong>총: 0건</strong>'
              },'->',
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
                    xtype: 'treecolumn'
                    , text: '메뉴명'
                    , exceltitle: '메뉴명'
                    , dataIndex: 'menu_name'
                    , type:'TEXT'
                    , width: 300
                    , locked:true
                    , hidden: false
                    , required:false
                    , editable:false
                    , style: 'text-align:center;'
                    , align:'left'
                    , isExcel: true
                },
                {
                    xtype: 'checkcolumn',
                    required: false,
                    editable: true,
                    isExcel: true,
                    align: 'center',
                    sortable: false,
                    type: 'BOOL',
                    width: 80,
                    text: '접근권한',
                    exceltitle: '접근권한',
                    dataIndex: 'auth_type'
                },
                {
                    text: '메뉴경로'
                    , exceltitle: '메뉴경로'
                    , dataIndex: 'name_path'
                    , type:'TEXT'
                    , width: 300
                    //, flex:1
                    , hidden: false
                    , required:false
                    , editable:false
                    , style: 'text-align:center;'
                    , isExcel: true
                }
            ]
          }]}>

        </Panel>
      )
  }
}

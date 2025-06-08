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
export default class RoleMenuAuthFirstView extends Component {
  constructor(props) {
      super(props);
      this.firstMenuCall = this.firstMenuCall.bind(this);
  }
  firstMenuCall = (result) => {
    this.props.firstMenuCall(result);
  }
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'menu_no', type:'number', defaultValue:0 },
      { name: 'menu_code', type:'string' },
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/Role/GetComboList`,
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
    const me = this,
      {first_grid} = this.refs,
      form = first_grid.down('form'),
      grid = first_grid.down('grid'),
      store = grid.getStore();
      this.store.load({
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
                    counter = first_grid.down('toolbar [code=counter]');
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
  onRowClick = (view, rec, node, rowIdx, eOpt, e) =>{
    const {first_grid} = this.refs,
          grid = first_grid.down('grid'),
          selection = grid.getSelection();
          if(selection.length == 1){
            this.firstMenuCall(rec);
          }
          else{
            this.firstMenuCall(null);
          }
  }
  render(){
    const { pagingtoolbar, result, isOpen } = this.state;
    return(
      <Panel
        layout={'fit'}
        ref={'first_grid'}
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
          stateId:'master-role-menu-auth-first-view',
          resizable: false,
          columnLines: false,
          rowLines: true,
          enableColumnHide: false,
          enableColumnMove: false,
          enableColumnResize: true,
          sealedColumns: false,
          sortableColumns: false,
          trackMouseOver: false,
          scrollable:true,
          // selModel: {
          //     type: 'checkboxmodel'
          // },
          store:this.store,
          listeners : {
             rowclick : this.onRowClick
          },
          tbar:[{
              xtype:'component',
              code: 'counter',
              html: '<strong>총: 0건</strong>'
            }
          ],
          columns:[
            {
                text: '일련번호',
                dataIndex: 'role_no',
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
                  text: '역할명',
                  dataIndex: 'role_name',
                  type: 'TEXT',
                  //width: 160,
                  flex:1,
                  isExcel: true,
                  align: 'left',
                  style:'text-align:center',
                  required: true,
                  renderer: function(value, metaData, record) {
                    var deviceDetail = record.get('role_name');
                    metaData.tdAttr = 'data-qtip="' + deviceDetail + '"';
                    return value;
                  },
                  filter: {
                      type: 'string'
                  }
              }
          ]
        }]}>

      </Panel>
    );
  }
}

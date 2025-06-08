import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Window, TextField, TabPanel, Container, Panel } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';

import { API_URL, CLIENT_ROOT_URL, paramsPostHandler, refreshToken } from '../../actions/index';

export default class CpToSpCorpGroupView extends Component {
  state = {
    Authorization:cookie.load('token'),
    result:[],
    popTitle:'CP사 정산 SP사 설정'
  }
  store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'cp_to_sp_corp_group_no', type:'number' },
      { name: 'cp_corp_detail_no', type:'number' },
      { name: 'sp_corp_no', type:'number' }
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/CpToSpCorpGroup/GetSpCorpList`,
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
  set_store = Ext.create('Ext.data.Store', {
    fields: [
      { name: 'cp_to_sp_corp_group_no', type:'number' },
      { name: 'cp_corp_detail_no', type:'number' },
      { name: 'sp_corp_no', type:'number' }
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/CpToSpCorpGroup/GetList`,
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
      const me = this,
            { result } = this.props;
            this.setState({popTitle:'CP사 <strong><font color=yellow>(' + result.data.cp_corp_detail_name + ')</font></strong> 정산 SP사 설정'});
  }
  componentDidMount(){
    const me = this,
          {result} = this.props,
          params = Ext.apply({}, {cp_corp_detail_no:result.data.cp_corp_detail_no});
          me.mainDataStoreLoad();
          me.mainDataStoreLoad1();
    // me.store.load({
    //     params:{condition:JSON.stringify(params)},
    //     callback: function (recs, operation, success) {

    //     }
    // });
    // me.set_store.load({
    //     params:{condition:JSON.stringify(params)},
    //     callback: function (recs, operation, success) {

    //     }
    // });
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  onClickSearch = (item) =>{
    this.mainDataStoreLoad();
  }
  onSpecialKeySearch1 = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad1();
    }
  }
  onClickSearch1 = (item) =>{
    this.mainDataStoreLoad1();
  }
  mainDataStoreLoad = () => {
      const me = this,
            {result} = this.props,
            {header_grid} = this.refs,
            grid = header_grid.down('#cp_to_spcorp_group_add_grid1'),
            store = grid.getStore(),
            form = grid.down('form'),
            formValue = form.getValues();
            formValue.cp_corp_detail_no = result.data.cp_corp_detail_no;
            
            const params = Ext.apply({}, formValue);
            store.getProxy().setExtraParams({condition:JSON.stringify(params)});
            store.currentPage = 1;
            this.store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {

                }
            });
  }
  mainDataStoreLoad1 = () => {
      const me = this,
            {result} = this.props,
            {header_grid} = this.refs,
            grid = header_grid.down('#cp_to_spcorp_group_add_grid2'),
            store = grid.getStore(),
            form = grid.down('form'),
            formValue = form.getValues();
            formValue.cp_corp_detail_no = result.data.cp_corp_detail_no;

            const params = Ext.apply({}, formValue);
            store.getProxy().setExtraParams({condition:JSON.stringify(params)});
            store.currentPage = 1;
            this.set_store.load({
                params:{condition:JSON.stringify(params)},
                scope: this,
                callback: function (recs, operation, success) {

                }
            });
  }        
  addClick = () => {
    const me = this,
          {header_grid} = this.refs;
    var grid1 = header_grid.down('#cp_to_spcorp_group_add_grid1'),
        grid2 = header_grid.down('#cp_to_spcorp_group_add_grid2'),
        grid_store1 = grid1.getStore(),
        grid_store2 = grid2.getStore(),
        selmodels = grid1.getSelectionModel(),
        rowlength = grid_store1.getCount(),
        selected = selmodels.selected;

        if (selected.length == 0) {
            alert("선택된 정보가 없습니다.");
            return;
        } else {
            for (var i = rowlength - 1; i >= 0; i--) {
                if (selmodels.isSelected(i)) {
                    var data = grid_store1.getAt(i);
                    grid_store2.add(data);
                    grid_store1.remove(grid_store1.getAt(i));
                }
            }
            grid1.getSelectionModel().deselectAll();
        }
  }
  removeClick = () => {
    const me = this,
          {header_grid} = this.refs;
    var grid1 = header_grid.down('#cp_to_spcorp_group_add_grid1'),
        grid2 = header_grid.down('#cp_to_spcorp_group_add_grid2'),
        grid_store1 = grid1.getStore(),
        grid_store2 = grid2.getStore(),
        selmodels = grid2.getSelectionModel(),
        rowlength = grid_store2.getCount(),
        selected = selmodels.selected;
        if (selected.length == 0) {
            alert("선택된 정보가 없습니다.");
            return;
        } else {
            for (var i = rowlength - 1; i >= 0; i--) {
                if (selmodels.isSelected(i)) {
                    var data = grid_store2.getAt(i);
                    grid_store1.add(data);
                    grid_store2.remove(grid_store2.getAt(i));
                }
            }
            grid2.getSelectionModel().deselectAll();
        }
  }
  save = () => {
    const me = this,
          {header_grid} = this.refs,
          {result, onClose} = this.props,
          form = header_grid.down('form'),
          formValues = form.getValues(),
          grid = header_grid.down('#cp_to_spcorp_group_add_grid2'),
          store = grid.getStore(),
          items = [];

          formValues.cp_corp_detail_no = result.data.cp_corp_detail_no;
          if(store.count()>0){
            store.each(function(itm) {
              //console.log(itm);
              items.push({
                  sp_corp_no: itm.get('sp_corp_no'),
                  cp_corp_detail_no: result.data.cp_corp_detail_no
              });
            });
            formValues.cptospList = items;
          }
          else{
            formValues.cptospList = '';
          }
          const params = paramsPostHandler(formValues);
          showConfirm({
              msg: 'CP사에 대한 SP사 정보를 설정하시겠습니까?',
              title:'확인',
              callback: function () {
                Ext.Ajax.request({
                    url: `${API_URL}/CpToSpCorpGroup/Save`,
                    method: 'POST',
                    headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
                    params : params,
                    dataType: "json",
                    success: function(response, request) {
                      alert('정상적으로 저장되었습니다.');
                      const ret = Ext.decode(response.responseText);
                      onClose();
                    },
                    failure: function(response, request) {
                      alert('정상적으로 처리되지 않았습니다. 다시 시도해주세요.');
                    }
                });
              }
          });

  }
  close = () => {
    const { onClose } = this.props;
    onClose();
  }
  render(){
    const me = this,
          { onClose } = this.props,
          { popTitle } = this.state;

    return(
      <Window
        width={880}
        height={580}
        minwidth={300}
        minHeight={300}
        title={popTitle}
        autoShow={true}
        modal={true}
        layout="fit"
        resizable ={true}
        draggable={true}
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
        <Panel
          layout='fit'
          scrollable={false}
          ref={'header_grid'}
          items={[
            {
                xtype: 'form',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                  {
                    xtype:'grid',
                    itemId: 'cp_to_spcorp_group_add_grid1',
                    layout:'fit',
                    title:'SP사 목록',
                    flex:1,
                    margin:'0 5 0 0',
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            sortOnDrop: true,
                            dragGroup: 'firstGridDDGroup',
                            dropGroup: 'threeGridDDGroup'
                        },
                        listeners: {
                            drop: function(node, data, dropRec, dropPosition) {
                                var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('role_no') : ' on empty view';
                            }
                        }
                    },
                    // viewConfig:{
                    //     enableTextSelection:true,
                    //     stripeRows:false,
                    //     //emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                    //     deferEmptyText: false
                    // },
                    plugins:[
                        {
                            ptype: 'cellediting',
                            clicksToEdit: 1
                        },
                        'gridfilters'
                    ],
                    selModel: {
                        type: 'checkboxmodel'
                    },
                    store:this.store,
                    border: false,
                    dockedItems:[
                        {
                            xtype: 'form',
                            dock: 'top',
                            width: '100%',
                            bodyPadding: '10 10 10 10',
                            border: false,
                            bodyStyle: 'background-color:#F1F1F1;;width:100%',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'textfield',
                                    fieldLabel: '검색어',
                                    emptyText: 'SP사명입력',
                                    flex:1,
                                    name: 'searchtxt',
                                    labelAlign: 'right',
                                    labelWidth: 45,
                                    listeners:{
                                        specialkey:this.onSpecialKeySearch
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: '조회',
                                    margin:'0 5 0 5',
                                    handler: this.onClickSearch
                                },
                                {
                                    xtype: 'button',
                                    text: '추가',
                                    handler: this.addClick
                                }
                            ]
                        }
                    ],
                    /*
                    tbar: [
                        {
                            xtype: 'textfield',
                            fieldLabel: '검색어',
                            emptyText: 'SP사명입력',
                            flex:1,
                            name: 'searchtxt',
                            labelAlign: 'right',
                            labelWidth: 55,
                            listeners:{
                                specialkey:this.onSpecialKeySearch
                            }
                        },
                        '->',{
                            xtype: 'button',
                            text: '조회',
                            handler: this.onClickSearch
                        },
                        {
                            xtype: 'button',
                            text: '추가',
                            handler: this.addClick
                        }
                    ],
                    */
                    columns:[{
                        text: 'SP사 번호',
                        sortable: false,
                        dataIndex: 'sp_corp_no',
                        groupable: false,
                        hidden: true
                    }, {
                        text: 'SP사명',
                        sortable: false,
                        //flex: 1,
                        width:360,
                        dataIndex: 'sp_corp_name',
                        groupable: false,
                        align:'left',
                        style:'text-align:center',
                        hidden: false
                    }
                    ]
                  },
                  {
                    xtype:'grid',
                    itemId: 'cp_to_spcorp_group_add_grid2',
                    layout:'fit',
                    title:'적용된 SP사 목록',
                    flex:1,
                    margin:'0 0 0 5',
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            sortOnDrop: true,
                            dragGroup: 'threeGridDDGroup',
                            dropGroup: 'firstGridDDGroup'
                        },
                        listeners: {
                            drop: function(node, data, dropRec, dropPosition) {
                                var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('role_no') : ' on empty view';
                            }
                        }
                    },
                    // viewConfig:{
                    //     enableTextSelection:true,
                    //     stripeRows:false,
                    //     //emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                    //     deferEmptyText: false
                    // },
                    plugins:[
                        {
                            ptype: 'cellediting',
                            clicksToEdit: 1
                        },
                        'gridfilters'
                    ],
                    selModel: {
                        type: 'checkboxmodel'
                    },
                    store:this.set_store,
                    border: false,
                    /*
                    tbar: [
                        '->', {
                            xtype: 'button',
                            text: '삭제',
                            handler: this.removeClick
                        }
                    ],
                    */
                    dockedItems:[
                        {
                            xtype: 'form',
                            dock: 'top',
                            width: '100%',
                            bodyPadding: '10 10 10 10',
                            border: false,
                            bodyStyle: 'background-color:#F1F1F1;;width:100%',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'textfield',
                                    fieldLabel: '검색어',
                                    emptyText: 'SP사명입력',
                                    flex:1,
                                    name: 'searchtxt',
                                    labelAlign: 'right',
                                    labelWidth: 45,
                                    listeners:{
                                        specialkey:this.onSpecialKeySearch1
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: '조회',
                                    margin:'0 5 0 5',
                                    handler: this.onClickSearch1
                                },
                                {
                                    xtype: 'button',
                                    text: '삭제',
                                    handler: this.removeClick
                                }
                            ]
                        }
                    ],
                    columns:[{
                        text: 'SP사 번호',
                        sortable: false,
                        dataIndex: 'sp_corp_no',
                        groupable: false,
                        hidden: true
                    }, {
                        text: 'SP사명',
                        sortable: false,
                        //flex: 1,
                        width:360,
                        dataIndex: 'sp_corp_name',
                        align:'left',
                        style:'text-align:center',
                        groupable: false,
                        hidden: false
                    }
                    ]
                  }
                ]
              }
          ]}/>
        </Window>
      );
  }
}

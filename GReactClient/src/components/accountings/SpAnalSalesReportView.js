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

export default class SpAnalSalesReportView extends Component {
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true,
    searchtxt:''
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
        url: `${API_URL}/AccountingSummary/GetAnalSalesReport`,
        timeout: 900000,
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
  search_year_list_store = Ext.create('Ext.data.Store', {
          fields: [
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/AccountingSummary/GetYearList`,
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
  sp_corp_detail_store = Ext.create('Ext.data.Store', {
          fields: [
            { name: 'sp_copr_detail_no', type:'number' },
            { name: 'sp_copr_detail_no_name', type:'string' },
            { name: 'use_yn', type:'string' }
          ],
          pageSize: null,
          remoteSort : true,
          proxy: {
              type: 'ajax',
              method: 'GET',
              headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
              url: `${API_URL}/SpCorpDetail/GetComboList`,
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
  /*판권구분*/
  sp_sales_kind_store = Ext.create('Ext.data.Store', {
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
        url: `${API_URL}/Movie/GetComboList`,
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
          params1 = Ext.apply({}, {type_name:'SALES_KIND'});
    Ext.Promise.all([
      new Ext.Promise(function (res) {
        me.search_year_list_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.sp_sales_kind_store.load({
            params:{condition:JSON.stringify(params1)},
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.search_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
      new Ext.Promise(function (res) {
        me.sp_corp_detail_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      })
    ]).then(function () {
      me.sp_sales_kind_store.insert(0, {type_code:null, type_data:'선택'});
      me.search_movie_store.insert(0, {movie_no:null, movie_name:'선택'});
      me.sp_corp_detail_store.insert(0, {sp_corp_detail_no:null, sp_corp_detail_name:'선택'});
      //me.mainDataStoreLoad();
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
                    me.onReconfigure(res);
            }
          }
        }
    });
  }
  showTagDetailWindow = (view, rowIdx, colIdx, actionItem, e, rec) => {
    view.getSelectionModel().deselectAll();
    view.getSelectionModel().select(rowIdx, true);
    this.setState({isOpen:false, result:rec});
    console.log("dfda");
  }
  onReconfigure = (res) => {
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      form = header_grid.down('form'),
      formValue = form.getValues(),
      store = grid.getStore(),
      this_year = Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'Y'),
      this_month = Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'm');
      //store.removeAll();
      var model = [],
          ret = Ext.decode(res.responseText);
    if(ret.count>0){
      model.push(
        {
          text: '영화명',
          dataIndex: 'movie_name',
          type: 'TEXT',
          width: 230,
          isExcel: true,
          sortable:true,
          align: 'left',
          style:'text-align:center'
        },
        {
          text: '판권구분',
          dataIndex: 'sales_kind_name',
          type: 'TEXT',
          width: 200,
          isExcel: true,
          sortable:true,
          align: 'left',
          style:'text-align:center'
        },
        {
          text: '판권',
          dataIndex: 'sp_corp_detail_name',
          type: 'TEXT',
          width: 200,
          isExcel: true,
          sortable:true,
          align: 'left',
          style:'text-align:center'
        },
        {
          text: '서비스개시일',
          dataIndex: 'service_open_date',
          type: 'TEXT',
          width: 100,
          isExcel: true,
          sortable:true,
          align: 'left',
          style:'text-align:center'
        }
      );
      // model.push(
      //   {
      //     text: '서비스개시일',
      //     dataIndex: 'service_open_date',
      //     type: 'TEXT',
      //     width: 120,
      //     isExcel: true,
      //     sortable:true,
      //     align: 'center',
      //     style:'text-align:center'
      //   }
      // );
      model.push(
        {
          text: '당해-3년<br>매출액',
          exceltitle:'당해-3년 매출액',
          dataIndex: 'under_3',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );
      model.push(
        {
          text: '당해-2년<br>매출액',
          exceltitle:'당해-3년 매출액',
          dataIndex: 'under_2',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );
      model.push(
        {
          text: '당해-1년<br>누적금액',
          exceltitle:'당해-1년 누적금액',
          dataIndex: 'under_1',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );

      for(var i=1; i<=12; i++){
        if(parseInt(this_year) == parseInt(formValue.st_date)){
          if(i<=parseInt(this_month)){
            model.push(
              {
                text: i + '월',
                dataIndex: 'col_'+i,
                type: 'TEXT',
                width: 80,
                isExcel: false,
                sortable:true,
                hidden:true,
                align: 'right',
                style:'text-align:center',
                renderer: function(value, metaData, record) {
                  return Ext.util.Format.number(value, '0,000');
                }
              }
            );
          }
        }
        else{
          model.push(
            {
              text: i + '월',
              dataIndex: 'col_'+i,
              type: 'TEXT',
              width: 80,
              isExcel: false,
              sortable:true,
              hidden:true,
              align: 'right',
              style:'text-align:center',
              renderer: function(value, metaData, record) {
                return Ext.util.Format.number(value, '0,000');
              }
            }
          );
        }
      }
      model.push(
        {
          text: '당해년도<br>누적금액',
          exceltitle:'당해년도 누적금액',
          dataIndex: 'sub_tot_sum',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          }
        }
      );
      model.push(
        {
          text: '총 누적금액',
          exceltitle:'총 누적금액',
          dataIndex: 'total_sum',
          type: 'TEXT',
          width: 140,
          isExcel: true,
          sortable:true,
          align: 'right',
          style:'text-align:center',
          renderer: function(value, metaData, record) {
            return Ext.util.Format.number(value, '0,000');
          },
          summaryType: 'sum',
          summaryRenderer : function(value, summaryData, dataIndex) {
              return Ext.util.Format.number(parseInt(value), '0,000.00');
          }
        }
      );
      // model.push(
      //   {
      //     text: '점유율',
      //     exceltitle:'점유율',
      //     dataIndex: 'total_sum1',
      //     type: 'TEXT',
      //     width: 140,
      //     isExcel: true,
      //     sortable:true,
      //     align: 'right',
      //     style:'text-align:center',
      //     renderer: function(value, metaData, record) {
      //       return Ext.util.Format.number(value, '0,000');
      //     }
      //   }
      // );
      // model.push(
      //   {
      //     text: '증감율',
      //     exceltitle:'증감율',
      //     dataIndex: 'total_sum2',
      //     type: 'TEXT',
      //     width: 140,
      //     isExcel: true,
      //     sortable:true,
      //     align: 'right',
      //     style:'text-align:center',
      //     renderer: function(value, metaData, record) {
      //       return Ext.util.Format.number(value, '0,000');
      //     }
      //   }
      // );
      grid.reconfigure(store, model);
      grid.getView().refresh(true);
    }
  }
  onClickSearch = (item) => {
    const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
          console.log(formValues);

          if((formValues.movie_no == null || formValues.movie_no == '0' || formValues.movie_no == '')){
            alert('1개 이상의 영화명을 검색조건으로 설정하세요.');
            return;
         }
     
    this.mainDataStoreLoad();
  }
  onClickExcelDownload = (item) =>{
    const me = this,
      {header_grid} = this.refs,
      grid = header_grid.down('grid'),
      ExcelName = '매출분석',
      url = 'GetSpAnalSalesReportExcelDownload'; //GetCorpSalesReportExcelDownload

      ExcelDownload(grid, ExcelName,url);
  }
  onSpecialKeySearch = (itfield, events) => {
    if (events.getKey() == Ext.EventObject.ENTER) {
      this.mainDataStoreLoad();
    }
  }
  render(){
    const { pagingtoolbar, result, isOpen } = this.state;
    return(
      <Panel layout="fit">
        {/*영화tag관리 팝업*/}
        { isOpen && (
            <SubTrendFirst
              result={result}
              onClose={() => this.setState({ result: null, isOpen:false })}/>
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
               deferEmptyText: false,
               getRowClass: function(record, index) {
                 console.log('getRowClass')
                  var c = record.get('depth');
                  if (c == 2) {
                      return 'grid-sum-node';
                  } else if (c == 3 || c==9) {
                      return 'grid-sum-node';
                  }
              }
           },
           plugins:[
               {
                   ptype: 'cellediting',
                   clicksToEdit: 1
               },
               'gridfilters'
           ],
            stateId:'master-common-code-view',
            stateful:false,
            enableLocking:false,
            multiColumnSort:false,
            lockable:false,
            columnLines: false,
            rowLines: true,
            enableColumnHide: false,
            enableColumnMove: false,
            enableColumnResize: true,
            sortableColumns: false,
            trackMouseOver: false,
            bodyStyle: "border-top:1 solid #eeeeee",
            style: "border-top:1 solid #eeeeee",
          //  selModel: {
          //      type: 'checkboxmodel'
          //  },
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
                           xtype:'hiddenfield',
                           name:'report_type',
                           value:'movie_sale_report'
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: '정산연도',
                             flex:1,
                             name: 'st_date',
                             displayField: 'c_year',
                             valueField: 'c_year',
                             hidden: false,
                             queryMode: 'local',
                             typeAhead: false,
                             emptyText: '선택',
                             editable: true,
                             forceSelection: false,
                             triggerAction: 'all',
                             selectOnFocus: true,
                             enableKeyEvents: true,
                             value: Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'Y'),
                             store:this.search_year_list_store
                         },
                         {
                          xtype: 'combo',
                          fieldLabel: '영화명',
                          flex:3,
                          name: 'movie_no',
                          displayField: 'movie_name',
                          valueField: 'movie_no',
                          hidden: false,
                          queryMode: 'local',
                          width:450,
                          typeAhead: false,
                          emptyText: '선택',
                          editable: true,
                          forceSelection: false,
                          multiSelect: true,
                          triggerAction: 'all',
                          selectOnFocus: true,
                          enableKeyEvents: true,
                          store:this.search_movie_store
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: '업체명',
                             flex:2,
                             name: 'sp_corp_detail_no',
                             displayField: 'sp_corp_detail_name',
                             valueField: 'sp_corp_detail_no',
                             hidden: false,
                             queryMode: 'local',
                             typeAhead: false,
                             emptyText: '선택',
                             editable: true,
                             forceSelection: false,
                             triggerAction: 'all',
                             selectOnFocus: true,
                             enableKeyEvents: true,
                             store:this.sp_corp_detail_store
                         },
                         {
                             xtype: 'combo',
                             fieldLabel: '구분',
                             flex:2,
                             name: 'sales_kind',
                             displayField: 'type_data',
                             valueField: 'type_code',
                             multiSelect: true,
                             hidden: false,
                             queryMode: 'local',
                             typeAhead: false,
                             emptyText: '선택',
                             editable: true,
                             forceSelection: false,
                             triggerAction: 'all',
                             selectOnFocus: true,
                             enableKeyEvents: true,
                             store:this.sp_sales_kind_store
                         }

                       ]
                     }
                   ]
               }
             ]
         }]}/>

         </Panel>
    )

  }
}

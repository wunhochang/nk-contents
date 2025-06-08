import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';

import { Window, Panel, Grid, Toolbar, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, prevMonth, ExcelDownload} from '../../utils/Util';
import {Line, Bar, Pie, HorizontalBar} from 'react-chartjs-2';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
const initialState = {
    labels: [],
    datasets: [
          {
            label: '영화순위',
            borderWidth: 0,
          	backgroundColor: [
          		'#FF6384',
          		'#36A2EB',
          		'#FFCE56',
              '#FF6384',
          		'#36A2EB',
          		'#FFCE56',
              '#FF6384',
          		'#36A2EB',
          		'#FFCE56',
              '#FF6384'
        		],
        		hoverBackgroundColor: [
          		'#FF6384',
          		'#36A2EB',
          		'#FFCE56',
              '#FF6384',
          		'#36A2EB',
          		'#FFCE56',
              '#FF6384',
          		'#36A2EB',
          		'#FFCE56',
              '#FF6384'
        		],
            data: [65, 59, 80, 81, 56, 55, 40]
          }
    ]
};

export default class SubMainFirst extends Component {
    state = {
      Authorization:cookie.load('token'),
      topMovieList:[]
    }
    movie_top_store = Ext.create('Ext.data.Store', {
      fields: [
      ],
      pageSize: null,
      remoteSort : false,
      proxy: {
          type: 'ajax',
          method: 'GET',
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
          url: `${API_URL}/AccountingSummary/GetMovieTopList`,
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
          listeners: {
            exception: function(proxy, response, options){
            }
          }
      }
    });
    componentWillMount(){
      this.setState(initialState);
    }
    componentDidMount(){
      this.mainDataStoreLoad();
    }
    onClickSearch = (item) => {
      this.mainDataStoreLoad();
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
        store.load({
            params:{condition:JSON.stringify(params)},
            scope: this,
            callback: function (recs, operation, success) {
              me.setMovieTop();
            }
        });
    }
    onClickExcelDownload = (item) =>{
      const me = this,
        {header_grid} = this.refs,
        grid = header_grid.down('grid'),
        ExcelName = '영화별랭킹',
        url = 'GetMovieTopListExcelDownload';
        ExcelDownload(grid, ExcelName,url);
    }
    setMovieTop = () => {
    		var _this = this;
      	var oldDataSet = _this.state.datasets[0];
        var item_list = [];
        var newData = [];
        var newLabelData = [];
      	var newDataSet = {
  				...oldDataSet
  			};
        if(this.movie_top_store.count()>0){
          Ext.each(this.movie_top_store.data.items, function (itm) {
            newLabelData.push(itm.data.movie_name);
            newData.push(itm.data.accounting_price);
            item_list.push(itm.data);
          });
          _this.setState({topMovieList:item_list});
          newDataSet.data = newData;
          var newState = {
          	...initialState,
            labels: newLabelData,
          	datasets: [newDataSet]
          };
          _this.setState(newState);
        }
    }
    render(){
        const {topMovieList} = this.state;
        return(
          <Panel
            layout={'hbox'}
            scrollable={false}
            bodyPadding={7}
            width={'100%'}
            border={false}>
                <Panel
                  layout={[{
                      type: 'vbox',
                      align: 'stretch'
                  }]}
                  width={'50%'}
                >
                  <Panel
                    ref={'header_grid'}
                    layout={'fit'}
                    items={[
                      {
                          xtype:'grid',
                          layout:'fit',
                          height:430,
                          viewConfig:{
                              enableTextSelection:true,
                              stripeRows:false,
                              emptyText: '<div style="text-align:center;width:100%">데이터가 없습니다.</div>',
                              deferEmptyText: false
                          },
                          store:this.movie_top_store,
                          dockedItems:[
                            {
                                xtype: 'form',
                                dock: 'top',
                                width: '100%',
                                bodyPadding: '10 10 10 10',
                                border: false,
                                bodyStyle: 'background-color:#FFFFFF;width:100%',
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                  {
                                      xtype: 'label',
                                      cls: 'mylabel',
                                      padding:'7 2 0 0',
                                      width:35,
                                      style:'text-align:right',
                                      text: '기간:'
                                  },
                                  {
                                    xtype:'monthfield',
                                    name: 'st_date',
                                    width:60,
                                    format: 'Y-m',
                                    padding:'0 5 0 0',
                                    value: prevMonth(parseInt(Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'm')))
                                  },
                                  {
                                      xtype: 'label',
                                      cls: 'mylabel',
                                      padding:'7 2 0 2',
                                      text: '~'
                                  },
                                  {
                                    xtype:'monthfield',
                                    name: 'end_date',
                                    width:60,
                                    format: 'Y-m',
                                    padding:'0 5 0 0',
                                    value: prevMonth(parseInt(Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'm')))
                                  },
                                  {
                                      xtype: 'component',
                                      flex:1
                                  },
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
                                    margin:'0 0 0 5',
                                    style: {
                                        'font-size': '14px',
                                        'background-color':'#4783AE',
                                        'border-color':'#4783AE',
                                        'padding':'5px 7px 4px 7px',
                                        'text-decoration': 'none',
                                        'border-radius': '4px 4px 4px 4px'
                                    },
                                    handler:this.onClickExcelDownload
                                  }
                                ]
                            }
                          ],
                          columns:[
                            {
                              text: '영화명',
                              dataIndex: 'movie_name',
                              type: 'TEXT',
                              flex:1,
                              isExcel: true,
                              align: 'left',
                              style:'text-align:center'
                            },
                            {
                              text: '매출액',
                              dataIndex: 'accounting_price',
                              type: 'TEXT',
                              width: 150,
                              isExcel: true,
                              align: 'right',
                              style:'text-align:center',
                              renderer: function(value, metaData, record) {
                                return Ext.util.Format.number(value, '0,000');
                              }
                            }
                          ]
                      }
                    ]}
                  >
                  </Panel>
                </Panel>
                <Panel
                  layout={'vbox'}
                  padding={'0 0 0 20'}
                  width={'50%'}>
                  <HorizontalBar
                      height={300}
                      width={550}
                      ref={'chartLine'}
                      data={this.state}/>
                </Panel>
            </Panel>
        )
    }
}

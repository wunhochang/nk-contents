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
            label: '영화순위1',
            borderWidth: 1,
            fill: false,
            data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
            label: '영화순위2',
            borderWidth: 1,
            fill: false,
            data: [65, 59, 80, 81, 56, 55, 40]
          }
    ]
};

var title='';

export default class SubTrendSecond extends Component {
    state = {
      Authorization:cookie.load('token'),
      salesKindList:[]
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
          url: `${API_URL}/AccountingSummary/GetTrendListSecond`,
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
    set_movie_store = Ext.create('Ext.data.Store', {
      fields: [
        { name: 'movie_no', type:'number' },
        { name: 'movie_code', type:'string' },
        { name: 'movie_rename', type:'string' }
      ],
      pageSize: null,
      remoteSort : false,
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
      this.setState(initialState);
    }
    componentDidMount(){
      const me = this;
    Ext.Promise.all([
       new Ext.Promise(function (res) {
         me.search_year_list_store.load({
             callback: function (recs, operation, success) {
               res();
             }
         });
       }),
      new Ext.Promise(function (res) {
        me.set_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
    ]).then(function () {
      //me.sp_sales_kind_store.insert(0, {type_code:null, type_data:'선택'});
      me.set_movie_store.insert(0, {movie_no:null, movie_rename:'선택'});
      //me.sp_corp_detail_store.insert(0, {sp_corp_detail_no:null, sp_corp_detail_name:'선택'});
      //me.mainDataStoreLoad();
    });
      //this.mainDataStoreLoad();
    }
    onClickSearch = (item) => {
      //destroyChart();
      const me = this,
          {result, showDisplayRefresh} = this.props,
          {reqform} = this.refs,
          {header_grid} = this.refs,
          form = header_grid.down('form'),
          formValues = form.getValues();
         // console.log(formValues);

          if((formValues.movie_no == null || formValues.movie_no == '0' || formValues.movie_no == '')){
            alert('영화명을 선택하세요.');
            return;
         }
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


       // console.log(params);
        store.getProxy().setExtraParams({condition:JSON.stringify(params)});
        store.currentPage = 1;
        store.load({
            params:{condition:JSON.stringify(params)},
            scope: this,
            callback: function (recs, operation, success) {
              me.setShareTrend();
            }
        });
    }
    

    onClickExcelDownload = (item) =>{
        const me = this,
        {header_grid} = this.refs,
        form = header_grid.down('form'),
        grid = header_grid.down('grid'),
        formValue = form.getValues(),

        ExcelName = '['+formValue.movie_rename+']_점유율',
        url = 'GetTrendListSecondExcelDownload';//'GetMovieTopListExcelDownload';
        ExcelDownload(grid, ExcelName,url);

    }

    // getDataset = (index, data) =>{ 
    //   return { 
    //   label: 'Label '+ index, 
    //   fillColor: 'rgba(220,220,220,0.2)', 
    //   strokeColor: 'rgba(220,220,220,1)', 
    //   pointColor: 'rgba(220,220,220,1)', 
    //   pointStrokeColor: '#fff', 
    //   pointHighlightFill: '#fff', 
    //   pointHighlightStroke: 'rgba(220,220,220,1)', 
    //   data: data 
    //   }; 
    //   }

    setShareTrend = () => {
        const me = this,
        {header_grid} = this.refs,
        form = header_grid.down('form'),
        grid = header_grid.down('grid'),
        store = grid.getStore(),
        formValue = form.getValues();


        title= '['+formValue.movie_rename+']';


        var _this = this;
      	var oldDataSet = _this.state.datasets[0];

        var colors2 = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"];
        var item_list = [];
        var newData = [];
        var newLabelData = [];
      	var newDataSet = {
  				...oldDataSet
  			};
        if(this.movie_top_store.count()>0){
          Ext.each(this.movie_top_store.data.items, function (itm) {
            newLabelData.push(itm.data.sales_kind_name);
            newData.push(itm.data.percentage);
            item_list.push(itm.data);
          });
          _this.setState({topCorpDetailList:item_list});
          newDataSet.data = newData;


          var newState = {
            ...initialState,
          labels: newLabelData,
          datasets: [{
            label: newLabelData,
            data: newData,
            backgroundColor: colors2,
            showTooltips: true,
            borderWidth: 0
          }] 
        };

          
          _this.setState(newState);
        }else{
            alert("데이터가 없습니다.");
            return;
        }
    }
    render(){
        const {salesKindList} = this.state;
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
                  width={'100%'}
                > 
                  <Panel
                    ref={'header_grid'}
                    layout={'fit'}
                    items={[
                      {
                          xtype:'grid',
                          layout:'fit',
                          height:50,
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
                                    xtype: 'combo',
                                    flex:1,
                                    name: 'st_date',
                                    displayField: 'c_year',
                                    valueField: 'c_year',
                                    hidden: true,
                                    queryMode: 'local',
                                    typeAhead: false,
                                    emptyText: '선택',
                                    editable: true,
                                    forceSelection: false,
                                    triggerAction: 'all',
                                    selectOnFocus: true,
                                    enableKeyEvents: true,
                                    value: Ext.util.Format.date(new Date((new Date()).getTime() - 1700 * 24 * 60 * 60 * 1000), 'Y'),
                                    store:this.search_year_list_store
                                  },
                                  {
                                    xtype: 'combo',
                                    flex:1,
                                    name: 'dt_date',
                                    displayField: 'c_year',
                                    valueField: 'c_year',
                                    hidden: true,
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
                                    xtype: 'label',
                                    cls: 'mylabel',
                                    padding:'7 2 0 2',
                                    text: '영화명'
                                  },
                                  {
                                    xtype: 'combo',
                                    flex:4,
                                    name: 'movie_no',
                                    displayField: 'movie_rename',
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
                                    store:this.set_movie_store,
                                    listeners: {
                                      change: function(){
                                          //console.log('change value' , 'The selected value id is '+this.getDisplayValue())   
                                          var form= this.up().getForm();
                                          form.findField('movie_rename').setValue(this.getDisplayValue());

                                      }
                                    }
                                  },
                                  {
                                    xtype: 'hiddenfield',
                                    fieldLabel: 'CP사숨김',
                                    name: 'movie_rename',
                                    id: 'movie_rename',
                                    allowBlank: true,
                                    width:200,
                                    flex:1,
                                    enableKeyEvents:true
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
                                    hidden:false,
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
                                text: '영화구분',
                                dataIndex: 'movie_name',
                                type: 'TEXT',
                                flex:1,
                                isExcel: true,
                                hidden:true,
                                align: 'left',
                                style:'text-align:center'
                            },
                            {
                              text: '판권구분',
                              dataIndex: 'sales_kind_name1',
                              type: 'TEXT',
                              flex:1,
                              isExcel: true,
                              hidden:true,
                              align: 'left',
                              style:'text-align:center'
                            },
                            {
                              text: '점유율',
                              dataIndex: 'percentage',
                              type: 'TEXT',
                              width: 150,
                              isExcel: true,
                              hidden:true,
                              align: 'right',
                              style:'text-align:center',
                              renderer: function(value, metaData, record) {
                                return Ext.util.Format.number(value, '0,000.00');
                              }
                            }
                          ]
                      }
                    ]}
                  >
                  </Panel>
                  <Panel
                  layout={'vbox'}
                  padding={'0 0 0 20'}
                  width={'100%'}>
                  <Pie
                      height={650}
                      width={1250}
                      ref={'chartLine'}
                      options={{
                        maintainAspectRatio: false,
                        responsive: false,
                        fill : false,
                        legend:{
                          display:true,
                          position:'right'
                        },
                        title:{
                          display:true,
                          text: JSON.stringify(title, null, 2).replace(/\"/gi, "")+' 판권구분별 점유율',
                          fontSize:20
                        },
                        tooltips: {
                          enabled: true,
                          title: {
                            display: true,
                          },
                          mode: "single",
                          callbacks: {
                            label: function (tooltipItem, data) {
                              const tooltipValue = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                              //console.log('tooltipValue : ', tooltipValue)
                              return tooltipValue+'%';//parseInt(tooltipValue, 10).toLocaleString();
                            },
                            title: function(tooltipItem, data) {

                                return data.labels[tooltipItem[0].index];//data.labels[tooltipItem[0].index].split('[', 1);
                            }
                          }
                        },
                        showAllTooltips: true,
                        hover: {
                            animationDuration: 0
                          },
                          animation: {
                            duration: 0,
                            onComplete: function () {
                              var self = this,
                                  chartInstance = this.chart,
                                  ctx = chartInstance.ctx;
                          
                              ctx.font = '12px Arial';
                              ctx.textAlign = "center";
                              ctx.fillStyle = "#ffffff";
                          
                              Chart.helpers.each(self.data.datasets.forEach(function (dataset, datasetIndex) {
                                  var meta = self.getDatasetMeta(datasetIndex),
                                      total = 0, //total values to compute fraction
                                      labelxy = [],
                                      labelname = [],
                                      offset = Math.PI / 2, //start sector from top
                                      radius,
                                      centerx,
                                      centery, 
                                      lastend = 0; //prev arc's end line: starting with 0
                          
                                  for (var val of dataset.data) { total += val; } 
                          
                                  Chart.helpers.each(meta.data.forEach( function (element, index) {
                                      radius = 0.9 * element._model.outerRadius - element._model.innerRadius;
                                      centerx = element._model.x;
                                      centery = element._model.y;
                                      var thispart = dataset.data[index],
                                          arcsector = Math.PI * (2 * thispart / total);
                                      if (element.hasValue() && dataset.data[index] > 0) {
                                        labelxy.push(lastend + arcsector / 2 + Math.PI + offset);
                                        labelname.push(dataset.label[index]);
                                      }
                                      else {
                                        labelxy.push(-1);
                                      }
                                      lastend += arcsector;
                                  }), self)
                          
                                  var lradius = radius * 3 / 4;
                                  for (var idx in labelxy) {
                                    
                                    if (labelxy[idx] === -1) continue;
                                    var langle = labelxy[idx],
                                        dx = centerx + lradius * Math.cos(langle),
                                        dy = centery + lradius * Math.sin(langle),
                                        val = Math.round(dataset.data[idx] / total * 100).toFixed(2);


                                      //  console.log('langle'+langle);
                                    ctx.fillText(labelname[idx], dx, dy);
                                  }
                          
                              }), self);
                            }
                          },
                        // scales: {
                        //     yAxes: [{
                        //         ticks: {
                        //             beginAtZero:true,
                        //             callback: function(value, index, values) {
                        //                 if(parseInt(value) >= 1000){
                        //                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        //                 } else {
                        //                    return + value;
                        //                 }
                        //            }                            
                        //         }
                        //     }]
                        //   }              
                      }}
                      data={this.state}/>
                </Panel>
                </Panel>
            </Panel>
        )
    }
}

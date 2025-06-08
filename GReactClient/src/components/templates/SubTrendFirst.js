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
        label: '판권구분',
        borderWidth: 0,
        backgroundColor: [
          '#FFFFFF'
        ],
        hoverBackgroundColor: [
          '#FFFFFF'
        ],
        data: [100]
      }
]
};

var title='';

const datasetKeyProvider=()=>{ 
  return btoa(Math.random()).substring(0,12)
} 

export default class SubTrendFirst extends Component {
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
          url: `${API_URL}/AccountingSummary/GetTrendListFirst`,
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
      this.setState(initialState);
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
        me.search_movie_store.load({
            callback: function (recs, operation, success) {
              res();
            }
        });
      }),
    ]).then(function () {
      //me.sp_sales_kind_store.insert(0, {type_code:null, type_data:'선택'});
      me.search_movie_store.insert(0, {movie_no:null, movie_name:'선택'});
      //me.sp_corp_detail_store.insert(0, {sp_corp_detail_no:null, sp_corp_detail_name:'선택'});
      //me.mainDataStoreLoad();
    });
      //this.mainDataStoreLoad();
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
            var j=1;
      if(ret.count>0){
        model.push(
          {
            text: '영화명',
            dataIndex: 'movie_name',
            type: 'TEXT',
            width: 200,
            hidden:true,
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
            hidden:true,
            isExcel: true,
            sortable:true,
            align: 'left',
            style:'text-align:center'
          }
        );
  
        for(var i=formValue.st_date; i<=formValue.dt_date; i++){
          
          model.push(
            {
              text: i + '년',
              dataIndex: 'salesamt_'+j,
              type: 'TEXT',
              width: 80,
              hidden:true,
              isExcel: true,
              sortable:true,
              align: 'right',
              style:'text-align:center',
              renderer: function(value, metaData, record) {
                return Ext.util.Format.number(value, '0,000');
              }
            }
          );
          j++;
        }
        
        // model.push(
        //   {
        //     text: '총금액',
        //     exceltitle:'총금액',
        //     dataIndex: 'total_sum',
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
                        totalCount = ret.count;
                       // counter = header_grid.down('toolbar [code=counter]');
                       // counter.setHtml('<strong>총 ' + Ext.util.Format.number(totalCount, '0,000') + '건</strong> ');
                        me.onReconfigure(res);
                        me.setSalesTrend();
            }
                }
              }
              
        });
    }
    
    

    onClickExcelDownload = (item) =>{
      const me = this,
        {header_grid} = this.refs,
        form = header_grid.down('form'),
        grid = header_grid.down('grid'),
        formValue = form.getValues(),

        ExcelName = '['+formValue.movie_name+']_'+formValue.st_date+'~'+formValue.dt_date+' 매출추이',
        url = 'GetTrendListFirstExcelDownload';//'GetMovieTopListExcelDownload';
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

    setSalesTrend = () => {
        const me = this,
        {header_grid} = this.refs,
        form = header_grid.down('form'),
        grid = header_grid.down('grid'),
        store = grid.getStore(),
        formValue = form.getValues();

        
        title= '['+formValue.movie_name+']';
    		var _this = this;
      	var oldDataSet = _this.state.datasets[0];
        var item_list = [];
        var newData = [];

        var newLabelData = [];
      	var newDataSet = {
  				...oldDataSet
  			};

        var allData = [];
        var names2 = [];
        var colors2 = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"];
        var data2 = [[10, 20], [20, 30]];
        var period = [];

        const isEmpty = (input) => {
          if( typeof input ==="undefined" || input ===null || input ===''  )
          {
            return '';
          }
          else{
            return input;
          }
        }

        const isEmpty2 = (input , color) => {
          //console.log('tttttest '+input)
          if( typeof input ==="undefined" || input ==null || input =="" || input =="undefined" )
          {
            return '#FFFFFF';
          }
          else{
            return color;
          }
        }

        if(this.movie_top_store.count()>0){
          Ext.each(this.movie_top_store.data.items, function (itm) {
            //newData.push([itm.data.salesamt_1,itm.data.salesamt_2,itm.data.salesamt_3,itm.data.salesamt_9]);
            newLabelData.push(itm.data.sales_kind_name);
            //console.log('-과연뭐가- ' + JSON.stringify(itm.data.sales_kind_name, null, 2));
            //newLabelData.push(itm.data.sales_kind_name);
            item_list.push(itm.data);
           // console.log("---"+item_list[1]);
            //console.log('-8-- ' + JSON.stringify(itm.data[1], null, 2));
            //console.log('제목' + JSON.stringify(title, null, 2));

            let j=2;
            for(let i=formValue.st_date; i<=formValue.dt_date; i++){
              allData.push(itm.data[j]);
              //console.log('-여기임-- '+j+':' + JSON.stringify(itm.data[j], null, 2));
              //newData.push(item_list[j]);
              j++;
            };
            newData.push(allData);
            allData = [];
          });
          let j=2;
          for(let i=formValue.st_date; i<=formValue.dt_date; i++){
            period.push(i);

          };
          _this.setState({salesKindList:item_list});
          
          


          newDataSet.data = newData;
          var newState = {
          	...initialState,
            labels: period,
            yAxes: [
              {
                  ticks: {
                      beginAtZero: true,
                      userCallback: function(value, index, values) {
                          return value.toLocaleString();   // this is all we need
                      }
                  }
              }
            ],
            fill:false,
          	//datasets: [newDataSet,newDataSet1]
            datasets: period.map((ds, i) => ({
              label: isEmpty(newLabelData[i]),
              data: newData[i],
              borderColor: isEmpty2(newLabelData[i], colors2[i]),
              Color: isEmpty2(newLabelData[i], colors2[i]),
              showTooltips: true,
              tension: 0.1,
              backgroundColor : isEmpty2(newLabelData[i], colors2[i]),
              fill : false
            }))  
            // datasets:[{
            //   label : "Download",
            //   backgroundColor : 'rgba(255, 99, 132, 1)',
            //   data : newData,
            //   showTooltips: true,
            //   borderColor: '#FAA46A',
            //   fill : false
            // },
            // {
            //   label : "Upload",
            //   backgroundColor : 'rgba(255, 205, 86, 1)',
            //   data : newData1,
            //   showTooltips: true,
            //   borderColor: '#1DCF35',
            //   fill : false
            // }]
          };
          _this.setState(newState);
        }else{
          alert('데이터가 없습니다.');
          return;
          title = '';
          var newState = {
          	...initialState,
            labels: isEmpty(''),
            yAxes: [
              {
                  ticks: {
                      beginAtZero: true,
                      userCallback: function(value, index, values) {
                          return value.toLocaleString();   // this is all we need
                      }
                  }
              }
            ],
            fill:false,
            datasets: [{
              label: '',
              data:  [0, 0],
              borderColor: '',
              showTooltips: true,
              tension: 0.1,
              backgroundColor : 'rgba(255, 99, 132, 1)',
              fill : false
            }] 
          	//datasets: [newDataSet,newDataSet1]
          };
          _this.setState(newState);

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
                                      xtype: 'label',
                                      cls: 'mylabel',
                                      padding:'7 2 0 0',
                                      width:35,
                                      style:'text-align:right',
                                      text: '기간:'
                                  },
                                  {
                                    xtype: 'combo',
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
                                    value: Ext.util.Format.date(new Date((new Date()).getTime() - 1700 * 24 * 60 * 60 * 1000), 'Y'),
                                    store:this.search_year_list_store
                                  },
                                  {
                                    xtype: 'label',
                                    cls: 'mylabel',
                                    padding:'7 2 0 2',
                                    text: '~'
                                  },
                                  {
                                    xtype: 'combo',
                                    flex:1,
                                    name: 'dt_date',
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
                                    xtype: 'label',
                                    cls: 'mylabel',
                                    padding:'7 2 0 2',
                                    text: '영화명'
                                  },
                                  {
                                    xtype: 'combo',
                                    flex:4,
                                    name: 'movie_no',
                                    displayField: 'movie_name',
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
                                    store:this.search_movie_store,//
                                    listeners: {
                                      change: function(){
                                          //console.log('change value' , 'The selected value id is '+this.getDisplayValue())   
                                          var form= this.up().getForm();
                                          form.findField('movie_name').setValue(this.getDisplayValue());

                                      }
                                    }
                                  },
                                  {
                                    xtype: 'hiddenfield',
                                    fieldLabel: 'CP사숨김',
                                    name: 'movie_name',
                                    id: 'movie_name',
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
                            
                          ]
                      }
                    ]}
                  >
                  </Panel>
                  <Panel
                  layout={'vbox'}
                  padding={'0 0 0 20'}
                  width={'100%'}>
                  <Line
                      height={650}
                      width={(screen.availWidth)-400}
                      ref={'chartLine'}
                      options={{
                        maintainAspectRatio: false,
                        responsive: false,
                        aspectRatio: 5,
                        fill : true,
                        legend:{
                          display:true,
                          position:'top',
                          labels:
                          {
                              boxWidth: 20,
                              fill: true
                             // backgroundColor:'#FFFFFF'
                          }
                        },
                        title:{
                          display:true,
                          text: JSON.stringify(title, null, 2).replace(/\"/gi, "")+' 매출액 추이',
                          fontSize:20
                        },
                        plugins: {
                          datalabels: {
                             display: true,
                             color: 'white'
                          }
                        },
                        tooltips: {
                          enabled: true,
                          mode: "single",
                          callbacks: {
                            label: function (tooltipItem, data) {
                              const tooltipValue = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                              //console.log('tooltipValue : ', tooltipValue)
                              return parseInt(tooltipValue, 10).toLocaleString();
                            }           
                          }
                        },
                        hover: {
                          animationDuration: 0
                        },
                        animation: {
                          onComplete: function() {
                            const chartInstance = this.chart,
                              ctx = chartInstance.ctx;
           
                            ctx.font = Chart.helpers.fontString(
                              10,
                              Chart.defaults.global.defaultFontStyle,
                              Chart.defaults.global.defaultFontFamily
                            );
                            ctx.textAlign = "center";
                            ctx.textBaseline = "bottom";
           
                            this.data.datasets.forEach(function(dataset, i) {
                              const meta = chartInstance.controller.getDatasetMeta(i);
                              meta.data.forEach(function(bar, index) {
                                const data = parseInt(dataset.data[index], 10).toLocaleString();
                                ctx.fillStyle = "#000";
                                ctx.fillText(data, bar._model.x, bar._model.y - 10);
                              });
                            });
                          }
                        },
                        scales: {
                          yAxes: [{
                              ticks: {
                                  beginAtZero:true,
                                  callback: function(value, index, values) {
                                      if(parseInt(value) >= 1000){
                                         return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                      } else {
                                         return + value;
                                      }
                                 }                            
                              }
                          }]
                        }              
                      }}
                      datasetKeyProvider={datasetKeyProvider}
                      data={this.state}/>
                </Panel>
                </Panel>
            </Panel>
        )
    }
}

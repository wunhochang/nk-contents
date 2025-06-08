import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';

import { Window, Panel, Grid, Toolbar, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, prevMonth} from '../../utils/Util';
import {Line, Bar, Pie, HorizontalBar} from 'react-chartjs-2';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
  //https://github.com/reactjs/react-chartjs
  //https://github.com/jerairrest/react-chartjs-2/blob/master/example/src/components/bar.js
  //https://github.com/jerairrest/react-chartjs-2/tree/master/example/src/components
const initialState = {
    // LINE, BAR
    // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    labels: [],
    datasets: [
          {
            label: '업체순위',
            // backgroundColor: 'rgba(255,99,132,0.2)',
            // borderColor: 'rgba(255,99,132,1)',
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
            // hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            // hoverBorderColor: 'rgba(255,99,132,1)',
            data: [65, 59, 80, 81, 56, 55, 40]
          }
          // Pie
          // {
        	// 	data: [],
          //   label: '업체순위',
        	// 	backgroundColor: [
          // 		'#FF6384',
          // 		'#36A2EB',
          // 		'#FFCE56',
          //     '#FF6384',
          // 		'#36A2EB',
          // 		'#FFCE56',
          //     '#FF6384',
          // 		'#36A2EB',
          // 		'#FFCE56',
          //     '#FF6384'
        	// 	],
        	// 	hoverBackgroundColor: [
          // 		'#FF6384',
          // 		'#36A2EB',
          // 		'#FFCE56',
          //     '#FF6384',
          // 		'#36A2EB',
          // 		'#FFCE56',
          //     '#FF6384',
          // 		'#36A2EB',
          // 		'#FFCE56',
          //     '#FF6384'
        	// 	]
        	// }
          // {
                /*BAR*/
          //     label: 'My First dataset',
          //     backgroundColor: 'rgba(255,99,132,0.2)',
          //     borderColor: 'rgba(255,99,132,1)',
          //     borderWidth: 1,
          //     hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          //     hoverBorderColor: 'rgba(255,99,132,1)',
          //     data: []
          //   }
          // {
                /*LINE*/
          //     label: 'My First dataset',
          //     fill: false,
          //     lineTension: 0.1,
          //     backgroundColor: 'rgba(75,192,192,0.4)',
          //     borderColor: 'rgba(75,192,192,1)',
          //     borderCapStyle: 'butt',
          //     borderDash: [],
          //     borderDashOffset: 0.0,
          //     borderJoinStyle: 'miter',
          //     pointBorderColor: 'rgba(75,192,192,1)',
          //     pointBackgroundColor: '#fff',
          //     pointBorderWidth: 1,
          //     pointHoverRadius: 5,
          //     pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          //     pointHoverBorderColor: 'rgba(220,220,220,1)',
          //     pointHoverBorderWidth: 2,
          //     pointRadius: 1,
          //     pointHitRadius: 10,
          //     data: [0,0,0,0,0,0,0]
          // }
    ]
};
export default class SubMainSecond extends Component {
    state = {
      Authorization:cookie.load('token'),
      topCorpDetailList:[]
    }
    
    sp_top_store = Ext.create('Ext.data.Store', {
      fields: [
      ],
      pageSize: null,
      remoteSort : true,
      proxy: {
          type: 'ajax',
          method: 'GET',
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
          url: `${API_URL}/AccountingSummary/GetSpCorpTopList`,
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
    //https://github.com/jerairrest/react-chartjs-2/blob/master/example/src/components/randomizedLine.js
    componentWillMount(){
      this.setState(initialState);
    }
    componentDidMount(){
      const me = this,
            prev_month = prevMonth(parseInt(Ext.util.Format.date(new Date((new Date()).getTime() + 0 * 24 * 60 * 60 * 1000), 'm'))),
            params = Ext.apply({}, {this_date:prev_month});
      Ext.Promise.all([
        new Ext.Promise(function (res) {
          me.sp_top_store.load({
              params:{condition:JSON.stringify(params)},
              callback: function (recs, operation, success) {
                res();
              }
          });
        })
      ]).then(function () {
        me.setMovieTop();
      });
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
        if(this.sp_top_store.count()>0){
          Ext.each(this.sp_top_store.data.items, function (itm) {
            newLabelData.push(itm.data.sp_corp_detail_name);
            newData.push(itm.data.accounting_price);
            item_list.push(itm.data);
          });
          _this.setState({topCorpDetailList:item_list});
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
        const {topCorpDetailList} = this.state;
        return(
          <Panel
            layout={[{
                type: 'vbox',
                align: 'stretch'
            }]}
            scrollable={false}
            bodyPadding={7}
            border={false}>

                <Container
                  layout={[{
                      type: 'vbox',
                      align: 'stretch'
                  }]}>
                  <table style={{width:'100%',verticalAlign:'top'}}>
                    <tr>
                      <td style={{width:'50%',verticalAlign:'top'}} >
                        <table className="table table-hover table-outline mb-0 hidden-sm-down">
                              <thead className="thead-default">
                                  <tr>
                                      <th className="text-center">업체명</th>
                                      <th className="text-center">매출액</th>
                                  </tr>
                              </thead>
                              <tbody>
                              { topCorpDetailList.map((item,i) => {
                                var accounting_price = Ext.util.Format.number(item.accounting_price, '0,000');
                                return(
                                  <tr>
                                      <td className="text-left">{item.sp_corp_detail_name}</td>
                                      <td className="text-right">{accounting_price}</td>
                                  </tr>
                                )
                              })
                            }

                              </tbody>
                        </table>
                      </td>
                      <td style={{width:'50%',verticalAlign:'top'}}>
                        <Bar
                            width={350}
                            ref={'chartLine'}
                            data={this.state}/>
                      </td>
                    </tr>
                  </table>


                </Container>
            </Panel>
        )
    }
}

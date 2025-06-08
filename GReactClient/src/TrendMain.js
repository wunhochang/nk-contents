
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';

import { Window, Panel, Grid, Toolbar, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from './utils/MessageUtil';
import {refreshToken} from './utils/AuthUtil';
import {AddDate, prevMonth} from './utils/Util';

import SubTrendFirst from './components/templates/SubTrendFirst';
import SubTrendSecond from './components/templates/SubTrendSecond';

export default class TrendMain extends Component {
    componentWillMount(){
    }
    componentDidMount(){
    }
    render(){
        return(
          <Panel
            layout={[{
                type: 'vbox',
                display: 'flex'
            }]}
            height={'100%'}
            scrollable={true}
            bodyPadding={3}
            border={false}
            >
                <Panel
                 layout={[{
                    type: 'hbox',
                    display: 'flex'
                }]}
                    region={'west'}
                    border={false}
                    scrollable={true}
                    fullscreen={true}
                    collapsible={true}
                    width={'99%'}
                    // width={649}
                    title={'매출추이'}
                    split={true}>
                    <SubTrendFirst/>
                </Panel>
                <Panel
                 layout={[{
                    type: 'hbox',
                    display: 'flex'
                }]}
                    region={'east'}
                    border={false}
                    scrollable={true}
                    fullscreen={true}
                    collapsible={true}
                    width={'99%'}
                    // width={649}
                    title={'점유율'}
                    split={true}>
                    <SubTrendSecond/>
                </Panel>
        </Panel>
        )
    }
}

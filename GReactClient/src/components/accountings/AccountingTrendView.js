
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';

import { Window, Panel, Grid, Toolbar, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate, prevMonth} from '../../utils/Util';

import SubTrendFirst from '../../components/templates/SubMainSecond';
import SubMainSecond from '../../components/templates/SubMainSecond';
export default class AccountingTrendView extends Component {
    componentWillMount(){
    }
    componentDidMount(){
    }
    render(){
        return(
          <Panel
            layout={[{
                type: 'vbox',
                align: 'stretch'
            }]}
            height={'100%'}
            scrollable={true}
            bodyPadding={7}
            border={false}>
              <SubTrendFirst/>
              <SubMainSecond/>
            </Panel>
        )
    }
}

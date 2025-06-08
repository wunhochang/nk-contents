import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

import MenuFirstView from './MenuFirstView';
import MenuSecondView from './MenuSecondView';
import MenuThirdView from './MenuThirdView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
export default class MenuView extends Component {
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token'),
    pagingtoolbar:true
  }
  firstMenuCall = (result) => {
    const {second_menu, third_menu} = this.refs;
          second_menu.onAutoProcessMenu(result);
          third_menu.onAutoProcessMenu(null);
  }
  secondMenuCall = (result) => {
    const {third_menu} = this.refs;
          third_menu.onAutoProcessMenu(result);
  }
  thirdMenuCall = (result) => {

  }
  render(){
    return(
      <Panel
        layout="fit"
        scrollable={false}
        bodyPadding={0}
        border={false}>

        <Panel
          layout="border"
          bodyBorder ={false}
          bodyPadding={0}
          padding={0}
          border={false}
          frame={false}
          fullscreen={true}>
          <Panel
              region={'west'}
              layout={'fit'}
              border={false}
              scrollable={true}
              fullscreen={true}
              width={'40%'}
              title={'1차메뉴'}
              split={true}>

              <MenuFirstView
                ref={'first_menu'}
                firstMenuCall={this.firstMenuCall.bind(this)}/>

          </Panel>
          <Panel
              region={'center'}
              layout={'fit'}
              border={false}
              scrollable={true}
              fullscreen={true}
              width={'30%'}
              title={'2차메뉴'}
              split={true}>

              <MenuSecondView
                ref={'second_menu'}
                secondMenuCall={this.secondMenuCall.bind(this)}/>

          </Panel>
          <Panel
              region={'east'}
              layout={'fit'}
              border={false}
              scrollable={true}
              fullscreen={true}
              width={'30%'}
              title={'3차메뉴'}
              split={true}>

              <MenuThirdView
                ref={'third_menu'}
                thirdMenuCall={this.thirdMenuCall.bind(this)}/>

          </Panel>
        </Panel>

      </Panel>
    )
  }
}

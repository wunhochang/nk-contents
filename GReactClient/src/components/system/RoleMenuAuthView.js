import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';
import { Window, Panel, Grid, Toolbar, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import {refreshToken} from '../../utils/AuthUtil';
import {AddDate} from '../../utils/Util';
import {createContextMenu} from '../../utils/GridContextMenu';

import RoleMenuAuthFirstView from './RoleMenuAuthFirstView';
import RoleMenuAuthSecondView from './RoleMenuAuthSecondView';

Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.util.*'
]);
export default class RoleMenuAuthView extends Component {
  state = {
    isOpen:false,
    result:[],
    Authorization:cookie.load('token')
  }
  firstMenuCall = (result) => {
    const {second_menu} = this.refs;
          second_menu.onAutoProcessMenu(result);
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
                bodyPadding={7}
                width={'20%'}
                title={'역할목록'}
                split={true}>
                <RoleMenuAuthFirstView
                  ref={'first_menu'}
                  firstMenuCall={this.firstMenuCall.bind(this)}/>
            </Panel>
            <Panel
                region={'center'}
                layout={'fit'}
                border={false}
                scrollable={true}
                fullscreen={true}
                width={'80%'}
                title={'메뉴권한목록'}
                split={true}>

                <RoleMenuAuthSecondView
                  ref={'second_menu'}/>
            </Panel>
          </Panel>
        </Panel>
      )
  }
}

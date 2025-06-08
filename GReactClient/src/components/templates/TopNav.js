import React, { Component } from 'react';
import cookie from 'react-cookies';

import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { loginUser } from '../../actions/auth';

import { Window, TextField, Panel, Form } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import { API_URL, CLIENT_ROOT_URL, pageSize, treeListWidth, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';

Ext.require(['Ext.panel.*','Ext.button.Button']);

export default class TopNav extends Component {
  state = {
      userInfo:cookie.load('user')
  }
  onLogOut = () => {
    this.props.onLogOut();
  }
  onNavClose = () => {
    this.props.onNavClose();
  }
  onUserEditCheck= () => {
    this.props.onUserEditCheck();
  }
  render(){
    const {userInfo} = this.state;
    var user_id = '',
        user_name = '';

    if(typeof(userInfo) != 'undefined' && userInfo != null){
      user_id = userInfo.user_id;
      user_name = userInfo.user_name;
    }

    //console.log(userInfo);
    return(
      <header className="app-header navbar">
              <button className="navbar-toggler mobile-sidebar-toggler d-lg-none" type="button">☰</button>
              <a className="navbar-brand" href="/"></a>
              <ul className="nav navbar-nav d-md-down-none">
                  <li className="nav-item">
                      <a className="nav-link navbar-toggler sidebar-toggler" href="#" onClick={this.onNavClose}>☰</a>
                  </li>
              </ul>

              <ul className="nav navbar-nav ml-auto">
                  <li className="nav-item dropdown">
                      {/*<a className="nav-link dropdown-toggle nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">*/}
                      <a className="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                          {/*<img src="https://genesisui.com/demo/prime/bootstrap4-ajax/img/avatars/6.jpg" className="img-avatar"/>*/}
                          <span className="d-md-down-none"><font color="#63c2de">{user_name}({user_id})</font>께서 로그인 하셨습니다.</span>
                      </a>
                  </li>
                  <li className="nav-item d-md-down-none" style={{paddingLeft:'10px'}}>
                    <a className="nav-link" href="#" onClick={this.onUserEditCheck}><i className="icon-settings" alt="Setting"></i></a>
                  </li>
                  <li className="nav-item d-md-down-none">
                    <a className="nav-link" href="#" onClick={this.onLogOut}><i className="icon-logout" alt="로그아웃"></i></a>
                  </li>

              </ul>
          </header>
    )
  }
}

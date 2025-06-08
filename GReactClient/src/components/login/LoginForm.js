import React, { Component } from 'react';
import cookie from 'react-cookies';

import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { loginUser } from '../../actions/auth';

import { Window, TextField, Panel, Form } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';

import RegisterForm from './RegisterForm';

Ext.require(['Ext.panel.*','Ext.button.Button']);

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
  }
  state={
    isOpenRegister:null
  }
  componentWillMount(){
  }
  componentDidMount(){
    const {user_id, password} = this.refs;
    user_id.focus();
  }
  onClick = () => {
    const {user_id, password} = this.refs;
  }
  userIdCheckKeypress = (e) => {
    const {user_id, password} = this.refs;
    if (e.key === 'Enter') {
      if(user_id.value ==''){
        alert('사용자 아이디를 입력해주세요.');
      }
      else{
        password.focus();
      }
    }
  }
  passwordCheckKeypress = (e) => {
    const {user_id, password} = this.refs;
    if (e.key === 'Enter') {
      if(password.value ==''){
        alert('비밀번호를 입력해주세요.');
      }
      else{
        this.onLogin();
      }
    }
  }
  onLogin = () => {
    const { user_id, password } = this.refs;
    if(user_id.value==''){
      alert('아이디를 입력해주세요.');
      user_id.focus();
      return false;
    }
    if(password.value==''){
      alert('비밀번호를 입력해주세요.');
      password.focus();
      return false;
    }
    var params = {user_id:user_id.value,password:password.value};
    var me = this;
    //console.log(me);
    Ext.Ajax.request({
        url: `${API_URL}/Token`,
        method: 'POST',
        headers: {'Content-Type': 'application/json;charset=UTF-8;' },
        params : JSON.stringify(params),
        dataType: "json",
        success: function(response, request) {
          if(response.status ==200){
            var ret = Ext.decode(response.responseText);
            cookie.save('token', 'Bearer ' + ret.access_token, { path: '/' });
            cookie.save('expires_in', ret.expires_in, { path: '/' });
            var expires_in = ret.expires_in;
            var login_stdatetime = Ext.Date.format(new Date((new Date()).getTime()), 'ymdHis');
            var login_eddatetime = Ext.Date.format(new Date((new Date()).getTime()+ parseFloat(expires_in)*1000), 'ymdHis');
            var date_cookie = {
              login_stdatetime:login_stdatetime,
              login_eddatetime:login_eddatetime
            };
            cookie.save('expires_date', date_cookie, { path: '/' });            
            me.userInfo(user_id.value);
          }
        },
        failure: function(response, request) {
          alert('입력하신 아이디 및 비밀번호를 다시 확인해주세요.');
        }
    });
  }
  fn = () => {
    const { user_id, password } = this.refs;
    var params = {user_id:user_id.value,password:password.value};
    var me = this;
    //console.log(me);
    Ext.Ajax.request({
        url: `${API_URL}/Token`,
        method: 'POST',
        headers: {'Content-Type': 'application/json;charset=UTF-8;' },
        params : JSON.stringify(params),
        dataType: "json",
        success: function(response, request) {
          if(response.status ==200){
            var ret = Ext.decode(response.responseText);
            cookie.save('token', 'Bearer ' + ret.access_token, { path: '/' });
            cookie.save('expires_in', ret.expires_in, { path: '/' });
            me.userInfo(user_id);
          }
        },
        failure: function(response, request) {
        }
    });
  }
  userInfo = (user_id) => {
    var me = this;
    Ext.Ajax.request({
        url: `${API_URL}/User/UserInfo/`+user_id,
        method: 'GET',
        headers: {'Authorization':cookie.load('token') },
        dataType: "json",
        success: function(response, request) {
          var ret = Ext.decode(response.responseText);
          //console.log(ret);
          if(ret.success ==true){
            var user_info = ret.data[0];
            cookie.save('user', user_info, { path: '/' });
            me.props.onLoginCheck();
          }
        },
        failure: function(response, request) {
        }
    });
  }
  onRegister = () => {
    this.setState({isOpenRegister:true});
  }
  render(){
    const {isOpenRegister} = this.state;
    return(
      <div>
      { isOpenRegister && (
          <RegisterForm/>
      ) }
      <div className="app flex-row align-items-center">
          <div className="container">
              <div className="row justify-content-center">
                  <div className="col-md-8"><img src="/assets/images/logo_login.png" alt="로고"/></div>
                  <div className="col-md-8" style={{height:'10px'}}></div>
                  <div className="col-md-8">
                      <div className="card-group mb-0">
                          <div className="card p-4">
                              <div className="card-block">
                                  <h1>Login</h1>
                                  <p className="text-muted">사용자 아이디와 비밀번호를 아래 입력해주세요.</p>
                                  <div className="input-group mb-3">
                                      <span className="input-group-addon"><i className="icon-user"></i>
                                      </span>
                                      <input type="text" ref={'user_id'} className="form-control" onKeyPress={this.userIdCheckKeypress} style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="사용자 아이디"/>
                                  </div>
                                  <div className="input-group mb-4">
                                      <span className="input-group-addon"><i className="icon-lock"></i>
                                      </span>
                                      <input type="password" ref={'password'} className="form-control" onKeyPress={this.passwordCheckKeypress} style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}}  placeholder="비밀번호"/>
                                  </div>
                                  <div className="row">
                                      <div className="col-6">
                                          <button type="button" className="btn btn-primary px-4" onClick={this.onLogin}>로그인</button>{/*Login*/}
                                      </div>
                                      <div className="col-6 text-right">
                                          <button type="button" className="btn btn-link px-0">비밀번호를 잊으셨나요?</button>{/*Forgot password?*/}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div className="card card-inverse card-primary py-5 d-md-down-none" style={{width:'44%'}}>
                              <div className="card-block text-center">
                                  <div>
                                      <h4>NK Contents 정산시스템</h4>{/*Sign up*/}
                                      <p><br/>NK Contents 정산시스템은 회원가입 후, <br/>관리자가 승인을 해야만 사용이 가능합니다.<br/><br/>※ 불법 접속시 법적인 조치를 받습니다.</p>
                                      {/*Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.*/}
                                      <button type="button" className="btn btn-primary active mt-3" onClick={this.onRegister}>회원가입</button>{/*Register Now!*/}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      </div>
    )
  }
}

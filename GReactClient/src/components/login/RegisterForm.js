import React, { Component } from 'react';
import cookie from 'react-cookies';

import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { loginUser } from '../../actions/auth';

import { Window, TextField, Panel, Form } from '@extjs/reactor/classic';
import {showConfirm, alert} from '../../utils/MessageUtil';
import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../../actions/index';

Ext.require(['Ext.panel.*','Ext.button.Button']);

export default class RegisterForm extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    user_id_check:false,
    old_user_id:''
  }
  componentWillMount(){
  }
  componentDidMount(){
    const {user_id, user_name, user_tel, user_email, user_pwd, user_re_pwd} = this.refs;
    user_id.focus();
  }
  onKeyPressUserId = (e) => {
    const {user_id, user_name} = this.refs;
    if (e.key === 'Enter') {
      if(user_id.value ==''){
        alert('아이디를 입력해주세요.');
        return false;
      }
      else{
        user_name.focus();
      }
    }
  }
  onKeyPressUserName = (e) => {
      const {user_name, user_tel} = this.refs;
      if (e.key === 'Enter') {
        if(user_name.value ==''){
          alert('이름을 입력해주세요.');
          return false;
        }
        else{
          user_tel.focus();
        }
      }
  }
  onKeyPressUserTel = (e) => {
      const {user_tel, user_email} = this.refs;
      if (e.key === 'Enter') {
        user_email.focus();
        // if(user_tel.value ==''){
        //   alert('연락처를 입력해주세요.');
        //   return false;
        // }
        // else{
        //   user_email.focus();
        // }
      }
  }
  onKeyPressUserEmail = (e) => {
      const {user_email, user_pwd} = this.refs;
      if (e.key === 'Enter') {
        user_pwd.focus();
        // if(user_email.value ==''){
        //   alert('Email을 입력해주세요.');
        //   return false;
        // }
        // else{
        //   user_pwd.focus();
        // }
      }
  }
  onKeyPressUserPasswd = (e) => {
      const {user_pwd, user_re_pwd} = this.refs;
      if (e.key === 'Enter') {
        if(user_pwd.value ==''){
          alert('비밀번호를 입력해주세요.');
          return false;
        }
        else{
          user_re_pwd.focus();
        }
      }
  }
  onKeyPressUserRePasswd = (e) => {
      const {user_pwd, user_re_pwd} = this.refs;
      if (e.key === 'Enter') {
        if(user_re_pwd.value ==''){
          alert('비밀번호확인을 입력해주세요.');
          return false;
        }
        else{
          if(user_pwd.value != user_re_pwd.value){
            alert('입력하신 비밀번호가 일치 하지 않습니다. 다시 확인해주세요.');
            return false;
          }
        }
        this.onRegister();
      }
  }
  onIDCheck = () => {
    const {user_id, user_name, user_tel, user_email, user_pwd, user_re_pwd} = this.refs,
          {user_id_check, old_user_id} = this.state;
    var params = {user_id:user_id.value};
    var me = this;

    if(user_id.value == ''){
      alert('아이디를 입력해주세요.');
      user_id.focus();
      return false;
    }
    Ext.Ajax.request({
        url: `${API_URL}/User/IDCheck/`+user_id.value,
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;' },
        dataType: "json",
        success: function(response, request) {
          if(response.status ==200){
             var ret = Ext.decode(response.responseText);
             if(ret.data.length>0 && ret.success == true){
               if(ret.data[0].cnt == 0){
                 me.setState({user_id_check:true, old_user_id:user_id.value});
                 alert('사용 가능한 아이디입니다.');
               }
               else{
                 me.setState({user_id_check:false, old_user_id:''});
                 alert('이미 사용중인 아이디입니다. 다른 아이디를 사용해주세요.');
               }
             }
             else{
               me.setState({user_id_check:false, old_user_id:''});
               alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
             }
          }
          else{
            me.setState({user_id_check:false, old_user_id:''});
            alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
          }
        },
        failure: function(response, request) {
          alert('서버상태가 불안정합니다. 담당자에게 문의해주세요.');
        }
    });
  }
  onClickRegister = () => {
    const {user_id, user_name, user_tel, user_email, user_pwd, user_re_pwd} = this.refs,
          {user_id_check, old_user_id} = this.state;
    if(user_id.value ==''){
      alert('아이디를 입력해주세요.');
      user_id.focus();
      return false;
    }
    if(user_id.value != old_user_id){
      alert('아이디 정보가 변경되었습니다. 아이디체크를 다시 해주세요.');
      user_id.focus();
      return false;
    }
    if(user_id_check == false){
      alert('사용하고자 하는 아이디확인을 해주세요.');
      return false;
    }
    if(user_name.value ==''){
      alert('이름을 입력해주세요.');
      user_name.focus();
      return false;
    }
    // if(user_tel.value ==''){
    //   alert('연락처를 입력해주세요.');
    //   user_tel.focus();
    //   return false;
    // }
    // if(user_email.value ==''){
    //   alert('Email을 입력해주세요.');
    //   user_email.focus();
    //   return false;
    // }
    if(user_pwd.value ==''){
      alert('비밀번호를 입력해주세요.');
      user_pwd.focus();
      return false;
    }
    if(user_re_pwd.value ==''){
      alert('비밀번호확인을 입력해주세요.');
      user_re_pwd.focus();
      return false;
    }
    else{
      if(user_pwd.value != user_re_pwd.value){
        alert('입력하신 비밀번호가 일치 하지 않습니다. 다시 확인해주세요.');
        return false;
      }
    }
    this.onRegister();
  }
  onRegister = () => {
    console.log('onRegister');
    showConfirm({
          msg: '작성하신 정보에 대해서 회원가입을 하시겠습니까?',
          title:'확인',
          callback: this.fnRegister
      });
  }
  fnRegister = () => {
    const {user_id, user_name, user_tel, user_email, user_pwd, user_re_pwd} = this.refs,
          me = this,
          params = paramsPostHandler({user_id:user_id.value,
                    user_name:user_name.value,
                    user_tel:user_tel.value,
                    user_email:user_email.value,
                    user_pwd:user_pwd.value});

          Ext.Ajax.request({
              url: `${API_URL}/User/Save`,
              method: 'POST',
              headers: {'Content-Type': 'application/json;charset=UTF-8;'},
              params : params,
              dataType: "json",
              success: function(response, request) {
                const ret = Ext.decode(response.responseText);
                if(ret.newID > 0 && ret.success == true){
                  me.setState({user_id_check:false});
                  showConfirm({
                        msg: '정상적으로 회원가입이 되었습니다.<br/>관리자 승인후, 사용이 가능합니다.',
                        title:'확인',
                        callback: me.onPageReload
                    });
                }
              },
              failure: function(response, request) {
                  alert('정상적으로 처리되지 않았습니다. 다시 시도해주세요.');
              }
          });
  }

  onPageReload = () => {
    window.location.href='/';
  }
  render(){
    return(
      <div className="app flex-row align-items-center">
          <div className="container">
              <div className="row justify-content-center">
                  <div className="col-md-6">
                      <div className="card mx-4">
                          <div className="card-block p-4">
                              <h2>회원가입</h2>{/*Register*/}
                              <p className="text-muted">사용자 정보를 아래 입력해주세요. 관리자 승인후, 사용이 가능합니다.</p>{/*Create your account*/}
                              <div className="input-group mb-3">
                                  <span className="input-group-addon"><i className="icon-user"></i>
                                  </span>
                                  <input type="text" ref={'user_id'} onKeyPress={this.onKeyPressUserId} className="form-control" style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="아이디를 입력해주세요."/>
                                  <button type="button" style={{width:'100px'}} onClick={this.onIDCheck} className="btn btn-block btn-success-login">아이디확인</button>
                              </div>

                              <div className="input-group mb-3">
                                  <span className="input-group-addon"><i className="icon-user"></i>
                                  </span>
                                  <input type="text" ref={'user_name'} onKeyPress={this.onKeyPressUserName} className="form-control" style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="이름을 입력해주세요."/>
                              </div>

                              <div className="input-group mb-3">
                                  <span className="input-group-addon"><i className="icon-phone"></i></span>
                                  <input type="text" ref={'user_tel'} onKeyPress={this.onKeyPressUserTel} className="form-control" style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="연락처를 입력해주세요."/>
                              </div>

                              <div className="input-group mb-3">
                                  <span className="input-group-addon">@</span>
                                  <input type="text" ref={'user_email'} onKeyPress={this.onKeyPressUserEmail}className="form-control" style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="Email를 입력해주세요."/>
                              </div>

                              <div className="input-group mb-3">
                                  <span className="input-group-addon"><i className="icon-lock"></i>
                                  </span>
                                  <input type="password" ref={'user_pwd'} onKeyPress={this.onKeyPressUserPasswd} className="form-control" style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="비밀번호를 입력해주세요."/>
                              </div>

                              <div className="input-group mb-4">
                                  <span className="input-group-addon"><i className="icon-lock"></i>
                                  </span>
                                  <input type="password" ref={'user_re_pwd'} onKeyPress={this.onKeyPressUserRePasswd} className="form-control" style={{fontWeight:'nomarl',border:'1px solid rgba(0, 0, 0, 0.15)',padding:'0.5rem 0.75rem',lineHeight:'1.25'}} placeholder="비밀번호확인"/>
                              </div>

                              <button type="button" className="btn btn-block btn-success" onClick={this.onClickRegister}>회원가입</button>{/*Create Account*/}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    )
  }
}

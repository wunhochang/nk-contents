import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, paramsHandler, paramsPostHandler, errorHandler } from '../actions/index';

export function refreshToken(cb) {
  const params = {};
  if(typeof(cookie.load('token')) == 'undefined' || cookie.load('token') == null){
    cookie.remove('token', { path: '/' });
    cookie.remove('user', { path: '/' });
    window.location.href = `${CLIENT_ROOT_URL}/login`;
    return;
  }
  Ext.Ajax.request({
      url: `${API_URL}/TokenRefresh`,
      method : 'POST',
      headers: {'Authorization':cookie.load('token')},
      params:params,
      dataType: "json",
      dataType: "json",
      callback: function(opts, suss, resp) {
        if(resp.status == 200){
          var ret = Ext.decode(resp.responseText);
          cookie.save('token', 'Bearer ' + ret.access_token, { path: '/' });
          cookie.save('expires_in', ret.expires_in, { path: '/' });
          //cb(resp.responseText);
          cb('OK');
        }
        else{
          cookie.remove('token', { path: '/' });
          cookie.remove('user', { path: '/' });
          window.location.href = `${CLIENT_ROOT_URL}/login`;
        }
      }
  });


  // Ext.Ajax.request({
  //     url: 'http://localhost:5554/api/TokenRefresh',
  //     method: 'POST',
  //     headers: {'Authorization':cookie.load('token')},
  //     params:params,
  //     dataType: "json",
  //     scope:this,
  //   	callback: function(opts, suss, resp){
  //   		const result = Ext.util.JSON.decode(resp.responseText);
  //       return result;
  //   	}
  //     // success: function(response, request) {
  //     //   if(response.status ==200){
  //     //     var ret = Ext.decode(response.responseText);
  //     //     cookie.save('token', 'Bearer ' + ret.access_token, { path: '/' });
  //     //     cookie.save('expires_in', ret.expires_in, { path: '/' });
  //     //
  //     //     return ret;
  //     //   }
  //     // },
  //     // failure: function(response, request) {
  //     //     return null;
  //     // }
  // });
}

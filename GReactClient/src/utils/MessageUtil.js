import React, { Component } from 'react';

export function showConfirm(cfg) {
  Ext.Msg.show({
      title: cfg.title || 'CONFIRM',
      message: cfg.msg,
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.INFO,
      fn: function (btn) {
          if (btn === 'yes' && Ext.isFunction(cfg.callback)) {
              cfg.callback();
          }
      }
  });
}

export function showError(cfg) {
  var msg;
  if (Ext.isString(cfg)) {
      msg = cfg;
      cfg = {
          msg: msg
      };
  }
  Ext.Msg.show({
      title: cfg.title || 'ERROR',
      message: cfg.msg,
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.ERROR,
      fn: function (btn) {
          if (btn === 'yes' && Ext.isFunction(cfg.callback)) {
              cfg.callback();
          }
      }
  });
}

export function showWarning(cfg) {
  Ext.Msg.show({
      title: cfg.title || 'WARNING',
      message: cfg.msg,
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.WARNING,
      fn: function (btn) {
          if (btn === 'yes' && Ext.isFunction(cfg.callback)) {
              cfg.callback();
          }
      }
  });
}

export function showInfo(cfg) {
  var msg;
  if (Ext.isString(cfg)) {
      msg = cfg;
      cfg = {
          msg: msg
      };
  }
  Ext.Msg.show({
      title: cfg.title || 'INFO',
      message: cfg.msg,
      buttons: Ext.Msg.YESNO,
      icon: Ext.Msg.ERROR,
      fn: function (btn) {
          if (btn === 'yes' && Ext.isFunction(cfg.callback)) {
              cfg.callback();
          }
      }
  });
}

export function alert(cfg){
  var msg;
  if (Ext.isString(cfg)) {
      msg = cfg;
      cfg = {
          msg: msg
      };
  }
  Ext.MessageBox.alert('알림', cfg.msg, null, this);
}

import React, { Component } from 'react';
import cookie from 'react-cookies';

import { Window, TextField, Button, Container, Grid, Panel } from '@extjs/reactor/classic';

export function stateProvider() {
  return new Ext.define('KKPC.util.RemoteStateProvider', {
      extend: 'Ext.state.Provider',
      uses: [
          'Ext.data.Store',
          'Ext.state.Provider',
          'Ext.util.Observable'
      ],

      constructor: function (config) {
          config = config || {};
          this.initialConfig = config;

          Ext.apply(this, config);

          this.mixins.observable.constructor.call(this, config);
      },

      set: function (name, value) {
          var pos, row;
          if ((pos = this.store.find('name', name)) > -1) {
              row = this.store.getAt(pos);
              row.set('value', Ext.JSON.encode(value));
          } else {
              this.store.add({
                  name: name,
                  value: Ext.JSON.encode(value)
              });
          }

          this.store.sync();
          this.fireEvent('statechange', this, name, value);

      },

      get: function (name, defaultValue) {
          var pos, row;
          if ((pos = this.store.find('name', name)) > -1) {
              row = this.store.getAt(pos);
              try {
                  return Ext.JSON.decode(row.get('value'));
              } catch (e) {
                  this.clear(name);
                  return defaultValue;
              }
          } else {
              return defaultValue;
          }

      },

      clear: function (name) {
          var pos;

          if ((pos = this.store.find('name', name)) > -1) {

              this.store.removeAt(pos);
              this.store.sync();
              this.fireEvent('statechange', this, name, null);

          }
      },

      storeage: function () {
          // if (!AuthUtil.Genone.Common.userInfo) {
          //     location.replace('/');
          // }
          return Ext.create('Ext.data.Store', {
            fields: [
                  {
                      name: 'name',
                      type: 'string'
                  },
                  {
                      name: 'value',
                      type: 'string'
                  }
              ],
              pageSize: null,
              remoteSort : true,
              proxy: {
                  type: 'ajax',
                  paramsAsJson: true,
                  api: {
                      read: '/ExtGridState/ExtGridStateGetAll',
                      create: '/ExtGridState/ExtGridStateInsert',
                      update: '/ExtGridState/ExtGridStateInsert',
                      destroy: '/ExtGridState/ExtGridStateDelete'
                  },
                  actionMethods: {
                      read: 'POST',
                      create: 'POST',
                      update: 'POST',
                      delete: 'POST'
                  },
                  extraParams: {
                      //oper_user_id: AuthUtil.Genone.Common.userInfo.user_id
                  },
                  reader: {
                      type: 'json',
                      rootProperty: 'list',
                      successProperty: 'success'
                  },
                  writer: {
                      type: 'json'
                  }
              }
          });
      },
      initStore: function (callback) {
          console.log('initStore');
          this.store = this.storeage();
          this.store.load(function () {
              if (Ext.isFunction(callback)) {
                  callback();
              }
          });
      }
  });
}

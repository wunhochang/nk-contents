import React, { Component } from 'react';
import cookie from 'react-cookies';

import { Window, TextField, Button, Container, Grid, Panel } from '@extjs/reactor/classic';

const MonthPicker = new Ext.define('MonthPicker', {
                  extend: 'Ext.form.field.Date',
                  xtype: 'monthfield',
                  requires: ['Ext.picker.Month'],
                  alternateClassName: ['Ext.form.MonthField', 'Ext.form.Month'],
                  selectMonth: null,
                  minWidth: 100,
                  deefaults: {
                      enableToggle: true,
                      labelAlign: 'right'
                  },
                  config: {
                      width: 300,
                      fieldLabel: '',
                      prefixName: 'datemonthpicker',
                      format: 'Y-m',
                      value: new Date()
                  },
                  createPicker: function () {
                      var me = this,
                          format = Ext.String.format;
                      return Ext.create('Ext.picker.Month', {
                          pickerField: me,
                          ownerCt: me.ownerCt,
                          //renderTo: document.body,
                          floating: true,
                          hidden: true,
                          focusOnShow: true,
                          minDate: me.minValue,
                          maxDate: me.maxValue,
                          disabledDatesRE: me.disabledDatesRE,
                          disabledDatesText: me.disabledDatesText,
                          disabledDays: me.disabledDays,
                          disabledDaysText: me.disabledDaysText,
                          format: me.format,
                          showToday: me.showToday,
                          startDay: me.startDay,
                          minText: format(me.minText, me.formatDate(me.minValue)),
                          maxText: format(me.maxText, me.formatDate(me.maxValue)),
                          listeners: {
                              select: {
                                  scope: me,
                                  fn: me.onSelect
                              },
                              monthdblclick: {
                                  scope: me,
                                  fn: me.onOKClick
                              },
                              yeardblclick: {
                                  scope: me,
                                  fn: me.onOKClick
                              },
                              OkClick: {
                                  scope: me,
                                  fn: me.onOKClick
                              },
                              CancelClick: {
                                  scope: me,
                                  fn: me.onCancelClick
                              },
                              afterrender: {
                                  scope: me,
                                  fn: function (c) {
                                      var me = c;
                                      me.el.on("mousedown", function (e) {
                                          e.preventDefault();
                                      }, c);
                                  }
                              }
                          },
                          keyNavConfig: {
                              esc: function () {
                                  me.collapse();
                              }
                          }
                      });
                  },
                  onCancelClick: function () {
                      var me = this;
                      me.selectMonth = null;
                      me.collapse();
                  },
                  onOKClick: function () {
                      var me = this;
                      if (me.selectMonth) {
                          me.setValue(me.selectMonth);
                          me.fireEvent('select', me, me.selectMonth);
                      }
                      me.collapse();
                  },
                  onSelect: function (m, d) {
                      var me = this;
                      me.selectMonth = new Date((d[0] + 1) + '/1/' + d[1]);
                  }
              });

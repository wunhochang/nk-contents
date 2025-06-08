import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import axios from 'axios';

import {showConfirm, alert} from './MessageUtil';

export function ExcelDownload(grid, ExcelName, customURL){
  if(grid ==null)
    return;
    console.log('TESTS '+grid.store.config.proxy.url);
   // console.log('grid url ' + JSON.stringify(grid, null, 2));
  const url = getExcelDownloadURL(grid.store.config.proxy.url, customURL);
  var excelcolumns = [],
      //columns = grid.headerCt.getVisibleGridColumns(),
      columns = grid.headerCt.getGridColumns(),
      idx = 0,
      len = columns.length;
      if(len>0){
        for (var i = 0; i < len; i++) {
          var col = columns[i];
          if (col != null) {
            console.log(col);

            if (typeof col.dataIndex != 'undefined' && col.dataIndex != "") {
              var data_index = col.dataIndex;
              if (col.type == 'FILEUPLOAD' || col.type == 'BUTTON') {
                  col.isExcel = false;
              }
              if (col.isExcel) {
                if (col.type == 'COMBO') {
                    // if (data_index.toUpperCase().endsWith('_NO')) {
                    //     data_index = data_index.substring(0, (data_index.length - '_NO'.length));
                    // }
                    // else if (data_index.toUpperCase().endsWith('_CODE')) {
                    //     data_index = data_index.substring(0, (data_index.length - '_CODE'.length));
                    // }
                    data_index += '_name';
                }
                // if (data_index.toUpperCase().endsWith('_YN')
                //     || data_index.toUpperCase().endsWith('_FLAG')
                //     || data_index.toUpperCase().endsWith('_TYPE')
                // ){
                //     data_index += '_name';
                // }
                var excelcolumn = {
                    Index: idx++,
                    ColumnName: col.exceltitle || strip_tags(col.text, ""),
                    DataIndex: data_index
                }
                excelcolumns.push(excelcolumn);
              }
            }
          }
        }
        var requestParams = grid.store.proxy.extraParams;
        var d = new Date();
        var thisdate = Ext.Date.format(new Date(), 'ymdHis'),
            formValues = grid.down('form').getForm().getValues();
        var params = Ext.apply({}, formValues, {excelcolumns:excelcolumns, excelname:ExcelName, excelmakedate:thisdate});
        //var params = Ext.apply({}, {excelcolumns:excelcolumns, excelname:ExcelName, excelmakedate:thisdate});
        //console.log('params '+params);
        console.log('파라미터 ' + JSON.stringify(formValues, null, 2));
        $.fileDownload(url, {
            httpMethod: "GET",
            data:{condition:JSON.stringify(params)},
            headers: {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": cookie.load('token')
            },
            prepareCallback: function prepareCallback() {
                //Ext.example.msg('알림', '엑셀 다운로드를 위한 데이터를 작성중입니다.');
            },
            successCallback: function successCallback() {
                //Ext.example.msg('알림', '데이터 작성을 완료 하였습니다.');
            },
            failCallback: function failCallback(html) {
                if(window.location.pathname =='/nkcpbillingreportview'){
                    alert('정상적으로 엑셀이 생성되지 않았습니다. <p>정산방법에 맞는 올바른 정산서를 선택하였는지 확인 후 다시 시도해주세요.');
                }else{
                    alert('정상적으로 엑셀이 생성되지 않았습니다. 잠시 후 다시 시도해주세요.');
                }
                
            }
        });
      }
      else{
        alert('다운로드받을 컬럼 정보가 없습니다.');
        return;
      }


}
export function getExcelDownloadURL(str, customURL) {
    var return_url = "";
    var str_array = str.split('/');
    if (str_array.length > 0) {
        for (var i = 0; i < str_array.length - 1; i++) {
            return_url = return_url + str_array[i] + "/";
        }
        if(typeof(customURL) == 'undefined' || customURL == null || customURL == ''){
          return_url = return_url + "ExcelDownload";
        }
        else{
          return_url = return_url + customURL;
        }
    }
    return return_url;
}

export function ExcelFileDownload(url, filename){
  var params = Ext.apply({}, {filename:filename});
  $.fileDownload(url, {
      httpMethod: "GET",
      data:{condition:JSON.stringify(params)},
      headers: {
          "Content-type": "application/json; charset=utf-8",
          "Authorization": cookie.load('token')
      },
      prepareCallback: function prepareCallback() {
          //Ext.example.msg('알림', '엑셀 다운로드를 위한 데이터를 작성중입니다.');
      },
      successCallback: function successCallback() {
          //Ext.example.msg('알림', '데이터 작성을 완료 하였습니다.');
      },
      failCallback: function failCallback(html) {
          alert('정상적으로 엑셀다운로드가 되지 않았습니다. 다시 시도해주세요.');
      }
  });
}

export function strip_tags(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
// 날짜계산
/*
 * 날짜를 더해서 계산하는 함수
 * @param {string} 'year' or 'month' or 'day'
 * @param {int} 더할 숫자
 */
export function AddDate(addCount, type, orgDate) {
  //var caledMonth, caledDay, caledYear;

  var loadDt = orgDate || new Date();
  var v = "";

  var dateType = type || 'day';

  if (dateType.toUpperCase() == 'YEAR') {
      v = new Date(Date.parse(loadDt));
      v.setYear(v.getFullYear() + addCount);
  } else if (dateType.toUpperCase() == 'MONTH') {
      v = new Date(Date.parse(loadDt));
      v.setMonth(v.getMonth() + addCount);
  } else {
      v = new Date(Date.parse(loadDt) + addCount * 1000 * 60 * 60 * 24);
  }

  return v;
}
//숫자형 Comma 추가
/*
 * 테이터타입이 숫자형인 값에 자리수 추가하는 함수
 * @param {number}  숫자
 * @param {int} 소수점 자리수
 */
 export function AddComma(num, round) {
     if (num.toString) {
         num = num.toString();
     }

     if (num == "") return num;
     var buf = "";
     var arrRound = num.toString().split('.');
     buf = arrRound[0].toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
     if (arrRound.length > 1) {
         buf += "." + arrRound[1].substr(0, round || 2); //기본 소수점 둘째자리
     }
     return buf;
 }
 //주차 계산
 /*
  * 해당 날짜가 몇주차인지 반환
  * @param {string}  해당 날짜의 string
  */
export function GetWeekCountOfMonth(dateStr) {
    var year = Number(dateStr.substring(0, 4));
    var month = Number(dateStr.substring(5, 7));

    var nowDate = new Date(year, month - 1, 1);

    var lastDate = new Date(year, month, 0).getDate();
    var monthSWeek = nowDate.getDay();

    //var weekSeq = parseInt((parseInt(lastDate) + monthSWeek - 1) / 7) + 1;

    return monthSWeek;
}
export function GetWeekRange(year, month, week) {
    var now = new Date();
    year = year || now.getFullYear();
    month = parseInt(month, 10) - 1; //javascript는 첫달이 0
    week = (week || 1) - 1;

    var firstDate = new Date(year, month, 1);
    var firstDay = firstDate.getDay();
    var arrRange = new Array();
    var rangeStartDate = (7 * week) - (firstDay - 1);
    var rangeEndDate = (7 * week) + (7 - firstDay);

    arrRange.push(new Date(year, month, rangeStartDate));
    arrRange.push(new Date(year, month, rangeEndDate));

    return arrRange;
}
export function removeTag(html) {
    return html.replace(/<.*?>/g, '').replace(/&nbsp;/g, '');
    //return html.replace(/<(\/)?([a-zA-Z]*)(\\s[a-zA-Z]*=[^>]*)?(\\s)*(\/)?>/gi, "");
}

export function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

export function prevMonth(month){
  var selectDate = new Date(),
      selectDate = new Date(selectDate.getFullYear(), (month-1), selectDate.getDate()),
      this_year = selectDate.getFullYear(),
      this_month = selectDate.getMonth();

      if(this_month==0){
        this_year = this_year-1;
        this_month = 12;
      }

  var value;
  if(this_month<10){
    value = this_year + '-0' + this_month;
  }
  else{
    value = this_year + '-' + this_month;
  }
  return value;
}

Date.prototype.formatDefault = function () {
    return [
        this.getFullYear().toString(),
        (this.getMonth() + 1).toString().replace(/^(\d)$/, '0$1'),
        (this.getDate()).toString().replace(/^(\d)$/, '0$1')
    ].join('-');
};

Date.prototype.isValid = function () {
    return this.getTime() === this.getTime();
};

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

String.prototype.replaceAll = function (org, dest) {
    return this.split(org).join(dest);
}

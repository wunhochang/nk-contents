import React, { Component, PropTypes } from 'react';
//import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import FileUpload from 'react-fileupload';

import { API_URL, CLIENT_ROOT_URL, pageSize, paramsHandler, paramsPostHandler, errorHandler } from '../actions/index';

import { Window, Panel, Grid, Button, Toolbar, FileField, TextField, Container } from '@extjs/reactor/classic';
import {showConfirm, alert} from './MessageUtil';

Ext.require([
  'Ext.form.FileUploadField',
  'Ext.ux.form.FileUploadField',
  'Ext.form.File',
  'Ext.form.trigger.Component',
  'Ext.form.field.File',
  'Ext.panel.Panel'
]);

export default class BtnFileUpload extends Component {
  constructor(props) {
      super(props);
      this.uploadSuccess = this.uploadSuccess.bind(this);
  }

  state = {
      ref_key: '',
      upload_folder:'DATA',   /*기본폴더*/
      title:'첨부파일',
      chooseAndUpload:false,  /*첨부파일버튼 활성화 여부*/
      allDownLoad:false,      /*첨부파일 전체 다운로드 버튼 활성화 여부*/
      downloadFlag:false,     /*다운로드 컬럼 활성화 여부*/
      deleteFlag:false,       /*삭제컬럼 활성화 여부*/
      fileToolBarFlag:false,
      btn_width:75,
      fileupload_grid:'fileupload_grid',
      Authorization:cookie.load('token')
  }
  componentWillMount(){
    if(!(this.props.title == null || this.props.title == '')){
      this.setState({title:this.props.title});
    }
    if(!(this.props.btn_width == null || this.props.btn_width == '')){
      this.setState({btn_width:this.props.btn_width});
    }
  }
  componentDidMount(){
  }
  uploadSuccess = (resp) =>{
    // const {fileupload_grid} = this.refs;
    // if(resp != null && resp.success == true){
    //     console.log(resp)
    // }
    // console.log('uploadsucess');
    //console.log(this.props);
    //console.log(resp);
    //this.props.onChange(resp);
    this.props.uploadSuccess(resp);
  }

    render(){
        const me = this;
        const options={
            baseUrl: `${API_URL}/Upload/UploadExcel`,
            fileFieldName:'files',
            requestHeaders:{'Authorization':cookie.load('token')},
            multiple:true,
            chooseAndUpload:true,
            param:{
                fid:0,
                upload_folder:this.state.upload_folder
            },
            paramAddToField : {purpose: 'save'},  /*추가데이터 입력하는 부분*/
            beforeChoose : function(){
                const {sp_corp_detail_no, sp_corp_detail_name} = me.props;
                if(sp_corp_detail_no == null || sp_corp_detail_no == '' || sp_corp_detail_no == '0'){
                  alert('SP사를 먼저 선택 해주세요.');
                  return false;
                }
            },
            chooseFile : function(files){
                //console.log('you choose',typeof files == 'string' ? files : files[0].name)
            },
            beforeUpload : function(files,mill){
                // if(typeof files == string) return true
                // if(files[0].size<1024*1024*20){
                //     files[0].mill = mill
                //     return true
                // }
                // return false
            },
            doUpload : function(files, mill){
                //this.props.doUpload(files,mill);
            },
            uploading : function(progress){
                //console.log('loading...', progress.loaded/progress.total+'%')
            },
            uploadSuccess : function(resp){
                this.props.uploadSuccess(resp);
                //console.log('upload success..!')
            },
            uploadError : function(err){
                alert(err.message)
            },
            uploadFail : function(resp){
                alert(resp)
            }
        }

        return(
            <FileUpload options={options} uploadSuccess={this.uploadSuccess.bind(this)}>
                <Button ref={'chooseAndUpload'} text={this.state.title} width={this.state.btn_width}  margin={'2 5 0 7'} hidden={this.state.chooseAndUpload} style={{'font-size': '14px','background-color':'#4783AE','border-color':'#4783AE','padding':'5px 7px 4px 7px','border-radius': '4px 4px 4px 4px'}}></Button>
            </FileUpload>
        );
    }
}

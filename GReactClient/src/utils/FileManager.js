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

export default class FileManager extends Component {
  constructor(props) {
      super(props);
      this.uploadSuccess = this.uploadSuccess.bind(this);
  }

  state = {
      ref_key: '',
      upload_folder:'DATA',   /*기본폴더*/
      chooseAndUpload:false,  /*첨부파일버튼 활성화 여부*/
      allDownLoad:false,      /*첨부파일 전체 다운로드 버튼 활성화 여부*/
      downloadFlag:false,     /*다운로드 컬럼 활성화 여부*/
      deleteFlag:false,       /*삭제컬럼 활성화 여부*/
      fileToolBarFlag:false,
      fileupload_grid:'fileupload_grid',
      Authorization:cookie.load('token')
  }
  file_store = Ext.create('Ext.data.Store', {
    fields: [
    ],
    pageSize: null,
    remoteSort : true,
    proxy: {
        type: 'ajax',
        method: 'GET',
        headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':this.state.Authorization },
        url: `${API_URL}/Upload/GetList`,
        actionMethods: {
            read: "GET"
        },
        paramsAsJson: true,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'count'
        }
    }
  });
  componentWillMount(){
    if(this.props.fileupload_grid !=null){
      this.setState({fileupload_grid:this.props.fileupload_grid});
    }
    if(this.props.upload_folder != null){
      this.setState({upload_folder:this.props.upload_folder})
    }
    if(this.props.chooseAndUpload !=null){
      this.setState({chooseAndUpload:this.props.chooseAndUpload})
    }
    if(this.props.allDownLoad !=null){
      this.setState({allDownLoad:this.props.allDownLoad})
    }
    if(this.props.downloadFlag !=null){
      this.setState({downloadFlag:this.props.downloadFlag})
    }
    if(this.props.deleteFlag !=null){
      this.setState({deleteFlag:this.props.deleteFlag})
    }
    if(this.props.ref_key != null){
         this.setState({ref_key:this.props.ref_key})
    }
    if(this.props.upload_folder != null){
         this.setState({upload_folder:this.props.upload_folder})
    }
    if(this.props.fileToolBarFlag != null){
         this.setState({fileToolBarFlag:this.props.fileToolBarFlag})
    }

    //console.log(this.props.ref_key)
    //console.log(this.props.upload_folder)
    //console.log(this.state.ref_key)
    if(this.props.ref_key != null && this.props.ref_key != '' && this.props.ref_key != '0'){
        this.fileUploadLoad();
    }
  }

  fileUploadLoad=() =>{
        const params = Ext.apply({}, {ref_key:this.props.ref_key, upload_folder:this.props.upload_folder });
        this.file_store.load({
            params:{condition:JSON.stringify(params)},
            callback: function (recs, operation, success) {
            }
        });
  }

  componentDidMount(){
  }
  onChange = (field, value) => {
    this.setState({ file: value });
  }
  uploadSuccess = (resp) =>{
    const {fileupload_grid} = this.refs;
    if(resp != null && resp.success == true){
      for(var i=0; i<resp.count; i++){
        this.file_store.add({type:'NEW',ref_key:this.state.ref_key, upload_folder:this.state.upload_folder, name:resp.data[i].fileName, size:resp.data[i].size, filee_no:resp.data[i].fileNo})
      }
    }
  }
  onDownloadHandler = (view, rowIdx, colIdx, actionItem, e, rec) =>{

  }
  onDeleteHandler = (view, rowIdx, colIdx, actionItem, e, rec) =>{
    var me = this;
    Ext.Msg.show({
        title:'확인',
        msg: '선택하신 첨부파일을 삭제 하시겠습니까?',
        buttons: Ext.Msg.YESNO,
        icon: Ext.Msg.INFO,
        fn: function (btn) {
            if (btn === 'yes') {
              console.log(rec);
              me.file_store.remove(me.file_store.getAt(rowIdx));
            }
        }
    });
  }

  render(){
    const options={
        baseUrl: `${API_URL}/Upload/Upload`,
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
            //return user.isAllowUpload
        },
        chooseFile : function(files){
            console.log('you choose',typeof files == 'string' ? files : files[0].name)
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
            console.log('loading...', progress.loaded/progress.total+'%')
        },
        uploadSuccess : function(resp){
            this.props.uploadSuccess(resp);
            console.log('upload success..!')
        },
        uploadError : function(err){
            alert(err.message)
        },
        uploadFail : function(resp){
            alert(resp)
        }
    }
    return(
      <Container
          layout={[{
              type: 'vbox',
              align: 'stretch'
          }]}
          padding="0">

      <Toolbar docked={'top'} buttonAlign={'right'} layout={[{pack: 'right'}]} hidden={this.state.fileToolBarFlag}>
          <FileUpload options={options} uploadSuccess={this.uploadSuccess.bind(this)}>
              <Button ref={'chooseAndUpload'} text={'첨부파일'} width={75}  margin={'0 5 0 0'} hidden={this.state.chooseAndUpload} style={{textAlign:'center'}}></Button>
              <Button ref={'allDownLoad'} text={'전체다운로드'} width={120} hidden={this.state.allDownLoad} style={{textAlign:'center'}}></Button>
          </FileUpload>
      </Toolbar>

      <Container
          flex={1}
          ref = {this.state.fileupload_grid}
          items={[
            {
              xtype:'grid',
              layout:'fit',
              viewConfig:{enableTextSelection:true, stripeRows:false},
              plugins:[
                  {
                      ptype: 'cellediting',
                      clicksToEdit: 1
                  },
                  'gridfilters'
              ],
              resizable: false,
              columnLines: false,
              rowLines: true,
              enableColumnHide: false,
              enableColumnMove: false,
              enableColumnResize: true,
              sealedColumns: false,
              sortableColumns: false,
              trackMouseOver: false,
              viewConfig: {
                  stripeRows: false,
                  enableTextSelection: false,
                  disableSelection: true
              },
              //tbar:[],
              // selModel: {
              //     type: 'checkboxmodel'
              // },
              store:this.file_store,
              columns: [
                  { header: '파일명', dataIndex: 'name', align:'center', width: 200 },
                  { header: '파일크기', dataIndex: 'size', align:'center', width: 100, renderer: Ext.util.Format.fileSize },
                  { header: '<img src="/assets/images/download-icon.jpg" height="20"/>',
                    hidden:this.state.downloadFlag,
                    xtype: 'actioncolumn',
                    dataIndex: '',
                    align:'center',
                    width: 60,
                    tooltip: '파일다운로드',
                    items: [
                        {
                            iconCls: 'file-uploads-image-download',
                            handler: this.onDownloadHandler
                        }
                    ]
                  },
                  { header: '<img src="/assets/images/delete-icon.png" height="20"/>',
                    hidden:this.state.deleteFlag,
                    xtype: 'actioncolumn',
                    dataIndex: '',
                    align:'center',
                    width: 60,
                    tooltip: '파일삭제',
                    items: [
                        {
                            iconCls: 'file-uploads-image-delete',
                            handler: this.onDeleteHandler
                        }
                    ]
                  }
              ]
            }
          ]}
        >
        </Container>
      </Container>
    );
  }
}

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { API_URL, CLIENT_ROOT_URL, pageSize, treeListWidth, paramsHandler, paramsPostHandler, errorHandler } from './actions/index';

import { connect } from 'react-redux';
import { Container, Button, Panel, Toolbar, TabPanel, SegmentedButton } from '@extjs/reactor/classic';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import {showConfirm, alert} from './utils/MessageUtil';
import {refreshToken} from './utils/AuthUtil';

import TopNav from './components/templates/TopNav';
import NavMenu from './components/templates/NavMenu';
import data from './components/templates/menu-data';

import {stateProvider} from './utils/RemoteStateProvider';
import RootTreeItem from './override/Overrides.list.RootTreeItem';
//import TabCloseMenu from './override/Ext.ux.TabCloseMenu';
import TabCloseMenu from './utils/Ext.ux.TabCloseMenu';

import Main from './Main';
import LoginForm from './components/login/LoginForm';
// import SettlementView from './components/settlement/SettlementView';
// import ReconfigView from './components/test/ReconfigView';
// import DragDropGridView from './components/test/DragDropGridView';
// import ServiceCorpView from './components/service-corp/ServiceCorpView';
// import SettlementTypeView from './components/settlement/SettlementTypeView';
// import MovieView from './components/movie/MovieView';

import CpCorpView from './components/cp-corp/CpCorpView';
import SpCorpView from './components/sp-corp/SpCorpView';

import MovieView from './components/movie/MovieView';
import MoviePublictionView from './components/movie/MoviePublictionView';

import CommonCodeView from './components/system/CommonCodeView';
import MenuView from './components/system/MenuView';
import UserView from './components/system/UserView';
import RoleView from './components/system/RoleView';
import RoleMenuAuthView from './components/system/RoleMenuAuthView';

import AccountingUploadView from './components/accountings/AccountingUploadView';
import MovieSalesReportView from './components/accountings/MovieSalesReportView';
import TotalSalesReportView from './components/accountings/TotalSalesReportView';
import SpCorpSalesReportView from './components/accountings/SpCorpSalesReportView';
import ReKuckSalesReportView from './components/accountings/ReKuckSalesReportView';
import PinkSalesReportView from './components/accountings/PinkSalesReportView';
import RawSalesReportView from './components/accountings/RawSalesReportView';
import CpCorpSalesReportView from './components/accountings/CpCorpSalesReportView';

import SpAnalSalesReportView from './components/accountings/SpAnalSalesReportView';
import AccountingTrendView from './components/accountings/AccountingTrendView';
import TrendMain from './TrendMain';
import CpBillingReportView from './components/accountings/CpBillingReportView';
import NkBillingReportView from './components/accountings/NkBillingReportView';
import RawBillingReportView from './components/accountings/RawBillingReportView';

import MailSendLogView from './components/system/MailSendLogView';
import InterSalesReportView from './components/accountings/InterSalesReportView';

const componentLookup = {
  main:(<Main title='메인' id='main' parentPath='' currentPath='' closable={false}/>),
  //settlementview:(<SettlementView title='매출관리' id='settlementview' closable={true} currentPath='Home>매출관리'/>),
  //servicecorpview:(<ServiceCorpView title='서비스업체관리' id='servicecorpview' closable={true} currentPath='Home>서비스업체관리'/>),
  //settlementtypeview:(<SettlementTypeView title='정산서관리' id='settlementtypeview' closable={true} currentPath='Home>정산서관리'/>),
  //movieview:(<MovieView title='영화관리' id='movieview' closable={true} currentPath='Home>영화관리'/>),
  cpcorpview:(<CpCorpView title='CP사관리' id='cpcorpview' closable={true} parentPath='업체관리' currentPath='CP사관리'/>),
  spcorpview:(<SpCorpView title='SP사관리' id='spcorpview' closable={true} parentPath='업체관리' currentPath='SP사관리'/>),

  movieview:(<MovieView title='영화정보관리' id='movieview' closable={true} parentPath='영화관리' currentPath='영화정보관리'/>),
  moviepublictionview:(<MoviePublictionView title='영화판권정보관리' id='moviepublictionview' closable={true} parentPath='영화관리' currentPath='영화판권정보관리'/>),

  accountinguploadview:(<AccountingUploadView title='정산업로드관리' id='accountinguploadview' closable={true} parentPath='매출관리' currentPath='정산업로드관리'/>),
  totalsalesreportview:(<TotalSalesReportView title='전체정산현황' id='totalsalesreportview' closable={true} parentPath='매출관리' currentPath='전체정산현황'/>),
  
  moviesalesreportview:(<MovieSalesReportView title='영화별매출현황' id='moviesalesreportview' closable={true} parentPath='매출관리' currentPath='영화별매출현황'/>),
  spcorpsalesreportview:(<SpCorpSalesReportView title='업체별매출현황' id='spcorpsalesreportview' closable={true} parentPath='매출관리' currentPath='업체별매출현황'/>),
  rekucksalesreportview:(<ReKuckSalesReportView title='리쿱현황' id='rekucksalesreportview' closable={true} parentPath='매출관리' currentPath='리쿱현황'/>),
  pinksalesreportview:(<PinkSalesReportView title='핑크무비현황' id='pinksalesreportview' closable={true} parentPath='매출관리' currentPath='핑크무비현황'/>),
  rawsalesreportview:(<RawSalesReportView title='법무법인현황' id='rawsalesreportview' closable={true} parentPath='매출관리' currentPath='법무법인현황'/>),
  cpcorpsalesreportview:(<CpCorpSalesReportView title='CP사별정산현황' id='cpcorpsalesreportview' closable={true} parentPath='매출관리' currentPath='CP사별정산현황'/>),

  spanalsalesreportview:(<SpAnalSalesReportView title='매출분석' id='spanalsalesreportview' closable={true} parentPath='매출관리' currentPath='매출분석'/>),
  accountingtrendview:(<AccountingTrendView title='추이분석' id='accountingtrendview' closable={true} parentPath='매출관리' currentPath='추이분석'/>),
  trendmain:(<TrendMain title='추이분석' id='trendmain' closable={true} parentPath='매출관리' currentPath='추이분석'/>),
  mailsendlogview:(<MailSendLogView title='정산메일이력' id='mailsendlogview' closable={true} parentPath='정산메일이력' currentPath='정산메일이력'/>),
  
  cpbillingreportview:(<CpBillingReportView title='CP사 정산서내역' id='cpcorpsalesreportview' closable={true} parentPath='정산관리' currentPath='CP사 정산서내역'/>),
  nkbillingreportview:(<NkBillingReportView title='NK정산서내역' id='nkbillingreportview' closable={true} parentPath='정산관리' currentPath='NK정산서내역'/>),
  rawbillingreportview:(<RawBillingReportView title='법무법인정산서내역' id='rawbillingreportview' closable={true} parentPath='정산관리' currentPath='법무법인정산서내역'/>),
  intersalesreportview:(<InterSalesReportView title='정산현황(해외팀)' id='intersalesreportview' closable={true} parentPath='해외팀' currentPath='정산현황'/>),

  menuview:(<MenuView title='메뉴관리' id='menuview' closable={true} parentPath='시스템관리'  currentPath='메뉴관리'/>),
  userview:(<UserView title='사용자관리' id='userview' closable={true} parentPath='시스템관리' currentPath='사용자관리'/>),
  commoncodeview:(<CommonCodeView title='공통코드관리' id='commoncodeview' closable={true} parentPath='시스템관리'  currentPath='공통코드관리'/>),
  roleview:(<RoleView title='역할관리' id='roleview' closable={true} parentPath='시스템관리' currentPath='역할관리'/>),
  rolemenuauthview:(<RoleMenuAuthView title='역할별메뉴권한' id='rolemenuauthview' closable={true} parentPath='시스템관리'  currentPath='역할별메뉴권한'/>)
}
class Layout extends Component {
  constructor(props) {
      super(props);
  }
  state = {
      showAppMenu: false,
      selectedComponent:null,
      tabs: [],
      nav_data : [],
      userInfo:[],
      authenticated:null
  }
  /*사용자 메뉴정보*/
  tree_store = new Ext.create('Ext.data.TreeStore', {
        rootVisible: true,
        root: data
  });

  nav_store = new Ext.create('Ext.data.TreeStore', {
      type: 'tree',
      autoLoad: false,
      rootVisible: true,
      proxy: {
          type: 'ajax',
          method: 'GET',
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization':cookie.load('token') },
          url: `${API_URL}/Menu/MenuTree`,
          actionMethods: {
              read: "GET"
          },
          paramsAsJson: true,
          reader: {
              type: 'json',
              transform: function (ret, a, b, c) {
                if(ret.data != null){
                  ret.expanded = true;
                  return ret.data;
                }
                else{
                  return null;
                }
              }
          },
          extraParams: {
            condition:JSON.stringify({user_id:this.state.userInfo.user_id})
          },
          listeners: {
                exception: function(proxy, response, options){
                  if(response.status == 401 && response.statusText == 'Unauthorized'){
                    var rts = refreshToken(function(status){
                        if(status=='OK'){
                          //me.setState({Authorization:cookie.load('token')});
                          //me.initPrevStoreLoad()
                          window.location.reload(true);
                        }
                        else{
                          cookie.remove('token', { path: '/' });
                          cookie.remove('user', { path: '/' });
                          window.location.href = `${CLIENT_ROOT_URL}/login`;
                        }
                    });
                  }
                  else{
                    cookie.remove('token', { path: '/' });
                    cookie.remove('user', { path: '/' });
                    window.location.href = `${CLIENT_ROOT_URL}/login`;
                  }

                  //Ext.MessageBox.alert('Error', response.status + ": " + response.statusText);
              }
          }
      }
  });

  //https://genesisui.com/demo/root/bootstrap4-ajax/views/pages/login.html
  componentWillMount(){
    if(cookie.load('token') != null){
      this.setState({ authenticated: cookie.load('token') });
    }

    if(cookie.load('user') != null){
      this.setState({ userInfo: cookie.load('user') });
    }

    const params = {user_id:this.state.authenticated};
    this.nav_store.load({
        params:{condition:JSON.stringify(params)},
        scope: this,
        callback: function (recs, operation, success) {
        }
    });
  }
  componentDidMount(){
    // const selectedComponent = componentLookup['main'];
    // if(this.state.tabs.indexOf(selectedComponent) >-1){
    //     this.tabPanel.setActiveItem(this.state.tabs.indexOf(selectedComponent))
    // }
    // else{
    //     this.setState({
    //         tabs: this.state.tabs.concat(selectedComponent)
    //     })
    //     this.tabPanel.setActiveItem(0)
    // }
  }
  toggleAppMenu = () => {
    this.setState({ showAppMenu: !this.state.showAppMenu });
  }
  onHideAppMenu = () => {
    this.setState({ showAppMenu: false });
  }
  navigate = (path, selectedComponent) => {
    this.setState({selectedComponent:selectedComponent}); /*선택된 메뉴 item정보 */
    if(this.state.selectedComponent != null & this.state.selectedComponent.children == null){
        this.setState({ showAppMenu: false });
        this.props.history.push(path);
        //console.log(this.props.history);
        this.addTab(path, selectedComponent);
    }
  }
  onCloseTab = (tab) => {
      const tabs = this.state.tabs.filter(t => t.props.id !== tab.props.id);
      this.setState({ tabs:tabs })
  }
  addTab = (path, selectedComponent) => {
      console.log('addTab');
      if(path != null){
        // if(selectedComponent == null
        //   || selectedComponent.component == ''
        //   || selectedComponent.component == '#' ){
        //       alert('메뉴준비중입니다.')
        //       return;
        //   }
        //   else{
        //     const str = '(<' + selectedComponent.component + ' id="' + selectedComponent.component + '" />)';
        //     const displayComponent = JSON.parse('{ "hello":' + str + '}');
        //     if(this.state.tabs.indexOf(displayComponent) >-1){
        //       this.tabPanel.setActiveItem(this.state.tabs.indexOf(displayComponent))
        //     }
        //     else{
        //       this.setState({
        //           tabs: this.state.tabs.concat(displayComponent)
        //       })
        //       this.tabPanel.setActiveItem(this.state.tabs.indexOf(displayComponent))
        //     }
        //   }
        var displayComponent = null;
        displayComponent = componentLookup[path.substring(1,path.length)];
        if(displayComponent == null || typeof(displayComponent) == undefined){
          alert('메뉴준비중입니다.')
          return;
        }
        // if(this.state.tabs.indexOf(displayComponent) >-1){
        //   this.tabPanel.setActiveItem(this.state.tabs.indexOf(displayComponent))
        // }
        // else{
        //   this.setState({
        //       tabs: this.state.tabs.concat(displayComponent)
        //   })
        //   this.tabPanel.setActiveItem(this.state.tabs.indexOf(displayComponent))
        // }
      }

      return false;
  }
  onLoginCheck = () => {
    //this.setState({ authenticated: cookie.load('token') });
    window.location.href = "/";
  }
  onLogOut = () => {
    cookie.remove('token', { path: '/' });
    cookie.remove('expires_in', { path: '/' });
    cookie.remove('user', { path: '/' });
    window.location.href = "/";
  }

  onNavClose = () => {
     const {westNav} = this.refs,
            w = westNav.width;
            if(w==0){
              westNav.setWidth(treeListWidth);
            }
            else{
              westNav.setWidth(0);
            }
     console.log(westNav)
  }
  onContextMenu = () => {
    alert('1');
  }
  render() {
    const navMenuDefaults = {
      onItemClick: this.navigate,
      //selection: location.pathname,
      store:this.nav_store
    }
    const { tabs, authenticated, showAppMenu } = this.state,
          { location } = this.props;
    return(
      <Panel
        layout="fit"
        scrollable={false}
        bodyPadding={0}
        border={false}>
            { (authenticated === null || authenticated === '' || typeof(authenticated) == undefined) && (
                <LoginForm
                    onLoginCheck={this.onLoginCheck}
                />
            ) }
            <Panel
              layout="border"
              bodyBorder ={false}
              bodyPadding={0}
              padding={0}
              border={false}
              frame={false}
              fullscreen={true}>

                  <Panel
                      region={'north'}
                      height={50}
                      bodyBorder ={false}
                      bodyPadding={0}
                      padding={0}
                      border={false}
                      frame={false}
                      fullscreen={true}>

                      <TopNav
                        onLogOut={this.onLogOut.bind(this)}
                        onNavClose={this.onNavClose.bind(this)}
                        />
                      {/*
                      <Button
                        text={'로그아웃'}
                        iconCls={'fa fa-sign-out'}
                        onClick={this.onLogOut.bind(this)}/>
                      */}
                  </Panel>

                  <Panel
                      ref={'westNav'}
                      region={'west'}
                      layout={[{
                          type: 'vbox',
                          align: 'stretch'
                      }]}
                      border={false}
                      scrollable={true}
                      fullscreen={true}
                      split={true}
                      width={treeListWidth}>

                      <NavMenu {...navMenuDefaults} />

                  </Panel>

                  <Panel
                      region={'center'}
                      collapsible={false}
                      layout="fit">

                      {/*TabPanel 들어간 부분(위쪽)*/}
                      <Panel
                          layout="border"
                          bodyBorder ={false}
                          bodyPadding={0}
                          padding={0}
                          border={false}
                          frame={false}
                          fullscreen={true}>

                          {/*컨텐츠 들어갈 부분*/}
                          <Panel
                              region={'center'}
                              collapsible={false}
                              //bodyPadding={' 0 7 7 7'}
                              bodyPadding={0}
                              scrollable={true}
                              layout="fit">

                              <LayoutRouter/>

                          </Panel>

                      </Panel>
                  </Panel>
            </Panel>
      </Panel>
    );
  }
}

class LayoutRouter extends Component {
  render() {
    return(
      <Switch>
        <Route exact path="/" component={Main}/>
        <Route path="/cpcorpview" component={CpCorpView}/>
        <Route path="/spcorpview" component={SpCorpView}/>
        <Route path="/movieview" component={MovieView}/>
        <Route path="/moviepublictionview" component={MoviePublictionView}/>
        <Route path="/accountinguploadview" component={AccountingUploadView}/>
        <Route path="/menuview" component={MenuView}/>
        <Route path="/userview" component={UserView}/>
        <Route path="/commoncodeview" component={CommonCodeView}/>
        <Route path="/roleview" component={RoleView}/>
        <Route path="/rolemenuauthview" component={RoleMenuAuthView}/>

        <Route path="/login" component={LoginForm}/>
      </Switch>
    );
  }
}
export default withRouter(Layout);

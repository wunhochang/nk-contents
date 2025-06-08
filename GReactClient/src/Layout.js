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
import UserEditForm from './components/login/UserEditForm';
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


import MailSendLogView from './components/system/MailSendLogView';
import NkCpBillingReportView from './components/accountings/NkCpBillingReportView';
import CpBillingReportView from './components/accountings/CpBillingReportView';
import NkBillingReportView from './components/accountings/NkBillingReportView';
import RawBillingReportView from './components/accountings/RawBillingReportView';

import InterSalesReportView from './components/accountings/InterSalesReportView';

import TelevisingRightView from './components/televising-right/TelevisingRightView';
import AccountsProfitLossView from './components/accounts-profit-loss/AccountsProfitLossView';

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

  spanalsalesreportview:(<SpAnalSalesReportView title='매출분석' id='spanalsalesreportview' closable={true} parentPath='매출관리' currentPath='매출분석'/>),
  trendmain:(<TrendMain title='추이분석' id='trendmain' closable={true} parentPath='매출관리' currentPath='추이분석'/>),


  intersalesreportview:(<InterSalesReportView title='정산현황(해외팀)' id='intersalesreportview' closable={true} parentPath='해외팀' currentPath='정산현황'/>),

  nkcpbillingreportview:(<NkCpBillingReportView title='NK/CP사 정산' id='nkcpbillingreportview' closable={true} parentPath='정산관리' currentPath='NK/CP사 정산'/>),
  cpbillingreportview:(<CpBillingReportView title='CP사 정산서상세내역' id='cpbillingreportview' closable={true} parentPath='정산관리' currentPath='CP사 정산서상세내역'/>),
  nkbillingreportview:(<NkBillingReportView title='NK정산서상세내역' id='nkbillingreportview' closable={true} parentPath='정산관리' currentPath='NK정산서상세내역'/>),
  cpcorpsalesreportview:(<CpCorpSalesReportView title='CP사별 정산현황' id='cpcorpsalesreportview' closable={true} parentPath='정산관리' currentPath='CP사별 정산현황'/>),
  rawbillingreportview:(<RawBillingReportView title='법무법인정산서내역' id='rawbillingreportview' closable={true} parentPath='정산관리' currentPath='법무법인정산서내역'/>),
  
  mailsendlogview:(<MailSendLogView title='정산메일이력' id='mailsendlogview' closable={true} parentPath='정산메일이력' currentPath='정산메일이력'/>),
  
  televisingrightview:(<TelevisingRightView title='방영권현황' id='televisingrightview' closable={true} parentPath='방영권현황' currentPath='방영권현황'/>),
  accountsprofitlossview:(<AccountsProfitLossView title='손익현황' id='accountsprofitlossview' closable={true} parentPath='손익현황' currentPath='손익현황'/>),

  menuview:(<MenuView title='메뉴관리' id='menuview' closable={true} parentPath='시스템관리'  currentPath='메뉴관리'/>),
  userview:(<UserView title='사용자관리' id='userview' closable={true} parentPath='시스템관리' currentPath='사용자관리'/>),
  commoncodeview:(<CommonCodeView title='공통코드관리' id='commoncodeview' closable={true} parentPath='시스템관리'  currentPath='공통코드관리'/>),
  roleview:(<RoleView title='역할관리' id='roleview' closable={true} parentPath='시스템관리' currentPath='역할관리'/>),
  rolemenuauthview:(<RoleMenuAuthView title='역할별메뉴권한' id='rolemenuauthview' closable={true} parentPath='시스템관리'  currentPath='역할별메뉴권한'/>)
}
var g_proxy = null;
class Layout extends Component {
  constructor(props) {
      super(props);
  }
  state = {
      showAppMenu: false,
      showUserEdit:false,
      selectedComponent:null,
      tabs: [],
      nav_data : [],
      userInfo:[],
      authenticated:cookie.load('token')
  }
  /*사용자 메뉴정보*/
  tree_store = new Ext.create('Ext.data.TreeStore', {
        rootVisible: true,
        root: data
  });
  navStoreReload = () => {
    if(cookie.load('token') != null){
      this.setState({ authenticated: cookie.load('token') });
    }
    const params = {user_id:this.state.authenticated};
    this.nav_store.proxy.setHeaders({'Content-Type': 'application/json;charset=UTF-8;','Authorization': this.state.authenticated });
    this.nav_store.load({
        params:{condition:JSON.stringify(params)},
        scope: this,
        callback: function (recs, operation, success) {
        }
    });
  }
  nav_store = new Ext.create('Ext.data.TreeStore', {
      type: 'tree',
      autoLoad: false,
      rootVisible: true,
      proxy: {
          type: 'ajax',
          method: 'GET',
          /*headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization': cookie.load('token') },*/
          headers: {'Content-Type': 'application/json;charset=UTF-8;','Authorization': this.state.authenticated },
          url: `${API_URL}/Menu/MenuTree`,
          actionMethods: {
              read: "GET"
          },
          paramsAsJson: true,
          reader: {
              type: 'json',
              transform: function (ret) {
                if(ret.data != null){
                  ret.expanded = true;
                  return ret.data;
                }
                else{
                  return null;
                }
              }
          },
          navStoreReload:this.navStoreReload,
          extraParams: {
            condition:JSON.stringify({user_id:this.state.userInfo.user_id})
          },
          listeners: {
                exception: function(proxy, response, options){
                  g_proxy = proxy;
                  if(response.status == 401 && response.statusText == 'Unauthorized'){
                    var rts = refreshToken(function(status){
                        if(status=='OK'){
                          g_proxy.navStoreReload();
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
    //console.log(this.props.history);
    // if(typeof(cookie.load('expires_date')) == 'undefined' || cookie.load('expires_date') == null){
    //   cookie.remove('token', { path: '/' });
    //   cookie.remove('user', { path: '/' });
    //   this.state.authenticated = null;
    //   return;
    // }
    // else{
    //   this.userAuthCheck();
    // }

    if(this.props.history.location.pathname == '/login'){
      this.state.authenticated = null;
      return;
    }
    if(typeof(cookie.load('token')) == 'undefined' || cookie.load('token') == null){
      cookie.remove('token', { path: '/' });
      cookie.remove('user', { path: '/' });
      this.state.authenticated = null;
      return;
    }
    else{
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
    const selectedComponent = componentLookup['main'];
    if(this.state.tabs.indexOf(selectedComponent) >-1){
        this.tabPanel.setActiveItem(this.state.tabs.indexOf(selectedComponent))
    }
    else{
        this.setState({
            tabs: this.state.tabs.concat(selectedComponent)
        })
        this.tabPanel.setActiveItem(0)
    }
  }
  // userAuthCheck = () =>{
  //   var expires_date = cookie.load('expires_date'),
  //       check_datetime = Ext.Date.format(new Date((new Date()).getTime()), 'ymdHis'),
  //       login_stdatetime = expires_date.login_stdatetime,
  //       login_eddatetime = expires_date.login_eddatetime;
  //
  //   console.log('1==>'+expires_date);
  // }

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
        this.addTab(path, selectedComponent);
    }
  }
  onCloseTab = (tab) => {
      const tabs = this.state.tabs.filter(t => t.props.id !== tab.props.id);
      this.setState({ tabs:tabs })
  }
  addTab = (path, selectedComponent) => {
      //console.log('addTab');
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
        if(this.state.tabs.indexOf(displayComponent) >-1){
          this.tabPanel.setActiveItem(this.state.tabs.indexOf(displayComponent))
        }
        else{
          this.setState({
              tabs: this.state.tabs.concat(displayComponent)
          })
          this.tabPanel.setActiveItem(this.state.tabs.indexOf(displayComponent))
        }
      }

      return false;
  }
  onLoginCheck = () => {
    // console.log(cookie.load('expires_in'));
    // console.log(cookie.load('expires_date'));
    //this.setState({ authenticated: cookie.load('token') });
    window.location.href = "/";
  }
  onUserEditCheck = () => {
    this.setState({ showUserEdit: true });
  }
  onUserEditClose = () => {
    this.setState({ showUserEdit: false });
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
     //console.log(westNav)
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
    const { tabs, authenticated, showAppMenu, showUserEdit } = this.state,
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
            { (showUserEdit === true) && (
                <UserEditForm
                    onUserEditClose={this.onUserEditClose.bind(this)}
                />
            ) }

            <Panel
              layout="border"
              bodyBorder ={false}
              bodyPadding={0}
              padding={0}
              border={false}
              frame={false}
              scrollable={false}
              fullscreen={true}>

                  <Panel
                      region={'north'}
                      height={50}
                      bodyBorder ={false}
                      bodyPadding={0}
                      padding={0}
                      border={false}
                      frame={false}
                      scrollable={false}
                      fullscreen={true}>

                      <TopNav
                        onLogOut={this.onLogOut.bind(this)}
                        onUserEditCheck={this.onUserEditCheck.bind(this)}
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

                              <TabPanel
                                   ref={tp => this.tabPanel = tp}
                                   _reactorIgnoreOrder
                                   shadow
                                   style={{ backgroundColor: 'white'}}
                                   activeTab={0}
                                   fullscreen={true}

                                  //  plugins={[{
                                  //     ptype: new TabCloseMenu
                                  //  }]}
                                  //  addEvents={[{
                                  //     "itemclick" : true
                                  //  }]}
                                  //plugins = {new TabCloseMenu}
                                  listeners={[{
                                      tabchange: function (tabPanel, newTab, oldTab, index) {
                                        //console.log('tabchange')
                                        //console.log('tabchange');
                                        //this.down('gridpanel').store.load();
                                        /*TAB변경시 새로고침처리부분*/
                                        // var item_cnt = newTab.items.length;
                                        // for(var i=0; i<item_cnt;i++){
                                        //     var grid = newTab.items.items[i].down('gridpanel');
                                        //     if(typeof(grid) != 'undefined' && grid != null){
                                        //         grid.store.load();
                                        //     }
                                        //     var tree_grid = newTab.items.items[i].down('treepanel');
                                        //     if(typeof(tree_grid) != 'undefined' && tree_grid != null){
                                        //       var tree_store = tree_grid.getStore();
                                        //       if(tree_store != null){
                                        //         tree_store.getRootNode().removeAll();
                                        //       }
                                        //     }
                                        // }

                                        var treelist = Ext.ComponentQuery.query('treelist')[0];
                                        var seletedNode = treelist.getSelection();
                                        var newSelectedNodeName = newTab.title;
                                        if (newTab.title == "메인") {
                                            treelist.setSelection(null);
                                            return;
                                        }
                                        else {
                                            treelist.getStore().getRoot().cascadeBy(function (node) {
                                                if (newSelectedNodeName == node.data.text) {
                                                    treelist.setSelection(node);
                                                    return;
                                                }
                                            });
                                        }
                                      },
                                      beforeadd: function (tabpane, component, index) {
                                        //console.log('beforeadd')
                                      },
                                      afterrender: function (panel) {
                                        //console.log('afterrender');
                                      }
                                  }]}
                                  tabBar={{
                                       height: 48,
                                       layout: {
                                           pack: 'left'
                                       },
                                       style: {
                                           paddingRight: '52px'
                                       }
                                }}>

                               { tabs.map((item,i) => {
                                  return (
                                      <Panel
                                          title={item.props.title}
                                          margin={5}
                                          key={item.props.id}
                                          closable={item.props.closable}
                                          layout={'fit'}
                                          onDestroy={this.onCloseTab.bind(this, item)}>
                                          <Panel
                                            layout="border"
                                            bodyBorder ={false}
                                            bodyPadding={0}
                                            padding={0}
                                            border={false}
                                            frame={false}
                                            fullscreen={true}
                                            >
                                            <Panel
                                              region={'north'}
                                              height={25}
                                              bodyBorder ={false}
                                              bodyPadding={0}
                                              padding={0}
                                              border={false}
                                              frame={false}
                                              fullscreen={true}>
                                                <ol className="breadcrumb">
                                                    <li className="breadcrumb-menu">
                                                        <li className="breadcrumb-item">Home / {item.props.parentPath} / <a href="#">{item.props.currentPath}</a></li>
                                                    </li>
                                                </ol>
                                            </Panel>
                                            <Panel
                                              region={'center'}
                                              collapsible={false}
                                              padding={0}
                                              layout="fit"
                                              scrollable={false}
                                              >
                                                {item}
                                            </Panel>
                                       </Panel>
                                      </Panel>
                                  );

                                })
                              }
                               </TabPanel>


                              {/*
                                <SettlementTypeView/>
                                <ServiceCorpView/>
                                <CommonCodeView/>

                                <DragDropGridView/>
                                <SettlementView/>
                                <ReconfigView/>*/}

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
      </Switch>
    );
  }
}
export default withRouter(Layout);

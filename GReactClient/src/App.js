import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom'
import reduxThunk from 'redux-thunk';
import cookie from 'react-cookie';

import Reducers from './reducers/index';

import Layout from './Layout';

const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(Reducers);

/**
 * The main application view
 */
export default function App() {
    return (
      <Provider store={store}>
        <Router>
          <Layout/>
        </Router>
      </Provider>
    )
}

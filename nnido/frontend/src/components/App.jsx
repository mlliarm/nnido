import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import Home from './home/Home';
import View from './view/View';
import Login from './accounts/Login';
import PrivateRoute from './common/PrivateRoute';
import Header from './common/Header';

import store from '../store';
import { loadUser } from '../actions/auth';

function App() {
  store.dispatch(loadUser());

  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute path="/view/:graph_id" component={View} />
          {/*
            <Route exact path="/register" component={Register} />
            Signing up is disabled until all security concerns are dealt with
          */}
          <Route exact path="/login" component={Login} />
          <Home />
        </Switch>
      </Router>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));

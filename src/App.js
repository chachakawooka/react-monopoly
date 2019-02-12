import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import logo from './logo.svg';
import './App.css';
import Board from './Components/Board';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <Board />
        </header>
      </div>
      </Provider>
    );
  }
}

export default App;

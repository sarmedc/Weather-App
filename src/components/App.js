import React, { Component } from 'react';

import '../Assets/weather.css'
import Weather from './weather.js'

class App extends Component {
  render() {
    return (
      <div className="App">        
        <Weather/>
      </div>
    );
  }
}

export default App;

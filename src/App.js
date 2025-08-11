import logo from './logo.svg';
import './App.css';
import {HashRouter as Router, Routes,Route,Navigate} from 'react-router-dom';

import AppealReciept from './components/AppealReciept.js'
import ScrutinyDetails from './components/ScrutinyDetails.js';

function App() {
  return (
    <div className="App">
	{/*<header className="App-header">
	  {/*<header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
		<h1>Welcome to React Work Space</h1>
	  </header>*/}
	
	  <Router>
		<Routes>
			<Route path='/' element={<Navigate to='/appeal' />} />
			<Route path='/appeal' element={<AppealReciept />} />
			<Route path='/scrutiny' element={<ScrutinyDetails />} />
		 </Routes>
	</Router>
	
    </div>
  );
}

export default App;

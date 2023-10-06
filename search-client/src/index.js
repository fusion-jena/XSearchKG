import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ConnectionsPage from './components/pages/ConnectionsPage';
import ResultPage from './components/pages/ResultPage';
import ResultsPage from './components/pages/ResultsPage';
import ErrorPage from './components/pages/ErrorPage';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
// strict mode causes double rendering (dev mode only)
// todo: enable for production
// <React.StrictMode>
root.render(
	<div className="App">
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/connections" element={<ConnectionsPage />} />
				<Route path="/result" element={<ResultPage />} />
				<Route path="/results" element={<ResultsPage />} />
				<Route path="*" element={<ErrorPage error="Page not found." />} />
			</Routes>
		</Router>
	</div>
);
// </React.StrictMode>

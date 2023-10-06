import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config';
import Connection from '../fragments/Connection';
import ErrorMessage from '../fragments/ErrorMessage';
import LoadingMessage from '../fragments/LoadingMessage';
import './Results.css';

const Results = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState();
	const [error, setError] = useState();
	const [connectionCount, setConnectionCount] = useState();
	const [results, setResults] = useState();
	const [resultStart, setResultStart] = useState();
	const [resultCount, setResultCount] = useState();
	const [page, setPage] = useState();
	const [connectionsPage, setConnectionsPage] = useState(false);

	useEffect(() => {
		setLoading(true);
		setError();
		setResults();

		const params = new URLSearchParams(location.search);
		setPage(params.get('page'));
		const url = `${config.api.baseUrl}/results?` + params.toString();
		fetch(url).then((response) => {
			response.json().then(json => {
				setLoading(false);
				if (response.ok) {
					setConnectionCount(json.connectionCount);
					setResults(json.results);
					setResultStart(json.resultStart);
					setResultCount(json.resultCount);
				} else {
					console.error('Failed to retrieve search results', json);
					setError(json.message);
				}
			});
		}).catch((error) => {
			console.error('Failed to retrieve search results', error);
			setLoading(false);
			setError(error.message);
		});
		setConnectionsPage(location.pathname === '/connections');
	}, [location]);

	const showConnections = () => {
		const params = new URLSearchParams(location.search);
		navigate(`/connections?` + params.toString());
		window.scrollTo(0, 0);
	}

	const detail = (result) => {
		const params = new URLSearchParams(location.search);
		params.set('iri', result.iri);
		navigate(`/result?` + params.toString());
	};

	const nextPage = () => {
		const params = new URLSearchParams(location.search);
		params.set('page', Number(page) + 1);
		navigate(`/results?` + params.toString());
		window.scrollTo(0, 0);
	}

	const previousPage = () => {
		const params = new URLSearchParams(location.search);
		params.set('page', Number(page) - 1);
		navigate(`/results?` + params.toString());
		window.scrollTo(0, 0);
	}

	return (
		<div className='Results'>
			{loading && <LoadingMessage />}
			{error && <ErrorMessage error={error} />}
			{results && (
				<div>
					{results.length === 0 && <h3>No results</h3>}
					{results.length > 0 && 
					<div>
						{!connectionsPage &&
							<div className='count'>Search considers {connectionCount} connection types <button className="link" onClick={showConnections}>Show</button></div>
						}
						<h3>{results.length === 1 ? 'Result' : 'Results'} {resultStart + 1} to {resultStart + results.length} of {resultCount}</h3>
					</div>}
					{results.map((result) => (
						<div className="result" key={result.iri} onClick={() => detail(result)} >
							<div className='connections'>
								{result.connections?.filter(connection => connection !== null).map((connection, index) => (
									<Connection key={index} target={result} connection={connection} detailed={false} />
								))}
								{result.connections.length === 0 && (
									<Connection target={result} detailed={false} />
								)}
							</div>
							<div>{result.description}</div>
						</div>
					))}
					<div className='paging'>
						{page > 0 && <button onClick={previousPage}><Icon icon="system-uicons:arrow-left" width="20" /> Previous</button>}
						{resultStart + results.length < resultCount && <button onClick={nextPage}>Next <Icon icon="system-uicons:arrow-right" width="20" /></button>}
					</div>
				</div>
			)}
		</div>
	);
};

export default Results;

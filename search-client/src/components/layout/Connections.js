import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Connections.css';
import './Results.css';
import config from '../../config/config';
import Connection from '../fragments/Connection';
import ErrorMessage from '../fragments/ErrorMessage';
import LoadingMessage from '../fragments/LoadingMessage';

const Connections = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState();
	const [error, setError] = useState();
	const [connections, setConnections] = useState();
	const [disabledConnections, setDisabledConnections] = useState();
	const [activeConnectionCount, setActiveConnectionCount] = useState();

	useEffect(() => {
		setLoading(true);
		setError();
		setConnections();

		const params = new URLSearchParams(location.search);
		const url = `${config.api.baseUrl}/connections?` + params.toString();
		fetch(url).then((response) => {
			response.json().then(json => {
				setLoading(false);
				if (response.ok) {
					setConnections(json.connections);
					const disabledConns = (params.get('disabledConnections') || '').split(',').filter(sg => sg).map(sg => Number(sg));
					setActiveConnectionCount(json.connections.length - disabledConns.length);
					setDisabledConnections(disabledConns);
				} else {
					console.error('Failed to retrieve config', json);
					setError(json.message);
				}
			});
		}).catch((error) => {
			console.error('Failed to retrieve config', error);
			setLoading(false);
			setError(error.message);
		});
	}, [location.search]);

	const isDisabled = (index) => disabledConnections.includes(index);

	const showResults = () => {
		const params = new URLSearchParams(location.search);
		navigate('/results?' + params);
	};

	const enableAllConnections = () => {
		const params = new URLSearchParams(location.search);
		params.delete('disabledConnections', disabledConnections.join(','));
		params.delete('page');
		navigate('/connections?' + params);
	};

	return (
		<div className='Connections'>
			{loading && <LoadingMessage />}
			{error && <ErrorMessage error={error} />}
			{connections && (
				<div>
					{connections.length === 0 && <div>No connections</div>}
					{connections.length > 0 && (
						<div>
							<h3>Search considers {activeConnectionCount} connection {activeConnectionCount === 1 ? 'type' : 'types'} <button className='link' onClick={showResults}>Hide</button></h3>
							{connections?.map((connection, index) => (
								<div key={index}>
									{!isDisabled(index) && (
										<Connection target={{ name: 'Result' }} connection={connection} detailed={true} index={index} connectionCount={connections.length} />
									)}
								</div>
							))}
							{disabledConnections && disabledConnections.length > 0 && (
								<div>
									<br />
									<h3>Ignored connection {disabledConnections.length === 1 ? 'type' : 'types'}</h3>
									{connections?.map((connection, index) => (
										<div key={index}>
											{isDisabled(index) && (
												<Connection target={{ name: 'Result' }} connection={connection} detailed={true} index={index} connectionCount={connections.length} />
											)}
										</div>
									))}
									<button className="link" onClick={enableAllConnections}>Consider all connection types</button>
								</div>
							)}
						</div>
					)}
				</div>
			)}
			<hr />
		</div>
	);
};

export default Connections;

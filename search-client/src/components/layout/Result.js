import { Icon } from '@iconify/react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config';
import Connection from '../fragments/Connection';
import ErrorMessage from '../fragments/ErrorMessage';
import LoadingMessage from '../fragments/LoadingMessage';
import './Result.css';

const Result = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();
	const [result, setResult] = useState();
	const resultReference = useRef();

	const close = () => {
		const params = new URLSearchParams(location.search);
		params.delete('iri');
		navigate('/results?' + params);
	}

	useEffect(() => {
		setLoading(true);
		setError(null);
		setResult(null);

		const params = new URLSearchParams(location.search);
		const url = config.api.baseUrl + '/result?' + params;
		fetch(url).then((response) => {
			response.json().then(json => {
				setLoading(false);
				if (response.ok) {
					setResult(json);
				} else {
					console.error('Failed to retrieve result', json);
					setError(json.message);
				}
			});
		}).catch((error) => {
			console.error('Failed to retrieve result', error);
			setLoading(false);
			setError(error.message);
		});
	}, [location]);

	useEffect(() => {
		document.title = [result?.name, config.page.title].join(' - ');
	}, [result]);

	useEffect(() => {
		const handleEscapeKey = (event) => {
			if (event.key === 'Escape') {
				close();
			}
		};

		const handleClickOutside = (event) => {
			if (resultReference.current && !resultReference.current.contains(event.target)) {
				close();
			}
		};

		document.addEventListener('keydown', handleEscapeKey);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleEscapeKey);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});

	return (
		<div className='Result'>
			<div className='result' ref={resultReference}>
				<Icon icon="system-uicons:close" width="40" className='close' onClick={close} aria-label="Close result" />
				{loading && <LoadingMessage />}
				{error && <ErrorMessage error={error} />}
				{result && (
					<div >
						<a href={result.iri} target="_blank" rel="noreferrer">
							<h2>{result.name}</h2>
							<div className='comment'>{result.iri}</div>
						</a>
						{result.image && (
							<div className='info'><img src={result.image} alt={result.name} /></div>
						)}
						<div className='info'>{result.description || result.type.name}</div>
						{result.link && (
							<div className='info'><strong>See also:</strong> <a href={result.link} target="_blank" rel="noreferrer">{result.link}</a></div>
						)}
						{result.connections.length > 0 && (
							<div>
								<hr />
								<h3>Connections to the keywords</h3>
								<div className='connections'>
									{result.connections?.map((connection, index) => (
										<div key={index}>
											{connection && (
												<div>
													<Connection target={result} connection={connection} detailed={true} index={index} connectionCount={result.maxConnections} />
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Result;

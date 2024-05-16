import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import config from '../../config/config';
import './Target.css';

const Target = ({ value, onChange, reference, onMenuClose }) => {
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const targetValue = params.get('target') || '';
		if (targetValue) {
			const newParams = new URLSearchParams();
			newParams.set('target', targetValue);
			const url = config.api.baseUrl + '/targets?' + newParams;
			fetch(url).then((response) => {
				response.json().then(json => {
					if (response.ok) {
						onChange(json?.[0]);
					} else {
						console.error('Failed to retrieve config', json);
					}
				});
			}).catch((error) => {
				console.error('Failed to retrieve config', error);
			});
		} else {
			if (reference.current) {
				reference.current.focus();
			}
		}
	}, [location.search, onChange, reference]);

	const targetOptions = async (inputValue) => {
		const params = new URLSearchParams();
		params.set('label', inputValue);
		const url = config.api.baseUrl + '/targets?' + params;
		return await fetch(url).then(async (response) => {
			const json = await response.json();
			if (response.ok) {
				return json;
			} else {
				console.error('Failed to retrieve config', json);
				return [];
			}
		}).catch((error) => {
			console.error('Failed to retrieve config', error);
			return [];
		});
	};

	const noOptionsMessage = (input) => input.inputValue ? 'No types' : 'Search types';

	return (
		<div className='Target'>
			<AsyncSelect
				cacheOptions
				defaultOptions
				loadOptions={targetOptions}
				noOptionsMessage={noOptionsMessage}
				placeholder="Result type"
				theme={config.select.theme}
				onChange={onChange}
				onMenuClose={onMenuClose}
				value={value}
				ref={reference}
			/>
		</div>
	);
};

export default Target;

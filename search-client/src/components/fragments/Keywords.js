import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import config from '../../config/config';
import './Keywords.css';

const Keywords = ({ value, onChange, reference }) => {
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const keywordValues = params.get('keywords') || '';
		if (keywordValues) {
			const newParams = new URLSearchParams();
			newParams.set('values', keywordValues);
			const url = config.api.baseUrl + '/keywords?' + newParams;
			fetch(url).then((response) => {
				response.json().then(json => {
					if (response.ok) {
						onChange(json);
					} else {
						console.error('Failed to retrieve config', json);
					}
				});
			}).catch((error) => {
				console.error('Failed to retrieve config', error);
			});
		}
	}, [location.search, onChange]);

	const keywordOptions = async (inputValue) => {
		if (!inputValue) {
			return [];
		}
		const params = new URLSearchParams();
		params.set('label', inputValue);
		const url = config.api.baseUrl + '/keywords?' + params;
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

	const styles = {
		multiValueLabel: (styles) => ({
			...styles,
			fontSize: '1em'
		}),
	};

	return (
		<div className='Keywords'>
			<AsyncSelect
				cacheOptions
				defaultOptions
				isMulti
				loadOptions={keywordOptions}
				noOptionsMessage={(input) => {
					if (input.inputValue === "") {
					  return <div>Type to search for keywords...</div>;
					} else {
					  return <div className="nooptions">No matching keywords</div>;
					}
				  }}
				placeholder="Keywords"
				theme={config.select.theme}
				onChange={onChange}
				styles={styles}
				value={value}
				ref={reference}
			/>
		</div>
	);
};

export default Keywords;

import { Icon } from '@iconify/react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import Keywords from '../fragments/Keywords';
import Target from '../fragments/Target';
import './SearchForm.css';

const SearchForm = () => {
	const navigate = useNavigate();
	const [target, setTarget] = useState();
	const [keywords, setKeywords] = useState([]);
	const targetReference = useRef(null);
	const keywordsReference = useRef(null);

	const search = (event) => {
		event.preventDefault();
		if (target) {
			navigate('/results?' + params());
		}
	};

	const params = () => {
		const params = new URLSearchParams();
		params.set('target', target.value);
		if (keywords?.length > 0) {
			params.set('keywords', JSON.stringify(keywords.map(keyword => keyword.value)));
		}
		return params;
	}

	const onTargetMenuClose = () => {
		if (keywordsReference.current) {
			keywordsReference.current.focus();
		}
	}

	useEffect(() => {
		const targetTitlePrefix = target?.label
		const keywordsTitlePrefix = keywords?.map(keyword => keyword.label).join(', ');
		const titlePrefix = [targetTitlePrefix, keywordsTitlePrefix].filter(text => text?.length > 0).join(': ');
		document.title = [titlePrefix, config.page.title].filter(text => text?.length > 0).join(' - ');
	}, [target, keywords]);

	return (
		<div className='SearchForm'>
			<form onSubmit={search}>
				<div className="inputContainer">
					<Target value={target} onChange={setTarget} reference={targetReference} onMenuClose={onTargetMenuClose} />
					<Keywords value={keywords} onChange={setKeywords} reference={keywordsReference} />
					<button title="Search" type="submit" disabled={!target}><Icon icon="system-uicons:search" width="20" /></button>
				</div>
			</form>
		</div>
	);
};

export default SearchForm;

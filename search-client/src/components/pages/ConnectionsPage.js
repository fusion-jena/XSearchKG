import React from 'react';
import Connections from '../layout/Connections';
import Logo from '../layout/Logo';
import Results from '../layout/Results';
import SearchForm from '../layout/SearchForm';

const SearchPage = () => {
	return (
		<div>
			<Logo />
			<SearchForm />
			<Connections />
			<Results />
		</div>
	);
};

export default SearchPage;

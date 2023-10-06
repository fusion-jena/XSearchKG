import React from 'react';
import Logo from '../layout/Logo';
import Result from '../layout/Result';
import Results from '../layout/Results';
import SearchForm from '../layout/SearchForm';

const ResultPage = () => {
	return (
		<div>
			<Logo />
			<SearchForm />
			<Result />
			<Results />
		</div>
	);
};

export default ResultPage;

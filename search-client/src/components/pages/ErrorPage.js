import React from 'react';
import ErrorMessage from '../fragments/ErrorMessage';
import Logo from '../layout/Logo';
import SearchForm from '../layout/SearchForm';

const ErrorPage = (props) => {
	return (
		<div>
			<Logo />
			<SearchForm />
			<ErrorMessage error={props.error} />
		</div>
	);
};

export default ErrorPage;

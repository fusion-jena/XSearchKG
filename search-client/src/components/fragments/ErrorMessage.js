import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = (props) => {
	return (
		<div className='ErrorMessage'>
			{props.error}
		</div>
	);
};

export default ErrorMessage;

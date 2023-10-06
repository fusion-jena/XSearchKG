import React from 'react';
import { ThreeDots } from 'react-loader-spinner'
import './LoadingMessage.css';

const LoadingMessage = () => {
	return (
		<div className='LoadingMessage'>
			<span className='label'>Loading</span>
			<ThreeDots
				height="20"
				width="20"
				radius="9"
				color="var(--text-color-2)"
			/>
		</div>
	);
};

export default LoadingMessage;

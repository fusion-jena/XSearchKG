import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import config from '../../config/config';
import './Logo.css';

const Logo = () => {
	return (
		<div className='Logo'>
			<Link to="/">
				<Icon icon="system-uicons:branch" width="22" />
				<h1>{config.page.title}</h1>
			</Link>
		</div>
	);
};

export default Logo;

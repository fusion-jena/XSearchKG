import React from 'react';
import { Link } from 'react-router-dom';
import config from '../../config/config';
import './Logo.css';

const Logo = () => {
	return (
		<div className='Logo'>
			<Link to="/">
				<h1>{config.page.title}</h1>
				{config.page.subtitle &&
					<div class="subtitle">{config.page.subtitle}</div>
				}
			</Link>
		</div>
	);
};

export default Logo;

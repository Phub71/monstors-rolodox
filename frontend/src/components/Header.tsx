import * as React from 'react';
import { Link } from 'react-router-dom';
import * as Search from './Search';
import logo from '../res/nllogo.png';

export default () => (
	<div className='flex flex-wrap mt4'>
		<div className='flex flex-wrap w-100 items-center justify-center'>
			<Link className='mw5' to='/'>
				<img src={logo} />
			</Link>
			<h1 className='f2 tc tl-m tl-l mt0 mt3-m mt3-l darkpurple'>NUGGETS</h1>
			<div className='w-50 tr'>
				<Search.Component />
			</div>
		</div>
	</div>
);

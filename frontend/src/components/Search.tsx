import * as React from 'react';

export const Component = (
	props: { term?: string } & {
		onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
		onSubmit?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
	} & React.HTMLAttributes<HTMLDivElement>,
) => (
	<input
		onSubmit={props.onSubmit}
		onChange={props.onChange}
		className={
			'gray-placeholder f2 bb no-decoration navy tr ' + props.className
		}
		type='text'
		value={props.term}
		placeholder='Search...'
	></input>
);

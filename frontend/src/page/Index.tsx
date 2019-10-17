import * as React from 'react';
import * as Nugget from '../components/Nugget';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Error from '../components/Error';
import * as Tag from '../components/Tag';
import * as CmdRequest from '../Cmd/Request'
import * as CmdMock from '../Cmd/Mock'
import Request from '../api/Request'
import Cmd from '../Cmd'
import { stat } from 'fs';

//---------------------------------------------------------------------------------
// STATE
//
export type State =
	| { type: 'LOADING', search: string }
	| { type: 'LOADED'; nuggetMetadata: Nugget.Metadata[]; tags: Tag.Content[], search: string }
	| { type: 'ERROR'; error: string };

const initialState: State = { type: 'LOADING', search: "" }

//---------------------------------------------------------------------------------
// ACTION
//
export type Action =
	| { type: 'GOT_DATA'; nuggetMetadata: Nugget.Metadata[], tags: Tag.Content[] }
	| { type: "GOT_NUGGETS", nuggetMetadata: Nugget.Metadata[] }
	| { type: 'SEARCH'; search: string }
	| { type: 'ERROR'; error: string }
	| { type: "GET_DATA", command: Cmd<Action> }
	| { type: "GET_NUGGETS", command: Cmd<Action> };


export function reducer(state = initialState, action: Action): State {
	switch (state.type) {
		case "LOADED":
			switch (action.type) {
				case 'GOT_DATA':
					return { ...state, type: 'LOADED', nuggetMetadata: action.nuggetMetadata, tags: action.tags, search: "" }
				case 'SEARCH':
					return { type: 'LOADING', search: action.search }
				case 'ERROR':
					return { type: 'ERROR', error: action.error }
				case 'GET_DATA':
					return { type: "LOADING", search: state.search }

				default:
					return initialState
			}
		case "ERROR":
			return state
		case "LOADING":
			switch (action.type) {
				case 'GOT_DATA':
					return { ...state, type: 'LOADED', nuggetMetadata: action.nuggetMetadata, tags: action.tags, search: "" }
				case 'SEARCH':
					return { type: 'LOADING', search: action.search }
				case "ERROR":
					return { type: 'ERROR', error: action.error }
				default:
					return state
			}
		default:
			return initialState
	}
}

const getNuggets =
	CmdRequest.make({
		request: Nugget.fetchTagStarsAndName,
		onSuccess: (data => ({ type: "GOT_DATA", nuggetMetadata: data, tags: [] }) as Action),
		onError: (str => ({ type: 'ERROR', error: str }) as Action)
	})

export const mockData: { nuggets: Nugget.Metadata[], tags: Tag.Content[] } =
	({
		nuggets: [
			{
				id: "0",
				title: 'How to set up my email signature',
				stars: 25,
				tags: [{ name: "Onboarding", popularity: 3000 }, { name: "Helpful", popularity: 1000 }, { name: "Tech", popularity: 2000 }]
			},
			{
				id: "1",
				title: 'How should I approach Docker and Kubernetes',
				stars: 500,
				tags: [{ name: "Onboarding", popularity: 3000 }, { name: "Tech", popularity: 2000 }]
			},
			{
				id: "2",
				title: 'How should I approach Docker and Kubernetes',
				stars: 50,
				tags: [{ name: "Onboarding", popularity: 3000 }, { name: "Tech", popularity: 2000 }]
			},
			{
				id: "3",
				title: 'How should I approach Docker and Kubernetes',
				stars: 400,
				tags: [],
			},
			{
				id: "4",
				title: 'How should I approach Docker and Kubernetes',
				stars: 5,
				tags: [],
			},
			{
				id: "5",
				title: 'How should I approach Docker and Kubernetes',
				stars: 300,
				tags: [],
			},
			{
				id: '6',
				title: 'How should I approach Docker and Kubernetes',
				stars: 25,
				tags: [],
			},
		],
		tags: [
			{ name: 'Dev', popularity: 3000 },
			{ name: 'Onboarding', popularity: 2000 },
			{ name: 'Support', popularity: 1500 },
		],
	})

const mockNuggets =
	CmdMock.make(mockData).map(data => ({ type: "GOT_DATA", nuggetMetadata: data.nuggets, tags: data.tags }) as Action)

//---------------------------------------------------------------------------------
// COMPONENT
//
const PureComponent = ({ state }: { state: State }) => {
	switch (state.type) {
		case 'LOADING':
			return (
				<div className='cf center ml7-ns'>
					<Header />
					<Spinner />
					<Footer />
				</div>
			);
		case 'LOADED':
			return (
				<div className='cf center mh7-ns mh6-m'>
					<Header />
					<h2 className='flex w-100 mh3 navy' >Popular tags</h2>
					<Tag.List tags={state.tags} />
					<div className='flex w-100 mh3 mt4-ns justify-between items-end'>
						<h2 className='f3 navy mb0'>Latest nuggets</h2>
						{/* <Link to='/article/create'>Create Article</Link> */}
					</div>
					<Nugget.List nuggets={state.nuggetMetadata} />
					
				
				</div>
			);
		case 'ERROR':
			return (
				<div className='cf center mh7-ns'>
					<Header />
					<Error error={state.error} />
					<Footer />
				</div>
			)
		default:
			return state;
	}
};

//---------------------------------------------------------------------------------
// REACT
//

export const Component = (useStateAndDispatch: () => [State, (action: Action) => any]) => () => {
	const [state, dispatch] = useStateAndDispatch()

	React.useEffect(() => {
		dispatch({
			type: "GET_DATA",
			command: mockNuggets
		})
	}, [])

	return <PureComponent state={state} />;
};



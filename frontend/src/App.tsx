import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import './style.css';
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';
import * as Card from './page/Card'
import * as Index from './page/Index'
import * as Create from './page/Create'
import Cmd from './Cmd'
import { effectMiddleware } from './Cmd'
import * as Form from './components/Form'
import { statement } from '@babel/template';

type Root = {
	index: Index.State,
	card: Card.State,
	create: Create.State
}

const rootReducer: Redux.Reducer<Root, Redux.AnyAction> = Redux.combineReducers({
	index: Index.reducer,
	card: Card.reducer,
	create: Create.reducer
});

const store = Redux.createStore(rootReducer,
	Redux.compose(
		Redux.applyMiddleware(effectMiddleware),
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()));


/**
 * Takes one of the contents in State and feeds it into the useSelector. 
 * Can be thought of as using the useSelector hook + useDispatch hook in Redux
 * 
 * For instance to access a index key:
 * 
 * const [state, dispatch] = useStateAndDispatchOf("index")
 * 
 * is the same as
 * 
 * const [state, dispatch] = [useSelector(state => state.index), useDispatch()]
 *
 * This is useful to ensure that we only feed valid states into our pages.
 * @param extractState A valid key in Root
 */
const useStateAndDispatchOf = <T, K extends keyof Root,>(extractState: K) => (): [T, Redux.Dispatch<any>] => {
	const useSelector = ReactRedux.useSelector(state => state[extractState]) as T
	const dispatch = ReactRedux.useDispatch()

	return [useSelector, dispatch]
}


const WithRouter = () => (
	<ReactRedux.Provider store={store}>
		<Router>
			<div className='center mt1 mt3-ns pr3 pl3 '>
				<Switch>
					<Route exact path='/create' component={Create.Component(useStateAndDispatchOf("create"))} />
					<Route exact path='/' component={Index.Component(useStateAndDispatchOf("index"))} />
					<Route exact path='/nugget/:id' component={Card.Component(useStateAndDispatchOf("card"))} />
				</Switch>
			</div>
		</Router>
	</ReactRedux.Provider>
);

ReactDOM.render(<WithRouter />, document.getElementById('app'));

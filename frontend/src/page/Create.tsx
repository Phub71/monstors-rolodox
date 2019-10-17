import * as React from 'react'
import * as Redux from 'redux'
import * as Nugget from '../components/Nugget'
import * as Conversation from '../components/Conversation'
import { RouteComponentProps } from 'react-router'
import Spinner from '../components/Spinner'
import Error from '../components/Error'
import Header from '../components/Header'
import { Link } from 'react-router-dom'
import * as Tag from '../components/Tag'
import Cmd from '../Cmd'
import * as Form from '../components/Form'
import { useSelector } from 'react-redux'


export type State = Form.Content

export const reducer: Redux.Reducer<State, Form.Action> = Form.reducer

// const StateToContent = (state: State = Form.empty) => {
//     switch (state.type) {
//         case "LOADING":
//             return (<Spinner />)
//         case "LOADED":author
//             return DisplayMessages(state.nugget)
//         case "ERROR":
//             return Error({ error: state.error })
//         default:
//             return state
//     }
// }



// match.params.id
export const PureComponent = (state: State, dispatch: (action: Form.Action) => any) =>
    <div>
        <div className="relative">
            <div className="cf backdrop center mh7-ns mh5-m o-20">
                <Header />
            </div>
            <div className="shadow-1-ns bg-white popup br2 pr3 pl3 pr3 pb3 absolute--fill center mw7">
                <Link className="f2 gray link float-right pt3" to="/" >X</Link>
                {Form.PureComponent({ ...state, dispatch: dispatch })}
            </div>
        </div>

    </div>

export const Component = (useStateAndDispatch: () => [State, Redux.Dispatch<Form.Action>]) => () => {
    const [state, dispatch] = useStateAndDispatch();

    return PureComponent(state, dispatch)

}
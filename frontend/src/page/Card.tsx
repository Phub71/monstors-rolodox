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
import * as CmdMock from '../Cmd/Mock'

export type State = { type: "LOADING" } | { type: "LOADED", nugget: Nugget.Content } | { type: "ERROR", error: string }


const initial: State = { type: "LOADING" }

export type Action =
    | { type: "GOT_NUGGET", nugget: Nugget.Content }
    | { type: "GOT_ERROR", error: string }
    | { type: "GET_NUGGET", command: Cmd<Action> }


export const reducer = (state: State = initial, action: Action): State => {
    switch (action.type) {
        case "GOT_NUGGET":
            return { type: "LOADED", nugget: action.nugget }
        case "GOT_ERROR":
            return { type: "ERROR", error: action.error }
        case "GET_NUGGET":
            return state
        default:
            return state
    }
}

const DisplayMessages = (nugget: Nugget.Content) =>
    <div className="flex flex-column items-center justify-around">
        <div className="w-100 navy">
            <h3 className="f3">{nugget.title}</h3>

        </div>
        <div className="w-100 inner-shadow br2 pa3-ns ma2-ns">
            <Conversation.Component list={nugget.conversation} />
        </div>
        <div className="flex w-100">
            <div>
                <Tag.List tags={nugget.tags} />
            </div>
            <div className="mt2">
                <span className="navy">{nugget.stars} 👍</span>
            </div>
        </div>
    </div>


const StateToContent = (state: State = initial) => {
    switch (state.type) {
        case "LOADING":
            return (<Spinner />)
        case "LOADED":
            return DisplayMessages(state.nugget)
        case "ERROR":
            return Error({ error: state.error })
        default:
            return state
    }
}

// match.params.id
export const PureComponent = (state: State) =>
    <div>
        <div className="relative">
            <div className="cf backdrop center mh7-ns mh5-m o-20">
                <Header />
            </div>
            <div className="shadow-1-ns bg-white popup br2 pr3 pl3 pr3 pb3 absolute--fill center mw7">
                <Link className="f2 gray link float-right pt3" to="/" >X</Link>
                {StateToContent(state)}
            </div>
        </div>

    </div>

const onKeyPress = (event: any): void => {
    // Key code 27 == Escape
    if (event.keyCode === 27)
        window.location.href = '/'
}




export const mockNuggets: Cmd<Action> =
    CmdMock.make({
        id: "0",
        title: 'How should I approach Docker and Kubernetes',
        conversation:
            [{ author: 'Marc', message: 'Hi!' }, { author: 'Örn', message: 'Hello!' }, { author: 'Marc', message: 'I have nothing important to say.' }, { author: 'Örn', message: 'Ok.' }],
        stars: 25,
        likedByUser: undefined,
        tags: [{ name: "Interesting", popularity: 3000 }, { name: "Very Helpful", popularity: 1000 }, { name: "Mindblowing", popularity: 2000 }]
    }).map(data => ({ type: "GOT_NUGGET", nugget: data }))

export const Component = (useStateAndDispatch: () => [State, Redux.Dispatch<Action>]) => ({ match }: RouteComponentProps<{ id: string }>) => {
    const [state, dispatch] = useStateAndDispatch();
    const id = +match.params.id as number | undefined

    React.useEffect(() => {
        window.addEventListener('keypress', (event) => onKeyPress(event));
        dispatch({ type: "GET_NUGGET", command: mockNuggets })
        return (() => window.removeEventListener('keypress', onKeyPress))
    }, [])

    return PureComponent(state)

}
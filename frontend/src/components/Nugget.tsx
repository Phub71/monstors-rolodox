import * as React from 'react';
import { Link } from 'react-router-dom';
// import * as Slack from '../Slack'
// import * as Tag from '../Tag'
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import * as Tag from './Tag'
import * as Conversation from './Conversation'
import Request from '../api/Request'
import { taggedTemplateExpression, TaggedTemplateExpression } from '@babel/types';

//---------------------------------------------------------------------------------
// CONTENT
//
export interface Content {
    id: string;
    title: string;
    conversation: Conversation.Content[]; //Slack.Conversation,
    stars: number;
    tags: Tag.Content[];
    likedByUser: boolean | undefined;
}

const initial: Content = {
    id: "0",
    title: 'How should I approach Docker and Kubernetes',
    conversation: [],
    stars: 25,
    likedByUser: undefined,
    tags: [{ name: "Onboarding", popularity: 3000 }, { name: "Tech", popularity: 2000 }]
};

//---------------------------------------------------------------------------------
// NUGGET
//
type Action = { type: 'CLICKED_LIKE'; id: string };

export function reducer(nugget = initial, action: Action): Content {
    switch (action.type) {
        case 'CLICKED_LIKE':
            if (nugget.likedByUser !== undefined) {
                return { ...nugget, likedByUser: !nugget.likedByUser };
            } else {
                return nugget;
            }

        default:
            return nugget;
    }
}
export type Metadata = { id: string, title: string, tags: Tag.Content[], stars: number }
const PureComponent = ({
    title,
    stars,
    tags,
}: Metadata) => (
        <article className='mw6-ns br3 mr2 ml2 hidden ba b--black-10 mv4'>
            <h1 className='f4 bg-lightgray navy br3 br--top mv0 pv2 ph3'>
                {title}
            </h1>
            <div className='pa3 flex-column bt b--black-10'>
                <div className="flex around items-center">
                    <div className="w-75">
                        <Tag.List tags={tags} />
                    </div>
                    <div className="w-25 mt2">
                        <span className="navy">{stars} 👍</span>
                    </div>
                </div>
            </div>
        </article>
    );

function mapStateToProps(state: { nugget: Content }) {
    const { nugget } = state;

    return nugget;
}

export const Component = ReactRedux.connect(mapStateToProps)(PureComponent);

//---------------------------------------------------------------------------------
// LIST
//
function displayElements(nuggets: Metadata[]) {
    return nuggets.map(nugget => (
        <li className='test darkneonpurple dim fl w-30-l w-50-m w-100' key={nugget.id}>
            <Link className="link" to={'/nugget/' + nugget.id}>
                <PureComponent
                    id={nugget.id}
                    title={nugget.title}
                    stars={nugget.stars}
                    tags={nugget.tags}
                />
            </Link>
        </li>
    ));
}

export const List = ({ nuggets }: { nuggets: Metadata[] }) => (
    <div className="vh-50 scroll fade-out-overflow">
        <ul className='list w-100 pl0 flex flex-wrap'>
            {displayElements(nuggets)}
        </ul>
    </div>
);


//---------------------------------------------------------------------------------
// QUERY
//

const formatQuery = (...info: (keyof Content)[]) =>
    info.reduce((str, item) => str + "," + item, "")


const queryFromNuggets = (...args: (keyof Content)[]): { query: string } => ({
    query: `{allNuggets{${formatQuery(...args)}}}`
})

export const fetchTagStarsAndName =
    Request.get({
        query: queryFromNuggets("title", "tags", "stars", "id"),
        decoder: (({ data }: { data?: { allNuggets?: Metadata[] } }): Metadata[] => {
            console.log(data)
            if (data && data.allNuggets) return data.allNuggets; else return undefined
        }),
        withCredentials: false
    })

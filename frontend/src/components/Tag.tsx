import * as React from 'react'

import { Link } from 'react-router-dom'
import Request from '../Api/Request'

export interface Content {
    name: string,
    popularity?: number
}

export function fromString(string: string): Content {
    return { name: string, popularity: undefined }
}


//---------------------------------------------------------------------------------
// INDEX
//
export const Component = ({ name, popularity }: Content & React.HTMLAttributes<HTMLDivElement>) =>
    <div className={"tagg f7 link dim br3 mr2 pa1 mt2"}>
        <Link className=" link o-80 near-black" to={"?search=" + name}>
            # {name}
        </Link>
    </div>

export const List = ({ tags }: { tags: Content[] }) =>
    <div className=" flex flex-wrap mr2">{tags.map((tag, id) => <Component key={id} name={tag.name} popularity={tag.popularity} />)}</div>

//---------------------------------------------------------------------------------
// CLOSE BUTTON
//
const ComponentWithCloseButton = ({ tag, onClose }: { tag: Content, onClose: (tag: Content) => any }) =>
    <div className={"tagg bg-light-gray f7 link dim br3 mr2 pa1 mt2"}>
        <a className="link o-80 near-black" onClick={() => onClose(tag)}>
            # {tag.name} x{tag.popularity}
        </a>
    </div>

const ListWithCloseButton = ({ tags, onClose }: { tags: Content[], onClose: (tag: Content) => any }) =>
    <div className=" flex flex-wrap mr2">{tags.map((tag, id) => <ComponentWithCloseButton key={id} tag={tag} onClose={onClose} />)}</div>

export const Input = ({ value, tags, onChange, onClose }: { tags: Content[], value: string, onChange: (change: string) => any, onClose: (tag: Content) => any }) =>
    <div >
        <ListWithCloseButton tags={tags} onClose={onClose} />
        <input
           
            type="text"
            value={value}
            onChange={event =>
                onChange(event.target.value)}
            name="content" />
    </div>


//---------------------------------------------------------------------------------
// QUERY TAGS
//

// Takes a Object and turns it into a query
// For instance
// {author: "J.K. Rowling", published: 1995}
// ->
// ?author=J.K. Rowling&published=1995
const formatQuery = (...info: (keyof Content)[]) =>
    info.reduce((str, item) => str + "," + item, "")


const queryTags = (...args: (keyof Content)[]): { query: string } => ({
    query: `{allTags{${formatQuery(...args)}}}`
})

export const fetchSuggestions =
    Request.get({
        query: queryTags(),
        decoder: (({ data }: { data?: { tags: { name: string, popularity: number }[] } }): Content[] => {
            console.log(data)
            if (data && data.tags) return data.tags; else return undefined
        }),
        withCredentials: false
    })

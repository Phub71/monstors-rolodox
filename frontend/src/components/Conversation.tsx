import * as React from 'react'

//---------------------------------------------------------------------------------
// CONTENT
//
export interface Content {
    author: string;
    message: string;
}

const Text = ({ content }: { content: Content }) =>
    <>
        <b>{content.author}</b>
        <br />
        <p>{content.message}</p>
    </>


//---------------------------------------------------------------------------------
// CONVERSATION BUBBLE
//
type Direction = "LEFT" | "RIGHT"

const leftBubble = ({ content }: { content: Content }) =>
    <div className="flex">
        <div className="br3 bt pa3 w-100 w-75-ns w-75-m mw6-ns bg-lightgray darkpurple">
            <Text content={content} />
        </div>
        <div className="w-25-ns w-25-m">
        </div>
    </div>

const rightBubble = ({ content }: { content: Content }) =>
    <div className="flex item-end">
        <div className="w-25-ns w-25-m">
        </div>
        <div className="br3 bt w-100 pa3 mw6-ns bg-navy white tr w-75-m w-75-ns">
            <Text content={content} />
        </div>
    </div>

const Bubble = ({ direction, content }: { direction: Direction, content: Content }) => {
    switch (direction) {
        case "LEFT":
            return leftBubble({ content })
        case "RIGHT":
            return rightBubble({ content })
        default:
            return <div></div>
    }
}

//---------------------------------------------------------------------------------
// COMPONENT
//

const swapDirection = (direction: Direction) =>
    direction === "LEFT" ? "RIGHT" : "LEFT"

export const Component = ({ list }: { list: Content[] }) => {
    const reducer = (direction: Direction, rest: Content[]): JSX.Element => {
        if (rest.length === 0)
            return (<></>)
        else {
            const head = rest[0]
            const tail = rest.slice(1)
            return (
                <>
                    <div className="mt3">
                        <Bubble direction={direction} content={head} />
                    </div>
                    {reducer(swapDirection(direction), tail)}
                </>
            );
        }
    }
    return (
        <div className="flex-column center">
            {reducer("LEFT", list)}
        </div>
    )
}
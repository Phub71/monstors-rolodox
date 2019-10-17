import * as React from 'react'
import Spinner from './Spinner'

export type State =
    | { type: "NOT_SENDING" }
    | { type: "SENDING" }
    | { type: "SUCCESS" }
    | { type: "ERROR", error: string }

export const Component =
    (props: { state: State } & { onClick: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void }) => {
        switch (props.state.type) {
            case "NOT_SENDING":
                return <input id="submitBtn" type="submit" name="create" onClick={event => { event.preventDefault(); props.onClick(event) }} />
            case "SENDING":
                return <Spinner />
            case "SUCCESS":
                return <p>Sent!</p>
            case "ERROR":
                return <p>Got error: {props.state.error}. Please try again later.</p>

        }
    }

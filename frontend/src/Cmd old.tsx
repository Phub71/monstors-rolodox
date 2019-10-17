/**
 * Cmd.tsx
 * 
 * Cmd manages ALL side effects for the application. This is useful because it separates the 
 * description of side effects to the actual effect, making reducers completely pure. 
 * 
 * To use an effect, simply add a key 'command' to your action and include the command you want executed.
 * A request command can look like this:
 * 
 * @exmaple
 * const getNuggets =
 *   Cmd.request({
 *      request: Nugget.fetchTagStarsAndName,
 *      expect: (data => ({ type: "GOT_DATA", nuggetMetadata: data, tags: [] }) as Action),
 *      onError: (str => ({ type: 'ERROR', error: str }) as Action)
 *  })
 * 
 * You can also mock effects using Cmd.mock:
 * 
 * @exmaple
 * Cmd.mock({
 *      id: "0",
 *      title: 'How should I approach Docker and Kubernetes',
 * }).map(data => ({ type: "GOT_DATA", data: data }))
 * 
 * Note the type signature Cmd<To_Dispatch>, the type parameter 'To_Dispatch' is what Redux will dispatch.
 * 
 * To add a new effect, you first need to add the effect in the Internal type, similar to how you add Actions. 
 * Afterwards you need to add a case in the methods:
 * 
 * map
 * effect
 * handleError
 * 
 * As well as a static method constructor under the section Command creators.
 * 
 * A note on SOLID principles and the design of this library:
 * Modifying the class directly might seem terrible since it is breaking the Open/Closed principles.
 * It is ultimately not a problem because you are only adding new cases to a switch case and 
 * adding a new static method. Breaking Open/Closed is bad only when you modify existing code in such a 
 * way that it will affect the other code.
 */
import * as Redux from 'redux'
import Request from './api/Request'


type Internal<T> =
    { type: "REQUEST", payload: Request<T, T> }
    | { type: "NONE" }
    | { type: "MOCK", payload: T }


class Cmd<A> {
    private internal: Internal<A>

    constructor(cmd: Internal<A>) {
        this.internal = cmd
    }

    // Helpers
    map = <B,>(mapper: (fun: A) => B): Cmd<B> => {
        switch (this.internal.type) {
            case "NONE":
                return new Cmd({ type: "NONE" })
            case "REQUEST":
                const request = this.internal.payload
                return new Cmd({ ...this.internal, payload: request.mapDecoder(mapper).mapError(mapper) })
            case "MOCK":
                return new Cmd({ ...this.internal, payload: mapper(this.internal.payload) })
        }
    }

    // Execution
    static executePromise = <A,>(cmd: Cmd<A>): Promise<A> | null => {
        switch (cmd.internal.type) {
            case "NONE":
                return null
            case "REQUEST":
                return Request.send(cmd.internal.payload)
            case "MOCK":
                return Promise.resolve(cmd.internal.payload)
        }
    }
    private static handleError = (cmd: Cmd<Redux.Action>, error: string | Error) => {
        console.log(cmd)
        switch (cmd.internal.type) {
            case "NONE":
                console.log("Got none error")
                break;
            case "REQUEST":
                if (error instanceof Error) {
                    return (cmd.internal.payload.onError(error.message))
                }
                else if (typeof error === 'string')
                    return (cmd.internal.payload.onError(error))
                else {
                    console.log('Error request:', cmd.internal.payload)
                    return (cmd.internal.payload.onError('Got a request error. Check logs for more info'))
                }
                break;
            case "MOCK":
                console.log("Got mock error")
                break;
        }
    }

    static execute = async (cmd: Cmd<Redux.Action>) => {
        try {
            console.log("Executing cmd:", cmd)
            const result = await Cmd.executePromise(cmd)
            if (result !== null) {
                console.log("Got results:", result)
                return (result)
            }
        }
        catch (error) {
            console.log('Got error', error)
            Cmd.handleError(cmd, error)
        }
    }

    // Command creators
    static none = new Cmd({ type: "NONE" })

    static request = <B, A>({ expect, onError, request }: { request: Request<B, string>, onError: (error: string) => A, expect: (payload: B) => A }): Cmd<A> =>
        new Cmd({ type: "REQUEST", payload: request.mapDecoder(expect).mapError(onError) })

    static mock = <A,>(value: A): Cmd<A> => {
        return new Cmd({ type: "MOCK", payload: value })
    }

}
export default Cmd

/**
 * effectMiddleware is a Redux middleware that listens to actions which contain an object key 'command' and executes effects.
 */
export const effectMiddleware: Redux.Middleware = (store: Redux.MiddlewareAPI<Redux.Dispatch<Redux.AnyAction>, any>) => next => async (reduxAction) => {
    if (reduxAction.command !== undefined) {
        next(reduxAction)
        const result = await Cmd.execute(reduxAction.command)
        return store.dispatch(result)
    }
    else {
        next(reduxAction)
    }
}
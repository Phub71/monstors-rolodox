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


interface Cmd<A> {
    map: <B, >(mapper: (fun: A) => B) => Cmd<B>,

    execute: () => Promise<A> | undefined,
    handleError: (error: string | Error) => A
}

export default Cmd

const batch = (cmds: Cmd<Redux.AnyAction>[]): Promise<Redux.AnyAction> | undefined => {
    const [head, ...tail] = cmds
    if (tail.length !== 0) {
        return head.execute().then(() => Promise.resolve(batch(tail)))
    } else if (head !== undefined) {
        return head.execute().catch(error => head.handleError(error))
    }
}


async function execute(cmd: Cmd<Redux.AnyAction>) {
    try {
        const result = await cmd.execute()
        return result
    } catch (error) {
        return cmd.handleError(error)
    }
}

/**
 * effectMiddleware is a Redux middleware that listens to actions which contain an object key 'command' and executes effects.
 */
export const effectMiddleware: Redux.Middleware = (store: Redux.MiddlewareAPI<Redux.Dispatch<Redux.AnyAction>, any>) => next => async (reduxAction) => {
    next(reduxAction)
    if (reduxAction.command !== undefined) {
        if (Array.isArray(reduxAction.command)) {
            console.log("Got array, ", reduxAction.command)
            const result = await batch(reduxAction.command)
            if (result !== undefined)
                return store.dispatch(result)
        }
        else {
            const result = await execute(reduxAction.command)
            if (result !== undefined)
                return store.dispatch(result)
        }
    }
}
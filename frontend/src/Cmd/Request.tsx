import Cmd from '../Cmd'
import Req from '../api/Request'

class Request<A> implements Cmd<A>  {
    value: Req<A, A>

    constructor(request: Req<A, A>) {
        this.value = request
    }

    map = <B,>(mapper: (fun: A) => B): Cmd<B> => {
        const request = this.value
        return new Request(request.mapDecoder(mapper).mapError(mapper))
    }

    execute = () => {
        return Req.send(this.value)
    }

    handleError = (error: string | Error) => {
        if (error instanceof Error) {
            return (this.value.onError(error.message))
        }
        else if (typeof error === 'string')
            return (this.value.onError(error))
        else {
            return (this.value.onError('Got a request error. Check logs for more info'))
        }
    }
}

export const make = <Value, Error, A>({ request, onSuccess, onError }: { request: Req<Value, Error>, onSuccess: (value: Value) => A, onError: (value: Error) => A }) => {
    return new Request(Req.toReduxAction(request, onSuccess, onError))
}

/**
 * Request.tsx
 * 
 * This file handles request creation, using node-fetch under the hood.
 * It assumes the backend is implemented using GraphQL.
 * 
 * The class is immutable.
 * 
 * To use, simply construct a request using the methods
 * 
 * Request.get
 * Request.post
 * 
 * This returns a new instance of a Request, to then later on send it, use the function
 * 
 * Request.send(myRequest)
 * 
 * The separation between send and creating requests is to make it easier to unit test.
 */
import fetch from 'node-fetch'
const host = "http://3.14.152.196:4000"

type Method = "GET" | "POST" | "DELETE"

class Request<Value, Error> {
    body: any | undefined
    method: Method
    decode: (result: any) => Value | undefined
    onError: (error: string) => Error
    headers: [string, string][] | []
    timeout: number | undefined
    withCredentials: boolean

    private constructor(body: any, decode: (result: any) => Value, method: Method, headers: [string, string][] | [], timeout: number | undefined, withCredentials: boolean, onError: (error: string) => Error) {
        this.body = body
        this.decode = decode
        this.headers = headers
        this.timeout = timeout
        this.method = method
        this.onError = onError
        this.withCredentials = withCredentials
    }

    mapDecoder = <B,>(mapper: (fun: Value) => B): Request<B, Error> => {
        const newDecoder = (result: any) => mapper(this.decode(result))
        return new Request(this.body, newDecoder, this.method, this.headers, this.timeout, this.withCredentials, this.onError)
    }
    mapError = <B,>(mapper: (fun: Error) => B): Request<Value, B> => {
        const newError = (result: any) => mapper(this.onError(result))
        return new Request(this.body, this.decode, this.method, this.headers, this.timeout, this.withCredentials, newError)
    }

    static toReduxAction = <Value, Error, Action>(request: Request<Value, Error>, onSuccess: (fun: Value) => Action, onError: (fun: Error) => Action): Request<Action, Action> => {
        return request.mapDecoder(onSuccess).mapError(onError)
    }

    static get = <A,>(request: {
        query: any,
        decoder: (result: any) => A | undefined,
        withCredentials: boolean
    }): Request<A, string> => {
        if (!request.withCredentials)
            return new Request(request.query, request.decoder, "GET", [["Content-Type", "application/json"], ['Accept', 'application/json'], ['Dnt', '1']], undefined, request.withCredentials, error => error)
        else
            // Todo: Fix credentials
            return new Request(request.query, request.decoder, "GET", [["Content-Type", "application/json"], ['Accept', 'application/json'], ['Dnt', '1']], undefined, request.withCredentials, error => error)
    }

    static send = <Value, Error>(request: Request<Value, Error>): Promise<Value> =>
        fetch(host, {
            // You always post with GraphQL, even in GET methods...
            method: "POST",
            body: JSON.stringify(request.body),
            headers: request.headers,
        })
            .then(response => response.json())
            .then(request.decode)
            .then(payload => new Promise((resolve, reject) => {
                if (payload === undefined)
                    reject(`parse error, decoder could not parse`)
                else
                    resolve(payload)
            }))



}

export default Request
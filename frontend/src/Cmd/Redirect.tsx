import Cmd from '../Cmd'

class Redirect<A> implements Cmd<A>  {
    value: A
    url: string

    constructor(url: string) {
        this.url = url
    }

    map = <B,>(mapper: (fun: A) => B): Cmd<B> => {
        return (new Redirect(this.url))
    }

    execute = (): undefined => {
        window.location.replace(this.url as any);
        return undefined
    }

    handleError = (error: string | Error) => {
        throw new Error("Got error redirecting")
    }
}

export const make = (url: string) => {
    return new Redirect(url)
}

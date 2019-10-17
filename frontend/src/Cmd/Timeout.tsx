import Cmd from '../Cmd'

// We delay the execution 
const delay = <T,>(time: number, value: T): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value), time)
    })
}

class Timeout<A> implements Cmd<A>  {
    value: A
    timeout: number
    constructor(value: A, timeout: number) {
        this.value = value
        this.timeout = timeout
    }

    map = <B,>(mapper: (fun: A) => B): Cmd<B> => {
        return new Timeout(mapper(this.value), this.timeout)
    }

    execute = () => {
        return delay(2000, this.value)
    }

    handleError = (error: string | Error) => {
        console.log("Got Timeout error")
        return this.value
    }

}

export const make = <A,>(timeout: number): Timeout<A> => {
    const value: undefined = undefined
    return new Timeout(undefined, timeout)
}



import Cmd from '../Cmd'

// We delay the execution for mocking
const delay = <T,>(time: number, value: T): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value), time)
    })
}

class Mock<A> implements Cmd<A>  {
    value: A
    constructor(value: A) {
        this.value = value
    }

    map = <B,>(mapper: (fun: A) => B): Cmd<B> => {
        return new Mock(mapper(this.value))
    }

    execute = () => {
        return delay(500, this.value)
    }

    handleError = (error: string | Error) => {
        console.log("Got mock error")
        return this.value
    }

}

export const make = <A,>(value: A): Mock<A> => {
    return new Mock(value)
}


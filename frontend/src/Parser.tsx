
/**
 * Helper functions for parsing
 * 
 * Limitations: Does not manage unicode properly
 */

type Mapper<A,B> = (val: A) => B;

type Binder<A,B> = (val: A) => Parser<B>;

class Parser<A> {
    parse: (convo: string) => [A, string][]
    constructor(parseFunction: (convo: string) => [A, string][]) {
        this.parse = parseFunction
    }

    bind = <B,>(binder: Binder<A,B>): Parser<B> => 
        new Parser ((convo: string) => {
            const res = this.parse(convo)
            return res.map(([val,remains]) => binder(val).parse(remains)).flat()
        })
    
    omit = <B,>(parser: Parser<B>): Parser<B> => 
        this.bind((val: A) => parser)
    

    map = <B,>(f: Mapper<A,B>, parser: Parser<A>): Parser<B> => 
        new Parser ((convo: string) => {
                const res = this.parse(convo)
                return res.map(([val,remains]) => [f(val),remains])
            })
    combine = (parser: Parser<A>): Parser<A> => 
            new Parser(convo => this.parse(convo).concat(parser.parse(convo)))
        
    option = (parser: Parser<A>): Parser<A> => 
            new Parser(convo => {
                const res = this.parse(convo)
                if (res === []) return parser.parse(convo)
                else return res
            })

    apply = <B,>(parser: Parser<(val: A) => B>): Parser<B> =>
        new Parser (convo => {
            const res1 = parser.parse(convo)
            const res2 = this.parse(convo)

            return res1.map(([f,_]) => res2.map((([a,str]) => [f(a),str]))).flat()
            
        })
    
}

const unit = <A,>(val: A): Parser<A> => 
    new Parser((convo) => [[val, convo]])

const runParser = <T,>(parser: Parser<T>) => (conversation: string) : T | undefined => {
    const [[val, str]] = parser.parse(conversation);
    if (val && str === "") return val 
    else return undefined
}

const char: Parser<string> = new Parser((convo: string) => {
    if (convo === "") {return []}
    else {
        const chomp = convo.charAt(0)
        const rest = convo.substring(1)
        return [[chomp,rest]]
    }
})

const some = <A,>(parser: Parser<A>): Parser<A[]> => {
    const some_v = 
    const many_v = some_v.option(unit([]))

}

const many = (parser: Parser<string>): Parser<string[]>

const number : Parser<number> = new Parser((convo: string) => {
    if (convo === "") {return undefined}
    else {
        const chomp = +convo.charAt(0) // Cast to number by adding +
        if (chomp === NaN) return []
        const rest = convo.substring(1)
        return [[chomp,rest]]
    }
})

type CharPredicate = (str: string) => boolean;

function satisfy(predicate: CharPredicate): Parser<string>  {
    const binder = (val: string) => 
        predicate(val) ? unit(val) : new Parser(convo => (([] as unknown) as [[string, string]]))
    return char.bind(binder)
}

function oneOf(chars : string[]): Parser<string> {
    return satisfy((str: string) => chars.some(c => c === str))
}

function isChar(char: string): Parser<string> {
    return satisfy(c => c === char)
}

function string (val: string): Parser<string> {
    if (val === "") return unit("")
    else {
        const chomp = val.charAt(0)
        const rest = val.substring(1)
        return isChar(chomp).omit(string(rest))
    }
}

const spaces: Parser<string> = isChar(" ").option(string("\n"))

function parens<A>(p: Parser<A>): Parser<A> {

    return isChar("[").omit(p).bind(result => isChar("]").omit(unit(result)))
}


const textToSmiley = (text: string): string => 
    {throw new Error("Not implemented")}


// :Hello:
const smiley: Parser<string> = 
    isChar(":")
        .omit(string("Hello"))
        .bind(result => 
            isChar(":").omit(unit(result)))


const amOrPm =
    oneOf(["P","A"]).omit(isChar("M"))

const oneOrTwoDigits = 
    number.omit(number).option(number)


// Parses [1:30 PM], [12:30 AM]
const aTime = 
    oneOrTwoDigits.omit(isChar(":")).omit(number).omit(number).omit(spaces).omit(amOrPm)

const time =
    parens(aTime)





// [Marc] OR [Mattias]
parens(string("Marc")).option(parens(string("Mattias")))

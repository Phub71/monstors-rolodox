
// type Cred = {username: string}

// type DecodeCred<T> = (cred: Cred) => T | undefined;

// export function login<T> (body: any, decoder: DecodeCred<T> ): Endpoint.Request<T> {
//     throw new Error("Not implemented")
// }

// function credHeader(cred:Cred | null): [string,string] {
//     throw new Error("Not implemented")
// }

// export function get<T> 
//     (endpoint: Endpoint.t, 
//      cred: Cred | null, 
//      decoder : Endpoint.Decode<T>): Promise<T> {
//     return Endpoint.request({
//         body : null, 
//         expect : decoder,
//         headers : [['Accept', 'application/json'], ['Content-Type', 'application/json'], credHeader(cred)],
//         method : "GET", 
//         timeout : undefined, 
//         url : endpoint, 
//         withCredentials : cred !== null
//     }) 
// }

// /**
//  * 
//  * @param endpoint Endpoint
//  * @param body Body that can be stringified
//  * @param cred Credentials or undefined if not included
//  * 
//  * Returns a status saying it was successful.
//  */
// export function post<T> 
//     (endpoint: Endpoint.t, 
//      body: any,
//      cred: Cred | undefined): Promise<string> {
//     return Endpoint.request({
//         body : JSON.stringify(body), 
//         expect : () => "Success",
//         headers : [credHeader(cred), ['Accept', 'application/json'], ['Content-Type', 'application/json']],
//         method : "POST", 
//         timeout : undefined, 
//         url : endpoint, 
//         withCredentials : cred !== null
//     }) 
// }

// /**
//  * 
//  * @param endpoint Endpoint
//  * @param body Body that can be stringified
//  * @param cred Credentials or undefined if not included
//  * 
//  * Returns a status saying it was successful.
//  */
// export function put<T> 
//     (endpoint: Endpoint.t, 
//      body: any,
//      cred: Cred | null): Promise<string> {
//     return Endpoint.request({
//         body : JSON.stringify(body), 
//         expect : () => "Success",
//         headers : [credHeader(cred), ['Accept', 'application/json'], ['Content-Type', 'application/json']],
//         method : "PUT", 
//         timeout : undefined, 
//         url : endpoint, 
//         withCredentials : cred !== null 
//     }) 
// }



// /**
//  * 
//  * @param endpoint Endpoint
//  * @param cred Credentials or undefined if not included
//  * 
//  * Returns a status saying it was successful.
//  */
// export function del<T> 
//     (endpoint: Endpoint.t, 
//      cred: Cred | null): Promise<string> {
//     return Endpoint.request({
//         body : undefined, 
//         expect : () => "Success",
//         headers : [credHeader(cred), ['Accept', 'application/json'], ['Content-Type', 'application/json']],
//         method : "DELETE", 
//         timeout : undefined, 
//         url : endpoint, 
//         withCredentials : cred !== null
//     }) 
// }
import Request from '../src/api/Request'


const ping = Request.get({ query: "", decoder: () => "success", withCredentials: false })


test("Can query server", () => {
    return Request.send(ping)
        .then(data => {
            console.log('got data', data)
            expect(data).toEqual("success")
        }).catch(e => {
            console.log(e)
            expect(true).toBe(false);
        })
})

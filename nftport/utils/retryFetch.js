const fetch = require('node-fetch')

const queue = [];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const queueFetch = (url, fetchOptions = {}, successCallback, errorCallback) => {
    queue.push({url, fetchOptions, successCallback, errorCallback})
}

const executeFetch = async () => {
    const wrapper = async () => {
        if (queue.length > 0) {
            request = queue.shift()
            try {
                const json = await retryFetch(request.url, request.fetchOptions)
                request.successCallback(json)
            } catch (err) {
                request.errorCallback(err)
            }
            await wrapper()
        }
    }
    
    await wrapper()
}

const retryFetch = async (url, fetchOptions = {}, retries = 3, retryDelay = 3000, initialDelay = 100) => {
    const wrapper = async n => {
        try {
            const res = await fetch(url, fetchOptions)
            const json = await res.json()

            if(json.error === undefined || json.error === null) {
                console.log("Successful Fetch: ", json)
                return json
            } else {
                console.warn("Warning fetch: ", json.error)
                throw `Response body has an error attribute: ${json.error}`
            }
        } catch (err) {
            if(n > 0) {
                await delay(retryDelay)
                await wrapper(n-1)
            } else {
                console.error("Error fetch: ", err)
                throw err
            }
        }
        
    }

    await delay(initialDelay)
    return await wrapper(retries)
}

module.exports = { queueFetch, executeFetch }
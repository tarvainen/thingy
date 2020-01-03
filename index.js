const http = require('http')
const url = require('url')
const fs = require('fs')

const requestHandler = (request, response) => {
  const { path } = url.parse(request.url)
  const [,key] = path.split('/')

  let value = ''

  const handle = () => {
    if (request.method === 'PUT') {
      if (!value) {
        return badRequest(response)
      }

      thingStore.set(key, value)

      return ok(response, value)
    } else if (request.method === 'DELETE') {
      const value = thingStore.get(key)

      if (!value) {
        return notFound(response)
      }

      thingStore.del(key)

      return ok(response, value)
    } else if (request.method === 'GET') {
      const value = thingStore.get(key)

      if (!value) {
        return notFound(response)
      }

      return ok(response, value)
    } else {
      return notFound(response)
    }
  }

  request.on('data', x => value += x.toString())
  request.on('end', handle)
}

const ok = (response, content) => {
  response.writeHead(200)
  response.write(content)
  response.end()
}

const notFound = (response) => {
  response.writeHead(404)
  response.end()
}

const badRequest = (response) => {
  response.writeHead(400)
  response.end()
}

const thingStore = (() => {
  let store = {}

  const set = (key, value) => {
    store[key] = value
    persist()
  }

  const del = (key) => {
    delete store[key]
    persist()
  }

  const get = (key) => store[key]

  const initialize = () => {
    try {
      store = JSON.parse(fs.readFileSync('./data.json'))
      console.log(`Initial things loaded (${Object.keys(store).length} keys)`)
    } catch (e) {
      console.error(`Failed to load initial data: ${e.message}`)
    }
  }

  let timeout
  const persist = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fs.writeFile(
      './data.json',
      JSON.stringify(store),
      () => console.log('Things persisted to file')
    ), 1000)
  }

  return { set, get, del, initialize}
})()

thingStore.initialize()

http.createServer(requestHandler).listen(8000, '0.0.0.0')

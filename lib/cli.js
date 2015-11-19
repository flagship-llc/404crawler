#!/usr/bin/env node

var Crawler = require("./index")
var URL = require("url")

var userArgs = process.argv.slice(2)
var initialURI = userArgs[0]

if (initialURI === undefined) {
  console.log("Usage: 404crawl [URI]")
  process.exit(1)
}

var url = URL.parse(initialURI)

if (url.protocol === null) {
  console.log("Please specify the protocol of the URI.")
  process.exit(1)
}

console.log(`Starting crawl from ${initialURI}.`)

var c = new Crawler(url.host, url.path, url.port)

c.on("complete", function() {
  console.log(c.stats)
})

c.start()


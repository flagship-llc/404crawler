var Simplecrawler = require("simplecrawler"),
    EventEmitter  = require("events").EventEmitter,
    util          = require("util")

var Crawler = function(host, initialPath, initialPort) {
  var crawler = this

  // Data integrity checks
  if (initialPort && isNaN(initialPort)) {
    throw new Error("Port must be a number!")
  }

  // Domain to crawl
  var host            = host || ""

  // Gotta start crawling *somewhere*
  var initialPath     = initialPath || "/"
  var initialPort     = initialPort || 80

  crawler.stats = {
    success_count: 0,
    fail_count: 0
  }

  var scrawler = new Simplecrawler(host, initialPath, initialPort, 5)
  crawler.scrawler = scrawler
  scrawler.maxConcurrency = 10
  scrawler.parseScriptTags = false
  scrawler.parseHTMLComments = false

  scrawler.on("fetchcomplete", crawler.fetchcomplete.bind(crawler))
  scrawler.on("complete", crawler.complete.bind(crawler))

  scrawler.addFetchCondition(function(parsedURL) {
    return (parsedURL.host === host)
  });
  scrawler.addFetchCondition(function(parsedURL) {
    return (!parsedURL.path.match(/\.(js|css|png|jpe?g|gif)$/))
  });

  // Run the EventEmitter constructor
  EventEmitter.call(crawler)
}

util.inherits(Crawler, EventEmitter)

/*
  Start crawling.
*/
Crawler.prototype.start = function() {
  var crawler = this
  crawler.scrawler.start()
}

Crawler.prototype.fetchcomplete = function(queueItem, responseBuffer, response) {
  var crawler = this,
      code = queueItem.stateData.code

  if (code >= 400 && code < 500) {
    console.log(`FAIL (${code}): ${queueItem.url} (referrer: ${queueItem.referrer})`)
    crawler.stats.fail_count += 1
  } else {
    console.log(`OK   (${code}): ${queueItem.url} (referrer: ${queueItem.referrer})`)
    crawler.stats.success_count += 1
  }

  crawler.emit("fetchcomplete", queueItem, responseBuffer, response)
}

Crawler.prototype.complete = function() {
  var crawler = this
  crawler.emit("complete")
}

module.exports = Crawler

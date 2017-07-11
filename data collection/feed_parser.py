# # Here's what we want:
# # 1. Grab the rss feed.
# # 2. Create a Set of at least 1000 urls from the feed. (So no duplication.)
# # 3. For each url:
# #		* let's actually start with the title: how good is the title?
# #		* get the whole text of that article
# #		* mark if it's interesting or not interesting
# # 4. In an offline data file store the key value pairs:
# #		key: the url
# #		value: Whether or not we've got the text of the article
# # 5. In a second offline data file store:
# #		key: the url
# #		value: the whole plaintext of the article
# const urls = new Set();
# const titleDict = {};
# const contentsDict = {};
# let result = null;
# let countElement = null;

# # TODO: incorporate these so we know how far to go back.
# let latestRedditId = null;
# let oldestRedditId = null;
# const REDDIT_QUERY_STUB = "https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dflair%253ANews%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall";
# let BEGINNING_YQL_URL = "https:#query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dflair%253ANews%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall\'&format=json&diagnostics=true&callback=";
# const YQL_URL_START = "https:#query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'";
# const YQL_URL_END = "\'&format=json&diagnostics=true&callback=";
# let currentYQLUrl = "https:#query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dflair%253ANews%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall\'&format=json&diagnostics=true&callback=";

# $(document).ready(function() {
    
#     countElement = document.getElementById("count");
#     runQuery();
# });

# function runQuery() {
# 	$.getJSON(currentYQLUrl, function(res) {
# 	    	# ensure that res.query.count == 25
# 	    	# for Object in res.query.results.entry, grab the title and the url
# 	    	# <span><a href="https:#medium.com/the-mission/clean-energy-powered-by-blockchains-a33c179eac3c">[link]</a></span>
# 	        verifyResultLength(res);
# 	        if (currentYQLUrl === BEGINNING_YQL_URL) {
# 	        	latestRedditId = res.query.results.entry[0].id;
# 	        }
# 	        oldestRedditId = res.query.results.entry[24].id;
# 	        addUrlsToSet(res);
# 	        console.log(urls.size);
# 	        countElement.innerHTML = "<p>"+urls.size+"</p>";
# 	        currentYQLUrl = YQL_URL_START + REDDIT_QUERY_STUB + "%26count%3D25%26after%3D" + oldestRedditId + YQL_URL_END;
#     		console.log("finished running query");
#     		if (urls.size < 100) {
#     			runQuery();
#     		}
# 	}, "jsonp");
# }

# function verifyResultLength(resultObject) {
# 	if (resultObject.query.count != 25 || 
# 		resultObject.query.count != resultObject.query.results.entry.length) {
# 		console.log("RESULT OBJECT MALFORMED");
# 		console.log(resultObject);
# 		return;
# 	}
# }

# function addUrlsToSet(resultObject) {
# 	const entries = resultObject.query.results.entry;
# 	const count = resultObject.query.count;
# 	for (let i=0; i < count; i++) {
# 		const entry = entries[i];
# 		getUrl(entry.content, entry.title);
# 	}
# }

# function addUrlToSet(url, title) {
# 	if (!urls.has(url)) {
# 		urls.add(url);
# 		titleDict[url] = title;
# 	}
# }

# function getUrl(content, title) {
# 	if (content.type != "html") {
# 		console.log("ENTRY CONTENT NOT OF HTML TYPE");
# 		return;
# 	}
# 	const contentString = content.content;
# 	const el = document.createElement( 'html' );
# 	el.innerHTML = contentString;
# 	const spans = el.getElementsByTagName( 'span' );
# 	let linkSpans = [];
# 	for (let i=0; i < spans.length; i++) {
# 		const span = spans[i];
# 		if (span.outerText == "[link]") {
# 			linkSpans.push(span);
# 		}
# 	}
# 	if (linkSpans.length > 1) {
# 		console.log("THERE IS MORE THAN ONE [link] IN THIS POST?? " + title);
# 		return;
# 	}
# 	const links = linkSpans[0].getElementsByTagName('a');
# 	if (links.length > 1) {
# 		console.log("THERE IS MORE THAN ONE LINK IN THIS SPAN??? " + title);
# 	}
# 	addUrlToSet(links[0].href, title);
# }

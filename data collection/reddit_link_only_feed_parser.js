// Here's what we want:
// 1. Grab the rss feed.
// 2. Create a Set of at least 1000 urls from the feed. (So no duplication.)
// 3. For each url:
//		* let's actually start with the title: how good is the title?
//		* get the whole text of that article
//		* mark if it's interesting or not interesting
// 4. In an offline data file store the key value pairs:
//		key: the url
//		value: Whether or not we've got the text of the article
// 5. In a second offline data file store:
//		key: the url
//		value: the whole plaintext of the article

const TOTAL_DATA_COUNT = 1000;

const BEGINNING_YQL_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dflair%253ANews%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall\'&format=json&diagnostics=true&callback=";
const REDDIT_QUERY_STUB = "https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dflair%253ANews%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall";
const YQL_URL_START = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'";
const YQL_URL_END = "\'&format=json&diagnostics=true&callback=";
let currentYQLUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dflair%253ANews%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall\'&format=json&diagnostics=true&callback=";

// const BEGINNING_YQL_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dself%253Ano%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall\'&format=json&diagnostics=true&callback=";
// const REDDIT_QUERY_STUB = "https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dself%253Ano%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall";
// const YQL_URL_START = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'";
// const YQL_URL_END = "\'&format=json&diagnostics=&callback=";
// let currentYQLUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FCryptoCurrency%2Fsearch.rss%3Fq%3Dself%253Ano%26restrict_sr%3Don%26sort%3Dnew%26t%3Dall\'&format=json&diagnostics=true&callback=";

const urls = new Set();
const titleDict = {};
const contentsDict = {};

let countElement = null;
let latestRedditId = null;
let oldestRedditId = null;
let result = null;
let textFile = null;

$(document).ready(function() {
    countElement = document.getElementById("count");
    runQuery();
});

function runQuery() {
	$.getJSON(currentYQLUrl, function(res) {
	    	// ensure that res.query.count == 25
	    	// for Object in res.query.results.entry, grab the title and the url
	    	// <span><a href="https://medium.com/the-mission/clean-energy-powered-by-blockchains-a33c179eac3c">[link]</a></span>
	        const length = verifyResultLength(res);
	        if (length > 0) {
	        	if (currentYQLUrl === BEGINNING_YQL_URL) {
		        	latestRedditId = res.query.results.entry[0].id;
		        }
		        oldestRedditId = res.query.results.entry[length - 1].id;
		        addUrlsToSet(res);
		        console.log(urls.size);
		        countElement.innerHTML = "<p>"+urls.size+"</p>";
		        currentYQLUrl = YQL_URL_START + REDDIT_QUERY_STUB + "%26count%3D25%26after%3D" + oldestRedditId + YQL_URL_END;
    		}
    		console.log("finished running query");
    		if (urls.size < TOTAL_DATA_COUNT && length > 0) {
    			runQuery();
    		} else {
    			convertAllObjectsToCSVs();
    		}
	}, "jsonp");
}

function convertAllObjectsToCSVs() {
	const titleElement = document.getElementById("download-title-dict");
	const urlsElement = document.getElementById("download-url-set");
	titleElement.innerHTML = "<a href='#' onclick='downloadCSV({ filename: \"url_to_title.csv\", data: titleDict, headerRow: \"Url\\tPost title\" });'>Download mapping of urls to post titles</a>";
	urlsElement.innerHTML = "<a href='#' onclick='downloadText({ filename: \"url_list.txt\", inputData: urls });'>Download list of urls found</a>";
}

function verifyResultLength(resultObject) {
	if (resultObject.query.count == 0 || 
		resultObject.query.count != resultObject.query.results.entry.length) {
		console.log("RESULT OBJECT MALFORMED");
		console.log(resultObject);
		return 0;
	} else {
		return resultObject.query.count;
	}
}

function addUrlsToSet(resultObject) {
	const entries = resultObject.query.results.entry;
	const count = resultObject.query.count;
	for (let i=0; i < count; i++) {
		const entry = entries[i];
		getUrl(entry.content, entry.title);
	}
}

function addUrlToSet(url, title) {
	if (!urls.has(url)) {
		urls.add(url);
		titleDict[url] = title;
	}
}

function getUrl(content, title) {
	if (content.type != "html") {
		console.log("ENTRY CONTENT NOT OF HTML TYPE");
		return;
	}
	const contentString = content.content;
	const el = document.createElement( 'html' );
	el.innerHTML = contentString;
	const spans = el.getElementsByTagName( 'span' );
	let linkSpans = [];
	for (let i=0; i < spans.length; i++) {
		const span = spans[i];
		if (span.outerText == "[link]") {
			linkSpans.push(span);
		}
	}
	if (linkSpans.length == 0 || linkSpans.length > 1) {
		console.log("There isn't only one link in this post. " + title);
		return;
	}
	const links = linkSpans[0].getElementsByTagName('a');
	if (links.length > 1) {
		console.log("There is more than one link in this span. " + title);
		return;
	}
	addUrlToSet(links[0].href, title);
}

function convertToPlainText(set) {
	let result = '';
	const LINE_DELIMITER = '\n';
	for (let item of set) {
		result = result + item + LINE_DELIMITER;
	}
	console.log("SET IS: ");
	console.log(result);
	return result;
}

function convertToCSV(headerRow, dictionary) {
	LINE_DELIMITER = '\n';
	COLUMN_DELIMITER = '\t';
	let result = headerRow + LINE_DELIMITER;

	if (dictionary.constructor == Object) {
		const keys = Object.keys(dictionary);
		for (var i=0; i < keys.length; i++) {
			const key = keys[i];
			result += key + COLUMN_DELIMITER + dictionary[key] + LINE_DELIMITER;
		}
	}
	if (dictionary.constructor == Set) {
		for (let item of dictionary) {
			result = result + item + COLUMN_DELIMITER + LINE_DELIMITER;
		}
	}
	return result;
}

function downloadCSV(args) {  
    var csv = convertToCSV(args.headerRow, args.data);
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}

function downloadText(args) {
    var data = new Blob([convertToPlainText(args.inputData)], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    link = document.createElement('a');
    link.setAttribute('href', textFile);
    link.setAttribute('download', args.filename);
    link.click();
}

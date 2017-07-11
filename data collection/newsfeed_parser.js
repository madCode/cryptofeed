// 20
COINDESK_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'http%3A%2F%2Fwww.coindesk.com%2Ffeed%2F\'&format=json&diagnostics=true&callback=";

// 50
CRYPTSCOUT_URL = "http://cryptscout.com/cryptocurrency-news-rss.php";

// reddit feed: Blockchain Healthcare
REDDIT_FEED_BLOCKCHAIN_HEALTHCARE = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'https%3A%2F%2Fwww.reddit.com%2Fr%2FBlockchain_Healthcare%2Fsearch.rss%3Fq%3Dself%253Ano%26restrict_sr%3Don\'&format=json&diagnostics=true&callback="

// 500 - maybe 1000?
BITZNEWS_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'http%3A%2F%2Fwww.bitnewz.net%2Frss%2FFeed%2F855\'&format=json&diagnostics=true&callback="

const TOTAL_DATA_COUNT = 1000;

const urls = new Set();
const titleDict = {};
const contentsDict = {};

let countElement = null;
let result = null;
let textFile = null;

$(document).ready(function() {
    countElement = document.getElementById("count");
    runQuery();
});

function runQuery() {
	$.getJSON(BITZNEWS_URL, function(res) {
	        const length = verifyResultLength(res);
	        if (length > 0) {
		        addUrlsToSet(res);
		        console.log(urls.size);
		        countElement.innerHTML = "<p>"+urls.size+"</p>";
    		}
    		console.log("finished running query");
			convertAllObjectsToCSVs();
	}, "jsonp");
}

function convertAllObjectsToCSVs() {
	const titleElement = document.getElementById("download-title-dict");
	const contentElement = document.getElementById("download-content-dict");
	const urlsElement = document.getElementById("download-url-set");
	titleElement.innerHTML = "<a href='#' onclick='downloadCSV({ filename: \"bitznews_url_to_title.csv\", data: titleDict, headerRow: \"Url\\tArticle title\" });'>Download mapping of urls to post titles</a>";
	contentElement.innerHTML = "<a href='#' onclick='downloadCSV({ filename: \"bitznews_url_to_content.csv\", data: contentsDict, headerRow: \"Url\\tArticle description\" });'>Download mapping of urls to descriptions</a>";
	urlsElement.innerHTML = "<a href='#' onclick='downloadText({ filename: \"bitznews_url_list.txt\", inputData: urls });'>Download list of urls found</a>";
}

function verifyResultLength(resultObject) {
	if (resultObject.query.count == 0 || 
		resultObject.query.count != resultObject.query.results.item.length) {
		console.log("RESULT OBJECT MALFORMED");
		console.log(resultObject);
		return 0;
	} else {
		return resultObject.query.count;
	}
}

function addUrlsToSet(resultObject) {
	const entries = resultObject.query.results.item;
	const count = resultObject.query.count;
	for (let i=0; i < count; i++) {
		const entry = entries[i];
		setUrlDicts(entry.link, entry.title, entry.description);
	}
}

function setUrlDicts(url, title, description) {
	if (!urls.has(url)) {
		urls.add(url);
		titleDict[url] = title;
		contentsDict[url] = description;
	}
}

function convertToPlainText(set) {
	let result = '';
	const LINE_DELIMITER = '\n';
	set.forEach(function(value) {
  		result = result + value + LINE_DELIMITER
	});
	console.log("SET IS: ");
	console.log(result);
	return result;
}

function convertToCSV(headerRow, dictionary) {
	LINE_DELIMITER = '\n';
	COLUMN_DELIMITER = '\t';
	let result = headerRow + LINE_DELIMITER;
	const keys = Object.keys(dictionary);

	for (var i=0; i < keys.length; i++) {
		const key = keys[i];
		result += key + COLUMN_DELIMITER + dictionary[key] + LINE_DELIMITER;
	}
	console.log(result);
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

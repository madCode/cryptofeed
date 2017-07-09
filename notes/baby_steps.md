# Proposed First Steps
1. Get an rss feed of 1 crypto subreddit
    * https://www.reddit.com/r/CryptoCurrency/search.rss?q=flair%3ANews&restrict_sr=on&sort=new&t=all
2. Get all the articles' titles.
    * https://www.raymondcamden.com/2015/12/08/parsing-rss-feeds-in-javascript-options
3. Classify which articles I want and which I don't want.
4. Can I make a classifier which will, given an article title, detect whether or not it's interesting to me?
    * https://www.quora.com/What-are-the-best-machine-learning-techniques-for-text-classification
    * http://machinelearningmastery.com/machine-learning-in-python-step-by-step/
    * http://www.python-course.eu/text_classification_python.php
    * http://nmis.isti.cnr.it/sebastiani/Publications/ASAI99.pdf

Questions to ask here:
* How good is a classifier with just the title of the article? (Given that I read the entire article in order to determine whether or not it's interesting.)
* If it's less than 95% accurate, let's see how good it is with just the first paragraph.
* If that's less than 95% accurate, let's see how good it is with the entire article.
    

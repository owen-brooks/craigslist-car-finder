from app import app
from flask import render_template, request
import sys

from scraper.CarScraper import findPosts
from scraper.URLScraper import scrapeCarLinks


@app.before_first_request
def findURLs():
    global urlDict
    urlDict = scrapeCarLinks()


@app.route('/')
def home():
    return render_template('search.html')


@app.route('/results', methods=['GET', 'POST'])
def search_request():
    searchTerm = request.form['input']
    if (searchTerm == ''):
        return render_template('search.html')
    searchTerm.replace('', '+')
    searchURL = '/search/cta?query='
    results = findPosts({}, urlDict, searchURL, searchTerm)
    print(results)
    return render_template('search.html')

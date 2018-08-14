import json
import urllib.request
from bs4 import BeautifulSoup
baseURL = 'https://baltimore.craigslist.org/'
searchURL = 'search/cta?query='
searchTerm = 'samurai'

request = urllib.request.Request(baseURL + searchURL + searchTerm)
response = urllib.request.urlopen(request)
page = BeautifulSoup(response.read().decode('utf-8'), 'html.parser')


def findAllLinks(baseURL, searchURL, searchTerm):
    # Find all possible links for a region and search term
    # ex) findAllLinks('https://baltimore.craigslist.org', '/search/cta?query=', 'honda')
    #   RETURNS: links to 5 pages of results
    links = [baseURL + searchURL + searchTerm]
    request = urllib.request.Request(baseURL + searchURL + searchTerm)
    response = urllib.request.urlopen(request)
    page = BeautifulSoup(response.read().decode('utf-8'), 'html.parser')
    nextPage = page.find('a', {'class': 'button next'})['href']
    while (nextPage != ''):
        links.append(baseURL + nextPage)
        request = urllib.request.Request(baseURL + nextPage)
        response = urllib.request.urlopen(request)
        page = BeautifulSoup(response.read().decode('utf-8'), 'html.parser')
        nextPage = page.find('a', {'class': 'button next'})['href']
    return links


# print(findAllLinks(baseURL, searchURL, searchTerm))


def findPosts(hashTable, baseURLDict, searchURL, searchTerm):
    # Takes region URLS, finds posts on all pages, and stores in hashtable
    # Key = Post ID
    for state in baseURLDict.keys():
        print('State : ' + state)
        for url in baseURLDict[state]:
            nextPage = searchURL + searchTerm
            while (nextPage != ''):
                print(url + nextPage)
                request = urllib.request.Request(url + nextPage)
                response = urllib.request.urlopen(request)
                page = BeautifulSoup(
                    response.read().decode('utf-8'), 'html.parser')
                posts = page.find_all('li', {'class': 'result-row'})
                for car in posts:
                    carData = {}
                    postID = car.find(
                        'a', {'class': 'result-title hdrlnk'})['data-id']
                    carData['Name'] = car.find(
                        'a', {'class': 'result-title hdrlnk'}).text
                    carData['Link'] = car.find(
                        'a', {'class': 'result-title hdrlnk'})['href']
                    carData['State'] = state
                    # Some posts dont have prices
                    try:
                        carData['Price'] = car.find(
                            'span', {'class': 'result-price'}).text
                    except:
                        carData['Price'] = ''
                    hashTable[postID] = carData
                nextPage = page.find('a', {'class': 'button next'})['href']
    return hashTable


#print(findPosts({}, {'MD': [baseURL]}, searchURL, searchTerm))
print(findPosts({}, {'Ohio': ['https://akroncanton.craigslist.org/',
                              'https://ashtabula.craigslist.org/', 'https://zanesville.craigslist.org/']}, searchURL, searchTerm))

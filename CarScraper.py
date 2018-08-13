import json
import urllib.request
from bs4 import BeautifulSoup
baseURL = 'https://baltimore.craigslist.org'
searchURL = '/search/cta?query='
searchTerm = 'samurai'

request = urllib.request.Request(baseURL + searchURL + searchTerm)
response = urllib.request.urlopen(request)
page = BeautifulSoup(response.read().decode('utf-8'), 'html.parser')


def findAllLinks(baseURL, baseSearch):
    links = []
    request = urllib.request.Request(baseURL + baseSearch)
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


#print(findAllLinks(baseURL, searchURL + searchTerm))

posts = page.find_all('li', {'class': 'result-row'})
data = []

for car in posts:
    carData = {}
    carData['Name'] = car.find('a', {'class': 'result-title hdrlnk'}).text
    carData['Link'] = car.find('a', {'class': 'result-title hdrlnk'})['href']
    try:
        carData['Price'] = car.find('span', {'class': 'result-price'}).text
    except:
        carData['Price'] = ''
    data.append(carData)

print(data)

import json
import urllib.request
from bs4 import BeautifulSoup

cityURL = 'https://www.craigslist.org/about/sites'
request = urllib.request.Request(cityURL)
response = urllib.request.urlopen(request)


page = BeautifulSoup(response.read().decode('utf-8'), "html.parser")
USSection = page.find("div", {"class": "colmask"})


def listStates():
    stateList = []
    for i in range(0, 51):
        state = USSection.find_all("h4")[i].text
        stateList.append(state)
    return stateList


def scrapeCarLinks():
    # Find US craigslist links
    # Returns: dict of states and links

    data = {}
    # Remove territories
    stateList = USSection.find_all("h4")[:-1]

    for idx, state in enumerate(stateList):
        regionHTML = USSection.find_all("ul")[idx].find_all("a")
        regionList = []
        for ii in regionHTML:
            regionList.append(ii['href'].split('.org')[0] + '.org')
        data[state.text] = regionList
    return data


print(scrapeCarLinks())

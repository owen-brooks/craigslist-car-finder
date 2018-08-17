import json
import urllib.request
from bs4 import BeautifulSoup
baseURL = 'https://baltimore.craigslist.org'
searchURL = '/search/cta?query='
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
                    carRequest = urllib.request.Request(carData['Link'])
                    carResponse = urllib.request.urlopen(request)
                    carPage = BeautifulSoup(
                        response.read().decode('utf-8'), 'html.parser')
                    carData['Photo'] = carPage.find(
                        'a', {'title': '1'})['href']
                    carData['State'] = state
                    # Some posts dont have prices
                    try:
                        carData['Price'] = car.find(
                            'span', {'class': 'result-price'}).text
                    except:
                        carData['Price'] = ''
                    hashTable[postID] = carData
                try:
                    nextPage = page.find('a', {'class': 'button next'})['href']
                except:
                    nextPage = ''
    return hashTable


#print(findPosts({}, {'MD': [baseURL]}, searchURL, searchTerm))
# print(findPosts({}, {'Alabama': ['https://auburn.craigslist.org', 'https://bham.craigslist.org', 'https://dothan.craigslist.org', 'https://shoals.craigslist.org', 'https://gadsden.craigslist.org', 'https://huntsville.craigslist.org', 'https://mobile.craigslist.org', 'https://montgomery.craigslist.org', 'https://tuscaloosa.craigslist.org'], 'Alaska': ['https://anchorage.craigslist.org', 'https://fairbanks.craigslist.org', 'https://kenai.craigslist.org', 'https://juneau.craigslist.org'], 'Arizona': ['https://flagstaff.craigslist.org', 'https://mohave.craigslist.org', 'https://phoenix.craigslist.org', 'https://prescott.craigslist.org', 'https://showlow.craigslist.org', 'https://sierravista.craigslist.org', 'https://tucson.craigslist.org', 'https://yuma.craigslist.org'], 'Arkansas': ['https://fayar.craigslist.org', 'https://fortsmith.craigslist.org', 'https://jonesboro.craigslist.org', 'https://littlerock.craigslist.org', 'https://texarkana.craigslist.org'], 'California': ['https://bakersfield.craigslist.org', 'https://chico.craigslist.org', 'https://fresno.craigslist.org', 'https://goldcountry.craigslist.org', 'https://hanford.craigslist.org', 'https://humboldt.craigslist.org', 'https://imperial.craigslist.org', 'https://inlandempire.craigslist.org', 'https://losangeles.craigslist.org', 'https://mendocino.craigslist.org', 'https://merced.craigslist.org', 'https://modesto.craigslist.org', 'https://monterey.craigslist.org', 'https://orangecounty.craigslist.org', 'https://palmsprings.craigslist.org', 'https://redding.craigslist.org', 'https://sacramento.craigslist.org', 'https://sandiego.craigslist.org', 'https://sfbay.craigslist.org', 'https://slo.craigslist.org', 'https://santabarbara.craigslist.org', 'https://santamaria.craigslist.org', 'https://siskiyou.craigslist.org', 'https://stockton.craigslist.org', 'https://susanville.craigslist.org', 'https://ventura.craigslist.org', 'https://visalia.craigslist.org', 'https://yubasutter.craigslist.org'], 'Colorado': ['https://boulder.craigslist.org', 'https://cosprings.craigslist.org', 'https://denver.craigslist.org', 'https://eastco.craigslist.org', 'https://fortcollins.craigslist.org', 'https://rockies.craigslist.org', 'https://pueblo.craigslist.org', 'https://westslope.craigslist.org'], 'Connecticut': ['https://newlondon.craigslist.org',
#                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             'https://hartford.craigslist.org', 'https://newhaven.craigslist.org', 'https://nwct.craigslist.org'], 'Delaware': ['https://delaware.craigslist.org'], 'District of Columbia': ['https://washingtondc.craigslist.org'], 'Florida': ['http://miami.craigslist.org', 'https://daytona.craigslist.org', 'https://keys.craigslist.org', 'https://fortlauderdale.craigslist.org', 'https://fortmyers.craigslist.org', 'https://gainesville.craigslist.org', 'https://cfl.craigslist.org', 'https://jacksonville.craigslist.org', 'https://lakeland.craigslist.org', 'http://miami.craigslist.org', 'https://lakecity.craigslist.org', 'https://ocala.craigslist.org', 'https://okaloosa.craigslist.org', 'https://orlando.craigslist.org', 'https://panamacity.craigslist.org', 'https://pensacola.craigslist.org', 'https://sarasota.craigslist.org', 'https://miami.craigslist.org', 'https://spacecoast.craigslist.org', 'https://staugustine.craigslist.org', 'https://tallahassee.craigslist.org', 'https://tampa.craigslist.org', 'https://treasure.craigslist.org', 'http://miami.craigslist.org'], 'Georgia': ['https://albanyga.craigslist.org', 'https://athensga.craigslist.org', 'https://atlanta.craigslist.org', 'https://augusta.craigslist.org', 'https://brunswick.craigslist.org', 'https://columbusga.craigslist.org', 'https://macon.craigslist.org', 'https://nwga.craigslist.org', 'https://savannah.craigslist.org', 'https://statesboro.craigslist.org', 'https://valdosta.craigslist.org'], 'Hawaii': ['https://honolulu.craigslist.org'], 'Idaho': ['https://boise.craigslist.org', 'https://eastidaho.craigslist.org', 'https://lewiston.craigslist.org', 'https://twinfalls.craigslist.org'], 'Illinois': ['https://bn.craigslist.org', 'https://chambana.craigslist.org', 'https://chicago.craigslist.org', 'https://decatur.craigslist.org', 'https://lasalle.craigslist.org', 'https://mattoon.craigslist.org', 'https://peoria.craigslist.org', 'https://rockford.craigslist.org', 'https://carbondale.craigslist.org', 'https://springfieldil.craigslist.org', 'https://quincy.craigslist.org'], 'Indiana': ['https://bloomington.craigslist.org', 'https://evansville.craigslist.org', 'https://fortwayne.craigslist.org', 'https://indianapolis.craigslist.org', 'https://kokomo.craigslist.org', 'https://tippecanoe.craigslist.org', 'https://muncie.craigslist.org', 'https://richmondin.craigslist.org', 'https://southbend.craigslist.org', 'https://terrehaute.craigslist.org'], 'Iowa': ['https://ames.craigslist.org', 'https://cedarrapids.craigslist.org', 'https://desmoines.craigslist.org', 'https://dubuque.craigslist.org', 'https://fortdodge.craigslist.org', 'https://iowacity.craigslist.org', 'https://masoncity.craigslist.org', 'https://quadcities.craigslist.org', 'https://siouxcity.craigslist.org', 'https://ottumwa.craigslist.org', 'https://waterloo.craigslist.org'], 'Kansas': ['https://lawrence.craigslist.org', 'https://ksu.craigslist.org', 'https://nwks.craigslist.org', 'https://salina.craigslist.org', 'https://seks.craigslist.org',
#                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           'https://swks.craigslist.org', 'https://topeka.craigslist.org', 'https://wichita.craigslist.org'], 'Kentucky': ['https://bgky.craigslist.org', 'https://eastky.craigslist.org', 'https://lexington.craigslist.org', 'https://louisville.craigslist.org', 'https://owensboro.craigslist.org', 'https://westky.craigslist.org'], 'Louisiana': ['https://batonrouge.craigslist.org', 'https://cenla.craigslist.org', 'https://houma.craigslist.org', 'https://lafayette.craigslist.org', 'https://lakecharles.craigslist.org', 'https://monroe.craigslist.org', 'https://neworleans.craigslist.org', 'https://shreveport.craigslist.org'], 'Maine': ['https://maine.craigslist.org'], 'Maryland': ['https://annapolis.craigslist.org', 'https://baltimore.craigslist.org', 'https://easternshore.craigslist.org', 'https://frederick.craigslist.org', 'https://smd.craigslist.org', 'https://westmd.craigslist.org'], 'Massachusetts': ['https://boston.craigslist.org', 'https://capecod.craigslist.org', 'https://southcoast.craigslist.org', 'https://westernmass.craigslist.org', 'https://worcester.craigslist.org'], 'Michigan': ['https://annarbor.craigslist.org', 'https://battlecreek.craigslist.org', 'https://centralmich.craigslist.org', 'https://detroit.craigslist.org', 'https://flint.craigslist.org', 'https://grandrapids.craigslist.org', 'https://holland.craigslist.org', 'https://jxn.craigslist.org', 'https://kalamazoo.craigslist.org', 'https://lansing.craigslist.org', 'https://monroemi.craigslist.org', 'https://muskegon.craigslist.org', 'https://nmi.craigslist.org', 'https://porthuron.craigslist.org', 'https://saginaw.craigslist.org', 'https://swmi.craigslist.org', 'https://thumb.craigslist.org', 'https://up.craigslist.org'], 'Minnesota': ['https://bemidji.craigslist.org', 'https://brainerd.craigslist.org', 'https://duluth.craigslist.org', 'https://mankato.craigslist.org', 'https://minneapolis.craigslist.org', 'https://rmn.craigslist.org', 'https://marshall.craigslist.org', 'https://stcloud.craigslist.org'], 'Mississippi': ['https://gulfport.craigslist.org', 'https://hattiesburg.craigslist.org', 'https://jackson.craigslist.org', 'https://meridian.craigslist.org', 'https://northmiss.craigslist.org', 'https://natchez.craigslist.org'], 'Missouri': ['https://columbiamo.craigslist.org', 'https://joplin.craigslist.org', 'https://kansascity.craigslist.org', 'https://kirksville.craigslist.org', 'https://loz.craigslist.org', 'https://semo.craigslist.org', 'https://springfield.craigslist.org', 'https://stjoseph.craigslist.org', 'https://stlouis.craigslist.org'], 'Montana': ['https://billings.craigslist.org', 'https://bozeman.craigslist.org', 'https://butte.craigslist.org', 'https://greatfalls.craigslist.org', 'https://helena.craigslist.org', 'https://kalispell.craigslist.org', 'https://missoula.craigslist.org', 'https://montana.craigslist.org'], 'Nebraska': ['https://grandisland.craigslist.org', 'https://lincoln.craigslist.org', 'https://northplatte.craigslist.org', 'https://omaha.craigslist.org', 'https://scottsbluff.craigslist.org'], 'Nevada': ['https://elko.craigslist.org', 'https://lasvegas.craigslist.org', 'https://reno.craigslist.org'], 'New Hampshire': ['https://nh.craigslist.org'], 'New Jersey': ['https://cnj.craigslist.org', 'https://jerseyshore.craigslist.org', 'https://newjersey.craigslist.org', 'https://southjersey.craigslist.org'], 'New Mexico': ['https://albuquerque.craigslist.org', 'https://clovis.craigslist.org', 'https://farmington.craigslist.org', 'https://lascruces.craigslist.org', 'https://roswell.craigslist.org', 'https://santafe.craigslist.org'], 'New York': ['https://albany.craigslist.org', 'https://binghamton.craigslist.org', 'https://buffalo.craigslist.org', 'https://catskills.craigslist.org', 'https://chautauqua.craigslist.org', 'https://elmira.craigslist.org', 'https://fingerlakes.craigslist.org', 'https://glensfalls.craigslist.org', 'https://hudsonvalley.craigslist.org', 'https://ithaca.craigslist.org', 'https://longisland.craigslist.org', 'https://newyork.craigslist.org', 'https://oneonta.craigslist.org', 'https://plattsburgh.craigslist.org', 'https://potsdam.craigslist.org', 'https://rochester.craigslist.org', 'https://syracuse.craigslist.org', 'https://twintiers.craigslist.org', 'https://utica.craigslist.org', 'https://watertown.craigslist.org'], 'North Carolina': ['https://asheville.craigslist.org', 'https://boone.craigslist.org', 'https://charlotte.craigslist.org', 'https://eastnc.craigslist.org', 'https://fayetteville.craigslist.org', 'https://greensboro.craigslist.org', 'https://hickory.craigslist.org', 'https://onslow.craigslist.org', 'https://outerbanks.craigslist.org', 'https://raleigh.craigslist.org', 'https://wilmington.craigslist.org', 'https://winstonsalem.craigslist.org'], 'North Dakota': ['https://bismarck.craigslist.org', 'https://fargo.craigslist.org', 'https://grandforks.craigslist.org', 'https://nd.craigslist.org'], 'Ohio': ['https://akroncanton.craigslist.org', 'https://ashtabula.craigslist.org', 'https://athensohio.craigslist.org', 'https://chillicothe.craigslist.org', 'https://cincinnati.craigslist.org', 'https://cleveland.craigslist.org', 'https://columbus.craigslist.org', 'https://dayton.craigslist.org', 'https://limaohio.craigslist.org', 'https://mansfield.craigslist.org', 'https://sandusky.craigslist.org', 'https://toledo.craigslist.org', 'https://tuscarawas.craigslist.org', 'https://youngstown.craigslist.org', 'https://zanesville.craigslist.org'], 'Oklahoma': ['https://lawton.craigslist.org', 'https://enid.craigslist.org', 'https://oklahomacity.craigslist.org', 'https://stillwater.craigslist.org', 'https://tulsa.craigslist.org'], 'Oregon': ['https://bend.craigslist.org', 'https://corvallis.craigslist.org', 'https://eastoregon.craigslist.org', 'https://eugene.craigslist.org', 'https://klamath.craigslist.org', 'https://medford.craigslist.org', 'https://oregoncoast.craigslist.org', 'https://portland.craigslist.org', 'https://roseburg.craigslist.org', 'https://salem.craigslist.org'], 'Pennsylvania': ['https://altoona.craigslist.org', 'https://chambersburg.craigslist.org', 'https://erie.craigslist.org', 'https://harrisburg.craigslist.org', 'https://lancaster.craigslist.org', 'https://allentown.craigslist.org', 'https://meadville.craigslist.org', 'https://philadelphia.craigslist.org', 'https://pittsburgh.craigslist.org', 'https://poconos.craigslist.org', 'https://reading.craigslist.org', 'https://scranton.craigslist.org', 'https://pennstate.craigslist.org', 'https://williamsport.craigslist.org', 'https://york.craigslist.org'], 'Rhode Island': ['https://providence.craigslist.org'], 'South Carolina': ['https://charleston.craigslist.org', 'https://columbia.craigslist.org', 'https://florencesc.craigslist.org', 'https://greenville.craigslist.org', 'https://hiltonhead.craigslist.org', 'https://myrtlebeach.craigslist.org'], 'South Dakota': ['https://nesd.craigslist.org', 'https://csd.craigslist.org', 'https://rapidcity.craigslist.org', 'https://siouxfalls.craigslist.org', 'https://sd.craigslist.org'], 'Tennessee': ['https://chattanooga.craigslist.org', 'https://clarksville.craigslist.org', 'https://cookeville.craigslist.org', 'https://jacksontn.craigslist.org', 'https://knoxville.craigslist.org', 'https://memphis.craigslist.org', 'https://nashville.craigslist.org', 'https://tricities.craigslist.org'], 'Texas': ['https://abilene.craigslist.org', 'https://amarillo.craigslist.org', 'https://austin.craigslist.org', 'https://beaumont.craigslist.org', 'https://brownsville.craigslist.org', 'https://collegestation.craigslist.org', 'https://corpuschristi.craigslist.org', 'https://dallas.craigslist.org', 'https://nacogdoches.craigslist.org', 'https://delrio.craigslist.org', 'https://elpaso.craigslist.org', 'https://galveston.craigslist.org', 'https://houston.craigslist.org', 'https://killeen.craigslist.org', 'https://laredo.craigslist.org', 'https://lubbock.craigslist.org', 'https://mcallen.craigslist.org', 'https://odessa.craigslist.org', 'https://sanangelo.craigslist.org', 'https://sanantonio.craigslist.org', 'https://sanmarcos.craigslist.org', 'https://bigbend.craigslist.org', 'https://texoma.craigslist.org', 'https://easttexas.craigslist.org', 'https://victoriatx.craigslist.org', 'https://waco.craigslist.org', 'https://wichitafalls.craigslist.org'], 'Utah': ['https://logan.craigslist.org', 'https://ogden.craigslist.org', 'https://provo.craigslist.org', 'https://saltlakecity.craigslist.org', 'https://stgeorge.craigslist.org'], 'Vermont': ['https://vermont.craigslist.org'], 'Virginia': ['https://charlottesville.craigslist.org', 'https://danville.craigslist.org', 'https://fredericksburg.craigslist.org', 'https://norfolk.craigslist.org', 'https://harrisonburg.craigslist.org', 'https://lynchburg.craigslist.org', 'https://blacksburg.craigslist.org', 'https://richmond.craigslist.org', 'https://roanoke.craigslist.org', 'https://swva.craigslist.org', 'https://winchester.craigslist.org'], 'Washington': ['https://bellingham.craigslist.org', 'https://kpr.craigslist.org', 'https://moseslake.craigslist.org', 'https://olympic.craigslist.org', 'https://pullman.craigslist.org', 'https://seattle.craigslist.org', 'https://skagit.craigslist.org', 'https://spokane.craigslist.org', 'https://wenatchee.craigslist.org', 'https://yakima.craigslist.org'], 'West Virginia': ['https://charlestonwv.craigslist.org', 'https://martinsburg.craigslist.org', 'https://huntington.craigslist.org', 'https://morgantown.craigslist.org', 'https://wheeling.craigslist.org', 'https://parkersburg.craigslist.org', 'https://swv.craigslist.org', 'https://wv.craigslist.org'], 'Wisconsin': ['https://appleton.craigslist.org', 'https://eauclaire.craigslist.org', 'https://greenbay.craigslist.org', 'https://janesville.craigslist.org', 'https://racine.craigslist.org', 'https://lacrosse.craigslist.org', 'https://madison.craigslist.org', 'https://milwaukee.craigslist.org', 'https://northernwi.craigslist.org', 'https://sheboygan.craigslist.org', 'https://wausau.craigslist.org'], 'Wyoming': ['https://wyoming.craigslist.org']}, searchURL, searchTerm))
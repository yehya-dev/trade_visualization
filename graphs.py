from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.templating import Jinja2Templates
from starlette.responses import JSONResponse, HTMLResponse
from starlette.staticfiles import StaticFiles
import json

TEMP_LIST = True

templates = Jinja2Templates('templates')

def divide_into_lists(size, coins):
    stop = size
    start = 0
    res_list = []
    while len(coins) + size >= stop:
        res_list.append(coins[start:stop])
        start, stop = start + size, stop + size
    return res_list

def get_needed_coins(COIN_FROM=None, COIN_TO=None, rev=False, file='needed_coin'):
    with open(file, 'r') as file:
        needed_coin = json.load(file)
        start = needed_coin.index(COIN_FROM) if COIN_FROM else 0
        end = needed_coin.index(COIN_TO) if COIN_TO else len(needed_coin)
        if rev:
            return needed_coin[start:end][::-1]
        else:
            return needed_coin[start:end]

async def assets(request):
        listType = request.query_params.get('type', 'fav')
        inter = request.query_params.get('inter')
        globalData = {
            'graphInt': '60',
            'signalInt': '15m',
            'listType': listType 
        }
        if inter:
            g, s = inter.split('/')
            globalData['graphInt'] = g
            globalData['signalInt'] = s

        globalDataJSON = json.dumps(globalData)

        return templates.TemplateResponse('view_assets.html', {
            'request': request,
            'globals': globalDataJSON
        })


async def pump_coins(request):
        needed_coins = get_needed_coins()
        needed_coins = divide_into_lists(25, needed_coins)
        return JSONResponse({
            'coins': needed_coins
        })

async def fav_coins(request):
        needed_coins = get_needed_coins(file= 'pump_test.json' if not TEMP_LIST else 'temp_list.json')
        needed_coins = divide_into_lists(25, needed_coins)
        return JSONResponse({
            'coins': needed_coins
        })


async def homepage(request):
    return HTMLResponse(
'''
<a href="/assets">/assets</a><br>
<a href="/assets?inter=1440/1D">/assets?inter=1440/1D</a><br>
<a href="/assets?type=pump">/assets?type=pump</a><br>
<a href="/assets?type=pump&inter=1440/1D">/assets?type=pump&inter=1440/1D</a>
''')


routes = [
    Route('/', homepage),
    Route('/assets', assets),
    Route('/pump_coins', pump_coins),
    Route('/fav_coins', fav_coins),
    Mount('/static', app=StaticFiles(directory='static'), name='static')
]
app = Starlette(debug=True, routes=routes)
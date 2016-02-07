import os
import errno
import shutil
import requests
from multiprocessing import Pool, cpu_count

MIN_Z = 5
MAX_Z = 5
TILE_SERVER = 'http://localhost:8000/'
OUTDIR = './tiles/'

def makedirs(tiledir):
    '''
    Checks to see if the tiledir exists, if not it will create it.
    Handles a race condition if two processes/threads are trying to make the
    same directory.
    :param tiledir: the directory path you want to make
    '''
    if not os.path.isdir(tiledir):
        try:
            os.makedirs(tiledir)
        except OSError, exc:
            #  Another thread/process has already made this directory
            if exc.errno != errno.EEXIST:
                raise

def save_tile(zxy):
    z, x, y = zxy
    z, x, y = str(z), str(x), str(y)
    y += '.png'
    tileurl = os.path.join(TILE_SERVER, z, x, y)
    tileout = os.path.join(OUTDIR, z, x, y)
    response = requests.get(tileurl, stream=True)
    with open(tileout, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    del response

def yield_tiles():
    for z in range(MIN_Z, MAX_Z+1):
        for x in range(0, 2**z):
            print z, x
            makedirs(os.path.join('/home/richard/Documents/Projects/node-census-mb/tiles', str(z), str(x)))
            for y in range(0, 2**z):
                yield [z, x, y]

if __name__ == '__main__':
    pool = Pool(
        processes=max(cpu_count() - 2, 1)
    )
    tiles = pool.map(save_tile, yield_tiles())

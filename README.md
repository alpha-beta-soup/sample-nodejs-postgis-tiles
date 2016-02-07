# sample-nodejs-postgis-tiles

Sample Mapnik/node.js tile server for PostGIS geometries. Mostly taken from http://www.sparkgeo.com/labs/big/, which itself is a bit outdated. Just need it to make some tiles faster than I could generate with Tilemill, and also wanted to do some alpha channel manipulation at the same time.

If you want to try it yourself, get up and running by configuring the PostGIS connection in `cencon.js`:

```js
// the db connection info
var postgis_settings = {
  'host' : 'localhost',
  'dbname' : 'gis',
  'table' : 'census2013.mb_clipped',
  'user' : 'postgres',
  'password' : 'postgres',
  'type' : 'postgis',
  'initial_size' : '10',
  'estimate_extent' : '0',
  'geometry_field': 'geom_900913'
};
```

Then run the node.js server: `node cencon.js` (runs on port `8000`). Can also do `nohup node cencon.js` to make it persist beyond the terminal session.

To sample the interactive Google Map: `python -m SimpleHTTPServer 8081` (Python 2.7), then navigate to http://localhost:8081

To just request tiles: http://localhost:8000/0/0/0.png

To batch request tiles, run `python request_tiles.py`, which will populate a directory `./tiles/` (change the maximum and minimum zooms beforehand).

---

There is also some mess about reprojecting PostGIS geometries of census meshblocks, because I was playing with them too. This is a very fast way to render PNG tiles from complex PostGIS geometries.

---

Dependencies:

- Postgres/PostGIS
- mapnik
- node
- node-mapnik

Mapnik is notoriously hard to install. I found the most painless way to do this is by installing libmapnik as part of Tilemill (which is also deprecated... so maybe do this in a Ubuntu 14.04 Docker).

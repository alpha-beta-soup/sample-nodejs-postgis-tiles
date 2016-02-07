var mapnik = require('mapnik');
var mercator = require('./sphericalmercator');
var url = require('url');
var fs = require('fs');
var http = require('http');
var parseXYZ = require('./tile.js').parseXYZ;
var path = require('path');
var port = 8000; // this will define the port at which the map tiles appear.. ie http://localhost:8000
var TMS_SCHEME = true;

// the db connection info
var postgis_settings = {
  'host' : 'localhost',
  'dbname' : 'gis',
  // 'table' : 'census2013.mb_clipped',
  'table': 'coastlines.global_unsimplified_lakes_clipped',
  'user' : 'postgres',
  'password' : 'postgres',
  'type' : 'postgis',
  'initial_size' : '10',
  'estimate_extent' : '0',
  // 'geometry_field': 'geom_900913'
};

http.createServer(function(req, res) {
  parseXYZ(req, TMS_SCHEME, function(err,params) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end(err.message);
    } else {
      try {
        var map = new mapnik.Map(256, 256, mercator.proj4);
        var layer = new mapnik.Layer('tile', mercator.proj4);
        var postgis = new mapnik.Datasource(postgis_settings); // settings defined above
        var bbox = mercator.xyz_to_envelope(parseInt(params.x),
                                               parseInt(params.y),
                                               parseInt(params.z), false); // coordinates provided by the sphericalmercator.js script
		layer.datasource = postgis;
        layer.styles = ['polygon']; // this pertains the the style in the xml doc
        map.bufferSize = 0; // how much edging is provided for each tile rendered
        map.load(path.join(__dirname, 'tile_symbols.xml'), {strict: true}, function(err,map) {
            if (err) throw err;
            map.add_layer(layer);
            map.extent = bbox;
            var im = new mapnik.Image(map.width, map.height);
            map.render(im, function(err, im) {
              if (err) {
                throw err;
              } else {
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(im.encodeSync('png'));
              }
            });
        });

      }
      catch (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.message);
      }
    }
  });
}).listen(port);

console.log('Server running on port %d', port);

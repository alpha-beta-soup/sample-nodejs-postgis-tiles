SELECT AddGeometryColumn('census2013', 'mb_clipped', 'geom_900913', 900913, 'MULTIPOLYGON', 2);

UPDATE census2013.mb_clipped *
SET geom_900913 = ST_Transform(geom, 900913);

SELECT ST_Area(geom), ST_Area(geom_900913) FROM census2013.mb_clipped
LIMIT 10;
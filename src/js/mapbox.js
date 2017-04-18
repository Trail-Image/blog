'use strict';

$(function() {
   var MAX_ZOOM = 18;
   var COORD_DECIMALS = 5;
   var imageryOn = false;
   var initial = { zoom: 6.5, center: [-116.0987, 44.7] };
   var style = {
      basic: 'jabbott7/cj1k069f0000p2slh5775akgj',
      imagery: 'jabbott7/cj1mcsd7t000h2rpitaiafuq0'
   };
   var $count = $('#photo-count');
   var $preview = $('#photo-preview');
   var $showImagery = $('#toggle-satellite');
   var $zoomOut = $('#zoom-out');
   var $check = {
      on: $('nav .glyphicon-check'),
      off: $('nav .glyphicon-unchecked')
   };
   // https://www.mapbox.com/mapbox-gl-js/api/#navigationcontrol
   var nav = new mapboxgl.NavigationControl();
   // https://www.mapbox.com/mapbox-gl-js/api/
   var map = new mapboxgl.Map({
      container: 'map-canvas',
      style: 'mapbox://styles/' + style.imagery,
      center: initial.center,
      zoom: initial.zoom,
      maxZoom: MAX_ZOOM,
      dragRotate: false
   });
   var canvas = map.getCanvasContainer();
   var markerOpacity = 0.6;
   var zoomOutEnabled = false;

   /**
    * Cache GeoJSON so it can be reassigned if map style changes
    * @type {GeoJSON.FeatureCollection}
    */
   var geoJSON = null;

    /**
    * Methods for generating content.
    */
   var html = {
      /**
       * @param {string} name
       * @param {function} [handler] Optional click handler
       * @returns {jQuery}
       */
      icon: function(name, handler) {
         var $icon = $('<span>').addClass('glyphicon glyphicon-' + name);
         if (handler !== undefined) { $icon.click(handler); }
         return $icon;
      },

      /**
       * Format coordinates
       * @param {number[]} pos
       * @returns {string}
       */
      coordinate: function(pos) {
         var factor = Math.pow(10, COORD_DECIMALS);
         var round = function(n) { return Math.round(n * factor) / factor; };
         return round(pos[1]) + ', ' + round(pos[0]);
      },


      /**
       * Make photo HTML
       * @param {GeoJSON.Feature} f
       * @returns {jQuery}
       */
      photo: function(f) {
         var img = f.properties;
         var tip = 'Click or tap to enlarge';
         return $('<figure>')
            .append($('<img>')
               .attr('src', img.url)
               .attr('title', tip)
               .attr('alt', tip)
               .click(function() { showPhotoInPost(img.url); })
            )
            .append($('<figcaption>').html(this.coordinate(f.geometry.coordinates)));
      }
   };

   map.addControl(nav, 'top-right')
      .on('load', function() {
         $showImagery.click(function() { showImagery(!imageryOn); });

         $.getJSON('/geo.json', function(data) {
            geoJSON = data;
            $count.html(geoJSON.features.length + ' photos').show();
            addMapLayers();
         });
      });

   /**
    * Get all photos near a location
    * @param {mapboxgl.LngLatLike} lngLat
    * @returns {GeoJSON.FeatureCollection}
    */
   function photosNearLocation(lngLat) {
      // 0.025 works at 6.3               0.1575
      // 0.015 works at 7.67              0.11505
      // 0.001 works at 8.5 - 10.56       0.009
      // 0.0002 works at 12.54            0.002508
      // 0.0001 works at 13.3 (not 12.3)  0.00133
      //CLUSTER_MARKER_SIZE
      //var d = =(($A2 * 4) / POW(2,$A2 * 1.4) * 10)
      var z = map.getZoom();
      var f = (z * 1.5) / Math.pow(2, z * 1.3) * 10;
      var sw = [lngLat.lng - f, lngLat.lat -f];
      var ne = [lngLat.lng + f, lngLat.lat +f];

      return geoJSON.features.filter(function(f) { 
         var coord = f.geometry.coordinates;
         return coord[0] >= sw[0] && coord[1] >= sw[1]
             && coord[0] <= ne[0] && coord[1] <= ne[1];
      });
   }

   function handleZoomEnd() {
      updateUrl();
      enableZoomOut();
   }

   /**
    * Update URL with current zoom level and map center.
    */
   function updateUrl() {
      var lngLat = map.getCenter();
      var url = '/map?lat=' + lngLat.lat + '&lon=' + lngLat.lng + '&zoom=' + map.getZoom();
      window.history.replaceState(null, null, url);
   }

   /**
    * Enable or disable satellite imagery. Abort if the setting is unchanged.
    * @param {boolean} enabled
    */
   function showImagery(enabled) {
      if (enabled == imageryOn) { return; }

      imageryOn = enabled;

      if (imageryOn) {
         $check.on.show(); $check.off.hide();
      } else {
         $check.on.hide(); $check.off.show();
      }
      map.once('data', function(e) { if (e.dataType == 'style') { addMapLayers(); } });
      map.setStyle('mapbox://styles/' + (imageryOn ? style.imagery : style.basic));
   }

   /**
    * Enable or disable the zoom-out button.
    */
   function enableZoomOut() {
      if (map.getZoom() > initial.zoom && !zoomOutEnabled) {
         zoomOutEnabled = true;
         $zoomOut
            .click(function() { map.easeTo(initial); })
            .removeClass('disabled');
      } else if (map.getZoom() <= initial.zoom && zoomOutEnabled) {
         zoomOutEnabled = false;
         $zoomOut.off('click').addClass('disabled');
      }
   }

   /**
    * Curry function to update canvas cursor.
    * @param {string} name
    * @returns {function}
    */
   function cursor(name) {
      if (name === undefined) { name = ''; }
      return function() { canvas.style.cursor = name; };
   }

   /**
    * Respond to mouse click on cluster marker.
    * @param {mapboxgl.Event} e
    * @see https://github.com/mapbox/mapbox-gl-js/issues/2384
    */
   function clickCluster(e) {
      var cluster = e.features[0].properties;
      var atZoom = map.getZoom();
      var zoomIn = function() {
         map.easeTo({
            center: e.lngLat,
            zoom: MAX_ZOOM - atZoom < 2 ? MAX_ZOOM : atZoom + 2
         });
      };

      if (cluster.point_count > 5 && atZoom < MAX_ZOOM) {
         zoomIn();
      } else {
         var photos = photosNearLocation(e.lngLat);
         if (photos.length == 0) {
            zoomIn();
         } else {
            var selected = 1;
            var $photos = $('<div>').addClass('photo-list');
            var $markers = $('<div>').addClass('markers');
            var select = function(count) {               
               selected += count;
               if (selected > photos.length) {
                  selected = 1;
               } else if (selected < 1) {
                  selected = photos.length;
               }
               $('figure', $photos).hide();
               $('span', $markers).removeClass('selected');
               $('figure:nth-child(' + selected + ')', $photos).show();
               $('span:nth-child(' + selected + ')', $markers).addClass('selected');
            };
            var prev = function() { select(-1); };
            var next = function() { select(1); };

            for (var i = 0; i < photos.length; i++) {
               $photos.append(html.photo(photos[i]));
               $markers.append(html.icon('map-marker'));
            }
            $('span:first-child', $markers).addClass('selected');

            $preview
               .empty()
               .css({ top: e.point.y + 15, left: e.point.x })
               .append($('<nav>')
                  .append(html.icon('arrow-left', prev))
                  .append($markers)
                  .append(html.icon('arrow-right', next))
               )
               .append($photos)
               .show();
         }
      }
   }

   /**
    * Respond to mouse click on photo marker.
    * @param {mapboxgl.Event} e
    */
   function clickPhoto(e) {
      $preview
         .empty()
         .css({ top: e.point.y + 15, left: e.point.x })
         .append(html.photo(e.features[0]))
         .show();
   }

   /**
    * Retrieve photo ID from preview URL and redirect to post with that photo
    * @param {string} url
    * @example https://farm3.staticflickr.com/2853/33767184811_9eff6deb48_n.jpg
    */
   function showPhotoInPost(url) {
      var path = url.split('/');
      var parts = path[path.length - 1].split('_');
      window.location = '/' + parts[0];
   }

   /**
    * Assign source and define layers for clustering.
    */
   function addMapLayers() {
      map.addSource('photos', {
         type: 'geojson',
         data: geoJSON,
         cluster: true,
         clusterMaxZoom: 22,
         clusterRadius: 20
      });

      // https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-circle
      // https://www.mapbox.com/mapbox-gl-js/style-spec/#types-function
      map.addLayer({
         id: 'cluster',
         type: 'circle',
         source: 'photos',
         filter: ['has', 'point_count'],
         paint: {
            'circle-color': '#524948',
            'circle-radius': {
               property: 'point_count',
               type: 'interval',
               stops: [
                  [0, 13],
                  [50, 16],
                  [100, 19]
               ]
            },
            'circle-opacity': markerOpacity,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ccc'
         }
      });

      // https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-symbol
      map.addLayer({
         id: 'cluster-count',
         type: 'symbol',
         source: 'photos',
         filter: ['has', 'point_count'],
         layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14
         },
         paint: {
            'text-color': '#fff'
         }
      });

      // https://www.mapbox.com/mapbox-gl-js/example/custom-marker-icons/
      map.addLayer({
         id: 'photo',
         type: 'circle',
         source: 'photos',
         filter: ['!has', 'point_count'],
         paint: {
            'circle-color': '#f00',
            'circle-radius': 7,
            'circle-stroke-width': 4,
            'circle-stroke-color': '#fdd',
            'circle-opacity': markerOpacity
         }
      });

      map.on('mouseenter', 'cluster', cursor('pointer'))
         .on('mouseleave', 'cluster', cursor())
         .on('mouseenter', 'photo', cursor('pointer'))
         .on('mouseleave', 'photo', cursor())
         .on('move', function()  { $preview.hide(); })
         .on('click', function() { $preview.hide(); })
         .on('zoomend', handleZoomEnd)
         .on('moveend', updateUrl)
         .on('mousedown', 'cluster', clickCluster)
         .on('mousedown', 'photo', clickPhoto);
   }
});
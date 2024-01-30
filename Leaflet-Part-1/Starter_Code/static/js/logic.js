// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

let tectonicplates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

// Create the map
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
});

// Add a tile layers to the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
	minZoom: 1,
	maxZoom: 16,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
}).addTo(myMap);

let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};

let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
};



d3.json(queryUrl).then(function (data) {
    function mapStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: Colormapping(feature.geometry.coordinates[2]),
            color: "black",
            radius: Radius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };

    }

console.log(earthquakes);

    function Colormapping(depth) {
        switch (true) {
            case depth > 90:
                return "red";
            case depth > 70:
                return "orangered";
            case depth > 50:
                return "orange";
            case depth > 30:
                return "gold";
            case depth > 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }

    function Radius(mag) {
        return mag * 4;
    }


    L.geoJson(data, {

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: mapStyle,


        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
            + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
          }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);

    


d3.json(API_plates).then(function(platedata) {
    L.geoJSON(platedata, {
    color: "orange",
    weight: 3
    }).addTo(tectonicplates);
    tectonicplates.addTo(myMap);
    });


    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
        for (let i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<i style="background:' + Colormapping(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap)
});



L.control.layers(baseMaps, overlays, {
    collapsed: false
    }).addTo(myMap);



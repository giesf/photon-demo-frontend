
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

let PMTILES_URL = "https://photon-demo.x-z.dev/pmtiles/world.pmtiles";

let source = new pmtiles.FetchSource(PMTILES_URL, new Headers({ 'Content-Language': 'xx' }));

const p = new pmtiles.PMTiles(source);

const url = new URL(location.href);
// this is so we share one instance across the JS code and the map renderer
protocol.add(p);

const marker = {
    x: url.searchParams.get("x") ? parseFloat(url.searchParams.get("x")) : 13.3989367,
    y: url.searchParams.get("y") ? parseFloat(url.searchParams.get("y")) : 52.510885,
    z: url.searchParams.get("z") ? parseInt(url.searchParams.get("z")) : 12
}
p.getMetadata().then((m) => {
    document.getElementById("description").textContent = m.description;
})

// we first fetch the header so we can get the center lon, lat of the map.
p.getHeader().then((h) => {
    window.map = new maplibregl.Map({
        container: "map",
        zoom: 8,
        hash: false,
        center: [marker.x, marker.y],
        style: {
            glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
            sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/light`,
            version: 8,
            sources: {
                transportation: {
                    type: "vector",
                    url: "pmtiles://https://photon-demo.x-z.dev/pmtiles/base.pmtiles",
                },
                worldtiles: {
                    type: "vector",
                    url: "pmtiles://" + PMTILES_URL,
                    attribution:
                        '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
                }
            },
            layers: [
                ...basemaps.layers("worldtiles", basemaps.namedFlavor("light")),
                {
                    "id": "railway",
                    "type": "circle",
                    "source": "transportation",
                    "source-layer": "infrastructure",

                    "filter": [
                        "match",
                        [
                            "get",
                            "class"
                        ],
                        [
                            "railway_station",
                        ],
                        true,
                        false
                    ],
                    "paint": {
                        "circle-radius": 5,
                        "circle-color": "green"
                    }
                }, {
                    "id": "ubahn",
                    "type": "circle",
                    "source": "transportation",
                    "source-layer": "infrastructure",

                    "filter": [
                        "match",
                        [
                            "get",
                            "class"
                        ],
                        [
                            "subway_station"
                        ],
                        true,
                        false
                    ],
                    "paint": {
                        "circle-radius": 5,
                        "circle-color": "blue"
                    }
                },
                ...basemaps.layers("worldtiles", basemaps.namedFlavor("light"), { lang: "en", labelsOnly: true })

            ],
        },
    });
    map.showTileBoundaries = false;
    map.flyTo({ essential: true, center: [marker.x, marker.y], zoom: marker.z })
    window.vmark = new maplibregl.Marker()
        .setLngLat([marker.x, marker.y])
        .addTo(map);
});
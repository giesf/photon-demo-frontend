let controller = new AbortController()
let timeout;

const results = document.getElementById("search-results")

function load(
    q
) {
    const { lng, lat } = window.map.getCenter()
    const zoom = window.map.getZoom()
    console.log("Searching for ", q)
    const sp = new URLSearchParams()
    controller.abort()
    controller = new AbortController()
    sp.set("q", q)
    sp.set("lon", lng)
    sp.set("lat", lat)
    sp.set("zoom", Math.floor(zoom))

    // sp.append("layer", "house")
    // sp.append("layer", "street")
    sp.append("limit", 40)
    if (timeout) { clearTimeout(timeout) }
    timeout = setTimeout(() => {
        fetch("https://photon-demo.x-z.dev/api?" + sp.toString(), {
            method: 'get',
            signal: controller.signal,
        }).then(res => res.json().then(r => {
            const rr = r.features.map(r => ({ ...r.properties, coordinates: r.geometry.coordinates }))
            const rstr = Array.from(new Set(rr.map(l => `<li onclick="navigate(event);" data-original='${JSON.stringify(l)}' data-x="${l.coordinates[0]}" data-y="${l.coordinates[1]}">${l.street && l.name ? l.name + ", " : ""}${l.street ?? l.name ?? ""}${l.housenumber ? " " + l.housenumber : ""}, ${l.district ? l.district + ", " : ""}${l.postcode} ${l.city}, ${l.country}</li>`)))

            results.innerHTML = rstr.join("\n")
            results.style.display = "block"
        }))
    }, 200)


}

function navigate(event) {
    const x = parseFloat(event.target.getAttribute("data-x"))
    const y = parseFloat(event.target.getAttribute("data-y"))
    window.vmark.setLngLat([x, y])
    window.map.flyTo({ essential: true, center: [x, y], zoom: 13 })

    results.style.display = "none"

}

document.getElementById("search").addEventListener("keyup", (ev) => {
    const sv = ev.target.value;

    if (sv.length > 3) {
        load(sv)
    }
})
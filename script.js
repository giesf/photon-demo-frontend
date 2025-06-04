let controller = new AbortController()
let timeout;
function load(
    q
){
    const sp = new URLSearchParams()
    controller.abort()
    controller = new AbortController()
    sp.set("q",q)
    sp.set("bbox","-21.9614,27.9956,64.0749,78.2079")
    sp.append("layer","house")
    sp.append("layer","street")
    if(timeout){ clearTimeout(timeout)}
    timeout = setTimeout(()=>{
        const start = new Date();
        fetch("https://photon.komoot.io/api?"+sp.toString(), {
            method: 'get',
            signal: controller.signal,
          }).then(res=>res.json().then(r=>{
            const rr = r.features.map(r=>r.properties)
    
            const rstr = Array.from( new Set(rr.map(l=>`<li data-original='${JSON.stringify(l)}'>${l.street && l.name ?  l.name+", ":""}${l.street ?? l.name ?? ""}${l.housenumber ?" "+l.housenumber: ""}, ${l.district ? l.district+", ":""}${l.postcode} ${l.city}, ${l.country}</li>`)))
            const end = new Date();
            const timeS = (end.valueOf()- start.valueOf() ) / 1000
            document.getElementById("time").innerHTML="Query Time: "+timeS.toFixed(3) + "sec"
            document.getElementById("results").innerHTML=rstr.join("\n")
        })  )
    },200)

  
}

document.getElementById("search").addEventListener("keyup",(ev)=>{
    const sv = ev.target.value;

    if(sv.length > 3 ){
        load(sv)
    }
})
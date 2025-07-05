import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { sankey, sankeyLinkHorizontal } from "https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm";

function computeMotivation(protest_data_point) {
    const motivations = ["Economic", "Political", "Gender", "Corruption"];
    console.log("motivation?")

    for (const col of motivations) {
        const val = (protest_data_point[col] || "").toString().trim().toLowerCase();
        console.log(val)
        console.log(protest_data_point)
        if (val === "yes" || val === "y" || val === "true") {
            return col;
        }
    }
    return null;
}

export function computeSankeyData(protestData, country, year) {
  // get country and year data
  const slice = protestData
    .filter(d => d.country === country)
    .filter(d => d.date.getFullYear() <= year);

  // creating links and counting values
  const p2m = new Map(); 
  const m2o = new Map();
  const participantsSet = new Set();
  const motivationSet   = new Set();
  const outcomeSet      = new Set();

  slice.forEach(d => {
    const p = d.gen_ptcpnt || "Unknown";
    const m = computeMotivation(d)  || "Unknown";
    const o = d.sig_outcome || "Unknown";

    participantsSet.add(p);
    motivationSet.add(m);
    outcomeSet.add(o);

    // creating first link
    const k1 = `${p}=${m}`;
    // p2m.set(k1, (p2m.get(k1) || 0) + 1);
    // adding protest data to the link
    if (!p2m.has(k1)) p2m.set(k1, []) 
    p2m.get(k1).push(d)

    // creating secon link
    const k2 = `${m}=${o}`;
    // m2o.set(k2, (m2o.get(k2) || 0) + 1);
    if (!m2o.has(k2)) m2o.set(k2, []) 
    m2o.get(k2).push(d)

  });

  // nodes based on found fields
  const nodes = [
    ...Array.from(participantsSet).map(id => ({ id, level: 0 })),
    ...Array.from(motivationSet).map(id   => ({ id, level: 1 })),
    ...Array.from(outcomeSet).map(id      => ({ id, level: 2 }))
  ];

  // links betw nodes for all protests
  const links = [];
  // add count
  p2m.forEach((arr, k) => {
    const [source, target] = k.split("=");
    links.push({ source, target, value: arr.length, protests: arr });
  });
  m2o.forEach((arr, k) => {
    const [source, target] = k.split("=");
    links.push({ source, target, value: arr.length, protests: arr });
  });

  //   add header for country 
    const headlineCountry = d3.select("#country-name")
    const headlineYear = d3.select("#year-sankey")
    
    headlineCountry.html(`${country}`);
    headlineYear.html(`till ${year}`)

  return { nodes, links };
}


export function renderSankey(data, { container = "#scatter-section", width = 500, height = 600 } = {}) {
  const { nodes: inNodes, links: inLinks } = data;

  // prep sankey layout
  const { nodes, links } = sankey()
    .nodeId(d => d.id)
    .nodeWidth(15)
    .nodePadding(8)
    .extent([[1, 1], [width - 1, height - 1]])
    ({
      nodes: inNodes.map(d => ({ ...d })),
      links: inLinks.map(d => ({ ...d }))
    });

  // select/create svg
  const svg = d3.select(container)
    .selectAll("svg.sankey")
    .data([null])
    .join("svg")
      .attr("class", "sankey")
      .attr("width",  width)
      .attr("height", height);

  // dleete prev
  svg.selectAll("*").remove();


  // draw links
  svg.append("g")
    .selectAll("path")
    .data(links)
    .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("opacity", 0.4);

    const tip = d3.select("body")
     .selectAll("div.sankey-tooltip")
     .data([null])
     .join("div")
     .attr("class", "sankey-tooltip")
     .style("position","absolute")
     .style("pointer-events","none")
     .style("background","rgba(0,0,0,0.8)")
     .style("color","#fff")
     .style("padding","6px 10px")
     .style("border-radius","4px")
     .style("font-size","0.85rem")
     .style("display","none");
    
     const linkPaths = svg.append("g")
    .selectAll("path")
    .data(links)
    .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("opacity", 0.4);
  

    linkPaths
    .on("mouseover", (event, d) => {
      const html = d.protests.map(p => {
        return `<div>
          <strong>${p.name}</strong><br/>
          Duration: ${p.duration}
        </div>`;
      }).join("<hr style='border-color:#555;margin:4px 0;'>");

      tip.html(html)
         .style("left",  (event.pageX + 12) + "px")
         .style("top",   (event.pageY - 12) + "px")
         .style("display","block");

      d3.select(event.currentTarget)
        .attr("opacity", 0.7)
        .attr("stroke", "#fff");
    })
    .on("mousemove", event => {
      tip
        .style("left", (event.pageX + 12) + "px")
        .style("top",  (event.pageY - 12) + "px");
    })
    .on("mouseout", (event) => {
      tip.style("display","none");
      d3.select(event.currentTarget)
        .attr("opacity", 0.4)
        .attr("stroke", "#999");
    });



  //  draw nodes
  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  node.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", "#31688e")
      .attr("opacity", 0.8);

  node.append("text")
      .attr("x", d => d.x0 < width / 2 ? (d.x1 - d.x0) + 6 : -6)
      .attr("y", d => (d.y1 - d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .style("fill", "#fff")
      .style("font-size", "10px")
      .text(d => d.id);
}

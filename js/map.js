import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";


export const width  = 1100;
export const height = 650;


 let mouseOver = function(event) {
        d3.selectAll("path.country")
            .transition()
            .duration(200)
            .style("opacity", .5)
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black")
    }
    console.log(d3.selectAll("countries"))
    console.log("lol")

let mouseLeave = function(event) {
        d3.selectAll("path.country")
            .transition()
            .duration(200)
            .style("opacity", 1)
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .style("stroke", "#999")
    }

const mapTooltip = d3.select("body")
  .append("div")
    .attr("class", "map-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "#fff")
    .style("padding", "4px 8px")
    .style("border-radius", "3px")
    .style("font-size", "0.85rem")
    .style("display", "none");


let showTooltip = function(data, event, demByCountry, currentYear) {
     // compute this country’s democracy score at currentYear
    const countryName = data.properties.name;
    const history = demByCountry.get(countryName) || [];
    const recs = history.filter(r => r.year <= currentYear);
    const score = recs.length
      ? recs[recs.length - 1].score.toFixed(2)
      : "N/A";
    console.log("heyy", recs)

    // show the tooltip
    mapTooltip
      .html(`<strong>${countryName}</strong><br/>Democracy Score: ${score}`)
      .style("left",  (event.pageX + 10) + "px")
      .style("top",   (event.pageY - 28) + "px")
      .style("display", "block");

    // highlight visually
    d3.select(event.currentTarget)
      .raise()
      .transition().duration(200)
        .style("stroke", "#fff")
        .style("stroke-width", 1);
}

let closeTooltip = function (event) {
mapTooltip.style("display", "none");
    // remove highlight
    d3.select(event.currentTarget)
      .transition().duration(200)
        .style("stroke", "#999")
        .style("stroke-width", 0.3);
}

export const projection = d3.geoMercator()
  .scale(175)
  .translate([width / 2, height / 1.5]);

// geopath
export const path = d3.geoPath(projection);

export function drawBaseMap(svg, mapData, onCountryClick = {}) {

    const countries = feature(mapData, mapData.objects.countries);
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(countries.features)
        .join("path")
            .attr("class", "country")
            .attr("d", path) // draw each country
            .attr("fill", "#eee")    // initial grey
            .attr("stroke", "#999")
            .attr("stroke-width", 0.3)
            .on("click", (event, d) => {
                onCountryClick(d.properties.name);
            });
}

export function createColorScale(demData) {
  const maxScore = d3.max(demData, d => d.score);
  const minScore = d3.min(demData, d => d.score);
  return d3.scaleDiverging(d3.interpolateSpectral)
           .domain([minScore, 0, maxScore]);
}


export function updateMap(svg, demByCountry, colorScale, currentYear) {

    const countries = svg.selectAll("path.country");
    countries
        .on("mouseover", (event, d) => {
            mouseOver(event);
            showTooltip(d, event, demByCountry, currentYear)
        })
        .on("mousemove", event => {
        mapTooltip
            .style("left", (event.pageX + 12) + "px")
            .style("top",  (event.pageY - 12) + "px");
        })
        .on("mouseleave", (event) => {
            mouseLeave(event);
            closeTooltip(event)
        });
    
    // add tooltip

    svg.selectAll("path.country")
     .transition().duration(500)
     .attr("fill", d => {
       const country = d.properties.name;
       const history = demByCountry.get(country) || [];
       // filter all scores ≤ currentYear
       const upToDate = history.filter(r => r.year <= currentYear);
       if (upToDate.length === 0) return "#ccc";  // no data
       // get the most recent
       const latest = upToDate[upToDate.length - 1];
       return colorScale(latest.score);
     });
}

export function drawSvgLegend(svg, colorScale, width = 1100, height = 650, scatterLegend = false) {
  const legendWidth  = 200;
  const legendHeight = 10;
  const margin       = 20;
  // position in bottom  right corner
  console.log(scatterLegend, "lol this is not what it seems like")
  var x;
  var y;
  if (scatterLegend) {
    x = width  - legendWidth - margin;
    y = height - legendHeight - margin + 60;
  } else {
     x = width  - legendWidth - margin;

     y = height - legendHeight - margin;
  }

  // prep a linear gradient
  const defs = svg.append("defs");
  const grad = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");

  // sample 11 stops from 0 to 1
  d3.range(0, 1.0001, 0.1).forEach(t => {
    grad.append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", colorScale(
        // map t back domain
        colorScale.domain()[0] + t * (colorScale.domain()[2] - colorScale.domain()[0])
      ));
  });

  // draw the gradient rect
  svg.append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width",  legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)")
    .style("stroke", "#888")
    .style("stroke-width", 0.5);

  // build a scale & axis for the legend
  const [min, , max] = colorScale.domain();
  const legendScale = d3.scaleLinear()
    .domain([min, max])
    .range([x, x + legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d3.format(".1f"));

  svg.append("g")
    .attr("class", "legend-axis")
    .attr("transform", `translate(0, ${y + legendHeight})`)
    .call(legendAxis)
    .selectAll("text")
      .style("fill", "#ddd")
      .style("font-size", "10px");

  svg.selectAll(".legend-axis path, .legend-axis line")
    .style("stroke", "#555");

  // label the legend
  svg.append("text")
    .attr("x", x)
    .attr("y", y - 6)
    .style("fill", "#ddd")
    .style("font-size", "11px")
    .text("Democracy score");
}

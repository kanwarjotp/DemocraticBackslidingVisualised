import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { scaleLinear } from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { drawSvgLegend } from "./map.js";

export function drawScatter(
  demData,
  protestData,
  year,
  {
    container     = "#scatter",
    width         = 550,
    height        = 400,
    margin        = { top: 20, right: 20, bottom: 30, left: 40 },
    colorScale,
    onCircleClick = () => {}
  } = {}
) {
  const demByCountry      = d3.group(demData,     d => d.country);
  const protestsByCountry = d3.group(protestData, d => d.country);

    const scoreExtent = d3.extent(demData, d => d.score);
    const maxCount = d3.max(
        Array.from(protestsByCountry.values()),
        arr => arr.length
    );

    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const xScale = scaleLinear()
        .domain(scoreExtent)
        .range([margin.left, margin.left + innerW])
        .nice();

    const yScale = scaleLinear()
        .domain([0, maxCount])
        .range([margin.top + innerH, margin.top])
        .nice();
    
    const totalProtestorsByCountry = new Map(
        Array.from(protestsByCountry.entries()).map(([country, arr]) => [
            country,
            d3.sum(arr, d => d.number_ppl)
        ])
        );
    
  const stats = Array.from(demByCountry, ([country, recs]) => {
    const latest = recs.filter(r => r.year <= year).pop();
    
    const allProtests = protestsByCountry.get(country) || [];
    const pastProtests = allProtests.filter(p => p.date.getFullYear() <= year);
    const count = pastProtests.length;

    const size = d3.sum(
      pastProtests,
      p => +p.number_ppl        
    );

    return {
      country,
      score: latest?.score ?? 0,
      size,
      count
    };
  });

  const svg = d3.select(container)
    .selectAll("svg.scatter")
    .data([null])
    .join("svg")
      .attr("class", "scatter")
      .attr("width",  width)
      .attr("height", height);



  if (svg.selectAll(".axis").empty()) { // draw axis once
    svg.append("g")
      .attr("class","axis x-axis")
      .attr("transform", `translate(0,${margin.top+innerH})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll("text").style("fill","#ddd");

    svg.append("g")
      .attr("class","axis y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").style("fill","#ddd");

    svg.select(".x-axis")
    .append("text")
    .attr("class", "axis-label")
    .attr("x", margin.left + innerW / 2)
    .attr("y", 35) 
    .attr("fill", "#ddd")
    .attr("text-anchor", "middle")
    .text("Democracy Score");

    svg.select(".y-axis")
    .append("text")
      .attr("class", "axis-label")
      .attr("transform", `rotate(-90)`)
      .attr("x", -(margin.top + innerH / 2))
      .attr("y", -35)                   
      .attr("fill", "#ddd")
      .attr("text-anchor", "middle")
      .text("Number of protests");
  }


  // draw legend
  drawSvgLegend(svg, colorScale, width, height, true)

  console.log(container)
  console.log(stats)

  const maxCirlceSize = 3500000;
  console.log("Protetsings", protestsByCountry)
  const rScale = d3.scaleSqrt()
    .domain([0, maxCirlceSize])
    .range([2, 50]);  

    let tooltip = d3.select("body").selectAll("div.scatter-tooltip")
    .data([null])
    .join("div")
      .attr("class", "scatter-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "4px 8px")
      .style("border-radius", "3px")
      .style("font-size", "0.85rem")
      .style("display", "none");

  svg.selectAll("circle.country")
    .data(stats, d=>d.country)
    .join(
      enter => enter.append("circle")
                     .attr("cx", d=>xScale(d.score))
                     .attr("cy", yScale(0))
                     .attr("r", 0)
                     .attr("class", "country")
                     .attr("opacity", 0.5)  
                     .attr("fill", d=>colorScale(d.score))
                    .call(sel => sel.transition()
                                   .duration(1000)
                                   .ease(d3.easeSinIn)
                                   .attr("cy", d=>yScale(d.count))
                                   .attr("r",  d=>(rScale(d.size))))
                    .on("mouseover", (event,d) => {
                       tooltip
                         .html(`<strong>${d.country}</strong><br/>Protests: ${d.count}<br>Number of Protestor(s): ${d.size.toLocaleString()}` )
                         .style("left",  (event.pageX + 10) + "px")
                         .style("top",   (event.pageY - 28) + "px")
                         .style("display", "block");
                     })
                     .on("mousemove", event => {
                       tooltip
                         .style("left", (event.pageX + 10) + "px")
                         .style("top",  (event.pageY - 28) + "px");
                     })
                     .on("mouseout", () => {
                       tooltip.style("display", "none");
                     })
                     .on("click",     (event,d) => {
                       tooltip.style("display", "none");
                       onCircleClick(d.country);
                     }),
      update => update.transition()
                      .duration(1000)
                      .ease(d3.easeSinInOut)
                      .attr("cx", d=>xScale(d.score))
                      .attr("cy", d=>yScale(d.count))
                      .attr("fill", d=>colorScale(d.score))
                      .attr("r",  d=>(rScale(d.size)))
                      .on("mouseover", (event,d) => {
                       tooltip
                         .html(`<strong>${d.country}</strong><br/>Protests: ${d.count}`)
                         .style("left",  (event.pageX + 10) + "px")
                         .style("top",   (event.pageY - 28) + "px")
                         .style("display", "block");
                     })
                     .on("mousemove", event => {
                       tooltip
                         .style("left", (event.pageX + 10) + "px")
                         .style("top",  (event.pageY - 28) + "px");
                     })
                     .on("mouseout", () => {
                       tooltip.style("display", "none");
                     })
                     .on("click",     (event,d) => {
                       tooltip.style("display", "none");
                       onCircleClick(d.country);
                     }),
      exit   => exit.transition()
                     .duration(1000)
                     .ease(d3.easeSinOut)
                     .attr("r", 0)
                     .on("mouseout", () => {
                       tooltip.style("display", "none");
                     })
                     .remove()
    )
    .on("click", (e,d)=> onCircleClick(d.country));
}
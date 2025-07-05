import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function renderLineChart(
  demData,
  {
    container,
    country,
    year,
    width,
    height,
    margin = { top: 20, right: 20, bottom: 80, left: 50 }
  }
) {
  // filter data for country 
  const countryData = Array.isArray(demData)
    ? demData.filter(d => d.country === country && d.year <= year)
    : (demData.get(country) || []).filter(d => d.year <= year);

  // define indicators with keys and display labels
  const indicators = [
    { key: 'freedom_exp_media', label: 'Freedom of Expression & Media' },
    { key: 'freedom_of_assoc', label: 'Freedom of Association' },
    { key: 'ju_con', label: 'Judicial Constraints' },
    { key: 'leg_con', label: 'Legislative Constraints' },
    { key: 'free_fair_elec', label: 'Free & Fair Elections' }
  ];

  // build a series for each indicator
  const series = indicators.map(({ key, label }) => ({
    key,
    label,
    values: countryData.map(d => ({ year: d.year, value: d[key] }))
  }));

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const x = d3.scaleLinear()
    .domain(d3.extent(countryData, d => d.year))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .nice()
    .range([innerHeight, 0]);

  const color = d3.scaleOrdinal()
    .domain(indicators.map(i => i.key))
    .range(d3.schemeCategory10);

  // line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

  // create or select SVG
  const svg = d3.select(container)
    .selectAll('svg.linechart')
    .data([null])
    .join('svg')
      .attr('class', 'linechart')
      .attr('width', width)
      .attr('height', height);

  svg.selectAll('*').remove();
  const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // draw bg columns for each year
  g.selectAll('.year-rect')
    .data(countryData)
    .join('rect')
      .attr('class', 'year-rect')
      .attr('x', d => x(d.year) - (innerWidth / countryData.length) / 2)
      .attr('y', 0)
      .attr('width', innerWidth / countryData.length)
      .attr('height', innerHeight)
      .attr('fill', '#ccc')
      .attr('opacity', 0.1);

  // axes with vertical x labels
  const xAxis = d3.axisBottom(x).ticks(countryData.length).tickFormat(d3.format('d'));
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -10)
      .attr('y', 0)
      .style('text-anchor', 'end');

  g.append('g')
    .call(d3.axisLeft(y));

  // draw lines
  g.selectAll('.line')
    .data(series)
    .join('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values))
      .attr('stroke', d => color(d.key))
      .attr('fill', 'none')
      .attr('stroke-width', 2);

  // legend below map container with friendly labels
  const legend = d3.select(container)
    .selectAll('div.legend')
    .data([null])
    .join('div')
      .attr('class', 'legend')
      .style('display', 'flex')
      .style('flex-wrap', 'wrap')
      .style('justify-content', 'center')
      .style('margin-top', '10px');

  // rebuild legend items
  legend.selectAll('*').remove();
  series.forEach(s => {
    const item = legend.append('div')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('margin', '0 8px');

    item.append('span')
      .style('display', 'inline-block')
      .style('width', '12px')
      .style('height', '12px')
      .style('background-color', color(s.key))
      .style('margin-right', '4px');

    item.append('span')
      .text(s.label)
      .style('font-size', '12px');
  });
}

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function updateProtestList(containerSelector, protestsByCountry, country, year, onClick = {}) {
  const all = protestsByCountry.get(country) || [];
  console.log(all)
  // filter by year
  const listData = all.filter(d => d.date.getFullYear() <= year);

  const container = d3.select(containerSelector)
    .selectAll(".protest-item")
    .data(listData, d => d.id);

  // EXIT old
  container.exit().remove();

  // ENTER new
  const enterSel = container.enter()
    .append("div")
      .attr("class", "protest-item")
      .text(d => d.name)   // bold by CSS
      .on("click", (event, d) => {
        onClick(d);
      });

    // enterSel
    // .append("button")
    //     .attr("class", "btn btn-link text-light fw-bold protest-item")
    //     .text(d => d.name)
    //     .on("click", (e,d) => onClick(d));
    
  container.merge(enterSel);
}

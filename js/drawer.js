import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DRAWER_SEL = "#drawer";
const CONTENT_SEL = "#drawerContent";
const CLOSE_BTN  = "#closeDrawer";


// implementing close/open
export function initDrawer() {
  d3.select(CLOSE_BTN).on("click", () => {
    d3.select(DRAWER_SEL).classed("open", false);
  });
}

// show protest metrics for selected protest in drawer
export function showDrawer(d) {
  const drawer = d3.select(DRAWER_SEL);
  const content = drawer.select(CONTENT_SEL);

  content.html(`
    <h2>${d.name}</h2>
    <div class="container-fluid">
        <p><strong>Country:</strong> ${d.country}</p>
        <p><strong>Start date:</strong> ${d.date.toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${d.duration}</p>
        <p><strong>Size:</strong> ${d.size} protesting</p>
    </div>
    <hr>
    <div class="container-fluid">
        <p><strong>General Participants:</strong> ${d.gen_ptcpnt.toLocaleString()}</p>
        <p><strong>Key participants:</strong> ${d.key_ptcpnt}</p>
        <hr>
        <p><strong>Triggers:</strong> ${d.trigger}</p>
        <p><strong>Motivation:</strong> ${d.motivation}</p>
        <p><strong>Outcomes:</strong> ${d.outcome}</p>
    </div>
  `);

  drawer.classed("open", true);
}
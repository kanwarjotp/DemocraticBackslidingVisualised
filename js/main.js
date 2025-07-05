import {
    loadData
} from "./data-loader.js";
import {
    drawBaseMap,
    createColorScale,
    updateMap,
    drawSvgLegend,
    width,
    height
} from "./map.js";
import {
    updateProtestList
} from "./protest.js";
import {
    initDrawer,
    showDrawer
} from "./drawer.js";
import {
    drawScatter
} from "./scatter.js";
import {
    initControls
} from "./control.js";
import {
    computeSankeyData,
    renderSankey
} from "./sankey.js";
import { renderLineChart } from "./linechart.js";


let currentYear = 2017;
let selectedCountry = null;

function selectCountry(country, protestsByCountry, demByCountry, colorScale, protestData, mapSvg, year) {
    selectedCountry = country;
    currentYear = year;

    // update the protest‐list
    updateProtestList("#protest-list", protestsByCountry, country, year, showDrawer);

    // highlight on the map
    updateMap(mapSvg, demByCountry, colorScale, year);
    mapSvg.selectAll("path.country")
        .classed("highlighted", d => d.properties.name === country);


    // highlight the circle in the scatter and rbuild
    d3.selectAll("circle.country")
        .classed("highlighted", d => d.country === country);


    // rebuild sankey
    const sankeyData = computeSankeyData(protestData, country, year);
    renderSankey(sankeyData, {
        container: "#sankey-container",
        width: 550,
        height: 400
    });
    //  indicator viz
    renderLineChart(demByCountry, {
        container:    "#linechart",
        country:      country,
        year:         year,
        width:        document.querySelector("#linechart").clientWidth,
        height:       300   
    });
}

loadData()
    .then(({
        demData,
        protestData,
        mapData
    }) => {
        // build lookups
        const demByCountry = d3.group(demData, d => d.country);
        const protestsByCountry = d3.group(protestData, d => d.country);
        const colorScale = createColorScale(demData);

        // draw map
        const svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        initDrawer();

        drawBaseMap(svg, mapData, country => {
            selectedCountry = country;
            updateProtestList("#protest-list", protestsByCountry, country, currentYear, showDrawer);
            selectCountry(selectedCountry, protestsByCountry, demByCountry, colorScale, protestData, svg, currentYear); // update all other elements
        });
        updateMap(svg, demByCountry, colorScale, currentYear);
        drawSvgLegend(svg, colorScale);

        //initial sankey
        const sankeyData = computeSankeyData(protestData, "India", currentYear);
        renderSankey(sankeyData, {
            container: "#sankey-container",
            width: 550,
            height: 400
        });

        // initial scatter
        drawScatter(demData, protestData, currentYear, {
            container: "#scatter",
            colorScale,
            mapHighlightFn: country => {},
            showDrawerFn: showDrawer,
            onCircleClick: country => {
                // highlight on the map + update protest list
                selectedCountry = country;
                updateProtestList("#protest-list", protestsByCountry, country, currentYear, showDrawer);
                selectCountry(selectedCountry, protestsByCountry, demByCountry, colorScale, protestData, svg, currentYear); // update all other elements
            }
        });

        // initial lineChart
        renderLineChart(demByCountry, {
            container:    "#linechart",
            country:      "India",
            year:         2017,
            width:        document.querySelector("#linechart").clientWidth,
            height:       300  
        });

        // controls
        // map controls
        initControls({
            sliderSelector: "#yearSlider",
            labelSelector: "#yearLabel",
            playBtnSelector: "#playBtn",
            onYearChange: year => {
                currentYear = year;
                updateMap(svg, demByCountry, colorScale, year);
                if (selectedCountry) {
                    updateProtestList("#protest-list", protestsByCountry, selectedCountry, year, showDrawer);
                    selectCountry(selectedCountry, protestsByCountry, demByCountry, colorScale, protestData, svg, currentYear); // update all other elements
                }
                renderRidgeline(demData, {
                container: "#ridgeline",
                width:  280,
                height: 200,
                years:  [2017,2018,2019,2020,2021,2022,2023,2024],
                bins:   30
                });
            }
        });

        // interesting countries controls
        d3.selectAll("#suggested-countries li")
            .style("cursor", "pointer")
            .on("click", function () {
                const country = d3.select(this).attr("data-country");
                if (!country) return;

                selectedCountry = country;
                updateProtestList("#protest-list", protestsByCountry, country, currentYear, showDrawer);
                selectCountry(selectedCountry, protestsByCountry, demByCountry, colorScale, protestData, svg, currentYear);
            });
        //scatter controls
        initControls({
            sliderSelector: "#scatterYearSlider",
            labelSelector: "#scatterLabel",
            playBtnSelector: "#scatterPlayBtn",
            onYearChange: year => {
                currentYear = year;
                // update protest list and sankey with year changes as well
                if (selectedCountry){
                    updateProtestList("#protest-list", protestsByCountry, selectedCountry, currentYear, showDrawer);
                    selectCountry(selectedCountry, protestsByCountry, demByCountry, colorScale, protestData, svg, currentYear); // update all other elements;
                }

                drawScatter(demData, protestData, year, {
                    container: "#scatter",
                    colorScale,
                    mapHighlightFn: null,
                    showDrawerFn: showDrawer,
                    onCircleClick: country => {
                        selectedCountry = country;
                        if (selectedCountry) {
                            updateProtestList("#protest-list", protestsByCountry, country, currentYear, showDrawer);
                            selectCountry(selectedCountry, protestsByCountry, demByCountry, colorScale, protestData, svg, currentYear); // update all other elements
                        }
                    }
                })

            }
        });
    })
    .catch(console.error);

// loading all data in js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";



function parseDemocracyRow(d) {
  return {
    country:            d.country_name,
    year:               +d.year,
    score:              +d.PC1,
    freedom_exp_media:  +d.v2x_freexp_altinf,
    freedom_of_assoc:   +d.v2x_frassoc_thick,
    ju_con:             +d.v2x_jucon,
    leg_con:            +d.v2xlg_legcon,
    free_fair_elec:     +d.v2xel_frefair,
    partip_in_protest:  +d.v2x_cspart,
    partip_in_gov:      +d.v2x_partip,
    delib_dem:          +d.v2xdl_delib
  };
}

function parseProtestRow(d) {
  return {
    id:            d.Protest_ID,
    country:       d.CountryName,
    name:          d.ProtestName,
    date:          new Date(d.Parsed_Start_Date),
    year:          +d.Start_Year,
    gen_ptcpnt:    d.Participant_Grouped,
    key_ptcpnt:    d.Primary_Participant,
    size:          d.PeakSize,
    number_ppl:    d.Peak_Size_Normalized,
    duration:      d.Duration,
    motivation:    d.Motivations,
    trigger:       d.Triggers,
    outcome:       d.Outcomes,
    sig_outcome:   d.Protestswithasignificantoutcome,
    Economic:      d.Economic,
    Political:     d.Political,
    Corruption:    d.Corruption,
    Gender:        d.Gender
  };
}


export function loadData() {
    return Promise.all([ // async load data
        d3.csv("./data/democracy_data.csv", parseDemocracyRow),
        d3.csv("./data/protest_data.csv", parseProtestRow),
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    ]).then(([demData, protestData, mapData]) => {
        return {demData, protestData, mapData};
    });
}
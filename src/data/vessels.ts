export type Vessel = {
  id: string;
  wbsId: string;
  title: string;
  sector: string;
  category: string;
  description: string;
  location: string;
  price: string;
  image: string;
  specs: { label: string; value: string }[];
  summary: string;
};

const img = [
  "https://images.pexels.com/photos/31751960/pexels-photo-31751960.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/29014457/pexels-photo-29014457.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/20600690/pexels-photo-20600690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13178759/pexels-photo-13178759.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13178758/pexels-photo-13178758.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13630777/pexels-photo-13630777.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/24869107/pexels-photo-24869107.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/35808484/pexels-photo-35808484.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13368022/pexels-photo-13368022.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/35901645/pexels-photo-35901645.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

const blurbs: Record<string, string> = {
  Barges:
    "Deck, hopper and spud barges for cargo, dredging support and marine construction projects, available for sale or worldwide charter.",
  Cargo:
    "General cargo coasters and multipurpose vessels for short-sea, coastal and regional trades.",
  "Crane Barge":
    "Derrick and crane barges for pile driving, subsea installation, salvage and heavy lift campaigns.",
  "Crew vessels":
    "Crew transfer and crew boats serving offshore wind, oil & gas terminals and port operations.",
  "Dive Vessels":
    "Dive support vessels with A-frames, dive control and survey spreads for inshore and offshore work.",
  Dredgers:
    "Cutter suction, trailing suction and grab dredgers for maintenance and capital dredging contracts.",
  "Fire Fighting Vessels":
    "FiFi-classed fireboats with monitors, foam systems, rescue craft and towing capability.",
  "Fishing Boats":
    "Trawlers, longliners and seiners for inshore and offshore fishing operations.",
  "For Charter":
    "Vessels currently open for time, trip or bareboat charter through our brokerage desk.",
  "Guard / Safety":
    "Guard and safety vessels with fast rescue craft, hospital facilities and standby capability.",
  "Jack up Barges":
    "Self-elevating jack-up platforms for cable lay, wind farm construction, accommodation and repair.",
  "Landing craft":
    "Shallow draft landing craft with bow ramps for cargo, plant, fuel and vehicle delivery.",
  "Marine plant & equipment":
    "Marine plant and equipment including spuds, anchors, pontoons, winches and dredging spreads.",
  "Multi Purpose":
    "Multi-purpose workboats for survey, utility, deck cargo and general marine services.",
  Multicat:
    "Multicat workboats with heavy deck cranes for anchor handling, dredging support and civils.",
  "Passenger Ferries":
    "Passenger ferries, excursion and restaurant vessels holding valid passenger certificates.",
  "Patrol boats":
    "Patrol and enforcement craft for customs, immigration, navy and port authority duties.",
  "Pilot boats":
    "Pilot launches with push-on fendering and safe boarding arrangements for harbour and terminal duties.",
  "Pollution control":
    "Oil spill response and pollution control vessels with skimmers, booms and recovered oil tankage.",
  "Project vessel":
    "Project and conversion vessels suited to research, accommodation and specialist campaigns.",
  "Reduced In Price":
    "Vessels currently offered at reduced prices, or from motivated vendors open to offers.",
  "Ribs & Tenders":
    "RIBs, tenders and small workboats for crew transfer, dive support and yacht services.",
  "Semi submarine":
    "Semi-submersible and glass-bottom vessels for tourism, survey and inspection work.",
  "Supply Vessel":
    "Platform supply and anchor handling vessels with DP capability for offshore field support.",
  Survey:
    "Hydrographic and geophysical survey vessels with moon pools, winches and positioning systems.",
  Tankers:
    "Product, bunker and chemical tankers with double hull and modern pumping arrangements.",
  Tugs:
    "Harbour, coastal and ASD tugs with up to 85 tonnes bollard pull, FiFi and escort notation.",
  Uncategorized:
    "Newly listed vessels currently awaiting classification by our brokerage team.",
};

/** title, location, price, built, loa, beam, draft, power/equipment, class, sector */
type Row = [string, string, string, string, string, string, string, string, string, string];

const rows: Record<string, Row[]> = {
  Barges: [
    ["36.5m Flattop Deck Cargo Barge – For sale or charter", "NORTH EUROPE", "POA", "2008", "36.50 m", "12.20 m", "2.44 m", "Deck load 10 t/m²", "Load line, unclassed", "For sale or charter"],
    ["44.1m Split Hopper Barge for Charter", "UK COAST", "POA", "1998", "44.10 m", "8.20 m", "2.23 m", "Hopper 400 m³", "Bureau Veritas", "For charter"],
    ["28m Spud Barge with 4-point Mooring", "WEST AFRICA", "185,000 USD", "2006", "28.00 m", "10.50 m", "1.80 m", "Spuds 18 m", "Unclassed", "For sale"],
  ],
  Cargo: [
    ["82m General Cargo Coaster – For sale", "BLACK SEA", "1,950,000 USD", "1999", "82.00 m", "11.40 m", "3.85 m", "2,250 dwt", "RINA", "For sale"],
    ["68m Multipurpose Cargo Vessel", "MEDITERRANEAN", "POA", "2004", "68.00 m", "10.20 m", "3.40 m", "1,600 dwt", "Bureau Veritas", "For sale"],
    ["45m Coastal Cargo Vessel with Box Hold", "UK", "320,000 GBP", "1994", "45.00 m", "8.20 m", "2.90 m", "640 dwt", "DNV", "For sale"],
  ],
  "Crane Barge": [
    ["45m Crane Barge with 250t Derrick", "NORTH SEA", "POA", "2003", "45.00 m", "18.00 m", "3.20 m", "Crane 250 t", "ABS", "For sale or charter"],
    ["32m Sheerleg Crane Barge 120t", "SOUTH EAST ASIA", "POA", "1999", "32.00 m", "14.00 m", "2.60 m", "Crane 120 t", "Unclassed", "For charter"],
    ["24m Spud Crane Barge", "WEST AFRICA", "295,000 USD", "2010", "24.00 m", "11.00 m", "1.60 m", "Crane 45 t", "Unclassed", "For sale"],
  ],
  "Crew vessels": [
    ["24m Aluminium Crew Transfer Vessel – For charter", "NORTH SEA", "POA", "2014", "24.00 m", "9.00 m", "1.60 m", "2 x 1,000 hp", "DNV HSLC / MCA Cat 1", "For charter"],
    ["18m Crew Boat 12 PAX", "WEST AFRICA", "480,000 USD", "2011", "18.00 m", "5.60 m", "1.30 m", "2 x 1,200 hp", "MCA Cat 1", "For sale"],
    ["32m Fast Crew Boat 50 PAX", "MIDDLE EAST", "POA", "2016", "32.00 m", "7.20 m", "1.80 m", "3 x 1,800 hp", "ABS HSC", "For charter"],
  ],
  "Dive Vessels": [
    ["10.10m Survey & Dive Vessel – For sale or Charter", "UK", "0.00 GBP", "2012", "10.10 m", "5.73 m", "1.20 m", "2 x 150 hp", "MCA Cat 2 coded", "For sale or charter"],
    ["26m Dive Support Vessel with Sat System", "NORTH SEA", "POA", "2009", "26.00 m", "8.60 m", "2.10 m", "Deck crane 10 t", "DNV", "For charter"],
    ["16m Catamaran Dive Support Boat", "MEDITERRANEAN", "210,000 EUR", "2013", "16.00 m", "6.40 m", "1.10 m", "A-frame 3 t", "MCA Cat 3", "For sale"],
  ],
  Dredgers: [
    ["18m Cutter Suction Dredger – For sale", "NETHERLANDS", "POA", "2011", "18.00 m", "6.00 m", "1.40 m", "Cutter 150 kW", "Unclassed", "For sale"],
    ["46m TSHD 1,200 m³", "SOUTH EAST ASIA", "POA", "2007", "46.00 m", "11.20 m", "3.60 m", "Hopper 1,200 m³", "RINA", "For sale or charter"],
    ["32m Grab Hopper Dredger", "WEST AFRICA", "650,000 USD", "2005", "32.00 m", "9.00 m", "2.40 m", "Grab 8 m³", "Bureau Veritas", "For sale"],
  ],
  "Fire Fighting Vessels": [
    ["25m FiFi 1 Fire Fighting Vessel", "MIDDLE EAST", "POA", "2008", "25.00 m", "8.00 m", "2.20 m", "FiFi 1 x 1,200 m³/h", "ABS", "For sale"],
    ["18m Port Fire Boat", "UK", "295,000 GBP", "2001", "18.00 m", "5.80 m", "1.50 m", "Monitors 2 x 600 m³/h", "MCA Cat 2", "For sale"],
    ["33m FiFi 2 Emergency Response Vessel", "NORTH SEA", "POA", "2012", "33.00 m", "9.60 m", "3.10 m", "FiFi 2 x 2,200 m³/h", "DNV", "For charter"],
  ],
  "Fishing Boats": [
    ["28m Steel Trawler", "NORTH EAST ATLANTIC", "385,000 EUR", "1996", "28.00 m", "7.20 m", "3.40 m", "900 hp", "Bureau Veritas", "For sale"],
    ["15m Longliner", "WEST AFRICA", "120,000 USD", "2004", "15.00 m", "5.00 m", "2.10 m", "450 hp", "Unclassed", "For sale"],
    ["34m Purse Seiner", "MEDITERRANEAN", "POA", "2009", "34.00 m", "8.20 m", "3.80 m", "1,400 hp", "RINA", "For sale"],
  ],
  "For Charter": [
    ["38m AHTS 65t BP – Available for Charter", "NORTH SEA", "POA", "2010", "38.00 m", "11.20 m", "4.20 m", "Bollard pull 65 t", "DNV", "For charter"],
    ["22m Multicat for Charter", "UK COAST", "POA", "2015", "22.00 m", "8.40 m", "1.50 m", "Deck crane 20 t/m", "MCA Cat 2", "For charter"],
    ["55m PSV – Charter Available", "WEST AFRICA", "POA", "2011", "55.00 m", "13.20 m", "4.40 m", "Deck 420 m²", "ABS DP1", "For charter"],
  ],
  "Guard / Safety": [
    ["35m Standby Safety Vessel", "NORTH SEA", "POA", "2005", "35.00 m", "10.20 m", "3.60 m", "FRC 2 x 16 PAX", "DNV", "For charter"],
    ["27m Guard Vessel with Rescue Facility", "MIDDLE EAST", "POA", "2008", "27.00 m", "8.40 m", "2.60 m", "Hospital bay", "ABS", "For sale or charter"],
    ["19m Fast Rescue Craft", "NORTH SEA", "240,000 GBP", "2013", "19.00 m", "5.40 m", "1.20 m", "2 x 1,000 hp", "MCA Cat 1", "For sale"],
  ],
  "Jack up Barges": [
    ["45m Jack Up Platform, 400t capacity", "NORTH SEA", "POA", "2007", "45.00 m", "24.00 m", "3.20 m", "Legs 45 m", "ABS", "For sale or charter"],
    ["32m Self-Elevating Jack Up Barge", "SOUTH EAST ASIA", "POA", "2011", "32.00 m", "18.00 m", "2.60 m", "Crane 80 t", "Bureau Veritas", "For charter"],
    ["26m Mini Jack Up with Accommodation", "MIDDLE EAST", "1,100,000 USD", "2014", "26.00 m", "14.00 m", "2.10 m", "12 berths", "Unclassed", "For sale"],
  ],
  "Landing craft": [
    ["11.5m Aluminium Landing Craft – For sale", "UK", "185,000 GBP", "2016", "11.50 m", "4.20 m", "0.90 m", "Deck crane 2.5 t/m", "MCA Workboat Code Cat 2", "For sale"],
    ["21m Steel Landing Craft", "WEST AFRICA", "220,000 USD", "2012", "21.00 m", "6.40 m", "1.30 m", "Payload 40 t", "Unclassed", "For sale"],
    ["15m Beach Landing Craft", "MIDDLE EAST", "POA", "2018", "15.00 m", "5.20 m", "0.85 m", "Payload 18 t", "Unclassed", "For sale or charter"],
  ],
  "Marine plant & equipment": [
    ["Dredging Spread – Spuds, Winches & Anchors", "NETHERLANDS", "POA", "2010", "—", "—", "—", "Complete spread", "Unclassed", "For sale"],
    ["4 x Spud Legs 24m with Hydraulic Racks", "UK", "95,000 GBP", "2013", "—", "—", "—", "Legs 24 m", "Unclassed", "For sale"],
    ["Modular Steel Pontoons 12 x 6m", "WEST AFRICA", "POA", "2015", "12.00 m", "6.00 m", "1.20 m", "Deck load 15 t/m²", "Load line", "For sale or charter"],
  ],
  "Multi Purpose": [
    ["16m Multi Purpose Workboat", "UK", "265,000 GBP", "2015", "16.00 m", "5.60 m", "1.10 m", "Deck crane 3 t/m", "MCA Cat 2", "For sale"],
    ["24m Multi Purpose Survey Workboat", "NORTH SEA", "POA", "2012", "24.00 m", "7.80 m", "1.80 m", "A-frame 5 t", "DNV", "For sale or charter"],
    ["30m Multi Purpose Deck Vessel", "MEDITERRANEAN", "POA", "2006", "30.00 m", "9.00 m", "2.20 m", "Deck 180 m²", "RINA", "For charter"],
  ],
  Multicat: [
    ["22m Multicat with 20 t/m Crane", "UK COAST", "POA", "2015", "22.00 m", "8.40 m", "1.50 m", "Deck crane 20 t/m", "MCA Cat 2", "For charter"],
    ["26m Multicat – Anchor Handling", "NORTH SEA", "POA", "2011", "26.00 m", "9.60 m", "1.90 m", "Winch 40 t", "DNV", "For sale or charter"],
    ["18m Multicat Utility Vessel", "WEST AFRICA", "420,000 USD", "2013", "18.00 m", "7.60 m", "1.30 m", "Deck crane 12 t/m", "Unclassed", "For sale"],
  ],
  "Passenger Ferries": [
    ["32.5m Yacht -16 cabin, restaurant vessel – For sale", "MEDITERRANEAN", "1,250,000 EUR", "1996 / refit 2019", "32.50 m", "7.60 m", "1.95 m", "120 passengers", "RINA", "For sale"],
    ["40m Passenger Ferry 250 PAX", "SOUTH EAST ASIA", "POA", "2008", "40.00 m", "9.80 m", "2.30 m", "2 x 1,500 hp", "Bureau Veritas", "For sale"],
    ["24m Catamaran Excursion Vessel", "MIDDLE EAST", "690,000 USD", "2014", "24.00 m", "8.00 m", "1.40 m", "150 passengers", "MCA Cat 2", "For sale"],
  ],
  "Patrol boats": [
    ["28m Aluminium Patrol Boat", "WEST AFRICA", "POA", "2016", "28.00 m", "6.20 m", "1.60 m", "3 x 1,800 hp", "ABS", "For sale"],
    ["19m Fast Interceptor Craft", "MIDDLE EAST", "340,000 USD", "2018", "19.00 m", "5.20 m", "1.10 m", "2 x 1,200 hp", "Unclassed", "For sale"],
    ["35m Coastal Patrol Vessel", "MEDITERRANEAN", "POA", "2011", "35.00 m", "7.40 m", "2.20 m", "2 x 2,400 hp", "RINA", "For sale or charter"],
  ],
  "Pilot boats": [
    ["16m Pilot Launch", "UK", "245,000 GBP", "2013", "16.00 m", "5.20 m", "1.40 m", "2 x 600 hp", "MCA Cat 3", "For sale"],
    ["22m Sea Going Pilot Boat", "NORTH SEA", "POA", "2010", "22.00 m", "6.60 m", "1.90 m", "2 x 1,000 hp", "DNV", "For sale or charter"],
    ["12m Harbour Pilot Boat", "WEST AFRICA", "135,000 USD", "2015", "12.00 m", "4.20 m", "1.00 m", "2 x 380 hp", "Unclassed", "For sale"],
  ],
  "Pollution control": [
    ["26m Oil Spill Response Vessel", "NORTH SEA", "POA", "2009", "26.00 m", "9.00 m", "2.20 m", "Skimmer 100 m³/h", "DNV", "For sale or charter"],
    ["18m Pollution Control Boat", "MEDITERRANEAN", "285,000 EUR", "2012", "18.00 m", "6.20 m", "1.40 m", "Boom 300 m", "RINA", "For sale"],
    ["32m Emergency Response & Recovery Vessel", "MIDDLE EAST", "POA", "2015", "32.00 m", "9.80 m", "2.80 m", "Tankage 220 m³", "ABS", "For charter"],
  ],
  "Project vessel": [
    ["55m Project / Accommodation Vessel", "NORTH SEA", "POA", "2002 / refit 2018", "55.00 m", "14.00 m", "4.20 m", "48 berths", "DNV", "For sale or charter"],
    ["42m Research & Survey Vessel", "MEDITERRANEAN", "POA", "2010", "42.00 m", "10.60 m", "3.40 m", "Moon pool 4 x 4 m", "RINA", "For charter"],
    ["30m Multipurpose Project Vessel", "WEST AFRICA", "POA", "2007", "30.00 m", "8.80 m", "2.60 m", "Deck crane 15 t", "Bureau Veritas", "For sale"],
  ],
  "Reduced In Price": [
    ["24m Crew Boat – Price Reduced", "WEST AFRICA", "295,000 USD (was 385,000)", "2011", "24.00 m", "6.40 m", "1.60 m", "2 x 1,200 hp", "MCA Cat 1", "For sale"],
    ["36m Flattop Barge – Reduced", "NORTH EUROPE", "145,000 EUR (was 190,000)", "2005", "36.00 m", "12.00 m", "2.30 m", "Deck load 8 t/m²", "Load line", "For sale"],
    ["18m Multicat – Offers Invited", "UK", "165,000 GBP (was 210,000)", "2012", "18.00 m", "7.20 m", "1.30 m", "Deck crane 10 t/m", "MCA Cat 2", "For sale"],
  ],
  "Ribs & Tenders": [
    ["8.5m Workboat RIB", "UK", "48,000 GBP", "2018", "8.50 m", "3.10 m", "0.60 m", "2 x 250 hp", "MCA Cat 4", "For sale"],
    ["12m Survey RIB with A-frame", "NORTH SEA", "POA", "2016", "12.00 m", "4.00 m", "0.75 m", "2 x 350 hp", "MCA Cat 3", "For charter"],
    ["10m Yacht Support Tender", "MEDITERRANEAN", "92,000 EUR", "2019", "10.00 m", "3.40 m", "0.70 m", "2 x 300 hp", "CE Cat B", "For sale"],
  ],
  "Semi submarine": [
    ["25m Semi-Submarine Tourist Vessel", "MIDDLE EAST", "POA", "2008", "25.00 m", "8.00 m", "2.40 m", "50 passengers", "Bureau Veritas", "For sale"],
    ["18m Glass Bottom Boat", "MEDITERRANEAN", "210,000 EUR", "2012", "18.00 m", "6.00 m", "1.60 m", "40 passengers", "RINA", "For sale"],
    ["32m Semi-Submersible Survey Craft", "SOUTH EAST ASIA", "POA", "2010", "32.00 m", "9.60 m", "3.10 m", "Observation deck", "Unclassed", "For sale or charter"],
  ],
  "Supply Vessel": [
    ["60m Platform Supply Vessel – For sale", "WEST AFRICA", "POA", "2010", "60.00 m", "14.00 m", "4.60 m", "Deck 450 m²", "ABS +A1 OSV, DP1", "For sale"],
    ["55m PSV for Charter", "NORTH SEA", "POA", "2011", "55.00 m", "13.20 m", "4.40 m", "Deck 420 m²", "DNV DP1", "For charter"],
    ["48m AHTS 70t Bollard Pull", "MIDDLE EAST", "POA", "2009", "48.00 m", "12.60 m", "4.80 m", "Bollard pull 70 t", "ABS", "For sale or charter"],
  ],
  Survey: [
    ["28m Hydrographic Survey Vessel", "NORTH SEA", "POA", "2013", "28.00 m", "8.60 m", "2.30 m", "Moon pool 2 x 2 m", "DNV", "For charter"],
    ["15m Inshore Survey Craft", "UK", "175,000 GBP", "2016", "15.00 m", "5.00 m", "1.00 m", "Multibeam spread", "MCA Cat 3", "For sale"],
    ["36m Geophysical Survey Vessel", "WEST AFRICA", "POA", "2006", "36.00 m", "9.80 m", "3.20 m", "Stern A-frame 8 t", "Bureau Veritas", "For sale or charter"],
  ],
  Tankers: [
    ["88m Product Tanker 3,200 dwt", "MEDITERRANEAN", "POA", "2005", "88.00 m", "13.60 m", "5.20 m", "3,200 dwt", "RINA", "For sale"],
    ["62m Bunker Tanker 1,450 dwt", "WEST AFRICA", "850,000 USD", "2009", "62.00 m", "10.60 m", "4.10 m", "1,450 dwt", "Bureau Veritas", "For sale"],
    ["45m Coastal Chemical Tanker", "NORTH SEA", "POA", "2011", "45.00 m", "9.20 m", "3.60 m", "Double hull", "DNV", "For sale or charter"],
  ],
  Tugs: [
    ["49.4 TBP Tug Twin Screw, Ice class – For sale", "BALTIC", "POA", "2004", "29.80 m", "9.50 m", "4.10 m", "Bollard pull 49.4 t", "RMRS Ice 2", "For sale"],
    ["32m ASD Harbour Tug 60t BP", "WEST AFRICA", "POA", "2012", "32.00 m", "11.20 m", "4.40 m", "Bollard pull 60 t", "ABS", "For sale or charter"],
    ["27m Coastal Towage Tug 35t BP", "UK COAST", "680,000 GBP", "2008", "27.00 m", "9.20 m", "3.80 m", "Bollard pull 35 t", "Bureau Veritas", "For sale"],
  ],
  Uncategorized: [
    ["14m Steel Workboat – New Listing", "UK", "POA", "2010", "14.00 m", "4.80 m", "1.10 m", "2 x 300 hp", "Unclassed", "For sale"],
    ["20m Unspecified Service Vessel", "WEST AFRICA", "POA", "2007", "20.00 m", "6.80 m", "1.70 m", "Details to follow", "Unclassed", "For sale or charter"],
    ["33m Vessel – Particulars on Request", "MEDITERRANEAN", "POA", "2003", "33.00 m", "9.20 m", "2.80 m", "Details to follow", "Unclassed", "For charter"],
  ],
};

const built: Vessel[] = [];
let counter = 0;

Object.keys(rows).forEach((category) => {
  rows[category].forEach((r) => {
    const [title, location, price, year, loa, beam, draft, power, cls, sector] = r;
    const index = counter++;
    built.push({
      id: `v-${1000 + index}`,
      wbsId: `WBS ${1000 + index}`,
      title,
      sector,
      category,
      description:
        loa === "—" ? power : `${loa.replace(" m", "")} x ${beam.replace(" m", "")} x ${draft.replace(" m", "")}m draft`,
      location,
      price,
      image: img[index % img.length],
      summary: `${blurbs[category]} This unit is offered from ${location.toLowerCase()} with delivery by arrangement. Particulars are given in good faith and without guarantee.`,
      specs: [
        { label: "Built", value: year },
        { label: "LOA", value: loa },
        { label: "Beam", value: beam },
        { label: "Draft", value: draft },
        { label: "Power / capacity", value: power },
        { label: "Class", value: cls },
      ],
    });
  });
});

export const vessels: Vessel[] = built;

/** Full category list as shown in the vessel search dropdown. */
export const CATEGORY_LIST = [
  "Barges",
  "Cargo",
  "Crane Barge",
  "Crew vessels",
  "Dive Vessels",
  "Dredgers",
  "Fire Fighting Vessels",
  "Fishing Boats",
  "For Charter",
  "Guard / Safety",
  "Jack up Barges",
  "Landing craft",
  "Marine plant & equipment",
  "Multi Purpose",
  "Multicat",
  "Passenger Ferries",
  "Patrol boats",
  "Pilot boats",
  "Pollution control",
  "Project vessel",
  "Reduced In Price",
  "Ribs & Tenders",
  "Semi submarine",
  "Supply Vessel",
  "Survey",
  "Tankers",
  "Tugs",
  "Uncategorized",
];

export const sectors = [
  "All",
  ...Array.from(new Set(vessels.map((v) => v.sector))),
];
export const locations = [
  "All",
  ...Array.from(new Set(vessels.map((v) => v.location))),
];

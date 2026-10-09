export type Vessel = {
  id: string;
  /** Unique listing reference, e.g. "AGM 1000" */
  agmId: string;
  title: string;
  sector: string;
  category: string;
  description: string;
  location: string;
  price: string;
  image: string;
  specs: { label: string; value: string }[];
  summary: string;
  /** Optional long-form broker copy; the detail page shows it in place of `summary`. */
  details?: string;
  /** Optional bullet-point remarks shown on the detail page. */
  remarks?: string[];
  /** Optional extra specification rows beyond the six key `specs`. */
  particulars?: { label: string; value: string }[];
  /** Optional named contact for this specific listing. */
  contact?: string;
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
  "For Sale":
    "Vessels offered for outright sale through our brokerage desk, with survey, documentation and worldwide delivery arranged.",
};

/** title, location, price, built, loa, beam, draft, power/equipment, class, sector */
type Row = [string, string, string, string, string, string, string, string, string, string];

const rows: Record<string, Row[]> = {
  "For Sale": [
    ["13,100 DWT Oil / Chemical Tanker – For Sale", "WORLDWIDE", "POA", "2006", "125.00 m", "20.20 m", "8.71 m", "MAN B&W 6S35MC, 4,440 kW", "RINA", "For sale"],
    ["4,300 DWT Oil Tanker with Boiler Heating System – For Sale", "OFFSHORE", "POA", "2012", "97.30 m", "15.30 m", "5.59 m", "Ningdong GN6320, 735 kW", "CCS", "For sale"],
    ["4,500 DWT Oil Tanker – For Sale", "OFFSHORE / NEAR SEA", "POA", "2011", "97.00 m", "15.20 m", "5.90 m", "Guangzhou Diesel 8320, 2,060 kW", "CCS", "For sale"],
    ["3,600 DWT Deck Barge – For Sale", "COASTAL WATERS", "POA", "2015", "90.00 m", "19.00 m", "3.50 m", "2 x Yuchai YC6C730L-C20, 536 kW", "ZC", "For sale"],
    ["Crew Transfer Vessel (CTV 1506) – For Sale", "PORT GENTIL, GABON", "EUR 550,000", "2009", "15.43 m", "6.30 m", "0.90 m", "2 x Scania, 550 kW", "—", "For sale"],
    ["AHTS MARIDIVE 703 – For Sale", "EGYPT", "On Application", "2011", "—", "—", "—", "2 x MaK, 5,400 BHP (10,800 BHP total)", "ABS A1 (E), DPS-2, FiFi-1", "For sale"],
    ["AHTS MARIDIVE 704 – For Sale", "EGYPT", "USD 15M (region)", "2011", "—", "—", "—", "2 x MaK, 5,400 BHP (10,800 BHP total)", "ABS A1 (E), DPS-2, FiFi-1", "For sale"],
    ["DP-2 Diesel Electric Platform Supply Vessel (SPM ALPHA) – For Sale", "TAKORADI, GHANA", "USD 12.5M", "2006", "73.20 m", "16.50 m", "5.63 m", "2 x 1,920 kW Z-drive (diesel-electric)", "ABS A1, FFV 1, DPS-2", "For sale"],
  ],
};

const built: Vessel[] = [];
let counter = 0;

/**
 * Optional per-listing additions that do not fit the positional tuple above,
 * keyed by the exact `title`. Kept separate so rich copy for one listing never
 * changes the tuple shape or the id sequence for any other row.
 */
const extras: Record<
  string,
  {
    image?: string;
    details?: string;
    remarks?: string[];
    particulars?: { label: string; value: string }[];
    contact?: string;
  }
> = {
  "13,100 DWT Oil / Chemical Tanker – For Sale": {
    image: "https://i.ibb.co/60tPbY70/Whats-App-Image-2026-10-08-at-7-18-45-AM.jpg",
    details:
      "Korean-built 13,100 DWT oil / chemical tanker with double hull and double bottom construction. Twelve cargo tanks, suitable for clean petroleum products and selected chemical parcels. MAN B&W 6S35MC main engine rated 4,440 kW. RINA class, Panama flag, unlimited navigation. Handy size, well suited for both regional and ocean-going employment.",
    remarks: [
      "2006 Korean newbuilding quality",
      "12 segregated cargo tanks",
      "Double hull / double bottom",
      "Worldwide trading capability",
      "Full specs, GA plan, tank coating, survey status and price on request",
      "Subject to prior sale, price change or withdrawal",
    ],
    particulars: [
      { label: "Deadweight", value: "13,100 MT" },
      { label: "Builder", value: "South Korea" },
      { label: "Flag", value: "Panama" },
      { label: "Depth", value: "11.30 m" },
      { label: "Light draft", value: "2.56 m" },
      { label: "Cargo tanks", value: "12" },
      { label: "Hull", value: "Double bottom / double hull" },
      { label: "Gross tonnage", value: "8,560" },
      { label: "Net tonnage", value: "4,093" },
      { label: "Trading area", value: "Unlimited / worldwide" },
    ],
    contact: "Anna (Vice President)",
  },
  "4,300 DWT Oil Tanker with Boiler Heating System – For Sale": {
    image: "https://i.ibb.co/N612YgY1/Whats-App-Image-2026-10-08-at-7-24-52-AM.jpg",
    details:
      "Well-maintained 4,300 DWT oil tanker built in 2012 in Zhejiang, China, and fully certified by CCS. Double-bottom and double-hull design with ten cargo holds and a boiler heating system for cargo temperature management, allowing a wider range of oil products to be carried. Ningdong GN6320 main engine rated 735 kW. Well maintained and suitable for immediate offshore deployment.",
    remarks: [
      "Modern double-hull design complies with enhanced environmental and safety standards",
      "Boiler heating system permits a wider range of oil products",
      "Built by a reputable Chinese shipyard and maintained under CCS class",
      "Good condition, suitable for immediate deployment",
    ],
    particulars: [
      { label: "Deadweight", value: "4,300 MT" },
      { label: "Builder", value: "Zhejiang, China" },
      { label: "Loaded draft", value: "5.586 m" },
      { label: "Ballast draft", value: "3.6 m" },
      { label: "Gross tonnage", value: "2,950" },
      { label: "Net tonnage", value: "1,650" },
      { label: "Cargo holds", value: "10" },
      { label: "Hull", value: "Double bottom / double hull" },
      { label: "Trading area", value: "Offshore" },
    ],
    contact: "Anna (Vice President)",
  },
  "4,500 DWT Oil Tanker – For Sale": {
    image: "https://i.ibb.co/6cTsRkpb/Whats-App-Image-2026-10-08-at-7-29-44-AM.jpg",
    details:
      "This 4,500 DWT oil tanker was built in 2011 in Guangxi, China and is classed with CCS. The vessel is of double bottom and double hull construction with 10 cargo tanks. She is powered by a Guangzhou Diesel 8320 main engine rated at 2,060 kW. Trading area is offshore / near sea. The vessel is in good condition and available for inspection by appointment.",
    remarks: [
      "Double bottom and double hull construction with 10 cargo tanks",
      "Guangzhou Diesel 8320 main engine rated 2,060 kW",
      "Offshore / near sea trading area",
      "Good condition, available for inspection by appointment",
    ],
    particulars: [
      { label: "Deadweight", value: "4,500 MT" },
      { label: "Builder", value: "Guangxi, China" },
      { label: "Moulded depth", value: "7.0 m" },
      { label: "Light draught", value: "3.8 m" },
      { label: "Cargo tanks", value: "10" },
      { label: "Hull", value: "Double bottom / double hull" },
      { label: "Gross tonnage", value: "3,000" },
      { label: "Net tonnage", value: "1,680" },
      { label: "Trading area", value: "Offshore / Near Sea" },
    ],
    contact: "Anna",
  },
  "3,600 DWT Deck Barge – For Sale": {
    image: "https://i.ibb.co/b5scrVyN/Whats-App-Image-2026-10-08-at-7-46-05-AM-1.jpg",
    details:
      "3,600 DWT deck barge built in 2015 in Jiangsu, China and classed with ZC under the PRC flag. Open flat deck design with no cargo holds — well suited to project cargo, heavy lift and modular transport. Twin Yuchai YC6C730L-C20 main engines rated 536 kW each, trading in coastal waters. Well maintained and ready for inspection and delivery.",
    remarks: [
      "Open flat deck, no cargo holds — ideal for project cargo, heavy lift or modular transport",
      "Twin Yuchai YC6C730L-C20 main engines, 536 kW each",
      "Built 2015, well maintained, ready for inspection and delivery",
    ],
    particulars: [
      { label: "Deadweight", value: "Approx. 3,600 MT" },
      { label: "Builder", value: "Jiangsu, China" },
      { label: "Flag", value: "Chinese (PRC)" },
      { label: "Moulded depth", value: "5.00 m" },
      { label: "Light draft", value: "3.00 m" },
      { label: "Structure", value: "Single bottom, single side shell" },
      { label: "Gross tonnage", value: "1,300 GT" },
      { label: "Net tonnage", value: "2,300 NT" },
      { label: "Navigation area", value: "Coastal waters" },
    ],
    contact: "Taizhou Changlong Shipping Trading Co., Ltd – Anna (Vice President)",
  },
  "Crew Transfer Vessel (CTV 1506) – For Sale": {
    image: "https://i.ibb.co/0jY4ytqg/Unknown-1.jpg",
    details:
      "Crew transfer vessel (model CTV 1506) built in 2009, measuring 15.43 m LOA with a 6.30 m beam and a shallow 0.90 m aft draft. Powered by twin Scania main engines rated 550 kW each, achieving a maximum speed of 23–24 knots with capacity for 12 POB. Port engine renewed, starboard engine 12,000 hours, fuel capacity 3.64 m³. Available for inspection at Port Gentil, Gabon.",
    remarks: [
      "Twin Scania main engines, 550 kW each",
      "Max speed 23 – 24 knots, 12 POB",
      "Engine hours: PS renewed / 12,000 h (SB)",
      "Inspection by appointment at Port Gentil, Gabon",
    ],
    particulars: [
      { label: "Model", value: "CTV 1506" },
      { label: "Vessel type", value: "Crew Transfer Vessel (CTV)" },
      { label: "Draft (aft)", value: "0.90 m" },
      { label: "Max speed", value: "23 – 24 knots" },
      { label: "POB", value: "12" },
      { label: "Engine hours", value: "PS renewed / 12,000 h (SB)" },
      { label: "Fuel capacity", value: "3.64 m³" },
      { label: "Inspection", value: "Port Gentil, Gabon" },
    ],
  },
  "AHTS MARIDIVE 703 – For Sale": {
    image: "https://i.ibb.co/1tJTzBHd/image-8.png",
    details:
      "MARIDIVE 703 — 2011-built anchor handling tug supply vessel (AHTS), DP-2 / FiFi-1, classed ABS +A1 (E) Offshore Support & Fire-Fighting Vessel Class 1 + AMS + DPS-2. Sister vessel to MARIDIVE 704 with identical specifications and capacities. Due for dry dock and available as-is or fully post-DD — buyer's preference determines the final commercial position. Bollard pull 150 t, deck cargo 800 t. Twin MaK main engines of 5,400 BHP each (10,800 BHP total), DP-2, 150 t double drum waterfall winch, 5 t deck crane, Class 1 external FiFi monitors and 50 berths. Inspection Egypt.",
    remarks: [
      "Due for Dry Dock — available as-is OR fully post-DD",
      "Buyer's preference determines final commercial position",
      "Price on application, subject to selected delivery basis",
      "Sister vessel to MARIDIVE 704, identical specifications",
    ],
    particulars: [
      { label: "Class", value: "ABS A1 (E) O.S.V. & FFV Class 1 + AMS + DPS-2" },
      { label: "Bollard pull", value: "150 t" },
      { label: "Deck cargo capacity", value: "800 t" },
      { label: "Clear deck space", value: "470 m²" },
      { label: "Main engines", value: "2 x MaK, 5,400 BHP each (10,800 BHP total)" },
      { label: "Auxiliaries", value: "2 x CAT diesel generators, 590 kW each" },
      { label: "Shaft alternators", value: "2 x 2,000 kW (440V, 3-phase, 60 Hz)" },
      { label: "Emergency generator", value: "1 x CAT, 99 kW" },
      { label: "Bow thrusters", value: "2 x transverse, 9.5 t each" },
      { label: "Stern thrusters", value: "2 x transverse, 9.5 t each" },
      { label: "Dynamic positioning", value: "DP-2" },
      { label: "Winch", value: "Electro-hydraulic double drum waterfall type" },
      { label: "Line pull", value: "150 t @ 3 m/min" },
      { label: "Brake holding", value: "450 t" },
      { label: "Tow wire", value: "1,400 m x 76 mm dia" },
      { label: "A/H wire", value: "220 m x 76 mm dia" },
      { label: "Towing pins", value: "1 set hydraulic, up to 160 t BP vessels" },
      { label: "Shark jaws", value: "Retractable, up to 300 t SWL" },
      { label: "Capstans", value: "2 x 10 t" },
      { label: "Tugger winches", value: "2 x 10 t (cargo shifting)" },
      { label: "Stern roller", value: "6.0 m x 2.5 m dia" },
      { label: "Anchors", value: "2 x HHP stockless, 1,980 kg each" },
      { label: "Deck crane", value: "5 t SWL @ 15 m radius" },
      { label: "FiFi Class 1 monitors", value: "2 x foam + water, 1,200 m³/hr each, 100 m throw, 45 m effective height" },
      { label: "Seawater pumps", value: "2 x 1,600 m³/hr each @ 140 m" },
      { label: "Foam tank", value: "11.7 m³" },
      { label: "Spray booms", value: "2 x 8 m, 6 nozzles each" },
      { label: "Dispersant tank", value: "12.2 m³" },
      { label: "Accommodation", value: "50 berths, fully A/C hot & cold climate" },
      { label: "Navigation & comms", value: "Furuno radar, SSB, 3 x Anschutz gyro, depth + autopilot, GPS, GMDSS, 3 x VHF" },
      { label: "Inspection", value: "Egypt" },
    ],
  },
  "AHTS MARIDIVE 704 – For Sale": {
    image: "https://i.ibb.co/1tJTzBHd/image-8.png",
    details:
      "MARIDIVE 704 — 2011-built anchor handling tug supply vessel (AHTS), DP-2 / FiFi-1, classed ABS +A1 (E) Offshore Support & Fire-Fighting Vessel Class 1 + AMS + DPS-2. Sister vessel to MARIDIVE 703 with identical specifications and capacities. Currently finalising dry dock and available as-is or fully post-DD — buyer's preference determines the final commercial position. Bollard pull 150 t, deck cargo 800 t. Twin MaK main engines of 5,400 BHP each (10,800 BHP total), DP-2, 150 t double drum waterfall winch, 5 t deck crane, Class 1 external FiFi monitors and 50 berths. Inspection Egypt.",
    remarks: [
      "Currently finalising Dry Dock — available as-is OR fully post-DD",
      "Buyer's preference determines final commercial position",
      "Region USD 15M on post-DD basis, to be finalised subject to condition and delivery basis",
      "Sister vessel to MARIDIVE 703, identical specifications",
    ],
    particulars: [
      { label: "Class", value: "ABS A1 (E) O.S.V. & FFV Class 1 + AMS + DPS-2" },
      { label: "Bollard pull", value: "150 t" },
      { label: "Deck cargo capacity", value: "800 t" },
      { label: "Clear deck space", value: "470 m²" },
      { label: "Main engines", value: "2 x MaK, 5,400 BHP each (10,800 BHP total)" },
      { label: "Auxiliaries", value: "2 x CAT diesel generators, 590 kW each" },
      { label: "Shaft alternators", value: "2 x 2,000 kW (440V, 3-phase, 60 Hz)" },
      { label: "Emergency generator", value: "1 x CAT, 99 kW" },
      { label: "Bow thrusters", value: "2 x transverse, 9.5 t each" },
      { label: "Stern thrusters", value: "2 x transverse, 9.5 t each" },
      { label: "Dynamic positioning", value: "DP-2" },
      { label: "Winch", value: "Electro-hydraulic double drum waterfall type" },
      { label: "Line pull", value: "150 t @ 3 m/min" },
      { label: "Brake holding", value: "450 t" },
      { label: "Tow wire", value: "1,400 m x 76 mm dia" },
      { label: "A/H wire", value: "220 m x 76 mm dia" },
      { label: "Towing pins", value: "1 set hydraulic, up to 160 t BP vessels" },
      { label: "Shark jaws", value: "Retractable, up to 300 t SWL" },
      { label: "Capstans", value: "2 x 10 t" },
      { label: "Tugger winches", value: "2 x 10 t (cargo shifting)" },
      { label: "Stern roller", value: "6.0 m x 2.5 m dia" },
      { label: "Anchors", value: "2 x HHP stockless, 1,980 kg each" },
      { label: "Deck crane", value: "5 t SWL @ 15 m radius" },
      { label: "FiFi Class 1 monitors", value: "2 x foam + water, 1,200 m³/hr each, 100 m throw, 45 m effective height" },
      { label: "Seawater pumps", value: "2 x 1,600 m³/hr each @ 140 m" },
      { label: "Foam tank", value: "11.7 m³" },
      { label: "Spray booms", value: "2 x 8 m, 6 nozzles each" },
      { label: "Dispersant tank", value: "12.2 m³" },
      { label: "Accommodation", value: "50 berths, fully A/C hot & cold climate" },
      { label: "Navigation & comms", value: "Furuno radar, SSB, 3 x Anschutz gyro, depth + autopilot, GPS, GMDSS, 3 x VHF" },
      { label: "Inspection", value: "Egypt" },
    ],
  },
  "DP-2 Diesel Electric Platform Supply Vessel (SPM ALPHA) – For Sale": {
    image: "https://i.ibb.co/fdVz595C/image-9.png",
    details:
      "SPM ALPHA — 2006-built diesel electric DP-2 platform supply vessel of the GPA 670 design, built Zhejiang, China, Liberian flag, classed ABS +A1 Offshore Support Vessel (FFV 1), Safety Standby Service, AMS, ACCU, DPS-2. LOA 73.20 m, moulded beam 16.50 m, 3,230 t DWT, 2,321 GRT / 696 NRT, max speed 13 knots at 100% MCR. Diesel-electric machinery: 3 x 1,825 kW main generators driving 2 x 1,920 kW fixed-pitch 360° Z-drives with 2 x 746 kW tunnel bow thrusters. 689 m² cargo deck at 5 t/m² for 1,600 t deck cargo, with full liquid mud / brine (1,092 m³), base oil and dry bulk cement capability. Recently completed dry dock at Nam Dock and currently employed in Takoradi, Ghana until mid-November 2026. Inspection Takoradi, Ghana post-charter. All details given without guarantee.",
    remarks: [
      "Recently completed dry dock at Nam Dock — no near-term dry-dock spend",
      "GPA 670 design — highly capable PSV for deep and shallow water operations",
      "Diesel electric propulsion — materially lower fuel burn and emissions than direct-drive peers",
      "FFV-1 + Safety Standby Service notation — dual-purpose supply + standby role",
      "Compact 73 m footprint with 3,230 DWT — punches above her size class",
      "Inspection Takoradi, Ghana post-charter mid-November",
    ],
    particulars: [
      { label: "Vessel type", value: "Diesel Electric DP-2 PSV (GPA 670 Design)" },
      { label: "Flag", value: "Liberia" },
      { label: "Built", value: "2006, Zhejiang, China" },
      { label: "LOA", value: "73.20 m" },
      { label: "Beam (moulded)", value: "16.50 m" },
      { label: "Depth (moulded)", value: "6.80 m" },
      { label: "Draft", value: "5.63 m" },
      { label: "DWT", value: "3,230 t" },
      { label: "GRT / NRT", value: "2,321 / 696" },
      { label: "Max speed", value: "13 knots (100% MCR)" },
      { label: "Main generators", value: "3 x 1,825 kW" },
      { label: "Main propulsion", value: "2 x 1,920 kW Z-drives, fixed pitch, 360°" },
      { label: "Bow thrusters", value: "2 x 746 kW tunnel" },
      { label: "Emergency generator", value: "190 kW @ 1,800 rpm" },
      { label: "Dynamic positioning", value: "DP-2" },
      { label: "Deck area", value: "50.30 m x 13.70 m (approx. 689 m²)" },
      { label: "Deck strength", value: "5 t/m²" },
      { label: "Deck cargo", value: "1,600 t" },
      { label: "Fuel oil", value: "1,064 m³" },
      { label: "Drill water", value: "759 m³" },
      { label: "Fresh water", value: "535 m³" },
      { label: "Liquid mud / brine", value: "1,092 m³" },
      { label: "Base oil", value: "188 m³" },
      { label: "Dry bulk / cement", value: "255 m³" },
      { label: "Cargo delivery", value: "FO/DW/FW 150 m³/hr @ 9 bar; mud/brine 2 x 75 m³/hr @ 15 bar; base oil 150 m³/hr @ 9 bar; bulk 50 t/hr @ 6 bar" },
      { label: "Deck crane", value: "1.6 t @ 10 m with roll reduction system" },
      { label: "Tugger", value: "1 x 10 t" },
      { label: "Capstans", value: "2 x 8 t" },
      { label: "Fire pumps", value: "2 x 1,500 m³/hr" },
      { label: "FiFi monitors", value: "2 x" },
      { label: "Life saving", value: "Full arrangement per class + standby rescue equipment" },
      { label: "Accommodation", value: "30 POB, fully air-conditioned" },
      { label: "Navigation", value: "2 x radars, 2 x gyrocompasses, 1 x magnetic compass, echo sounder, speed log, autopilot, GPS + 2 x DGPS" },
      { label: "Communications", value: "GMDSS A3, broadband" },
      { label: "Class", value: "ABS +A1 O.S.V. (FFV 1), Safety Standby Service, AMS, ACCU, DPS-2" },
      { label: "Status", value: "Recently completed dry dock at Nam Dock" },
      { label: "Currently employed", value: "Takoradi, Ghana until mid-November 2026" },
      { label: "Inspection", value: "Takoradi, Ghana post-charter" },
    ],
  },
};

Object.keys(rows).forEach((category) => {
  rows[category].forEach((r) => {
    const [title, location, price, year, loa, beam, draft, power, cls, sector] = r;
    const index = counter++;
    const extra = extras[title];
    built.push({
      id: `v-${1000 + index}`,
      agmId: `AGM ${1000 + index}`,
      title,
      sector,
      category,
      description:
        loa === "—" ? power : `${loa.replace(" m", "")} x ${beam.replace(" m", "")} x ${draft.replace(" m", "")}m draft`,
      location,
      price,
      image: extra?.image ?? img[index % img.length],
      summary: `${blurbs[category]} This unit is offered from ${location.toLowerCase()} with delivery by arrangement. Particulars are given in good faith and without guarantee.`,
      specs: [
        { label: "Built", value: year },
        { label: "LOA", value: loa },
        { label: "Beam", value: beam },
        { label: "Draft", value: draft },
        { label: "Power / capacity", value: power },
        { label: "Class", value: cls },
      ],
      ...(extra?.details ? { details: extra.details } : {}),
      ...(extra?.remarks ? { remarks: extra.remarks } : {}),
      ...(extra?.particulars ? { particulars: extra.particulars } : {}),
      ...(extra?.contact ? { contact: extra.contact } : {}),
    });
  });
});

export const vessels: Vessel[] = built;

/** Full category list as shown in the vessel search dropdown. */
export const CATEGORY_LIST = ["For Sale"];

export const sectors = [
  "All",
  ...Array.from(new Set(vessels.map((v) => v.sector))),
];
export const locations = [
  "All",
  ...Array.from(new Set(vessels.map((v) => v.location))),
];
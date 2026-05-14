// data.js — All ElectRAM route, schedule, drive-time and pricing data.
// Source: ElectRAM_Flights/app.py (Streamlit prototype). Numbers verbatim.

window.AIRPORTS = [
  ["CRW", "Charleston, WV"],
  ["ATL", "Atlanta, GA"],
  ["CLT", "Charlotte, NC"],
  ["ROA", "Roanoke, VA"],
  ["TRI", "Tri-Cities, TN"],
  ["LEX", "Lexington, KY"],
  ["CKB", "Clarksburg/Bridgeport, WV"],
  ["MGW", "Morgantown, WV"],
  ["BNA", "Nashville, TN"],
  ["IND", "Indianapolis, IN"],
  ["SDF", "Louisville, KY"],
  ["HTS", "Huntington, WV"],
  ["SHD", "Shenandoah Valley, VA"],
];

window.AIRPORT_CODES = Object.fromEntries(window.AIRPORTS);

// {dur_h, dur_m}
window.ROUTES = {
  "CRW-ATL": { h: 1, m: 20 }, "CRW-CLT": { h: 1, m: 0 },
  "CRW-ROA": { h: 0, m: 35 }, "CRW-TRI": { h: 0, m: 50 },
  "CRW-LEX": { h: 0, m: 45 }, "CRW-CKB": { h: 0, m: 25 },
  "CRW-MGW": { h: 0, m: 30 }, "CRW-BNA": { h: 1, m: 15 },
  "CRW-IND": { h: 1, m: 20 }, "CRW-SDF": { h: 1, m: 0 },
  "CRW-HTS": { h: 0, m: 25 }, "CRW-SHD": { h: 0, m: 45 },
  "ROA-CLT": { h: 0, m: 50 }, "CLT-ATL": { h: 1, m: 5 },
  "ATL-CLT": { h: 1, m: 5 },  "TRI-ATL": { h: 1, m: 10 },
  "LEX-IND": { h: 0, m: 50 }, "HTS-CLT": { h: 1, m: 10 },
  "SHD-CLT": { h: 1, m: 15 }, "ROA-CRW": { h: 0, m: 35 },
  "CLT-CRW": { h: 1, m: 0 },  "ATL-CRW": { h: 1, m: 20 },
  "TRI-CLT": { h: 1, m: 0 },  "CLT-TRI": { h: 1, m: 0 },
  "LEX-CLT": { h: 1, m: 10 }, "CLT-LEX": { h: 1, m: 10 },
  "SDF-CLT": { h: 1, m: 15 }, "CLT-SDF": { h: 1, m: 15 },
  "BNA-ATL": { h: 1, m: 5 },  "ATL-BNA": { h: 1, m: 5 },
  "BNA-CLT": { h: 1, m: 20 }, "CLT-BNA": { h: 1, m: 20 },
  "IND-CLT": { h: 1, m: 25 }, "CLT-IND": { h: 1, m: 25 },
  "MGW-CRW": { h: 0, m: 30 }, "CKB-CRW": { h: 0, m: 25 },
  "HTS-CRW": { h: 0, m: 25 }, "SHD-CRW": { h: 0, m: 45 },
};

// 0 = Monday … 6 = Sunday
window.ROUTE_DAYS = {
  "CRW-ATL": [0,1,2,3,4,5,6], "CRW-CLT": [0,1,2,3,4,5,6],
  "CRW-ROA": [0,2,4], "CRW-TRI": [1,3,5],
  "CRW-LEX": [0,3,6], "CRW-CKB": [0,1,2,3,4],
  "CRW-MGW": [0,1,2,3,4], "CRW-BNA": [1,4,6],
  "CRW-IND": [0,2,5], "CRW-SDF": [1,3,6],
  "CRW-HTS": [0,1,2,3,4], "CRW-SHD": [2,5],
  "ROA-CLT": [0,1,2,3,4,5,6], "CLT-ATL": [0,1,2,3,4,5,6],
  "ATL-CLT": [0,1,2,3,4,5,6], "TRI-ATL": [0,2,4],
  "LEX-IND": [1,3,5], "HTS-CLT": [0,2,4],
  "SHD-CLT": [1,4], "ROA-CRW": [0,2,4],
  "CLT-CRW": [0,1,2,3,4,5,6], "ATL-CRW": [0,1,2,3,4,5,6],
  "TRI-CLT": [1,3,5], "CLT-TRI": [1,3,5],
  "LEX-CLT": [0,3,6], "CLT-LEX": [0,3,6],
  "SDF-CLT": [1,3,6], "CLT-SDF": [1,3,6],
  "BNA-ATL": [1,4,6], "ATL-BNA": [1,4,6],
  "BNA-CLT": [1,4,6], "CLT-BNA": [1,4,6],
  "IND-CLT": [0,2,5], "CLT-IND": [0,2,5],
  "MGW-CRW": [0,1,2,3,4], "CKB-CRW": [0,1,2,3,4],
  "HTS-CRW": [0,1,2,3,4], "SHD-CRW": [2,5],
};

// Driving time between airport pairs
window.DRIVE_TIMES = {
  "CRW-ATL": { h: 7, m: 0 }, "CRW-CLT": { h: 4, m: 15 },
  "CRW-ROA": { h: 2, m: 45 }, "CRW-TRI": { h: 3, m: 25 },
  "CRW-LEX": { h: 2, m: 50 }, "CRW-CKB": { h: 2, m: 5 },
  "CRW-MGW": { h: 2, m: 35 }, "CRW-BNA": { h: 6, m: 15 },
  "CRW-IND": { h: 5, m: 45 }, "CRW-SDF": { h: 4, m: 0 },
  "CRW-HTS": { h: 1, m: 0 },  "CRW-SHD": { h: 4, m: 0 },
  "ROA-CLT": { h: 3, m: 0 },  "CLT-ATL": { h: 4, m: 15 },
  "ATL-CLT": { h: 4, m: 15 }, "TRI-ATL": { h: 4, m: 45 },
  "LEX-IND": { h: 3, m: 0 },  "HTS-CLT": { h: 4, m: 30 },
  "SHD-CLT": { h: 4, m: 45 },
};

// Cost per flight hour (from app.py: erj_cost_fh / echo_cost_fh)
window.COST_PER_FH = {
  echo: 2009,
  erj: 7450, // Embraer ERJ-145 — typical regional jet block-hour cost
};

window.dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
window.dayNamesFull = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

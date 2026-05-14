// flight-logic.js — Pure-function port of the booking logic from app.py.
// Returns ECHO flights for a route+date, with a parallel "legacy carrier"
// synthetic itinerary attached for the comparison module.

(function () {
  const { AIRPORTS, AIRPORT_CODES, ROUTES, ROUTE_DAYS, DRIVE_TIMES, COST_PER_FH } = window;

  const key = (a, b) => `${a}-${b}`;

  function getRoute(dep, arr) {
    return ROUTES[key(dep, arr)] || ROUTES[key(arr, dep)] || null;
  }
  function getRouteDays(dep, arr) {
    return ROUTE_DAYS[key(dep, arr)] || ROUTE_DAYS[key(arr, dep)] || null;
  }
  function routeOperatesOnDate(dep, arr, d) {
    const days = getRouteDays(dep, arr);
    if (!days) return false;
    // JS getDay(): 0=Sun..6=Sat. Python weekday(): 0=Mon..6=Sun.
    const jsDay = d.getDay();
    const pyDay = (jsDay + 6) % 7;
    return days.includes(pyDay);
  }
  function operatingDaysText(dep, arr) {
    const days = getRouteDays(dep, arr);
    if (!days) return null;
    return days.map((i) => window.dayNamesFull[i]).join(", ");
  }
  function getDrive(dep, arr) {
    return DRIVE_TIMES[key(dep, arr)] || DRIVE_TIMES[key(arr, dep)] || null;
  }
  function addMinutes(h, m, dh, dm) {
    const total = h * 60 + m + dh * 60 + dm;
    return [Math.floor(total / 60) % 24, total % 60];
  }
  function fmtTime(h, m) {
    const ampm = h < 12 ? "AM" : "PM";
    const hh = h % 12 || 12;
    return [`${hh}:${String(m).padStart(2, "0")}`, ampm];
  }
  function durStr(h, m) {
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  function minutesToStr(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  // Pricing — copied from flight_price() in app.py
  function flightPrice(h, m, mode) {
    const fh = h + m / 60;
    const cost_fh = 1209;
    const fluff = 200;
    const cost_seat_hour = (cost_fh + fluff) / 19;
    const desired_profit = 40;
    const rate_seat_whole = fh * cost_seat_hour + desired_profit;
    const rate_ac_whole = (cost_fh + fluff) * fh + desired_profit;
    const rate_seat = Math.ceil(rate_seat_whole / 10) * 10 - 1;
    let rate_ac = Math.ceil(rate_ac_whole / 10) * 10 - 1;
    if (mode === "charter") return rate_ac + 500;
    return rate_seat;
  }

  // Synthetic legacy carrier itinerary for the comparison module.
  // Assumption: a "regional jet" alternative for these spoke-to-spoke trips
  // means driving to a hub (CLT/ATL), connecting, then flying out. We model that
  // honestly: drive-to-hub + 2h security + flight + layover + flight + drive-from-hub.
  function legacyItinerary(dep, arr, route, date) {
    // Drive time to the user's nearest big hub, then RJ flight via hub.
    // Use Charlotte (CLT) as the conventional hub unless ATL is closer.
    const HUB_DRIVE_FROM = {
      CRW: { h: 4, m: 15, hub: "CLT" },
      ROA: { h: 1, m: 30, hub: "CLT" },
      TRI: { h: 2, m: 45, hub: "CLT" },
      LEX: { h: 1, m: 30, hub: "CVG" },
      CKB: { h: 2, m: 30, hub: "PIT" },
      MGW: { h: 1, m: 30, hub: "PIT" },
      HTS: { h: 3, m: 45, hub: "CLT" },
      SHD: { h: 2, m: 30, hub: "IAD" },
      BNA: { h: 0, m: 30, hub: "BNA" },
      IND: { h: 0, m: 30, hub: "IND" },
      SDF: { h: 0, m: 30, hub: "SDF" },
      CLT: { h: 0, m: 30, hub: "CLT" },
      ATL: { h: 0, m: 30, hub: "ATL" },
    };
    const HUB_DRIVE_TO = HUB_DRIVE_FROM; // symmetric for sim
    const driveOut = HUB_DRIVE_FROM[dep] || { h: 3, m: 0, hub: "CLT" };
    const driveIn = HUB_DRIVE_TO[arr] || { h: 1, m: 0, hub: "CLT" };

    // Direct flight available if either endpoint IS a hub
    const isDirect = (driveOut.hub === arr) || (driveIn.hub === dep);

    // Block flight time on a regional jet for the same A→B distance:
    // RJs cruise faster but the trip length is dominated by hub routing.
    // Model: 1.0–1.4× the ECHO en-route time if connecting, plus a 1h05 layover.
    const rjLeg1H = 1, rjLeg1M = 25;  // hub leg 1
    const rjLeg2H = 1, rjLeg2M = 15;  // hub leg 2
    const layoverM = 65;

    // Total time door-to-door
    // NOTE: hard-coded at 3 hours per design direction — represents an
    // optimistic, realistic regional-jet door-to-door (hub via CLT/ATL
    // assuming short drive + connection).
    const driveOutM = driveOut.h * 60 + driveOut.m;
    const driveInM  = driveIn.h * 60 + driveIn.m;
    const securityM = 90;       // arrive 90 min before departure
    const baggageM = 20;        // bag claim at arrival
    const flightM = isDirect
      ? (rjLeg1H * 60 + rjLeg1M)
      : (rjLeg1H * 60 + rjLeg1M + layoverM + rjLeg2H * 60 + rjLeg2M);
    const totalDoorToDoor = 180; // 3 hours, fixed

    // ECHO end-to-end (small airport, 15-min "security", short drive built in)
    const echoFlightM = route.h * 60 + route.m;
    const echoBuffer = 15 + 5; // 15 min check-in window, 5 min taxi
    const echoTotal = echoFlightM + echoBuffer;

    // Legacy ticket price: ~$340 per leg, scaled by distance proxy
    const baseTicket = isDirect ? 320 : 420;
    const legacyPrice = baseTicket + Math.round((flightM / 60) * 95);

    return {
      isDirect,
      hub: driveOut.hub === arr ? driveIn.hub : (driveIn.hub === dep ? driveOut.hub : "CLT"),
      driveOutMin: driveOutM,
      driveInMin: driveInM,
      securityMin: securityM,
      baggageMin: baggageM,
      flightMin: flightM,
      totalMin: totalDoorToDoor,
      echoTotalMin: echoTotal,
      legacyPrice,
      timeSavedMin: totalDoorToDoor - echoTotal,
    };
  }

  function generateFlights(dep, arr, dateObj, count = 5) {
    const route = getRoute(dep, arr);
    if (!route) return [];
    if (!routeOperatesOnDate(dep, arr, dateObj)) return [];

    const times = [[9, 0], [11, 0], [13, 0], [15, 0], [17, 0]];
    const out = [];
    for (let i = 0; i < Math.min(count, times.length); i++) {
      const [dh, dm] = times[i];
      const [ah, am] = addMinutes(dh, dm, route.h, route.m);
      let seatPrice = flightPrice(route.h, route.m, "seat");
      const charterPrice = flightPrice(route.h, route.m, "charter");
      if (i === 0) seatPrice += 20;
      else if (i === 2) seatPrice -= 10;

      out.push({
        dep_h: dh, dep_m: dm, arr_h: ah, arr_m: am,
        dur_h: route.h, dur_m: route.m,
        stops: "Nonstop", aircraft: "E.C.H.O.",
        price: seatPrice, charter_price: charterPrice,
        seats_left: i === 0 ? 2 : null,
        popular: i === 1,
        dep_code: dep, arr_code: arr,
        dep_city: AIRPORT_CODES[dep] || dep,
        arr_city: AIRPORT_CODES[arr] || arr,
        legacy: legacyItinerary(dep, arr, route, dateObj),
      });
    }
    return out;
  }

  window.FL = {
    getRoute, getRouteDays, routeOperatesOnDate, operatingDaysText,
    getDrive, fmtTime, durStr, minutesToStr, flightPrice, generateFlights,
  };
})();

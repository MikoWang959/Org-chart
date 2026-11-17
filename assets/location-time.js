(() => {
  const zonesByPlace = {
    "el paso texas": "America/Denver",
    "allen texas": "America/Chicago",
    "richardson texas": "America/Chicago",
    "spring texas": "America/Chicago",
    "dallas": "America/Chicago",
    "fort worth": "America/Chicago",
    "houston": "America/Chicago",
    "austin texas": "America/Chicago",
    "austin": "America/Chicago",
    "plano": "America/Chicago",
    "topeka": "America/Chicago",
    "chicago": "America/Chicago",
    "minneapolis": "America/Chicago",
    "bentonville": "America/Chicago",
    "appleton": "America/Chicago",
    "denver": "America/Denver",
    "santa fe": "America/Denver",
    "salt lake city": "America/Denver",
    "phoenix": "America/Phoenix",
    "los angeles": "America/Los_Angeles",
    "san diego": "America/Los_Angeles",
    "san jose": "America/Los_Angeles",
    "milpitas": "America/Los_Angeles",
    "san mateo": "America/Los_Angeles",
    "irvine california": "America/Los_Angeles",
    "glendale california": "America/Los_Angeles",
    "rancho cordova": "America/Los_Angeles",
    "san francisco": "America/Los_Angeles",
    "seattle": "America/Los_Angeles",
    "portland oregon": "America/Los_Angeles",
    "new york": "America/New_York",
    "research triangle park": "America/New_York",
    "maitland": "America/New_York",
    "tampa": "America/New_York",
    "boca raton": "America/New_York",
    "columbia south carolina": "America/New_York",
    "ann arbor": "America/New_York",
    "philadelphia": "America/New_York",
    "indianapolis": "America/New_York",
    "trenton": "America/New_York",
    "herndon": "America/New_York",
    "fulton maryland": "America/New_York",
    "boston": "America/New_York",
    "washington dc": "America/New_York",
    "atlanta": "America/New_York",
    "miami": "America/New_York",
    "honolulu": "Pacific/Honolulu",
    "mexico city": "America/Mexico_City",
    "dubai": "Asia/Dubai",
    "belgrade": "Europe/Belgrade",
    "lysaker": "Europe/Oslo",
    "panama": "America/Panama",
    "rio de janeiro": "America/Sao_Paulo",
    "toronto": "America/Toronto",
    "montreal": "America/Toronto",
    "vancouver": "America/Vancouver",
    "calgary": "America/Edmonton",
    "edmonton": "America/Edmonton",
    "winnipeg": "America/Winnipeg",
    "halifax": "America/Halifax",
    "london": "Europe/London",
    "united kingdom": "Europe/London",
    "ireland": "Europe/Dublin",
    "dublin": "Europe/Dublin",
    "germany": "Europe/Berlin",
    "berlin": "Europe/Berlin",
    "munich": "Europe/Berlin",
    "france": "Europe/Paris",
    "paris": "Europe/Paris",
    "netherlands": "Europe/Amsterdam",
    "amsterdam": "Europe/Amsterdam",
    "belgium": "Europe/Brussels",
    "brussels": "Europe/Brussels",
    "spain": "Europe/Madrid",
    "madrid": "Europe/Madrid",
    "italy": "Europe/Rome",
    "rome": "Europe/Rome",
    "sweden": "Europe/Stockholm",
    "stockholm": "Europe/Stockholm",
    "poland": "Europe/Warsaw",
    "warsaw": "Europe/Warsaw",
    "czech republic": "Europe/Prague",
    "prague": "Europe/Prague",
    "south africa": "Africa/Johannesburg",
    "johannesburg": "Africa/Johannesburg",
    "india": "Asia/Kolkata",
    "bengaluru": "Asia/Kolkata",
    "bangalore": "Asia/Kolkata",
    "hyderabad": "Asia/Kolkata",
    "mumbai": "Asia/Kolkata",
    "new delhi": "Asia/Kolkata",
    "tokyo": "Asia/Tokyo",
    "japan": "Asia/Tokyo",
    "seoul": "Asia/Seoul",
    "south korea": "Asia/Seoul",
    "singapore": "Asia/Singapore",
    "hong kong": "Asia/Hong_Kong",
    "beijing": "Asia/Shanghai",
    "shanghai": "Asia/Shanghai",
    "china": "Asia/Shanghai",
    "taipei": "Asia/Taipei",
    "taiwan": "Asia/Taipei",
    "manila": "Asia/Manila",
    "philippines": "Asia/Manila",
    "bangkok": "Asia/Bangkok",
    "thailand": "Asia/Bangkok",
    "jakarta": "Asia/Jakarta",
    "sydney": "Australia/Sydney",
    "melbourne": "Australia/Melbourne",
    "brisbane": "Australia/Brisbane",
    "perth": "Australia/Perth",
    "australia": "Australia/Sydney",
    "auckland": "Pacific/Auckland",
    "new zealand": "Pacific/Auckland"
  };
  const placeEntries = Object.entries(zonesByPlace).sort((a, b) => b[0].length - a[0].length);

  function normalize(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function inferTimeZone(location) {
    const normalized = normalize(location || "");
    if (!normalized) return "";
    const match = placeEntries.find(([place]) => (` ${normalized} `).includes(` ${place} `));
    return match?.[1] || "";
  }

  window.resolveProfileLocalTime = (location, timeZoneOverride) => {
    if (!location && !timeZoneOverride) return "Not provided yet";
    const timeZone = timeZoneOverride || inferTimeZone(location);
    if (!timeZone) return "Time zone not mapped for this location";
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone
      }).format(new Date());
    } catch {
      return "Time zone not mapped for this location";
    }
  };
})();

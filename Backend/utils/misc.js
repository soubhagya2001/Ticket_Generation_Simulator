export function extractClasses(raw) {
  const classes = new Set();

  // Coach composition block
  const match = raw.match(/BG~~~[01]+~(.*?)~0~1~/);
  if (!match) return [];

  const block = match[1];

  // Explicit class markers before colon
  const classRegex = /\b(GN|1A|2A|3A|3E|SL|2S|CC|EC|EA|PC|SLRD)\b(?=:)/g;
  let m;

  while ((m = classRegex.exec(block)) !== null) {
    if (!["PC", "SLRD"].includes(m[1])) {
      classes.add(m[1]);
    }
  }

  return [...classes];
}




/**
 * Extracts and normalizes Indian Railways fare data
 * from legacy IR train record string.
 */
export function extractFares(raw, coachComposition = {}) {
  // Capture fare block
  const match = raw.match(/([A-Z_]+):(\d+):([^~]+)/);
  if (!match) return {};

  // Split slabs (preserve empties)
  const slabs = match[3].split(":");

  // Classes must come from rake, in priority order
  const classPriority = ["1A", "2A", "3A", "3E", "SL", "2S", "GN"];

  const availableClasses = classPriority.filter(
    cls => coachComposition[cls]
  );

  const passengerTypes = [
    "adult",
    "child",
    "senior_male",
    "senior_female",
    "divyang",
    "escort"
  ];

  const fares = {};
  let slabPtr = 0;

  for (const slab of slabs) {
    if (!availableClasses.length) break;

    // Skip empty slabs
    if (!/\d/.test(slab)) continue;

    const prices = slab
      .split(",")
      .map(v => Number(v))
      .filter(v => !Number.isNaN(v));

    // Drop zero-only slabs
    if (!prices.some(v => v > 0)) continue;

    const cls = availableClasses.shift();
    const normal = {};

    passengerTypes.forEach((type, i) => {
      if (prices[i] !== undefined) {
        normal[type] = prices[i];
      }
    });

    fares[cls] = {
      normal,
      tatkal: { adult: null }
    };
  }

  return fares;
}

export function extractQuotas(raw) {
  const quotaRegex = /\b(GN|TQ|LD|PT|SS|HO|DF|PH|FT|DP|YU)(?=[:~,])/g;
  return [...new Set(raw.match(quotaRegex) || [])];
}


export function extractCoachComposition(raw) {
  const result = {};

  const match = raw.match(/BG~~~[01]+~(.*?)~0~1~/);
  if (!match) return result;

  const tokens = match[1].split(",");

  let currentClass = null;
  let has3E = false;

  // First pass: detect if 3E exists
  for (const t of tokens) {
    if (t.startsWith("3E:")) {
      has3E = true;
      break;
    }
  }

  const coachRules = {
    "1A": /^(H|HA)\d*$/,
    "2A": /^A\d+$/,
    "3A": /^B\d+$/,
    "3E": /^M\d+$/,
    "SL": /^S\d+$/,
    "2S": /^D\d+$/,
    "CC": /^C\d+$/,
    "EC": /^E\d+$/,
    // "PC": /^S\d+$/,
    "SLRD": /^SLRD$/
  };

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    // Class header
    if (token.includes(":")) {
      let [cls, coach] = token.split(":");

      // GN has no valid coaches
      if (cls === "GN") {
        currentClass = null;
        continue;
      }

      // Handle M-series ambiguity
      if (coach?.startsWith("M")) {
        cls = has3E ? "3E" : "3A";
      }

      currentClass = coachRules[cls] ? cls : null;

      if (
        currentClass &&
        coach &&
        coachRules[currentClass].test(coach)
      ) {
        add(result, currentClass, coach);
      }
      continue;
    }

    // Continuation coach
    if (currentClass && coachRules[currentClass].test(token)) {
      add(result, currentClass, token);
    }
  }

  return result;
}




function add(obj, cls, coach) {
  if (!cls || !coach) return;
  if (!obj[cls]) obj[cls] = [];
  if (!obj[cls].includes(coach)) obj[cls].push(coach);
}




export function extractTrainZone(raw) {
  const zones = [
    "CR","ER","ECR","ECOR","NR","NER","NFR","NCR",
    "NW","SCR","SER","SECR","SWR","SR","WR","WCR"
  ];

  for (const zone of zones) {
    const regex = new RegExp(`~${zone}~`);
    if (regex.test(raw)) {
      return zone;
    }
  }
  return null;
}

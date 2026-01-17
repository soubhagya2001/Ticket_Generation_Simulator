import { CLASS_PRIORITY, PASSENGER_TYPES, VALID_CLASSES, ZONES } from "../constants/trainConstants.js";

export function extractClasses(raw) {
  if (typeof raw === 'object') {
    return raw.classes || raw.train_base?.classes || [];
  }

  // Derive from coach composition if possible
  const comp = extractCoachComposition(raw);
  const classes = Object.keys(comp);

  if (classes.length > 0) return classes;

  // Fallback: search for explicit class markers in the raw string
  const explicitClasses = new Set();
  const classRegex = /\b(GN|1A|2A|3A|3E|SL|2S|CC|EC|EA|PC|SLRD)\b(?=[:~,])/g;
  let m;
  const searchStr = typeof raw === 'string' ? raw : "";

  while ((m = classRegex.exec(searchStr)) !== null) {
    if (!["PC", "SLRD"].includes(m[1])) {
      explicitClasses.add(m[1]);
    }
  }

  return [...explicitClasses];
}




/**
 * Extracts and normalizes Indian Railways fare data
 * from legacy IR train record string.
 */
export function extractFares(raw, coachComposition = {}) {
  if (typeof raw === 'object') {
    return raw.fares || raw.train_base?.fares || {};
  }

  // Capture fare block
  const match = typeof raw === 'string' ? raw.match(/([A-Z_]+):(\d+):([^~]+)/) : null;
  if (!match) return {};

  // Split slabs (preserve empties)
  const slabs = match[3].split(":");

  // Classes must come from rake, in priority order
  const classPriority = CLASS_PRIORITY

  const availableClasses = classPriority.filter(
    cls => coachComposition[cls]
  );

  const passengerTypes = PASSENGER_TYPES;

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
  if (typeof raw === 'object') {
    return raw.quotas || raw.train_base?.quotas || [];
  }
  if (typeof raw !== 'string') return [];
  const quotaRegex = /\b(GN|TQ|LD|PT|SS|HO|DF|PH|FT|DP|YU)(?=[:~,])/g;
  return [...new Set(raw.match(quotaRegex) || [])];
}


export function extractCoachComposition(raw) {
  if (typeof raw === 'object') {
    return raw.coach_composition || raw.train_base?.coach_composition || {};
  }

  const result = {};
  if (typeof raw !== 'string') return result;

  // Handles BG~... and BG~~~ formats
  const match = raw.match(/(?:BG~[^^]*?~|BG~~~)([01]+)~(.*?)(?:~0~|~0~1~|~[^^]*$)/);
  if (!match) return result;

  const tokens = match[2].split(":");
  let currentClass = null;

  const validClasses = VALID_CLASSES;

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    // Format A: G,G1,3A (Type, Name, Class)
    if (token.includes(",")) {
      const parts = token.split(",");
      if (parts.length >= 3) {
        const cls = parts[2].trim();
        const coach = parts[1].trim();
        if (validClasses.includes(cls) && coach) {
          add(result, cls, coach);
          currentClass = cls;
          continue;
        }
      }
    }

    // Format B: 3A:B2 (Class:Coach)
    if (token.includes(":")) {
       const [cls, coach] = token.split(":");
       if (validClasses.includes(cls)) {
         if (coach) add(result, cls, coach);
         currentClass = cls;
         continue;
       }
    }

    // Format C: Continuation tokens after a class header
    // Check if token looks like a coach number/code (e.g., S2, B5, G10, M3)
    if (currentClass && /^[A-Z]+\d+$/.test(token)) {
      add(result, currentClass, token);
    }
  }

  // If we found NO coaches but found some class identifiers, we still want to return classes
  // This helps extractClasses() which relies on this function
  return result;
}




function add(obj, cls, coach) {
  if (!cls || !coach) return;
  if (!obj[cls]) obj[cls] = [];
  if (!obj[cls].includes(coach)) obj[cls].push(coach);
}




export function extractTrainZone(raw) {
  if (typeof raw === 'object') {
    return raw.zone || raw.train_base?.zone || null;
  }
  if (typeof raw !== 'string') return null;

  for (const zone of ZONES) {
    const regex = new RegExp(`~${zone}~`);
    if (regex.test(raw)) {
      return zone;
    }
  }
  return null;
}

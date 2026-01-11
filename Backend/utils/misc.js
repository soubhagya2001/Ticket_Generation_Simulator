export function extractClasses(str) {
  if (!str.includes("|")) return [];
  return str
    .split("|")
    .map(c => c.split(":")[0])
    .filter(Boolean);
}


export function extractFares(str) {
  const fares = {};
  const parts = str.split(":");

  for (let i = 0; i < parts.length; i++) {
    if (["1A","2A","3A","SL","2S","3E"].includes(parts[i])) {
      const prices = parts[i + 1]
        ?.split(",")
        .filter(p => p !== "")
        .map(Number);

      fares[parts[i]] = prices || [];
    }
  }
  return fares;
}

export function extractQuotas(str) {
  const quotaRegex = /\b(GN|TQ|LD|PT|SS|HO|DF|PH|FT|DP|YU)\b/g;
  return [...new Set(str.match(quotaRegex) || [])];
}


export function extractCoachComposition(raw) {
  const result = {};
  const coachPattern = /([A-Z]{1,4}):([A-Z0-9,]+)/g;
  let match;

  while ((match = coachPattern.exec(raw)) !== null) {
    const coachType = match[1];
    const coaches = match[2].split(",").filter(Boolean);

    // Ignore false positives like dates or zones
    if (coaches.length > 0 && coaches[0].length <= 4) {
      result[coachType] = coaches;
    }
  }

  return result;
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

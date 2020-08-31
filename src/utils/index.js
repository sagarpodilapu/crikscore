import { floor, round } from "lodash";
const CART_KEY = "cart";
const TOKEN_KEY = "jwt";

export const fow = (score) => {
  if (score === undefined) return;
  const fowScore = score.filter(function (s) {
    return s.out === true;
  });
  let fowBatsmen = [];
  fowScore.map((fowSingle) => {
    fowBatsmen.push(
      `${fowSingle.totalWickets}-${fowSingle.totalRuns} (${fowSingle.whoIsOut.name}, ${fowSingle.currentOver})`
    );
  });
  return fowBatsmen.reverse().join(", ");
};

export const extras = (score) => {
  if (score === undefined) return;
  const extrasScore = score.filter(function (s) {
    return s.extra === true;
  });
  console.log(extrasScore);
  let extraCalc = [];
  extrasScore.map((e) => {});
};

export const calculateBalls = (overs) => {
  if (overs === 0) return overs;
  let temp = overs.split(".");
  let balls;
  if (temp.length === 2) balls = parseInt(temp[0]) * 6 + parseInt(temp[1]);
  else balls = parseInt(temp[0]) * 6;
  return balls;
};

export const calculateOvers = (balls) => {
  let overs = floor(balls / 6);
  let localBalls = balls % 6;
  localBalls = localBalls === 0 ? "" : `.${localBalls}`;
  return `${overs}${localBalls}`;
};
export const calculateEco = (runs, balls) => {
  if (balls === undefined || runs === undefined || balls === 0 || runs === 0)
    return 0.0;
  return round((runs * 6) / balls, 2);
};

export const currentRR = (runs, balls) => {
  if (balls === undefined || runs === undefined || balls === 0 || runs === 0)
    return "INF";
  return round((runs * 6) / balls, 2);
};

export const expectedRuns = (CRR, overs) => {
  if (CRR === undefined || overs === undefined || CRR === "INF") return "INF";
  return floor(CRR * parseInt(overs));
};

export const requiredRR = (runs, balls) => {
  if (balls === undefined || runs === undefined || balls === 0 || runs === 0)
    return 0.0;
  return round((runs * 6) / balls, 2);
};

export const calculateSR = (runs, balls) => {
  if (balls === 0) return "NA";
  return round((runs * 100) / balls);
};

export const setCart = (value, cartKey = CART_KEY) => {
  if (localStorage) {
    localStorage.setItem(cartKey, JSON.stringify(value));
  }
};

export const getCart = (cartKey = CART_KEY) => {
  if (localStorage && localStorage.getItem(cartKey)) {
    return JSON.parse(localStorage.getItem(cartKey));
  }
  return [];
};

export const clearCart = (cartKey = CART_KEY) => {
  if (localStorage) {
    localStorage.removeItem(cartKey);
  }
  return null;
};

export const setToken = (value, tokenKey = TOKEN_KEY) => {
  if (localStorage) {
    localStorage.setItem(tokenKey, JSON.stringify(value));
  }
};

export const getToken = (tokenKey = TOKEN_KEY) => {
  if (localStorage && localStorage.getItem(tokenKey)) {
    return JSON.parse(localStorage.getItem(tokenKey));
  }
  return null;
};

export const clearToken = (tokenKey = TOKEN_KEY) => {
  if (localStorage) {
    localStorage.removeItem(tokenKey);
  }
  return null;
};

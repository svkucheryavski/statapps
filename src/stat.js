/**
 * Counts how many values from a vector falls into bins
 * @param {Array} x - vector with numbers
 * @param {Array} bins - vector with bins boundaries
 * @returns {Array} vector with counts for each bean
 */
export const count = function(x, bins) {

   if (x === undefined || !Array.isArray(x) ||x.length < 2) {
      throw("count: 'x' must bet a vector with numbers.")
   }

   if (bins === undefined || !Array.isArray(bins) || bins.length < 2) {
      throw("count: 'bins' must bet a vector with numbers.")
   }

   const n = bins.length;

   // add a bit extra to right side
   bins[n - 1] = bins[n - 1] * 1.0001
   return bins.slice(1).map((v, i) => x.filter( v => v >= bins[i] & v < bins[i + 1]).length);
}

/**
 * Computes middle points between values from a vector
 * @param {Array} x - vector with numbers
 * @returns {Array} vector with middle points
 */
export const mids = function(x) {
   const d = diff(x)
   return(x.slice(1).map((v, i) => (v - d[i])));
}

/**
 * Splits range of vector values into equal intervals
 * @param {Array} x - vector with numbers
 * @param {number} n - number of intervals
 */
export const split = function(x, n) {
   if (x === undefined || !Array.isArray(x) || x.length < 2) {
      throw("split: 'x' must bet a vector with numbers.")
   }

   if (n === undefined || n < 2) {
      throw("split: 'n' must be a positive integer number.");
   }

   const mn = min(x);
   const mx = max(x);

   if (mn === mx) {
      throw("split: values in a vector 'x' should vary.");
   }

   const step = (mx - mn) / n;
   return Array.from({length: n + 1}, (v, i) => mn + i * step + 0.0);
}

/**
 *
 * @param {*} x
 * @returns
 */
export function diff(x) {
   return x.slice(1).map( (y, i) => (y - x[i]));
}

export function min(x) {
   return Math.min.apply(null, x);
}

export function sum(x) {
   return x.reduce((t, v) => t + v);
}

export function max(x) {
   return Math.max.apply(null, x);
}

export function range(x) {
   return [min(x), max(x)];
}

export function getOutliers(x, Q1, Q3) {
   const IQR = Q3 - Q1;
   const bl = Q1 - 1.5 * IQR
   const bu = Q3 + 1.5 * IQR
   return(x.filter(v => v < bl || v > bu));
}

/** Computes a quantile for a numeric vector
 *  @param {Array} x - numeric vector
 *  @param {number} p - a number between 0 and 1 (quantile)
*/
export function quantile(x, p) {

   if (p < 0 || p > 1) {
      throw("Parameter 'p' must be between 0 and 1.");
   }

   if (!Array.isArray(x) || x.length < 2) {
      throw("Parameter 'x' must be a vector with numbers.");
   }

   const n = x.length;
   const n1 = Math.floor((n + 1) * p);
   const n2 = Math.ceil((n + 1) * p);

   if (n1 == n2) {
      return x[n1 - 1];
   }

   const p1 = (n1 - 0.5) / n;
   const p2 = (n2 - 0.5) / n;
   return(x[n1 - 1] + (x[n2 - 1] - x[n1 - 1]) / (p2 - p1) * (p - p1));
}

export function runif(n, a, b) {
   return Array.from({length: n}, () => (a + Math.random() * (b - a)));
}

export function rnorm(n, mu, sigma) {
   const u = runif(n * 2, 0, 1);
   const a = u.filter( (v, i) => i % 2 === 0 ).map( u1 => Math.sqrt(-2 * Math.log(u1)))
   const b = u.filter( (v, i) => i % 2 === 1 ).map( u2 => 2 * 3.1415926 * u2)

   return a.map((v, i) => v * Math.sin(b[i]) * sigma + mu);
}


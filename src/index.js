/**********************************************
 * Functions for computing single statistics  *
 **********************************************/

/**
 * Finds smallest value in a vector
 * @param {number[]} x - vector with values
 * @returns {number}
 */
export function min(x) {
   let n = x.length;
   let min = Number.POSITIVE_INFINITY

   while (n--) min = x[n] < min ? x[n] : min;
   return min;
}

/**
 * Finds largest value in a vector
 * @param {number[]} x - vector with values
 * @returns {number}
 */
export function max(x) {
   let n = x.length;
   let max = Number.NEGATIVE_INFINITY

   while (n--) max = x[n] > max ? x[n] : max;
   return max;
}

/**
 * Computes sum of all value in a vector
 * @param {number[]} x - vector with values
 * @returns {number}
 */
export function sum(x) {
   return x.reduce((t, v) => t + v);
}

/**
 * Computes mean (average) value for a vector
 * @param {number[]} x - vector with values
 * @returns {number}
 */
export function mean(x) {
   return sum(x) / x.length;
}

/**
 * Computes standard deviation for a vector
 * @param {number[]} x - vector with values
 * @param {boolean} biased - compute a biased version with n degrees of freedom or not (with n-1).
 * @param {number} m - mean value (e.g. if already computed).
 * @returns {number}
 */
export function sd(x, biased = false, m = undefined) {
   if (m === undefined) m = mean(x)
   return Math.sqrt(sum(x.map(v => (v - m)**2 )) / (x.length - (biased ? 0 : 1)));
}

/**
 * Computes a p-th quantile for a numeric vector
 * @param {number[]} x - vector with values
 * @param {number} p - probability
 * @returns {number}
 */
export function quantile(x, p) {

   if (typeof(p) !== "number" || p < 0 || p > 1) {
      throw("Parameter 'p' must be between 0 and 1 (both included).");
   }

   x = sort(x);
   const n = x.length;
   const h = (n - 1) * p + 1;
   const n1 = Math.floor(h);
   const n2 = Math.ceil(h);

   return x[n1 - 1] + (x[n2 - 1] - x[n1 - 1]) * (h - Math.floor(h));
}

/***************************************************
 * Functions for computing vectors of statistics   *
 ***************************************************/

/**
 * Generate a sequence of n numbers between min and max.
 * @param {number} min - first value in the sequence
 * @param {number} max - last value in the sequence
 * @param {number} n - number of values in the sequence
 * @returns {number[]} array with the sequence values
 */
export function seq(min, max, n) {

   if (n < 3) {
      throw("Parameter 'n' should be larger than 3.")
   }

   const step = (max - min + 0.0) / (n - 1 + 0.0)
   let out = [...Array(n)].map((x, i) => min + i * step);

   // if step is smaller than 1 round values to remove small decimals accidentally added by JS
   if (Math.abs(step) < 1) {
      const r = Math.pow(10, Math.round(-Math.log10(step)) + 1);
      out = out.map(v => Math.round((v + Number.EPSILON) * r) / r)
   }

   return(out)
}



/**
 * Finds a range of values in a vector (min and max)
 * @param {number[]} x - vector with values
 * @returns {number[]} array with min and max values
 */
export function range(x) {
   return [min(x), max(x)];
}

/**
 * Computes a range of values in a vector with a margin
 * @param {number[]} x - vector with values
 * @param {number} margin - margin in parts of one (e.g. 0.1 for 10% or 2 for 200%)
 * @returns{number[]} array with marginal range boundaries
 */
export function mrange(x, margin) {
   const mn = min(x);
   const mx = max(x);
   const d = mx - mn;

   return [mn - d * margin, max(x) + d * margin];
}

/**
 * Splits range of vector values into equal intervals
 * @param {number[]} x - vector with values
 * @param {number} n - number of intervals
 * @returns {number[]} vector with boundaries of the intervals
 */
export function split(x, n) {
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
 * Counts how many values from a vector falls into provided intervals (bins)
 * @param {number[]} x - vector with values
 * @param {number[]} bins - vector with bins boundaries
 * @returns {number[]} vector with counts for each bean
 */
export function count(x, bins) {

   if (x === undefined || !Array.isArray(x) ||x.length < 2) {
      throw("count: 'x' must be a vector with numbers.")
   }

   if (bins === undefined || !Array.isArray(bins) || bins.length < 2) {
      throw("count: 'bins' must be a vector with numbers.")
   }

   const n = bins.length;

   // add a bit extra to right side of the last bin
   bins[n - 1] = bins[n - 1] * 1.0001
   return bins.slice(1).map((v, i) => x.filter( v => v >= bins[i] & v < bins[i + 1]).length);
}

/**
 * Computes middle points between values of a vector
 * @param {number[]} x - vector with values
 * @returns {number[]} vector with middle points
 */
export const mids = function(x) {
   return x.slice(1).map((v, i) => (0.5 * (v + x[i])));
}

/**
 * Computes difference between all adjacent values in a vector
 * @param {number[]} x - vector with values
 * @returns {number[]} vector with the differences
 */
export function diff(x) {
   return x.slice(1).map( (y, i) => (y - x[i]));
}

/**
 * Sorts values in a vector
 * @param {Array} x - vector with values
 * @returns {Array} vector with sorted values
 */
export function sort(x, decreasing = false) {
   return decreasing ? x.sort((a, b) => b - a) : x.sort((a, b) => a - b);
}


/**
 * Finds outliers in a vector based on inter-quartile range distance
 * @param {Array} x - vector with values
 * @param {number} Q1 - first quartile (optional parameter)
 * @param {Array} Q3 - third quartile (optional parameter)
 * @returns {Array} vector with outliers or empty vector if none were found.
 */
export function getOutliers(x, Q1 = undefined, Q3 = undefined) {

   if (Q1 === undefined) Q1 = quantile(x, 0.25);
   if (Q3 === undefined) Q3 = quantile(x, 0.75);

   const IQR = Q3 - Q1;
   const bl = Q1 - 1.5 * IQR
   const bu = Q3 + 1.5 * IQR
   return(x.filter(v => v < bl || v > bu));
}

/*******************************************
 * Functions for theoretical distributions *
 *******************************************/

/**
 * Generates 'n' random numbers from a uniform distribution
 * @param {number} n - amount of numbers to generate
 * @param {number} a - smallest value (min) of the population
 * @param {number} b - largest value (max) of the population
 * @returns {number[]} vector with generated numbers
 */
export function runif(n, a = 0, b = 1) {
   let out = [];
   for (let i = 0; i < n; i++) out.push(a + Math.random() * (b - a));
   return out;
}

/**
 * Computes density for given vector of values using uniform distribution
 * @param {Array} x - vector of values
 * @param {number} a - smallest value (min) of the population
 * @param {number} b - largest value (max) of the population
 * @returns {Array} vector with densities
 */
export function dunif(x, a = 0, b = 1) {
   if (!Array.isArray(x)) {
      throw("Parameter 'x' must be an array.")
   }

   return x.map((v) => (v >= a && v <= b) ? 1 / (b - a) : 0);
}


 /**
 * Generates 'n' random numbers from a normal distribution
 * @param {number} n - amount of numbers to generate
 * @param {number} mu - average value of the population
 * @param {number} sigma - standard deviation of the population
 * @returns {Array} vector with generated numbers
 */
export function rnorm(n, mu = 0, sigma = 1) {

   let out = [];
   for (let i = 0; i < n; i ++) {
      const a = Math.sqrt(-2 * Math.log(Math.random()));
      const b = 2 * Math.PI * Math.random();
      out.push(a * Math.sin(b) * sigma + mu);
   }
   return out;
}


/**
 * Computes density for given vector of values using normal distribution
 * @param {Array} x - vector of values
 * @param {number} mu - average value of the population
 * @param {number} sigma - standard deviation of the population
 * @returns {Array} vector with densities
 */
export function dnorm(x, mu = 0, sigma = 1) {
   if (!Array.isArray(x)) {
      throw("Parameter 'x' must be an array.");
   }

   const A = 1 / (Math.sqrt(2 * Math.PI) * sigma);
   const frac = -0.5 / sigma ** 2;

   return x.map((v) => A * Math.exp(frac * ((v - mu) ** 2)));
}

/**
 * Computes probability for given vector of values using normal distribution
 * @param {Array} x - vector of values
 * @param {number} mu - average value of the population
 * @param {number} sigma - standard deviation of the population
 * @returns {Array} vector with densities
 */
export function pnorm(x, mu = 0, sigma = 1) {

   if (!Array.isArray(x)) {
      throw("Parameter 'x' must be an array.");
   }

   const frac = 1 / (Math.sqrt(2) * sigma);
   return x.map(v => (0.5 * (1 + erf( (v - mu) * frac))));
}


/**
 * Computes value of error function (normal distribution)
 * @param {number} x - a number
 * @returns {number} value for erf
 */
export function erf(x) {

  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // constants
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  // approximation
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html
//https://en.wikipedia.org/wiki/Normal_distribution
const libR = require('../dist/lib/libR.js');
const {
    Normal,
    rng: { seq: _seq, arrayrify, numberPrecision }
} = libR;

//some helpers
const log = arrayrify(Math.log);
const seq = seq()();
const precision = numberPrecision(9);

//
const { rnorm, dnorm, pnorm, qnorm } = Normal();


dnorm(0); //standard normal density, max value at '0'
//0.3989422804014327
dnorm(3, 4, 2); // standard normal with mean=4 and sigma=2, value at 3
//0.17603266338214976
dnorm(-10); // course the gaussian is almost zero 10 sigmas from the mean
//7.69459862670642e-23
const d1 = dnorm([-Infinity, Infinity, NaN, -4, -3, -2, 0, 1, 2, 3, 4]);
precision(d1);
/*
[ 0,
  0,
  NaN,
  0.00013383022576488537,
  0.0044318484119380075,
  0.05399096651318806,
  0.3989422804014327,
  0.24197072451914337,
  0.05399096651318806,
  0.0044318484119380075,
  0.00013383022576488537 ]
*/
const d2 = dnorm(
    seq(0)(0)(-4, 4), //[-4,-3,..., 4]
    2, //mu = 2
    1, //sigma = 1
    true //give return values as log
);
precision(d2);
/*
[ -18.918938533204674,
  -13.418938533204672,
  -8.918938533204672,
  -5.418938533204673,
  -2.9189385332046727,
  -1.4189385332046727,
  -0.9189385332046728,
  -1.4189385332046727,
  -2.9189385332046727 ]
*/
const q = [-1, 0, 1];
pnorm(0);
//0.5
const p2 = pnorm(q);
precision(p2);
//[ 0.15865525393145705, 0.5, 0.8413447460685429 ]

const p3 = pnorm(q, 0, 1, false); // propability upper tail, reverse above result
precision(p3);
//[ 0.8413447460685429, 0.5, 0.15865525393145705 ]

const p4 = pnorm(q, 0, 1, false, true); // probabilities as log(p)
precision(p4);
/*
[ -0.17275377902344988,
  -0.6931471805599453,
  -1.8410216450092636 ]
*/
const p5 = pnorm(q, 0, 1, false);
precision(p5);
//[ -0.1727537790234499, -0.6931471805599453, -1.8410216450092636 ]

const p = seq(0, 1, 0.25);
// qnorm
qnorm(0);

qnorm([-1, 0, 1]); // -1 makes no sense


qnorm(p, 0, 2); // take quantiles of 25%

qnorm(p, 0, 2, false); // same but use upper Tail of distribution

qnorm(log(p), 0, 2, false, true); // same but use upper Tail of distribution

rnorm(5)

rnorm(5, 2, 3);
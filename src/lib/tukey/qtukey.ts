/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 	     Ross Ihaka
 *  Copyright (C) 2000--2005 The R Core Team
 *  based in part on AS70 (C) 1974 Royal Statistical Society
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 *
 *  SYNOPSIS
 *
 *	#include <Rmath.h>
 *	double qtukey(p, rr, cc, df, lower_tail, log_p);
 *
 *  DESCRIPTION
 *
 *	Computes the quantiles of the maximum of rr studentized
 *	ranges, each based on cc means and with df degrees of freedom
 *	for the standard error, is less than q.
 *
 *	The algorithm is based on that of the reference.
 *
 *  REFERENCE
 *
 *	Copenhaver, Margaret Diponzio & Holland, Burt S.
 *	Multiple comparisons of simple effects in
 *	the two-way analysis of variance with fixed effects.
 *	Journal of Statistical Computation and Simulation,
 *	Vol.30, pp.1-15, 1988.
 */

/* qinv() :
 *	this function finds percentage point of the studentized range
 *	which is used as initial estimate for the secant method.
 *	function is adapted from portion of algorithm as 70
 *	from applied statistics (1974) ,vol. 23, no. 1
 *	by odeh, r. e. and evans, j. o.
 *
 *	  p = percentage point
 *	  c = no. of columns or treatments
 *	  v = degrees of freedom
 *	  qinv = returned initial estimate
 *
 *	vmax is cutoff above which degrees of freedom
 *	is treated as infinity.
 */

const { sqrt, log } = Math;

function qinv(p: number, c: number, v: number): number {
  const p0 = 0.322232421088;
  const q0 = 0.99348462606e-1;
  const p1 = -1.0;
  const q1 = 0.588581570495;
  const p2 = -0.342242088547;
  const q2 = 0.531103462366;
  const p3 = -0.204231210125;
  const q3 = 0.10353775285;
  const p4 = -0.453642210148e-4;
  const q4 = 0.38560700634e-2;
  const c1 = 0.8832;
  const c2 = 0.2368;
  const c3 = 1.214;
  const c4 = 1.208;
  const c5 = 1.4142;
  const vmax = 120.0;

  let ps;
  let q;
  let t;
  let yi;

  ps = 0.5 - 0.5 * p;
  yi = sqrt(log(1.0 / (ps * ps)));
  t =
    yi +
    ((((yi * p4 + p3) * yi + p2) * yi + p1) * yi + p0) /
      ((((yi * q4 + q3) * yi + q2) * yi + q1) * yi + q0);
  if (v < vmax) t += (t * t * t + t) / v / 4.0;
  q = c1 - c2 * t;
  if (v < vmax) q += -c3 / v + c4 * t / v;
  return t * (q * log(c - 1.0) + c5);
}

/*
 *  Copenhaver, Margaret Diponzio & Holland, Burt S.
 *  Multiple comparisons of simple effects in
 *  the two-way analysis of variance with fixed effects.
 *  Journal of Statistical Computation and Simulation,
 *  Vol.30, pp.1-15, 1988.
 *
 *  Uses the secant method to find critical values.
 *
 *  p = confidence level (1 - alpha)
 *  rr = no. of rows or groups
 *  cc = no. of columns or treatments
 *  df = degrees of freedom of error term
 *
 *  ir(1) = error flag = 1 if wprob probability > 1
 *  ir(2) = error flag = 1 if ptukey probability > 1
 *  ir(3) = error flag = 1 if convergence not reached in 50 iterations
 *		       = 2 if df < 2
 *
 *  qtukey = returned critical value
 *
 *  If the difference between successive iterates is less than eps,
 *  the search is terminated
 */

import * as debug from 'debug';

import { ME, ML_ERR_return_NAN, ML_ERROR, R_Q_P01_boundaries } from '../common/_general';

import { R_DT_qIv } from '../exp/expm1';
import { map } from '../r-func';
import { _ptukey } from './ptukey';

const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;
const { abs: fabs, max: fmax2 } = Math;
const printer = debug('qtukey');
/**
> qtukey
function (p, nmeans, df, nranges = 1, lower.tail = TRUE, log.p = FALSE)
.Call(C_qtukey, p, nranges, nmeans, df, lower.tail, log.p)
<bytecode: 0x000000001cde4a80>
<environment: namespace:stats>

*/
export function qtukey<T>(
  pp: T, //p
  rr: number, //ranges
  cc: number, //nmeans
  df: number, //df
  lower_tail: boolean = true, //lower.tail
  log_p: boolean = false //log.p
): T {
  return map(pp)(p =>
    _qtukey(p, rr, cc, df, lower_tail, log_p)
  ) as any;
}


function _qtukey(
  p: number,
  rr: number,
  cc: number,
  df: number,
  lower_tail: boolean,
  log_p: boolean
): number {
  const eps = 0.0001;
  const maxiter = 50;

  let ans = 0.0;
  let valx0;
  let valx1;
  let x0;
  let x1;
  let xabs;
  let iter;

  if (ISNAN(p) || ISNAN(rr) || ISNAN(cc) || ISNAN(df)) {
    ML_ERROR(ME.ME_DOMAIN, 'qtukey', printer);
    return NaN;
  }

  /* df must be > 1 ; there must be at least two values */
  if (df < 2 || rr < 1 || cc < 2) return ML_ERR_return_NAN(printer);

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }

  p = R_DT_qIv(lower_tail, log_p, p); /* lower_tail,non-log "p" */

  /* Initial value */

  x0 = qinv(p, cc, df);

  /* Find prob(value < x0) */

  valx0 = _ptukey(x0, rr, cc, df, /*LOWER*/ true, /*LOG_P*/ false) - p;

  /* Find the second iterate and prob(value < x1). */
  /* If the first iterate has probability value */
  /* exceeding p then second iterate is 1 less than */
  /* first iterate; otherwise it is 1 greater. */

  if (valx0 > 0.0) x1 = fmax2(0.0, x0 - 1.0);
  else x1 = x0 + 1.0;
  valx1 = _ptukey(x1, rr, cc, df, /*LOWER*/ true, /*LOG_P*/ false) - p;

  /* Find new iterate */

  for (iter = 1; iter < maxiter; iter++) {
    ans = x1 - valx1 * (x1 - x0) / (valx1 - valx0);
    valx0 = valx1;

    /* New iterate must be >= 0 */

    x0 = x1;
    if (ans < 0.0) {
      ans = 0.0;
      valx1 = -p;
    }
    /* Find prob(value < new iterate) */

    valx1 =
      _ptukey(ans, rr, cc, df, /*LOWER*/ true, /*LOG_P*/ false) - p;
    x1 = ans;

    /* If the difference between two successive */
    /* iterates is less than eps, stop */

    xabs = fabs(x1 - x0);
    if (xabs < eps) return ans;
  }

  /* The process did not converge in 'maxiter' iterations */
  ML_ERROR(ME.ME_NOCONV, 'qtukey', printer);
  return ans;
}

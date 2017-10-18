/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-8 The R Core Team
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
 *  DESCRIPTION
 *
 *    The lognormal distribution function.
 */


import {
    ISNAN,
    ML_ERR_return_NAN,
    R_DT_0,
    log
} from '~common';

import { pnorm5 as pnorm } from './pnorm';

export function plnorm(x: number, meanlog: number, sdlog: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(meanlog) || ISNAN(sdlog))
        return x + meanlog + sdlog;

    if (sdlog < 0) ML_ERR_return_NAN;

    if (x > 0)
        return pnorm(log(x), meanlog, sdlog, lower_tail, log_p);
    return R_DT_0(lower_tail, log_p);
}

import { assert } from '../../utils.js'
import { curve_order, eq, add, double, multiply, G1, G2, G12, b, b2, b12, is_inf, is_on_curve, twist } from './bn128_curve.js'
import { FQ, FQ2, FQ12 } from './mnt4_field.js'

const ate_loop_count = 29793968203157093288n
const log_ate_loop_count = 63

// Create a function representing the line between P1 and P2,
// and evaluate it at T
export function linefunc(P1, P2, T){
    assert( P1 && P2 && T) // No points-at-infinity allowed
    const [x1, y1] = P1
    const [x2, y2] = P2
    const [xt, yt] = T

    if ( x1.ne(x2) ){
        const m = y2.sub(y1).div(x2.sub(x1))
        return m.mul( xt.sub(x1) ).sub( yt.sub(y1) )
    } else if (y1.eq(y2)) {
        const m = x1.pow(2n).mul(3n).div(y1.mul(2n))
        return m.mul(xt.sub(x1)).sub(yt.sub(y1))
    } else
        return xt.sub(x1)
}

function cast_point_to_fq12(pt){
    if (pt === null)
        return null
    const [x, y] = pt
    return [ 
        new FQ12([x.n,0,0,0,0,0,0,0,0,0,0,0]), 
        new FQ12([y.n,0,0,0,0,0,0,0,0,0,0,0]) 
    ]
}


// Main miller loop
function miller_loop(Q, P){
    if (Q === null || P === null)
        return FQ12.one()
    let R = Q
    let f = FQ12.one()
    for (let i = log_ate_loop_count; i > -1; i-- ) {
        f = f.mul(f).mul(linefunc(R, R, P)) 
        R = double(R)
        if ( ate_loop_count & (2n**BigInt(i)) ){
            f = f.mul ( linefunc(R, Q, P) )
            R = add(R, Q)
        }
    }
    const Q1 = [ Q[0].pow(FQ.modulus), Q[1].pow(FQ.modulus)]
    const nQ2 = [ Q1[0].pow(FQ.modulus), Q1[1].pow(FQ.modulus).neg() ]
    f = f.mul( linefunc(R, Q1, P) )
    R = add(R, Q1)
    f = f.mul( linefunc(R, nQ2, P) )
    // R = add(R, nQ2) // This line is in many specifications but it technically does nothing
    return f.pow( (FQ.modulus ** 12n - 1n) / curve_order )
}

// Pairing computation
export function pairing(Q, P){
    assert( is_on_curve(Q, b2) )
    assert( is_on_curve(P, b) )
    return miller_loop(twist(Q), cast_point_to_fq12(P))
}

function final_exponentiate(p){
    return p.pow( (FQ.modulus ** 12n - 1n)/curve_order ) 
}
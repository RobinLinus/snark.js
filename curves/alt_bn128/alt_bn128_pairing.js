import {assert} from '../../utils.js'
import { FQ, FQ12, AltBn128CurvePoint, AltBn128CurvePointFQ12 } from './alt_bn128_curve_1.js'


const ate_loop_count = 29793968203157093288n
const log_ate_loop_count = 63

// Create a function representing the line between P1 and P2,
// and evaluate it at T
export function linefunc(P1, P2, T){
    assert( P1 && P2 && T) // No points-at-infinity allowed
    const [x1, y1] = P1.P
    const [x2, y2] = P2.P
    const [xt, yt] = T.P

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
    const [x, y] = pt.P
    return new AltBn128CurvePointFQ12( 
        new FQ12([x.n,0,0,0,0,0,0,0,0,0,0,0]), 
        new FQ12([y.n,0,0,0,0,0,0,0,0,0,0,0]) 
    )
}


// Main miller loop
function miller_loop(Q, P){
    if (Q.is_zero() || P.is_zero())
        return FQ12.one()
    let R = Q
    let f = FQ12.one()
    for (let i = log_ate_loop_count; i > -1; i-- ) {
        f = f.mul(f).mul(linefunc(R, R, P)) 
        R = R.double()
        if ( ate_loop_count & (2n**BigInt(i)) ){
            f = f.mul ( linefunc(R, Q, P) )
            R = R.add(Q)
        }
    }
    const Q1 = new AltBn128CurvePointFQ12 ( Q.x.pow(FQ.modulus), Q.y.pow(FQ.modulus) ) 
    const nQ2 = new AltBn128CurvePointFQ12( Q1.x.pow(FQ.modulus), Q1.y.pow(FQ.modulus).neg() )
    f = f.mul( linefunc(R, Q1, P) )
    R = R.add(Q1)
    f = f.mul( linefunc(R, nQ2, P) )
    // R = add(R, nQ2) // This line is in many specifications but it technically does nothing
    return f.pow( (FQ.modulus ** 12n - 1n) / AltBn128CurvePoint.order )
}

// Pairing computation
export function pairing(Q, P){
    Q.is_well_defined()
    P.is_well_defined()
    return miller_loop(AltBn128CurvePointFQ12.twist(Q), cast_point_to_fq12(P))
}

function final_exponentiate(p){
    return p.pow( (FQ.modulus ** 12n - 1n)/AltBn128CurvePoint.order ) 
}
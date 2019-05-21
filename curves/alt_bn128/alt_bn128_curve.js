import { assert } from '../../utils.js'
import { _FQ, _FQP } from '../../fields/field_elements.js'
import { CurvePoint } from '../ec.js'

// The finite field 
export class FQ extends _FQ {
    static get modulus() {
        return 21888242871839275222246405745257275088696311157297823662689037894645226208583n
    }
}

// The group of points on curve Alt_BN128 over FQ
export class AltBn128CurvePoint extends CurvePoint {

    static get order() {
        return 21888242871839275222246405745257275088548364400416034343698204186575808495617n
    }

    static get b() {
        return new FQ(3)
    }

    static get G() {
        return new AltBn128CurvePoint(new FQ(1), new FQ(2))
    }

    is_well_defined() {
        if (this.is_zero())
            return true
        const [x, y] = this.P;
        return y.mul(y).sub(x.mul(x).mul(x)).eq(this.constructor.b)
    }

    static get field(){
        return FQ
    }
}
// Curve order should be prime
// assert( pow(2, AltBn128CurvePoint.order, AltBn128CurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % AltBn128CurvePoint.order === 0n)

// Generator should be on the curve
assert(AltBn128CurvePoint.G.is_well_defined())



// Generic polynomials over the finite field
export class FQP extends _FQP {
    static get FQ() {
        return FQ
    }
}

// The quadratic extension field
export class FQ2 extends FQP {
    static get modulus_coeffs() {
        return [1, 0]
    }
}

// The group of points on curve Alt_BN128 over FQ2
export class AltBn128CurvePointFQ2 extends AltBn128CurvePoint {

    static get b() {
        return new FQ2([3, 0]).div(new FQ2([9, 1]))
    }

    static get G() {
        return new AltBn128CurvePointFQ2(
            new FQ2([
                10857046999023057135944570762232829481370756359578518086990519993285655852781n,
                11559732032986387107991004021392285783925812861821192530917403151452391805634n
            ]),
            new FQ2([
                8495653923123431417604973247489272438418190587263600148770280649306958101930n,
                4082367875863433681332203403145435568316851327593401208105741076214120093531n
            ])
        )
    }
}
assert(AltBn128CurvePointFQ2.G.is_well_defined())



// The 12th-degree extension field
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [82, 0, 0, 0, 0, 0, -18, 0, 0, 0, 0, 0] // Implied + [1]
    }
}

// The group of points on curve Alt_BN128 over FQ12
export class AltBn128CurvePointFQ12 extends AltBn128CurvePoint {

    static get b() {
        return new FQ12([3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    static get w() {
        return new FQ12([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    static twist(pt) {
        if (pt.is_zero())
            return this.zero()
        const [_x, _y] = pt.P
        // Field isomorphism from Z[p] / x**2 to Z[p] / x**2 - 18*x + 82
        const xcoeffs = [_x.coeffs[0].sub(_x.coeffs[1].mul(9n)), _x.coeffs[1]]
        const ycoeffs = [_y.coeffs[0].sub(_y.coeffs[1].mul(9n)), _y.coeffs[1]]
        // Isomorphism into subfield of Z[p] / w**12 - 18 * w**6 + 82,
        // where w**6 = x
        const nx = new FQ12([xcoeffs[0], 0, 0, 0, 0, 0, xcoeffs[1], 0, 0, 0, 0, 0])
        const ny = new FQ12([ycoeffs[0], 0, 0, 0, 0, 0, ycoeffs[1], 0, 0, 0, 0, 0])
        // Divide x coord by w**2 and y coord by w**3
        return new AltBn128CurvePointFQ12(nx.mul(this.w.pow(2n)), ny.mul(this.w.pow(3n)))
    }

    static get G(){
        return this.twist(AltBn128CurvePointFQ2.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(AltBn128CurvePointFQ12.G.is_well_defined())
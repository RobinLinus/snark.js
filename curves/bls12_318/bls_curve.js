import { assert } from '../../utils.js'
import { _FQ, _FQP } from '../../fields/field_elements.js'
import { CurvePoint } from '../ec.js'

// The finite field 
export class FQ extends _FQ {
    static get modulus() {
        return 4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559787n
    }
}

// The group of points on curve BLS12_318 over FQ
export class BLSCurvePoint extends CurvePoint {

    static get order() {
        return 52435875175126190479447740508185965837690552500527637822603658699938581184513n
    }

    static get a() {
        return FQ.identity()
    }

    static get b() {
        return new FQ(4)
    }

    static get G() {
        return new BLSCurvePoint(
            new FQ(3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507n),
            new FQ(1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569n)
        )
    }
}
// Curve order should be prime
// assert( pow(2, BLSCurvePoint.order, BLSCurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % BLSCurvePoint.order === 0n)

// Generator should be on the curve
assert(BLSCurvePoint.G.is_well_defined())



// Generic polynomials over the finite field
export class FQP extends _FQP {
    static get FQ() {
        return FQ
    }
}

// The quadratic extension field FQ^2
export class FQ2 extends FQP {
    static get modulus_coeffs() {
        return [1, 0]
    }
}

// The group of points on curve BLS12_318 over FQ^2
export class BLSCurvePointFQ2 extends BLSCurvePoint {

    static get a() {
        return FQ2.identity()
    }

    static get b() {
        return new FQ2([4, 4])
    }

    static get G() {
        return new BLSCurvePointFQ2(
            new FQ2([
                352701069587466618187139116011060144890029952792775240219908644239793785735715026873347600343865175952761926303160n,
                3059144344244213709971259814753781636986470325476647558659373206291635324768958432433509563104347017837885763365758n
            ]),
            new FQ2([
                1985150602287291935568054521177171638300868978215655730859378665066344726373823718423869104263333984641494340347905n,
                927553665492332455747201965776037880757740193453592970025027978793976877002675564980949289727957565575433344219582n
            ])
        )
    }
}
assert(BLSCurvePointFQ2.G.is_well_defined())



// The 12th-degree extension field FQ^12
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [ 2, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0 ] // Implied + [1]
    }
}

// The group of points on curve BLS12_318 over FQ12
export class BLSCurvePointFQ12 extends BLSCurvePoint {

    static get a(){
        return FQ12.identity()
    }

    static get b() {
        return new FQ12([4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    static get w() {
        return new FQ12([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    static twist(pt) {
        if (pt.is_identity())
            return this.identity()
        const [_x, _y] = pt.P
        // Field isomorphism from Z[p] / x**2 to Z[p] / x**2 - 18*x + 82
        const xcoeffs = [_x.coeffs[0].sub(_x.coeffs[1]), _x.coeffs[1]]
        const ycoeffs = [_y.coeffs[0].sub(_y.coeffs[1]), _y.coeffs[1]]
        // Isomorphism into subfield of Z[p] / w**12 - 18 * w**6 + 82,
        // where w**6 = x
        const nx = new FQ12([xcoeffs[0], 0, 0, 0, 0, 0, xcoeffs[1], 0, 0, 0, 0, 0])
        const ny = new FQ12([ycoeffs[0], 0, 0, 0, 0, 0, ycoeffs[1], 0, 0, 0, 0, 0])
        // Divide x coord by w**2 and y coord by w**3
        return new BLSCurvePointFQ12(nx.div(this.w.pow(2n)), ny.div(this.w.pow(3n)))
    }

    static get G() {
        return this.twist(BLSCurvePointFQ2.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(BLSCurvePointFQ12.G.is_well_defined())
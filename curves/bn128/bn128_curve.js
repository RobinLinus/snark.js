// Compare to https://github.com/scipr-lab/libff/blob/f2067162520f91438b44e71a2cab2362f1c3cab4/libff/algebra/curves/alt_bn128/alt_bn128_pairing.cpp
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
export class Bn128CurvePoint extends CurvePoint {

    static get order() {
        return 21888242871839275222246405745257275088548364400416034343698204186575808495617n
    }

    static get b() {
        return new FQ(3)
    }

    static get G() {
        return new Bn128CurvePoint(new FQ(1), new FQ(2))
    }

    static get field(){
        return FQ
    }

    is_well_defined() {
        if (this.is_identity())
            return true
        const [x, y] = this.P;
        return y.mul(y).sub(x.mul(x).mul(x)).eq(this.constructor.b)
    }
}

// Curve order should be prime
// assert( pow(2, Bn128CurvePoint.order, Bn128CurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % Bn128CurvePoint.order === 0n)

// Generator should be on the curve
assert(Bn128CurvePoint.G.is_well_defined())



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
export class Bn128CurvePointFQ2 extends Bn128CurvePoint {

    static get b() {
        return new FQ2([
            19485874751759354771024239261021720505790618469301721065564631296452457478373n, 
            266929791119991161246907387137283842545076965332900288569378510910307636690n
            ])
    }

    static get G() {
        return new Bn128CurvePointFQ2(
            new FQ2([
                15267802884793550383558706039165621050290089775961208824303765753922461897946n,
                9034493566019742339402378670461897774509967669562610788113215988055021632533n
            ]),
            new FQ2([
                644888581738283025171396578091639672120333224302184904896215738366765861164n,
                20532875081203448695448744255224543661959516361327385779878476709582931298750n
            ])
        )
    }
}
assert(Bn128CurvePointFQ2.G.is_well_defined())



// The 12th-degree extension field
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [82, 0, 0, 0, 0, 0, -18, 0, 0, 0, 0, 0] // Implied + [1]
    }
}

// The group of points on curve Alt_BN128 over FQ12
export class Bn128CurvePointFQ12 extends Bn128CurvePoint {

    static get b() {
        return new FQ12([3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    static get w() {
        return new FQ12([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    static twist(pt) {
        if (pt.is_identity())
            return this.identity()
        const [_x, _y] = pt.P
        // Field isomorphism from Z[p] / x**2 to Z[p] / x**2 - 18*x + 82
        const xcoeffs = [_x.coeffs[0].sub(_x.coeffs[1].mul(9n)), _x.coeffs[1]]
        const ycoeffs = [_y.coeffs[0].sub(_y.coeffs[1].mul(9n)), _y.coeffs[1]]
        // Isomorphism into subfield of Z[p] / w**12 - 18 * w**6 + 82,
        // where w**6 = x
        const nx = new FQ12([xcoeffs[0], 0, 0, 0, 0, 0, xcoeffs[1], 0, 0, 0, 0, 0])
        const ny = new FQ12([ycoeffs[0], 0, 0, 0, 0, 0, ycoeffs[1], 0, 0, 0, 0, 0])
        // Divide x coord by w**2 and y coord by w**3
        return new Bn128CurvePointFQ12(nx.mul(this.w.pow(2n)), ny.mul(this.w.pow(3n)))
    }

    static get G(){
        return this.twist(Bn128CurvePointFQ2.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(Bn128CurvePointFQ12.G.is_well_defined())
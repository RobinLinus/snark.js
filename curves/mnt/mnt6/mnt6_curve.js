import { assert } from '../../../utils.js'
import { _FQ, _FQP } from '../../../fields/field_elements.js'
import { CurvePoint } from '../../ec.js'

// The finite field 
export class FQ extends _FQ {
    static get modulus() {
        return 475922286169261325753349249653048451545124878552823515553267735739164647307408490559963137n
    }
}

// The group of points on curve Alt_BN128 over FQ
export class MNT6CurvePoint extends CurvePoint {

    static get order() {
        return 475922286169261325753349249653048451545124879242694725395555128576210262817955800483758081n
    }

    static get a() {
        return new FQ(11)
    }

    static get b() {
        return new FQ(106700080510851735677967319632585352256454251201367587890185989362936000262606668469523074n)
    }

    static get G() {
        return new MNT6CurvePoint(
            new FQ(336685752883082228109289846353937104185698209371404178342968838739115829740084426881123453n), 
            new FQ(402596290139780989709332707716568920777622032073762749862342374583908837063963736098549800n)
        )
    }
}
// Curve order should be prime
// assert( pow(2, MNT6CurvePoint.order, MNT6CurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % MNT6CurvePoint.order === 0n)

// Generator should be on the curve
assert(MNT6CurvePoint.G.is_well_defined())



// Generic polynomials over the finite field
export class FQP extends _FQP {
    static get FQ() {
        return FQ
    }
}

// The quadratic extension field
export class FQ2 extends FQP {
    static get modulus_coeffs() {
        return [
            336685752883082228109289846353937104185698209371404178342968838739115829740084426881123453n, 
            402596290139780989709332707716568920777622032073762749862342374583908837063963736098549800n, 
            1n
        ]
    }
}
const non_residue = new FQ(5)
// The group of points on curve Alt_BN128 over FQ2
export class MNT6CurvePointFQ2 extends MNT6CurvePoint {

    static get a() {
        return new FQ2([ 0, 0, MNT6CurvePoint.a ])
    }

    static get b() {
        return new FQ2([ MNT6CurvePoint.b.mul(non_residue), 0, 0])
    }

    static get G() {
        return new MNT6CurvePointFQ2(
            new FQ2([
                421456435772811846256826561593908322288509115489119907560382401870203318738334702321297427n, 
                103072927438548502463527009961344915021167584706439945404959058962657261178393635706405114n,
                143029172143731852627002926324735183809768363301149009204849580478324784395590388826052558n
            ]),
            new FQ2([
                464673596668689463130099227575639512541218133445388869383893594087634649237515554342751377n,
                100642907501977375184575075967118071807821117960152743335603284583254620685343989304941678n,
                123019855502969896026940545715841181300275180157288044663051565390506010149881373807142903n
            ])
        )
    }
}
assert(MNT6CurvePointFQ2.G.is_well_defined())




// The 12th-degree extension field
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [82, 0, 0, 0, 0, 0, -18, 0, 0, 0, 0, 0] // Implied + [1]
    }
}

// The group of points on curve Alt_BN128 over FQ12
export class MNT6CurvePointFQ12 extends MNT6CurvePoint {

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
        return new MNT6CurvePointFQ12(nx.mul(this.w.pow(2n)), ny.mul(this.w.pow(3n)))
    }

    static get G(){
        return this.twist(MNT6CurvePointFQ2.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(MNT6CurvePointFQ12.G.is_well_defined())

console.log('MNT6CurvePointFQ12')
import { assert } from '../../../utils.js'
import { _FQ, _FQP } from '../../../fields/field_elements.js'
import { CurvePoint } from '../../ec.js'

// The finite field 
export class FQ extends _FQ {
    static get modulus() {
        return 475922286169261325753349249653048451545124879242694725395555128576210262817955800483758081n
    }
}

// Generic polynomials over the finite field
export class FQP extends _FQP {
    static get FQ() {
        return FQ
    }
}

// The group of points on curve Alt_BN128 over FQ
export class MNT4CurvePoint extends CurvePoint {

    static get order() {
        return 475922286169261325753349249653048451545124878552823515553267735739164647307408490559963137n
    }

    static get a() {
        return new FQ(2)
    }

    static get b() {
        return new FQ(423894536526684178289416011533888240029318103673896002803341544124054745019340795360841685n)
    }

    static get G() {
        return new MNT4CurvePoint(
            new FQ(60760244141852568949126569781626075788424196370144486719385562369396875346601926534016838n), 
            new FQ(363732850702582978263902770815145784459747722357071843971107674179038674942891694705904306n)
        )
    }
}
// Curve order should be prime
// assert( pow(2, MNT4CurvePoint.order, MNT4CurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % MNT4CurvePoint.order === 0n)

// Generator should be on the curve
assert(MNT4CurvePoint.G.is_well_defined())



// The quadratic extension field
export class FQ2 extends FQP {
    static get modulus_coeffs() {
        return [1, 0]
    }
}

const non_residue = new FQ(17)
// The group of points on curve Alt_BN128 over FQ2
export class MNT4CurvePointFQ2 extends MNT4CurvePoint {

    static get a() {
        return new FQ2([ MNT4CurvePoint.a.mul(non_residue), 0 ])
    }

    static get b() {
        return new FQ2([ 0, MNT4CurvePoint.b.mul(non_residue) ])
    }

    static get G() {
        return new MNT4CurvePointFQ2(
            new FQ2([
                438374926219350099854919100077809681842783509163790991847867546339851681564223481322252708n, 
                37620953615500480110935514360923278605464476459712393277679280819942849043649216370485641n
            ]),
            new FQ2([
                37437409008528968268352521034936931842973546441370663118543015118291998305624025037512482n,
                424621479598893882672393190337420680597584695892317197646113820787463109735345923009077489n
            ])
        )
    }
}
assert(MNT4CurvePointFQ2.G.is_well_defined())



// The 12th-degree extension field
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [82, 0, 0, 0, 0, 0, -18, 0, 0, 0, 0, 0] // Implied + [1]
    }
}

// The group of points on curve Alt_BN128 over FQ12
export class MNT4CurvePointFQ12 extends MNT4CurvePoint {

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
        return new MNT4CurvePointFQ12(nx.mul(this.w.pow(2n)), ny.mul(this.w.pow(3n)))
    }

    static get G(){
        return this.twist(MNT4CurvePointFQ2.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(MNT4CurvePointFQ12.G.is_well_defined())

console.log('MNT4CurvePointFQ12')
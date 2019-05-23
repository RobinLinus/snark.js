// Compare to https://github.com/scipr-lab/libff/blob/f2067162520f91438b44e71a2cab2362f1c3cab4/libff/algebra/curves/mnt/mnt4/mnt4_init.cpp

import { assert } from '../../../utils.js'
import { _FQ, _FQP } from '../../../fields/field_elements.js'
import { CurvePoint } from '../../ec.js'

// The finite field FQ
export class FQ extends _FQ {
    static get modulus() {
        return 41898490967918953402344214791240637128170709919953949071783502921025352812571106773058893763790338921418070971888253786114353726529584385201591605722013126468931404347949840543007986327743462853720628051692141265303114721689601n
    }
}

// The group of points on curve MNT4753 over FQ
export class MNT4753CurvePoint extends CurvePoint {

    static get order() {
        return 41898490967918953402344214791240637128170709919953949071783502921025352812571106773058893763790338921418070971888458477323173057491593855069696241854796396165721416325350064441470418137846398469611935719059908164220784476160001n
    }

    static get a() {
        return new FQ(2)
    }

    static get b() {
        return new FQ(28798803903456388891410036793299405764940372360099938340752576406393880372126970068421383312482853541572780087363938442377933706865252053507077543420534380486492786626556269083255657125025963825610840222568694137138741554679540n)
    }

    static get G() {
        return new MNT4753CurvePoint(
            new FQ(23803503838482697364219212396100314255266282256287758532210460958670711284501374254909249084643549104668878996224193897061976788052185662569738774028756446662400954817676947337090686257134874703224133183061214213216866019444443n),
            new FQ(21091012152938225813050540665280291929032924333518476279110711148670464794818544820522390295209715531901248676888544060590943737249563733104806697968779796610374994498702698840169538725164956072726942500665132927942037078135054n)
        )
    }
}

// Curve order should be prime
// assert( pow(2, MNT4753CurvePoint.order, MNT4753CurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % MNT4753CurvePoint.order === 0n)

// Generator should be on the curve
assert(MNT4753CurvePoint.G.is_well_defined())



// Generic polynomials over the finite field FQ
export class FQP extends _FQP {
    static get FQ() {
        return FQ
    }
}

const non_residue = new FQ(13)

// The quadratic extension field of FQ
export class FQ2 extends FQP {
    static get modulus_coeffs() {
        return [non_residue, 0]
    }

    mul(other) {
        if (other instanceof this.constructor.FQ || typeof(other) == 'bigint' || typeof(other) == 'number') {
            return super.mul(other)
        } else {
            const non_residue = this.constructor.modulus_coeffs[0]
            const [a1, b1] = this.coeffs
            const [a2, b2] = other.coeffs
            const a = a1.mul(a2)
            const b = b1.mul(b2)
            const c = [a.add(b.mul(non_residue)), ((a1.add(b1).mul(a2.add(b2))).sub(a).sub(b))]
            return new this.constructor(c)
        }
    }
}

// The group of points on curve MNT4753 over FQ2
export class MNT4753CurvePointFQ2 extends MNT4753CurvePoint {

    static get a() {
        return new FQ2([MNT4753CurvePoint.a.mul(non_residue), FQ.zero()])
    }

    static get b() {
        return new FQ2([FQ.zero(), MNT4753CurvePoint.b.mul(non_residue)])
    }

    static get G() {
        return new MNT4753CurvePointFQ2(
            new FQ2([
                22367666623321080720060256844679369841450849258634485122226826668687008928557241162389052587294939105987791589807198701072089850184203060629036090027206884547397819080026926412256978135536735656049173059573120822105654153939204n,
                19674349354065582663569886390557105215375764356464013910804136534831880915742161945711267871023918136941472003751075703860943205026648847064247080124670799190998395234694182621794580160576822167228187443851233972049521455293042n
            ]),
            new FQ2([
                6945425020677398967988875731588951175743495235863391886533295045397037605326535330657361771765903175481062759367498970743022872494546449436815843306838794729313050998681159000579427733029709987073254733976366326071957733646574n,
                17406100775489352738678485154027036191618283163679980195193677896785273172506466216232026037788788436442188057889820014276378772936042638717710384987239430912364681046070625200474931975266875995282055499803236813013874788622488n
            ])
        )
    }
}
assert(MNT4753CurvePointFQ2.G.is_well_defined())



// The 12th-degree extension field
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [82, 0, 0, 0, 0, 0, -18, 0, 0, 0, 0, 0] // Implied + [1]
    }
}

// The group of points on curve MNT4753 over FQ12
export class MNT4753CurvePointFQ12 extends MNT4753CurvePoint {

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
        return new MNT4753CurvePointFQ12(nx.mul(this.w.pow(2n)), ny.mul(this.w.pow(3n)))
    }

    static get G() {
        return this.twist(MNT4753CurvePointFQ2.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(MNT4753CurvePointFQ12.G.is_well_defined())

console.log('MNT4753CurvePointFQ12')
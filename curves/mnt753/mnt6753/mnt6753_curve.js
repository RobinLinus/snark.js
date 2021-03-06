// Compare to https://github.com/scipr-lab/libff/blob/f2067162520f91438b44e71a2cab2362f1c3cab4/libff/algebra/curves/mnt/mnt4/mnt4_init.cpp

import { assert } from '../../../utils.js'
import { _FQ, _FQP } from '../../../fields/field_elements.js'
import { CurvePoint } from '../../ec.js'

// The finite field FQ
export class FQ extends _FQ {
    static get modulus() {
        return 41898490967918953402344214791240637128170709919953949071783502921025352812571106773058893763790338921418070971888458477323173057491593855069696241854796396165721416325350064441470418137846398469611935719059908164220784476160001n
    }
}

// The group of points on curve MNT6753 over FQ
export class MNT6753CurvePoint extends CurvePoint {

    static get order() {
        return 41898490967918953402344214791240637128170709919953949071783502921025352812571106773058893763790338921418070971888253786114353726529584385201591605722013126468931404347949840543007986327743462853720628051692141265303114721689601n
    }

    static get a() {
        return new FQ(11)
    }

    static get b() {
        return new FQ(11625908999541321152027340224010374716841167701783584648338908235410859267060079819722747939267925389062611062156601938166010098747920378738927832658133625454260115409075816187555055859490253375704728027944315501122723426879114n)
    }

    static get G() {
        return new MNT6753CurvePoint(
            new FQ(16364236387491689444759057944334173579070747473738339749093487337644739228935268157504218078126401066954815152892688541654726829424326599038522503517302466226143788988217410842672857564665527806044250003808514184274233938437290n),
            new FQ(4510127914410645922431074687553594593336087066778984214797709122300210966076979927285161950203037801392624582544098750667549188549761032654706830225743998064330900301346566408501390638273322467173741629353517809979540986561128n)
        )
    }
}



// Curve order should be prime
// assert( pow(2, MNT6753CurvePoint.order, MNT6753CurvePoint.order) == 2 )

// Curve order should be a factor of field_modulus**12 - 1
assert((FQ.modulus ** 12n - 1n) % MNT6753CurvePoint.order === 0n)

// Generator should be on the curve
assert(MNT6753CurvePoint.G.is_well_defined())



// Generic polynomials over the finite field FQ
export class FQP extends _FQP {
    static get FQ() {
        return FQ
    }
}

const non_residue = new FQ(11)
// The quadratic extension field of FQ
export class FQ3 extends FQP {
    static get modulus_coeffs() {
        // return [11n ,0n, 0n]
        return [non_residue, 0n, 0n]
    }

    mul(other) {
        if (other instanceof this.constructor.FQ || typeof(other) == 'bigint' || typeof(other) == 'number') {
            return super.mul(other)
        } else {
            const non_residue = this.constructor.modulus_coeffs[0]
            const [a1, b1, c1] = this.coeffs
            const [a2, b2, c2] = other.coeffs
            const a = a1.mul(a2)
            const b = b1.mul(b2)
            const c = c1.mul(c2)
            const d = [
                a.add( b1.add(c1).mul(b2.add(c2)).sub(b).sub(c).mul(non_residue) ), 
                a1.add(b1).mul(a2.add(b2)).sub(a).sub(b).add(c.mul(non_residue)),
                a1.add(c1).mul(a2.add(c2)).sub(a).add(b).sub(c)
            ]
            return new this.constructor(d)
        }
    }
}


// The group of points on curve MNT6753 over FQ2
export class MNT6753CurvePointFQ3 extends MNT6753CurvePoint {

    static get a() {
        return new FQ3([0, 0, MNT6753CurvePoint.a])
    }

    static get b() {
        return new FQ3([MNT6753CurvePoint.b.mul(non_residue), 0, 0])
    }

    static get G() {
        return new MNT6753CurvePointFQ3(
                new FQ3([
                    new FQ(46538297238006280434045879335349383221210789488441126073640895239023832290080310125413049878152095926176013036314720850781686614265244307536450228450615346834324267478485994670716807428718518299710702671895190475661871557310n),
                    new FQ(10329739935427016564561842963551883445915701424214177782911128765230271790215029185795830999583638744119368571742929964793955375930677178544873424392910884024986348059137449389533744851691082159233065444766899262771358355816328n),
                    new FQ(19962817058174334691864015232062671736353756221485896034072814261894530786568591431279230352444205682361463997175937973249929732063490256813101714586199642571344378012210374327764059557816647980334733538226843692316285591005879n)
                ]),
                new FQ3([
                    new FQ(5648166377754359996653513138027891970842739892107427747585228022871109585680076240624013411622970109911154113378703562803827053335040877618934773712021441101121297691389632155906182656254145368668854360318258860716497525179898n),
                    new FQ(26817850356025045630477313828875808893994935265863280918207940412617168254772789578700316551065949899971937475487458539503514034928974530432009759562975983077355912050606509147904958229398389093697494174311832813615564256810453n),
                    new FQ(32332319709358578441696731586704495581796858962594701633932927358040566210788542624963749336109940335257143899293177116050031684054348958813290781394131284657165540476824211295508498842102093219808642563477603392470909217611033n)
                ]));
    }
}




assert(MNT6753CurvePointFQ3.G.is_well_defined())



// The 12th-degree extension field
export class FQ12 extends FQP {
    static get modulus_coeffs() {
        // The modulus of the polynomial in this representation of FQ12
        return [82, 0, 0, 0, 0, 0, -18, 0, 0, 0, 0, 0] // Implied + [1]
    }
}

// The group of points on curve MNT6753 over FQ12
export class MNT6753CurvePointFQ12 extends MNT6753CurvePoint {

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
        return new MNT6753CurvePointFQ12(nx.mul(this.w.pow(2n)), ny.mul(this.w.pow(3n)))
    }

    static get G() {
        return this.twist(MNT6753CurvePointFQ3.G)
    }
}

// Check that the twist creates a point that is on the curve
assert(MNT6753CurvePointFQ12.G.is_well_defined())

console.log('MNT6753CurvePointFQ12')
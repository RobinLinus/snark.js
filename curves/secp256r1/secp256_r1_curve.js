import { assert } from '../../utils.js'
import { _FQ } from '../../fields/field_elements.js'
import { CurvePoint } from '../ec.js'

// The finite field FQ
export class FQ extends _FQ {
    static get modulus() {
        return 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFn
    }
}

// The group of points on curve Secp256r1 over FQ
export class Secp256r1Point extends CurvePoint {

    static get order() {
        return 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551n
    }

    static get a() {
        return new FQ(-3)
    }

    static get b() {
        return new FQ(0x5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604Bn)
    }

    static get G() {
        return new Secp256r1Point(
            new FQ(0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296n), 
            new FQ(0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5n)
        )
    }
}

// Generator should be on the curve
assert(Secp256r1Point.G.is_well_defined())

console.log('Secp256r1Point works')
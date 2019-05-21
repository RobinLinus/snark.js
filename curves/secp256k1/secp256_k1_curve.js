import { assert } from '../../utils.js'
import { _FQ } from '../../fields/field_elements.js'
import { CurvePoint } from '../ec.js'

// The finite field FQ
export class FQ extends _FQ {
    static get modulus() {
        return 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn
    }
}

// The group of points on curve Secp256k1 over FQ
export class Secp256k1Point extends CurvePoint {

    static get order() {
        return 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n
    }

    static get a() {
        return new FQ(0)
    }

    static get b() {
        return new FQ(7)
    }

    static get G() {
        return new Secp256k1Point(
            new FQ(0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n), 
            new FQ(0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n)
        )
    }
}

// Generator should be on the curve
assert(Secp256k1Point.G.is_well_defined())

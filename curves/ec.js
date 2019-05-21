import { assert } from '../utils.js'

// Abstract group of elliptic curve points
export class CurvePoint {

    constructor(x, y, is_zero = false) {
        if (is_zero) {
            this._is_zero = true
        } else {
            this.P = [x, y]
        }
    }

    get x() {
        return this.P[0]
    }

    get y() {
        return this.P[1]
    }

    is_zero() {
        return this._is_zero || false
    }

    static zero() {
        return new this.prototype.constructor(0, 0, true);
    }

    // Check that a point is on the curve defined by y**2 == x**3 + b
    is_well_defined() {
        if (this.is_zero())
            return true
        const [x, y] = this.P;
        const [a, b] = [ this.constructor.a, this.constructor.b ]
        return y.mul(y).sub(x.mul(x).mul(x)).sub(x.mul(a)).eq(b)
    }

    // Elliptic curve doubling
    double() {
        const [x, y] = this.P
        const l = x.pow(2n).mul(3n).div(y.mul(2n))
        const newx = l.pow(2n).sub(x.mul(2n))
        const newy = l.neg().mul(newx).add(l.mul(x)).sub(y)
        return new this.constructor(newx, newy)
    }

    // Elliptic curve addition
    add(other) {
        if (this.is_zero())
            return other
        if (other.is_zero())
            return this
        if (this.eq(other))
            return this.double()
        if (this.x.eq(other.x))
            return this.constructor.zero()

        const [x1, y1] = this.P
        const [x2, y2] = other.P
        const l = y2.sub(y1).div(x2.sub(x1))
        const newx = l.mul(l).sub(x1).sub(x2)
        const newy = l.neg().mul(newx).add(l.mul(x1)).sub(y1)
        assert(newy.eq((l.neg().mul(newx).add(l.mul(x2)).sub(y2))))
        return new this.constructor(newx, newy)
    }

    // Convert P => -P
    neg(pt) {
        if (this.is_zero())
            return this.constructor.zero()
        return new this.constructor(this.x, this.y.neg())
    }

    // Elliptic curve point multiplication
    multiply(n) {
        n = BigInt(n)
        if (n == 0n)
            return this.constructor.zero()
        else if (n == 1n) // FIXME compare to field elements
            return this
        else if (n % 2n === 0n) // FIXME compare to field elements
            return this.double().multiply(n / 2n)
        else
            return this.double().multiply(n / 2n).add(this)
    }

    eq(other) {
        return this.x.eq(other.x) && this.y.eq(other.y)
    }
}
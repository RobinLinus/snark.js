import { assert } from '../utils.js'
// Extended euclidean algorithm to find modular inverses for
// integers
function inv(a, n) {
    let t = 0n;
    let newT = 1n;
    let r = n;
    let newR = a;
    let q;
    while (newR != 0n) {
        q = r / newR;
        [t, newT] = [newT, (t - q * newT) % n];
        [r, newR] = [newR, r - q * newR];
    }
    return t
}


function _n(other) {
    return BigInt( (other.n || other.n === 0n || other.n === 0) ? other.n : other)
}

// An abstract class for field elements in FQ. Wrap a number in this class,
// and it becomes a field element.
// subclasses need to implement `FQ.modulus`
export class _FQ {

    constructor(n) {
        n = _n(n)
        this.n = n % this.constructor.modulus
        if( this.n < 0 )
            this.n += this.constructor.modulus // Fix sign of x mod n for negative x
    }

    add(other) {
        const on = _n(other)
        return new this.constructor(this.n + on)
    }

    mul(other) {
        const on = _n(other)
        return new this.constructor(this.n * on)
    }

    sub(other) {
        const on = _n(other)
        return new this.constructor(this.n - on)
    }

    div(other) {
        const on = _n(other)
        return new this.constructor( this.n * inv(on, this.constructor.modulus) )
    }

    pow(other) {
        if (other == 0n)
            return new this.constructor(1n)
        else if (other == 1n)
            return new this.constructor(this.n)
        else if (other % 2n == 0n)
            return this.mul(this).pow(other / 2n)
        else
            return this.mul(this).pow(other / 2n).mul(this)
    }

    eq(other) {
        const on = _n(other)
        return this.n == on
    }

    ne(other) {
        return !this.eq(other)
    }

    neg(self) {
        return new this.constructor(-this.n)
    }

    static one() {
        return new this.prototype.constructor(1n)
    }

    static zero() {
        return new this.prototype.constructor(0n)
    }
}


// Utility methods for polynomial math
function deg(p) {
    let d = p.length - 1
    while ( (p[d] === 0n || p[d].n === 0n) && d) {
        d -= 1
    }
    return d
}

function zip(a, b) {
    const r = []
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        r.push([a[i], b[i]])
    }
    return r
}

function zeros(n) {
    const v = []
    for (let i = 0; i < n; i++) {
        v.push(0n)
    }
    return v
}

function poly_rounded_div(a, b, FQ) {
    let dega = deg(a)
    let degb = deg(b)
    let temp = a.map(x => new FQ(x))
    let o = a.map(x => new FQ(0n))
    for (let i = dega - degb; i > -1; i--) {
        o[i] = o[i].add(temp[degb + i].div(b[degb]))
        for (let c = 0; c < degb + 1; c++) {
            temp[c + i] = temp[c + i].sub(o[c])
        }
    }
    return o.slice(0, deg(o) + 1)
}

// A class for elements in polynomial extension fields
export class _FQP {

    constructor(coeffs) {
        assert(coeffs.length == this.degree)
        this.coeffs = coeffs.map(c => new this.constructor.FQ(c))
    }

    get degree(){
        return this.constructor.modulus_coeffs.length
    }

    add(other) {
        // assert( isinstance(other, this.class) ) 
        return new this.constructor(zip(this.coeffs, other.coeffs).map(e => e[0].add(e[1])))
    }

    sub(other) {
        // assert isinstance(other, this.class)
        return new this.constructor(zip(this.coeffs, other.coeffs).map(e => e[0].sub(e[1])))
    }

    mul(other) {
        if (other instanceof this.constructor.FQ || typeof(other) == 'bigint' || typeof(other) == 'number' ) {
            return new this.constructor( this.coeffs.map(c => c.mul(other)) )
        } else {
            // assert( other instanceof this.prototype.constructor )
            let b = zeros(this.degree * 2 - 1).map(z => new this.constructor.FQ(z))

            for (let i = 0; i < this.degree; i++) {
                for (let j = 0; j < this.degree; j++) {
                    b[i + j] = b[i + j].add(this.coeffs[i].mul(other.coeffs[j]))
                }
            }

            while (b.length > this.degree) {
                let exp = b.length - this.degree - 1
                let top = b.pop()
                for (let i = 0; i < this.degree; i++) {
                    b[exp + i] = b[exp + i].sub( top.mul( this.constructor.modulus_coeffs[i] ))
                }
            }

            return new this.constructor(b) 
        }

    }

    div(other) {
        if (other instanceof this.constructor.FQ || other instanceof BigInt) {
            return new this.constructor(this.coeffs.map(c => c.div(other)))
        } else {
            // assert isinstance(other, this.class)
            return this.mul(other.inv())
        }
    }

    pow(other) {
        if (other == 0n)
            return new this.constructor([1n].concat(zeros(this.degree - 1)))
        else if (other == 1n)
            return new this.constructor(this.coeffs)
        else if (other % 2n == 0n)
            return this.mul(this).pow(other / 2n)
        else
            return this.mul(this).pow(other / 2n).mul(this)
    }

    // Extended euclidean algorithm used to find the modular inverse
    inv() {
        let lm = [1].concat(zeros(this.degree)).map(c => new this.constructor.FQ(c))
        let hm = zeros(this.degree + 1).map(c => new this.constructor.FQ(c))

        let low = this.coeffs.concat([new this.constructor.FQ(0)])
        let high = this.constructor.modulus_coeffs.concat([new this.constructor.FQ(1)])

        while (deg(low)) {
            let r = poly_rounded_div(high, low, this.constructor.FQ)
            r = r.concat( zeros(this.degree + 1 - r.length) )
            let nm = hm.map(x => new this.constructor.FQ(x))
            let next = high.map(x => new this.constructor.FQ(x))
            for (let i = 0; i < this.degree + 1; i++) {
                for (let j = 0; j < this.degree + 1 - i; j++) {
                    nm[i+j] = nm[i+j].sub( lm[i].mul(r[j]) );
                    next[i+j] = next[i+j].sub( low[i].mul(r[j]) );
                }
            }
            [lm, low, hm, high] = [nm, next, lm, low]
        }
        return new this.constructor( lm.slice(0, this.degree) ).div( low[0] )
    }

    eq(other) {
        for (let i = 0; i < this.coeffs.length; i++) {
            if (this.coeffs[i].ne(other.coeffs[i]))
                return false
        }
        return true
    }

    ne(other) {
        return !this.eq(other)
    }

    neg(self) {
        return new this.constructor(this.coeffs.map(c => c.neg()))
    }

    static one() {
        const v = zeros(this.prototype.degree - 1)
        v.unshift(1)
        return new this.prototype.constructor(v)
    }

    static zero() {
        return new this.prototype.constructor(zeros(this.prototype.degree))
    }

}

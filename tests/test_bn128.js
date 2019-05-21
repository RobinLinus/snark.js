import {assert} from '../../utils.js'
import {FQ, FQ2, FQ12} from '../curves/alt_bn128/alt_bn128_field.js'

console.log('Starting alt_bn128 tests')

assert( (new FQ(2)).mul( new FQ(2) ).eq( new FQ(4) ) )
assert( new FQ(2).div(new FQ(7)).add(new FQ(9).div(new FQ(7))).eq(new FQ(11).div(new FQ(7))) )
assert( new FQ(2).mul( new FQ(7)).add( new FQ(9).mul(new FQ(7)) ).eq( new FQ(11).mul( new FQ(7))  ) )
assert( new FQ(9).pow(FQ.modulus).eq(new FQ(9)) )
console.log('FQ works fine')

let x = new FQ2([1n, 0n])
let f = new FQ2([1n, 2n])
let fpx = new FQ2([2n, 2n]) 
let one = FQ2.one()
assert( x.add(f).eq(fpx) )
assert( f.div(f).eq(one) )
assert( one.div(f).add(x.div(f)).eq( one.add(x).div(f) ))
assert( one.mul(f).add(x.mul(f)).eq( one.add(x).mul(f) ))
assert( x.pow(FQ.modulus ** 2n - 1n).eq(one) )
console.log('FQ2 works fine')

x = new FQ12([1n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n])
f = new FQ12([1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n])
fpx = new FQ12([2n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n])
one = FQ12.one()
assert( x.add(f).eq(fpx) )
assert( f.div(f).eq(one) )
assert( one.div(f).add(x.div(f)).eq(one.add(x).div(f)) )
assert( one.mul(f).add(x.mul(f)).eq(one.add(x).mul(f)) )
// This check takes too long
// assert x ** (FQ.modulus ** 12 - 1) == one
console.log( 'FQ12 works fine' )


import {curve_order,eq,neg,add,double,multiply,G1,G2,G12,b2,b12,is_inf,is_on_curve} from '../curves/alt_bn128/alt_bn128_curve.js'


assert( eq(add(add(double(G1), G1), G1), double(double(G1))))
assert( eq(double(G1), G1) == false)
assert( eq(add(multiply(G1, 9n), multiply(G1, 5n)), add(multiply(G1, 12n), multiply(G1, 2n))) )
assert( is_inf(multiply(G1, curve_order)))
console.log('G1 works fine')

assert( eq(add(add(double(G2), G2), G2), double(double(G2))) )
assert( ! eq(double(G2), G2) )
assert( eq(add(multiply(G2, 9n), multiply(G2, 5n)), add(multiply(G2, 12n), multiply(G2, 2n))) )
assert( is_inf(multiply(G2, curve_order)) )
assert( ! is_inf(multiply(G2, 2n * FQ.modulus - curve_order)) )
assert( is_on_curve(multiply(G2, 9n), b2) )
console.log('G2 works fine')

assert( eq(add(add(double(G12), G12), G12), double(double(G12))) )
assert( ! eq(double(G12), G12) )
assert( eq(add(multiply(G12, 9n), multiply(G12, 5n)), add(multiply(G12, 12n), multiply(G12, 2n))) )
assert( is_on_curve(multiply(G12, 9n), b12) )
assert( is_inf(multiply(G12, curve_order)) ) 
console.log('G12 works fine')


import {pairing, linefunc} from '../curves/alt_bn128/alt_bn128_pairing.js'

console.log('Starting pairing tests')
const startTime = performance.now()

const [one_, two, three] = [ G1, double(G1), multiply(G1, 3n) ]
const [negone, negtwo, negthree] = [ multiply(G1, curve_order - 1n), multiply(G1, curve_order - 2n), multiply(G1, curve_order - 3n) ]

assert( linefunc(one_, two, one_).eq( new FQ(0n) ))
assert( linefunc(one_, two, two).eq( new FQ(0n) ))
assert( linefunc(one_, two, three).ne(new FQ(0n) ))
assert( linefunc(one_, two, negthree).eq( new FQ(0n) ))
assert( linefunc(one_, negone, one_).eq( new FQ(0n) ))
assert( linefunc(one_, negone, negone).eq( new FQ(0n) ))
assert( linefunc(one_, negone, two).ne(new FQ(0n) ))
assert( linefunc(one_, one_, one_).eq( new FQ(0n) ))
assert( linefunc(one_, one_, two).ne(new FQ(0n) ))
assert( linefunc(one_, one_, negtwo).eq( new FQ(0n) ))
console.log('"line function" is consistent' )

const p1 = pairing(G2, G1)
const pn1 = pairing(G2, neg(G1))
assert( p1.mul(pn1).eq( FQ12.one() ) )
console.log('Pairing check against negative in G1 passed')
const np1 = pairing(neg(G2), G1)
assert(p1.mul(np1).eq(FQ12.one()))
assert(pn1.eq(np1))
console.log('Pairing check against negative in G2 passed')
assert(p1.pow(curve_order).eq(FQ12.one()))
console.log('Pairing output has correct order')
const p2 = pairing(G2, multiply(G1, 2n))
assert( p1.mul(p1).eq(p2) )
console.log('Pairing bilinearity in G1 passed')

assert( p1.ne(p2) && p1.ne(np1) && p2.ne(np1) )
console.log('Pairing is non-degenerate')

const po2 = pairing(multiply(G2, 2n), G1)
assert(p1.mul(p1).eq(po2))
console.log('Pairing bilinearity in G2 passed')
const p3 = pairing(multiply(G2, 27n), multiply(G1, 37n))
const po3 = pairing(G2, multiply(G1, 999n))
assert(p3.eq(po3))

console.log('Composite check passed')
console.log('Total time for pairings:', (performance.now() - startTime))

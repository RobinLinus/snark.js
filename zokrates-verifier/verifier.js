import { AltBn128CurvePoint, AltBn128CurvePointFQ2, FQ, FQ2, FQ12 } from '../curves/alt_bn128/alt_bn128_curve.js'
import { pairing } from '../curves/alt_bn128/alt_bn128_pairing.js'
import { assert } from '../utils.js'


class Verifier {

    static verify(verificationKey, inputs, proof) {
        const vk = verificationKey;
        assert(inputs.length + 1 == vk.gammaABC.length);
        
        // Compute the linear combination vk_x
        let vk_x = AltBn128CurvePointFQ2.zero() 
        for (let i = 0; i < inputs.length; i++){
            vk_x = vk_x.add( vk.gammaABC[i + 1].multiply(inputs[i]))
        }
        vk_x = vk_x.add(vk.gammaABC[0]);

        const result = pairing(proof.B, proof.A)
            .mul( pairing(vk.gamma, vk_x.neg()) )
            .mul( pairing(vk.delta, proof.C.neg()) )
            .mul( pairing(vk.b, vk.a.neg()) )

        if (result.eq(FQ12.one())){
            return true
        } else {
            return false
        }
    }
}

class G1Point extends AltBn128CurvePoint{
    constructor(x,y){
        super( new FQ(x), new FQ(y) )
    }
}

class G2Point extends AltBn128CurvePointFQ2{
    constructor(x,y){
        super( new FQ2(x), new FQ2(y) )
    }
}

class VerificationKey{

    static async from_url(url){
        const text = await fetch(url).then(r => r.text() )
        return new VerificationKey(text)
    }

    constructor(text){
        const numbers = text.match(/0x[0-9A-Fa-f]*/g)
        this.a     = new G1Point( numbers[0], numbers[1] )
        this.b     = new G2Point([numbers[3], numbers[2]], [numbers[5], numbers[4]])
        this.gamma = new G2Point([numbers[7], numbers[6]], [numbers[9], numbers[8]])
        this.delta = new G2Point([numbers[11], numbers[10]], [numbers[13], numbers[12]])

        this.gammaABC = []
        for(let i=14; i < numbers.length; i+=2 ) {
            this.gammaABC.push(new G1Point(numbers[i],numbers[i+1]))
        }
    }

}

class Proof {
    
    static async from_url(url){
        const json = await fetch(url)
            .then(response => response.json())
        return new Proof(json)
    }

    constructor(json){
        const p = json.proof
        this.proof = {
            A : new G1Point(p.a[0], p.a[1]),
            B : new G2Point(p.b[0].reverse(), p.b[1].reverse()),
            C : new G1Point(p.c[0], p.c[1])
        }
        this.inputs = json.inputs.map(n => BigInt(n))
    }
}



async function verify(keyUrl, proofUrl){
    console.log('Fetching verification key')
    const k = await VerificationKey.from_url(keyUrl)
    
    console.log('Fetching proof')
    const p = await Proof.from_url(proofUrl);
    
    console.log('Proof verification started')

    const result = Verifier.verify(k, p.inputs, p.proof) 
    if ( result ){
        console.log('Proof verification successful')
    } else {
        console.error('Proof verification failed')
    }
    return result
}

// verify('examples/root/verification.key', 'examples/root/proof2.json')
verify('examples/preimage/verification.key', 'examples/preimage/proof.json')



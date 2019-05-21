import { _FQ } from '../fields/field_elements.js'


// The finite field of unknown order
export class FQ extends _FQ {
    static get modulus() {
        return 25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357n
    }
}


export class Accumulator {

    constructor() {
        this._state = Accumulator.G
    }

    add(x) {
        const prev_state = this._state;
        this._state = this._state.pow(x)
        return new InclusionProof(prev_state)
    }

    remove(x, proof) {
        if (proof.verify(x, this))
            throw 'Invalid proof'
        this._state = proof
    }

    static get G() {
        return new FQ(2n)
    }

    get state(){
    	return this._state
    }

}


export class InclusionProof {

	constructor(root){
		this._root = root 
	}

    verify(x, A) {
        return this._root.pow(x).eq(A.state)
    }

    update(y) {
        this._root = this._root.pow(y)
    }
}


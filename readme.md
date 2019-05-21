# snark.js

Research project on constant-size and stateless blockchains.

## Disclaimer

THIS CODE IS NOT SECURE! DO NOT USE IT IN REAL LIFE!

## Compatibility

This project depends on the native [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) type, which is currently available only in Chrome. 

## Research References

### zkSNARKS
- [Scalable Zero Knowledge via Cycles of Elliptic Curves](https://eprint.iacr.org/2014/595.pdf)
- [C∅C∅: A Framework for Building Composable Zero-Knowledge Proofs](https://eprint.iacr.org/2015/1093.pdf)
- [On the Size of Pairing-based Non-interactive Arguments](https://eprint.iacr.org/2016/260.pdf)

### Hash Functions
- [Fast and simple constant-time hashing to the BLS12-381 elliptic curve](https://eprint.iacr.org/2019/403.pdf)
- [Starkad and Poseidon: New Hash Functions for Zero Knowledge Proof Systems](https://eprint.iacr.org/2019/458)

### STARKS 
- [Scalable, transparent, and post-quantum secure computational integrity](https://eprint.iacr.org/2018/046.pdf)
- [Transparent scalable computational integrity (Talk)](https://www.youtube.com/watch?v=HJ9K_o-RRSY)
- [Doubly-efficient zkSNARKs without trusted setup](https://eprint.iacr.org/2017/1132.pdf)
- [Aurora: Transparent Succinct Arguments for R1CS (Paper)](https://eprint.iacr.org/2018/828.pdf)
- [Aurora: Transparent Succinct Arguments for R1CS (Talk)](https://www.youtube.com/watch?v=jEHOZbKSHNI)
- [Ligero: Lightweight Sublinear Arguments Without a Trusted Setup](https://acmccs.github.io/papers/p2087-amesA.pdf)

### Blockchain Protocols 
- [Coda: Decentralized cryptocurrency at scale](https://cdn.codaprotocol.com/v2/static/coda-whitepaper-05-10-2018-0.pdf)
- [EDRAX: A Cryptocurrency with Stateless Transaction Validation](https://eprint.iacr.org/2018/968.pdf)

### Signatures 
- [Compact Multi-Signatures for Smaller Blockchains](https://eprint.iacr.org/2018/483.pdf)
- [Snarky Signatures: Minimal Signatures of Knowledge from Simulation-Extractable SNARKs](https://eprint.iacr.org/2017/540.pdf)
- [MiMC: Efficient Encryption and Cryptographic Hashing with Minimal Multiplicative Complexity](https://eprint.iacr.org/2016/492.pdf)

### Misc
- [Batching Techniques for Accumulators with Applications to IOPs and Stateless Blockchains](https://eprint.iacr.org/2018/1188.pdf)
- [Verifiable Delay Functions](https://eprint.iacr.org/2018/601.pdf)

### Related Tools 
- [libsnark: a C++ library for zkSNARK proofs](https://github.com/scipr-lab/libsnark)
- [libiop: a C++ library for IOP-based zkSNARKs](https://github.com/scipr-lab/libiop)
- [A toolbox for zkSNARKs on Ethereum](https://github.com/Zokrates/ZoKrates)
- [snarky: OCaml DSL for verifiable computation](https://github.com/o1-labs/snarky)

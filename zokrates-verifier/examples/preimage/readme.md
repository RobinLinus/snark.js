# Example: Knowledge of Hash Preimage 

The `verification.key` lets a verifier verify the prover's knowledge of a preimage of a sha256 hash 

- `proof.json` is a zkProof for the knowledge of the preimage of `c6481e22c5ff4164af680b8cfaa5e8ed3120eeff89c4f307c4a6faaae059ce10` (which is `0b101`)

### Corresponding zokrates `.code` file:

```
import "hashes/sha256/512bitPacked.code" as sha256packed

def main(private field a, private field b, private field c, private field d, field e, field f) -> (field):
    h = sha256packed([a, b, c, d])
    h[0] == e
    h[1] == f
    return 1
```

- max preimage size: 512 bit
- More details: [read this tutorial](https://zokrates.github.io/sha256example.html)


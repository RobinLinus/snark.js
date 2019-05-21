# Example: Knowledge of Square Root

The `verification.key` lets a verifier verify the prover's knowledge of the square root of a number

- `proof.json` is a zkProof for the knowledge of the square root of 1787569
- `proof2.json` is a zkProof for the knowledge of the square root of 100


### Corresponding zokrates `.code` file:

```
def main(private field a, field b) -> (field):
  field result = if a * a == b then 1 else 0 fi
  return result
```

- More details: [read this tutorial](https://zokrates.github.io/gettingstarted.html)
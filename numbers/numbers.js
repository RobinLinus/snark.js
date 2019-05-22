export function pow(a, b, n) {
    a = a % n;
    let result = 1n;
    let x = a;

    while (b > 0) {
        const leastSignificantBit = b % 2n;
        b = b / 2n;

        if (leastSignificantBit == 1n) {
            result = result * x;
            result = result % n;
        }

        x = x * x;
        x = x % n;
    }
    return result;
}

export function egcd(m, n) {
    let a1 = 1n;
    let b1 = 0n;
    let a = 0n;
    let b = 1n;
    let c = m;
    let d = n;
    let q = c / d;
    let r = c % d;
    while (r > 0n) {
        let t = a1;
        a1 = a;
        a = t - q * a; // a1 - qa
        t = b1;
        b1 = b;
        b = t - q * b; // b1 - qb
        c = d;
        d = r;
        q = c / d;
        r = c % d;
    }
    return [a, b, d];
}

export function mod_inv(x, n) {
    const [a, b, g] = egcd(x, n)
    if (g != 1n)
        throw 'Inverse doesn\'t exist'
    return a
}

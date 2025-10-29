---
sidebar_position: 3
---

# Cryptographic Extensions

Master RISC-V Cryptographic Extensions that provide hardware-accelerated cryptographic operations, essential for secure communications, data encryption, and kernel security features on RISC-V systems.

## What Are Cryptographic Extensions?

**What**: RISC-V Cryptographic Extensions are ISA extensions that provide hardware acceleration for cryptographic operations including encryption, decryption, hashing, and secure random number generation. Multiple extension sets target different cryptographic algorithms and use cases.

**Why**: Understanding Cryptographic Extensions is crucial because:

- **Performance** - Hardware acceleration significantly faster than software
- **Security** - Dedicated hardware reduces attack surface
- **Efficiency** - Lower power consumption than software implementations
- **Standard Compliance** - Support for standard cryptographic algorithms
- **Kernel Security** - Kernel uses crypto for secure communications
- **Real-Time Performance** - Hardware meets real-time requirements

**When**: Cryptographic Extensions are used when:

- **TLS/SSL** - Secure network communications
- **Disk Encryption** - Full-disk encryption and filesystem encryption
- **Kernel Security** - Kernel cryptographic functions
- **Digital Signatures** - Certificate verification and signatures
- **Random Number Generation** - Secure random number generation
- **Performance-Critical Crypto** - High-throughput cryptographic operations

**How**: Cryptographic Extensions work through:

- **Dedicated Instructions** - Special instructions for crypto operations
- **State Machines** - Hardware state machines for complex algorithms
- **Accelerated Algorithms** - Hardware support for AES, SHA, RSA, etc.
- **Secure Random** - Hardware random number generators
- **Key Management** - Secure key storage and management

**Where**: Cryptographic Extensions are found in:

- **Secure Processors** - Security-focused RISC-V processors
- **Network Processors** - Routers, switches, network appliances
- **Storage Controllers** - Encrypted storage systems
- **IoT Devices** - Secure IoT applications
- **High-Performance Systems** - Servers requiring fast crypto
- **Kernel Crypto Framework** - Linux kernel cryptographic subsystem

## RISC-V Crypto Extension Sets

**What**: RISC-V defines multiple cryptographic extension sets targeting different algorithms.

**How**: Extension sets work:

```c
// Example: RISC-V Cryptographic Extension sets
// Scalar Crypto Extensions (Zk*):
// - Zknd: AES decryption (AES-128/192/256)
// - Zkne: AES encryption
// - Zknh: SHA-2 (SHA-256, SHA-512)
// - Zkr: Entropy source (random number generation)
// - Zksed: SM4 encryption/decryption
// - Zksh: SM3 hash function
// - Zkb: Bit manipulation for crypto
// - Zkt: Data independent timing

// Vector Crypto Extensions:
// - Vectorized versions of scalar crypto operations
// - Processes multiple blocks in parallel

// Example: Checking cryptographic extension support
bool has_aes_extension(void) {
    unsigned long misa;

    __asm__ volatile("csrr %0, misa" : "=r"(misa));

    // Check for scalar crypto extensions
    // Zknd/Zkne extensions indicated by specific bits
    // Implementation specific: check extension-specific CSR or feature flags

    return check_crypto_extension(misa, CRYPTO_AES);
}

bool has_sha_extension(void) {
    unsigned long misa;

    __asm__ volatile("csrr %0, misa" : "=r"(misa));

    return check_crypto_extension(misa, CRYPTO_SHA);
}

// Example: Cryptographic extension capabilities
struct crypto_capabilities {
    bool aes_128;
    bool aes_192;
    bool aes_256;
    bool sha_256;
    bool sha_512;
    bool rng_support;
};

struct crypto_capabilities get_crypto_capabilities(void) {
    struct crypto_capabilities caps = {0};

    // Check available extensions
    unsigned long misa;
    __asm__ volatile("csrr %0, misa" : "=r"(misa));

    // Check AES support (Zknd/Zkne)
    if (has_aes_extension()) {
        caps.aes_128 = true;
        caps.aes_192 = true;  // If supported
        caps.aes_256 = true;  // If supported
    }

    // Check SHA support (Zknh)
    if (has_sha_extension()) {
        caps.sha_256 = true;
        caps.sha_512 = true;  // If supported
    }

    // Check RNG support (Zkr)
    if (has_rng_extension()) {
        caps.rng_support = true;
    }

    return caps;
}
```

**Explanation**:

- **Multiple extensions** different extensions for different algorithms
- **Scalar crypto** scalar instructions for crypto operations
- **Vector crypto** vectorized crypto for parallel processing
- **Extension detection** check misa or extension-specific CSRs
- **Capabilities** query hardware capabilities at runtime

## AES Encryption/Decryption

**What**: AES (Advanced Encryption Standard) extensions provide hardware acceleration for AES encryption and decryption.

**How**: AES operations work:

```c
// Example: AES encryption using Zkne extension
// aes32esmi rd, rs1, rs2, bs  // AES Encrypt Single Round (MixColumns)
// aes32esi rd, rs1, rs2, bs   // AES Encrypt Single Round (Final Round)

// AES-128 encryption example
void aes128_encrypt_block(uint32_t *state, uint32_t *round_key) {
    // State is 4x 32-bit words = 128 bits (16 bytes)
    // round_key is round key

    // AES encryption: AddRoundKey, SubBytes, ShiftRows, MixColumns
    // Hardware implements these operations

    // AES-128 has 10 rounds + initial AddRoundKey

    // Initial AddRoundKey
    __asm__ volatile(
        "aes32esi %0, %1, %2, 0\n"   // Round 0
        "aes32esi %0, %1, %2, 1\n"   // Round 1
        "aes32esi %0, %1, %2, 2\n"   // Round 2
        "aes32esi %0, %1, %2, 3\n"   // Round 3
        : "=r"(*state)
        : "r"(*state), "r"(*round_key)
        : "memory"
    );

    // Rounds 1-9: SubBytes, ShiftRows, MixColumns, AddRoundKey
    for (int round = 1; round < 10; round++) {
        __asm__ volatile(
            "aes32esmi %0, %1, %2, 0\n"   // MixColumns
            "aes32esmi %0, %1, %2, 1\n"
            "aes32esmi %0, %1, %2, 2\n"
            "aes32esmi %0, %1, %2, 3\n"
            : "=r"(*state)
            : "r"(*state), "r"(round_key[round])
            : "memory"
        );
    }

    // Final round (no MixColumns)
    __asm__ volatile(
        "aes32esi %0, %1, %2, 0\n"
        "aes32esi %0, %1, %2, 1\n"
        "aes32esi %0, %1, %2, 2\n"
        "aes32esi %0, %1, %2, 3\n"
        : "=r"(*state)
        : "r"(*state), "r"(round_key[10])
        : "memory"
    );
}

// Example: AES decryption using Zknd extension
// aes32dsmi rd, rs1, rs2, bs  // AES Decrypt Single Round (MixColumns)
// aes32dsi rd, rs1, rs2, bs   // AES Decrypt Single Round (Final Round)

void aes128_decrypt_block(uint32_t *state, uint32_t *round_key) {
    // Similar to encryption but uses decrypt instructions
    // aes32dsmi for rounds with MixColumns
    // aes32dsi for final round

    // Initial round
    __asm__ volatile(
        "aes32dsi %0, %1, %2, 0\n"
        "aes32dsi %0, %1, %2, 1\n"
        "aes32dsi %0, %1, %2, 2\n"
        "aes32dsi %0, %1, %2, 3\n"
        : "=r"(*state)
        : "r"(*state), "r"(round_key[10])
        : "memory"
    );

    // Middle rounds
    for (int round = 9; round >= 1; round--) {
        __asm__ volatile(
            "aes32dsmi %0, %1, %2, 0\n"
            "aes32dsmi %0, %1, %2, 1\n"
            "aes32dsmi %0, %1, %2, 2\n"
            "aes32dsmi %0, %1, %2, 3\n"
            : "=r"(*state)
            : "r"(*state), "r"(round_key[round])
            : "memory"
        );
    }

    // Final round
    __asm__ volatile(
        "aes32dsi %0, %1, %2, 0\n"
        "aes32dsi %0, %1, %2, 1\n"
        "aes32dsi %0, %1, %2, 2\n"
        "aes32dsi %0, %1, %2, 3\n"
        : "=r"(*state)
        : "r"(*state), "r"(round_key[0])
        : "memory"
    );
}

// Example: AES key expansion
// aes32ks2 rd, rs1, rs2, bs  // AES Key Schedule Instruction
// aes32ks1 rd, rs1, rs2, bs  // AES Key Schedule Instruction

void aes128_key_expansion(uint32_t *round_keys, const uint8_t *key) {
    // Expand 128-bit key to 11 round keys (128 bits each)

    // First round key is the original key
    round_keys[0] = ((uint32_t)key[0] << 24) | ((uint32_t)key[1] << 16) |
                    ((uint32_t)key[2] << 8) | key[3];
    // ... load other words

    // Generate remaining round keys
    for (int i = 1; i < 11; i++) {
        // Key expansion using aes32ks1 and aes32ks2
        __asm__ volatile(
            "aes32ks1 %0, %1, %2, 0\n"
            "aes32ks2 %0, %0, %3, 0\n"
            : "=r"(round_keys[i*4])
            : "r"(round_keys[(i-1)*4]), "r"(round_keys[(i-1)*4+3]),
              "r"(round_keys[i*4])
            : "memory"
        );
    }
}
```

**Explanation**:

- **AES instructions** aes32esi/aes32esmi for encryption, aes32dsi/aes32dsmi for decryption
- **Round operations** hardware implements SubBytes, ShiftRows, MixColumns
- **Key expansion** aes32ks1/aes32ks2 for generating round keys
- **Block processing** process 128-bit blocks at a time
- **Performance** hardware implementation much faster than software

## SHA Hash Functions

**What**: SHA (Secure Hash Algorithm) extensions provide hardware acceleration for SHA-256 and SHA-512 hash functions.

**How**: SHA operations work:

```c
// Example: SHA-256 using Zknh extension
// sha256sig0 rd, rs1  // SHA-256 Sigma 0
// sha256sig1 rd, rs1  // SHA-256 Sigma 1
// sha256sum0 rd, rs1  // SHA-256 Sum 0
// sha256sum1 rd, rs1  // SHA-256 Sum 1

// SHA-256 hash computation
void sha256_transform(uint32_t *state, const uint32_t *data) {
    uint32_t w[64];
    uint32_t a, b, c, d, e, f, g, h;
    uint32_t s0, s1, maj, ch, temp1, temp2;

    // Load message schedule from data
    for (int i = 0; i < 16; i++) {
        w[i] = data[i];
    }

    // Extend message schedule (w[16..63])
    for (int i = 16; i < 64; i++) {
        // s0 = SHA256_SIG0(w[i-15])
        __asm__ volatile("sha256sig0 %0, %1" : "=r"(s0) : "r"(w[i-15]));

        // s1 = SHA256_SIG1(w[i-2])
        __asm__ volatile("sha256sig1 %0, %1" : "=r"(s1) : "r"(w[i-2]));

        w[i] = w[i-16] + s0 + w[i-7] + s1;
    }

    // Initialize working variables
    a = state[0]; b = state[1]; c = state[2]; d = state[3];
    e = state[4]; f = state[5]; g = state[6]; h = state[7];

    // Main loop
    for (int i = 0; i < 64; i++) {
        // Sum1 = SHA256_SUM1(e)
        __asm__ volatile("sha256sum1 %0, %1" : "=r"(s1) : "r"(e));

        // Ch = choose function: (e & f) ^ (~e & g)
        ch = (e & f) ^ (~e & g);

        temp1 = h + s1 + ch + k[i] + w[i];

        // Sum0 = SHA256_SUM0(a)
        __asm__ volatile("sha256sum0 %0, %1" : "=r"(s0) : "r"(a));

        // Maj = majority function: (a & b) ^ (a & c) ^ (b & c)
        maj = (a & b) ^ (a & c) ^ (b & c);

        temp2 = s0 + maj;

        h = g;
        g = f;
        f = e;
        e = d + temp1;
        d = c;
        c = b;
        b = a;
        a = temp1 + temp2;
    }

    // Add to state
    state[0] += a; state[1] += b; state[2] += c; state[3] += d;
    state[4] += e; state[5] += f; state[6] += g; state[7] += h;
}

// Example: SHA-512 using Zknh extension
// sha512sig0 rd, rs1  // SHA-512 Sigma 0 (lower 32 bits)
// sha512sig1 rd, rs1  // SHA-512 Sigma 1 (lower 32 bits)
// sha512sum0 rd, rs1  // SHA-512 Sum 0 (lower 32 bits)
// sha512sum1 rd, rs1  // SHA-512 Sum 1 (lower 32 bits)
// sha512sig0h rd, rs1, rs2  // SHA-512 Sigma 0 (high part)
// sha512sig1h rd, rs1, rs2  // SHA-512 Sigma 1 (high part)
// sha512sum0r rd, rs1, rs2  // SHA-512 Sum 0 (rotated)
// sha512sum1r rd, rs1, rs2  // SHA-512 Sum 1 (rotated)

void sha512_transform(uint64_t *state, const uint64_t *data) {
    // Similar structure to SHA-256 but uses 64-bit words
    // Uses SHA-512 specific instructions
    uint64_t w[80];
    uint64_t a, b, c, d, e, f, g, h;
    uint64_t s0, s1, maj, ch, temp1, temp2;

    // Load and extend message schedule
    for (int i = 0; i < 16; i++) {
        w[i] = data[i];
    }

    for (int i = 16; i < 80; i++) {
        // SHA-512 message schedule extension
        __asm__ volatile("sha512sig1 %0, %1" : "=r"(s1) : "r"(w[i-2]));
        __asm__ volatile("sha512sig0 %0, %1" : "=r"(s0) : "r"(w[i-15]));

        w[i] = w[i-16] + s0 + w[i-7] + s1;
    }

    // Initialize and process similar to SHA-256
    // ... (using 64-bit operations)
}
```

**Explanation**:

- **SHA instructions** dedicated instructions for SHA operations
- **Sigma functions** hardware implements sigma operations
- **Sum functions** hardware implements sum operations
- **Message schedule** hardware accelerates message schedule generation
- **Performance** significant speedup over software implementation

## Random Number Generation

**What**: RISC-V provides entropy source extension (Zkr) for secure random number generation.

**How**: Random number generation works:

```c
// Example: Entropy source CSR (seed CSR)
// seed CSR provides hardware random number generation
// Read-only CSR that returns random bits

// Example: Reading random value from entropy source
unsigned long get_hardware_random(void) {
    unsigned long random_value;

    // Read seed CSR (entropy source)
    // seed CSR is read-only, returns random bits each read
    __asm__ volatile("csrr %0, seed" : "=r"(random_value));

    return random_value;
}

// Example: Generating random bytes
void get_random_bytes(void *buf, size_t len) {
    unsigned long random;
    unsigned char *p = (unsigned char *)buf;

    for (size_t i = 0; i < len; i++) {
        if (i % sizeof(unsigned long) == 0) {
            // Read new random value every sizeof(unsigned long) bytes
            random = get_hardware_random();
        }

        // Extract byte from random value
        p[i] = (unsigned char)(random >> ((i % sizeof(unsigned long)) * 8));
    }
}

// Example: Kernel random number generator using entropy source
void arch_get_random_long(unsigned long *v) {
    // Use hardware entropy source
    *v = get_hardware_random();
}

void arch_get_random_seed(unsigned long *v) {
    // Use hardware entropy source for seeding
    *v = get_hardware_random();
}

// Example: Checking entropy source quality
bool entropy_source_available(void) {
    // Check if seed CSR is available and functioning
    // Some implementations may not have hardware RNG

    // Try to read seed CSR
    unsigned long value1, value2;

    __asm__ volatile("csrr %0, seed" : "=r"(value1));
    __asm__ volatile("csrr %0, seed" : "=r"(value2));

    // If values are different, entropy source is working
    // (though this is not a complete test)
    return value1 != value2;
}
```

**Explanation**:

- **seed CSR** read-only CSR providing hardware entropy
- **Random bits** each read returns new random bits
- **Entropy quality** hardware entropy source provides high-quality randomness
- **Kernel integration** kernel uses entropy source for /dev/random
- **Security** hardware RNG avoids software PRNG weaknesses

## Kernel Cryptographic Framework

**What**: Linux kernel cryptographic framework integrates hardware crypto accelerators.

**How**: Kernel crypto integration works:

```c
// Example: Kernel crypto algorithm registration
#include <linux/crypto.h>
#include <crypto/internal/hash.h>

// AES implementation using hardware acceleration
static int riscv_aes_encrypt(struct crypto_tfm *tfm, u8 *dst, const u8 *src) {
    struct crypto_aes_ctx *ctx = crypto_tfm_ctx(tfm);
    uint32_t state[4];
    uint32_t round_keys[44];  // AES-256 needs 15 rounds (60 words)

    // Load state
    memcpy(state, src, 16);

    // Expand key if needed
    aes_key_expand(ctx->key_enc, round_keys, ctx->key_length);

    // Encrypt using hardware
    aes128_encrypt_block(state, round_keys);

    // Store result
    memcpy(dst, state, 16);

    return 0;
}

static int riscv_aes_decrypt(struct crypto_tfm *tfm, u8 *dst, const u8 *src) {
    // Similar to encrypt but uses decrypt instructions
    struct crypto_aes_ctx *ctx = crypto_tfm_ctx(tfm);
    uint32_t state[4];
    uint32_t round_keys[44];

    memcpy(state, src, 16);
    aes_key_expand(ctx->key_dec, round_keys, ctx->key_length);
    aes128_decrypt_block(state, round_keys);
    memcpy(dst, state, 16);

    return 0;
}

// Register AES algorithm
static struct crypto_alg riscv_aes_alg = {
    .cra_name = "aes",
    .cra_driver_name = "aes-riscv",
    .cra_priority = 300,  // Higher priority than software
    .cra_flags = CRYPTO_ALG_TYPE_CIPHER,
    .cra_blocksize = AES_BLOCK_SIZE,
    .cra_ctxsize = sizeof(struct crypto_aes_ctx),
    .cra_module = THIS_MODULE,
    .cra_u = {
        .cipher = {
            .cia_min_keysize = AES_MIN_KEY_SIZE,
            .cia_max_keysize = AES_MAX_KEY_SIZE,
            .cia_setkey = crypto_aes_set_key,
            .cia_encrypt = riscv_aes_encrypt,
            .cia_decrypt = riscv_aes_decrypt,
        }
    }
};

// Example: SHA-256 implementation
static int riscv_sha256_init(struct shash_desc *desc) {
    struct sha256_state *sctx = shash_desc_ctx(desc);

    sctx->state[0] = SHA256_H0;
    sctx->state[1] = SHA256_H1;
    sctx->state[2] = SHA256_H2;
    sctx->state[3] = SHA256_H3;
    sctx->state[4] = SHA256_H4;
    sctx->state[5] = SHA256_H5;
    sctx->state[6] = SHA256_H6;
    sctx->state[7] = SHA256_H7;
    sctx->count = 0;

    return 0;
}

static int riscv_sha256_update(struct shash_desc *desc, const u8 *data,
                               unsigned int len) {
    struct sha256_state *sctx = shash_desc_ctx(desc);
    unsigned int partial = sctx->count % SHA256_BLOCK_SIZE;

    sctx->count += len;

    if (partial + len >= SHA256_BLOCK_SIZE) {
        int blocks = (len - (SHA256_BLOCK_SIZE - partial)) / SHA256_BLOCK_SIZE;
        int rem = (len - (SHA256_BLOCK_SIZE - partial)) % SHA256_BLOCK_SIZE;

        if (partial) {
            // Complete partial block
            memcpy(sctx->buf + partial, data, SHA256_BLOCK_SIZE - partial);
            sha256_transform(sctx->state, (uint32_t *)sctx->buf);
            data += SHA256_BLOCK_SIZE - partial;
        }

        // Process full blocks
        for (int i = 0; i < blocks; i++) {
            sha256_transform(sctx->state, (const uint32_t *)data);
            data += SHA256_BLOCK_SIZE;
        }

        // Save remaining data
        if (rem) {
            memcpy(sctx->buf, data, rem);
        }
    } else {
        memcpy(sctx->buf + partial, data, len);
    }

    return 0;
}

static int riscv_sha256_final(struct shash_desc *desc, u8 *out) {
    struct sha256_state *sctx = shash_desc_ctx(desc);
    __be32 *dst = (__be32 *)out;
    __be32 bits[2];
    unsigned int index, pad_len;
    u64 bit_count;

    // Save number of bits
    bit_count = sctx->count << 3;
    bits[1] = cpu_to_be32(bit_count);
    bits[0] = cpu_to_be32(bit_count >> 32);

    // Pad message
    index = sctx->count % SHA256_BLOCK_SIZE;
    pad_len = (index < 56) ? (56 - index) : ((64 + 56) - index);

    riscv_sha256_update(desc, sha256_padding, pad_len);
    riscv_sha256_update(desc, (const u8 *)bits, 8);

    // Output hash
    for (int i = 0; i < SHA256_DIGEST_SIZE / sizeof(__be32); i++) {
        dst[i] = cpu_to_be32(sctx->state[i]);
    }

    return 0;
}

// Register SHA-256 algorithm
static struct shash_alg riscv_sha256_alg = {
    .digestsize = SHA256_DIGEST_SIZE,
    .init = riscv_sha256_init,
    .update = riscv_sha256_update,
    .final = riscv_sha256_final,
    .descsize = sizeof(struct sha256_state),
    .base = {
        .cra_name = "sha256",
        .cra_driver_name = "sha256-riscv",
        .cra_priority = 300,
        .cra_blocksize = SHA256_BLOCK_SIZE,
        .cra_module = THIS_MODULE,
    }
};

// Module initialization
static int __init riscv_crypto_init(void) {
    if (!has_aes_extension() && !has_sha_extension()) {
        return -ENODEV;  // No crypto extensions available
    }

    if (has_aes_extension()) {
        crypto_register_alg(&riscv_aes_alg);
    }

    if (has_sha_extension()) {
        crypto_register_shash(&riscv_sha256_alg);
    }

    return 0;
}

static void __exit riscv_crypto_exit(void) {
    if (has_aes_extension()) {
        crypto_unregister_alg(&riscv_aes_alg);
    }

    if (has_sha_extension()) {
        crypto_unregister_shash(&riscv_sha256_alg);
    }
}
```

**Explanation**:

- **Crypto framework** kernel provides crypto API for algorithms
- **Algorithm registration** register hardware-accelerated algorithms
- **Priority** hardware algorithms have higher priority than software
- **Algorithm structure** define encrypt/decrypt or hash operations
- **Module loading** crypto module loads when extension detected

## Next Steps

**What** you're ready for next:

After mastering Cryptographic Extensions, you should be ready to:

1. **Learn Custom Extensions** - Platform-specific extensions
2. **Study Kernel Architecture** - RISC-V Linux kernel architecture
3. **Understand Security** - Security features and mechanisms
4. **Explore Performance** - Crypto performance optimization
5. **Begin Security Development** - Apply crypto knowledge

**Where** to go next:

Continue with the next lesson on **"Custom Extensions"** to learn:

- Platform-specific extension design
- Custom instruction encoding
- Extension implementation
- Kernel support for custom extensions
- Application-specific extensions

**Why** the next lesson is important:

Custom extensions allow platforms to add specialized instructions for domain-specific acceleration, important for embedded systems and specialized applications.

**How** to continue learning:

1. **Study Spec** - Read RISC-V Cryptographic Extension specification
2. **Use Hardware** - Test crypto on RISC-V hardware
3. **Study Kernel Code** - Examine kernel crypto implementation
4. **Benchmark** - Measure crypto performance
5. **Write Drivers** - Implement crypto accelerator drivers

## Resources

**Official Documentation**:

- [RISC-V Cryptographic Extension Specification](https://github.com/riscv/riscv-crypto) - Complete crypto spec
- [RISC-V Foundation](https://riscv.org/technical/specifications/) - All RISC-V specifications

**Kernel Sources**:

- [Linux Kernel Crypto](https://github.com/torvalds/linux/tree/master/crypto) - Kernel crypto framework

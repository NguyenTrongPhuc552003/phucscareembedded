---
sidebar_position: 3
---

# Secure Boot

Master secure boot implementation in the Linux kernel, understanding boot chain verification, trusted execution, and cryptographic authentication on ARM64 platforms including Rock 5B+.

## What is Secure Boot?

**What**: Secure boot is a security mechanism that ensures only trusted, cryptographically signed software can execute during the boot process, creating a chain of trust from firmware to operating system.

**Why**: Understanding secure boot is crucial because:

- **Boot Security**: Prevents malware from loading during boot
- **Chain of Trust**: Establishes trusted execution environment
- **Attack Prevention**: Blocks rootkits and bootkits
- **Integrity Verification**: Ensures software hasn't been tampered with
- **Compliance**: Required for many security certifications
- **Embedded Security**: Critical for secure embedded deployments

**When**: Secure boot is relevant when:

- **System Initialization**: During boot process
- **Firmware Updates**: When updating system firmware
- **Kernel Loading**: When loading kernel and modules
- **Production Deployment**: In production systems
- **Compliance Requirements**: Meeting security standards
- **High-Security Systems**: Government and financial systems

**How**: Secure boot works through:

```c
// Example: Secure boot verification in kernel
// Boot image signature verification
struct boot_params {
    struct setup_header hdr;
    __u8  _pad2[4];
    __u64 tboot_addr;
    __u64 secure_boot;
    // ... more fields
};

// Verify kernel signature
static int verify_kernel_signature(const void *kernel_data, size_t kernel_size,
                                   const void *signature, size_t sig_size)
{
    struct public_key *pkey;
    struct public_key_signature sig;
    int ret;

    // Load public key from keyring
    pkey = request_asymmetric_key(NULL, "kernel_signing_key");
    if (IS_ERR(pkey))
        return PTR_ERR(pkey);

    // Set up signature structure
    sig.pkey_algo = "rsa";
    sig.hash_algo = "sha256";
    sig.digest = kmalloc(SHA256_DIGEST_SIZE, GFP_KERNEL);
    sig.digest_size = SHA256_DIGEST_SIZE;
    sig.s = signature;
    sig.s_size = sig_size;

    // Calculate kernel hash
    ret = crypto_shash_digest(desc, kernel_data, kernel_size, sig.digest);
    if (ret < 0)
        goto error;

    // Verify signature
    ret = verify_signature(pkey, &sig);

error:
    kfree(sig.digest);
    key_put(pkey);
    return ret;
}

// UEFI secure boot status
static bool get_secure_boot_status(void)
{
    efi_guid_t var_guid = EFI_GLOBAL_VARIABLE_GUID;
    unsigned long size = sizeof(u8);
    u8 secure_boot;
    efi_status_t status;

    status = efi.get_variable(L"SecureBoot", &var_guid, NULL, &size,
                              &secure_boot);
    if (status != EFI_SUCCESS)
        return false;

    return secure_boot != 0;
}
```

**Where**: Secure boot is used in:

- **UEFI Systems**: x86_64 and ARM64 UEFI platforms
- **ARM TrustZone**: ARM secure world implementation
- **Embedded Devices**: IoT and industrial systems
- **Mobile Devices**: Smartphones and tablets
- **Rock 5B+**: ARM64 secure boot implementation

## Chain of Trust

**What**: Chain of trust is the sequential verification of each component in the boot process, from firmware to operating system, ensuring each stage is trusted before executing the next.

**Why**: Understanding chain of trust is important because:

- **Security Foundation**: Basis of secure boot security
- **Attack Prevention**: Prevents boot-time attacks
- **Integrity Assurance**: Ensures system integrity
- **Trust Establishment**: Establishes trusted environment
- **Compliance**: Required for security standards

**How**: Chain of trust operates through:

```c
// Example: Boot chain verification
// Boot stage verification
enum boot_stage {
    BOOT_STAGE_FIRMWARE,
    BOOT_STAGE_BOOTLOADER,
    BOOT_STAGE_KERNEL,
    BOOT_STAGE_INITRD,
    BOOT_STAGE_ROOTFS,
};

struct trust_chain {
    enum boot_stage stage;
    const char *name;
    const void *image;
    size_t image_size;
    const void *signature;
    size_t sig_size;
    struct public_key *pkey;
    bool verified;
};

// Verify boot chain
static int verify_boot_chain(struct trust_chain *chain, int num_stages)
{
    int i, ret;

    for (i = 0; i < num_stages; i++) {
        pr_info("Verifying %s...\n", chain[i].name);

        // Verify signature
        ret = verify_signature_chain(&chain[i]);
        if (ret < 0) {
            pr_err("Failed to verify %s: %d\n", chain[i].name, ret);
            return ret;
        }

        chain[i].verified = true;
        pr_info("%s verified successfully\n", chain[i].name);
    }

    return 0;
}

// ARM TrustZone boot verification
static int trustzone_verify_next_stage(const void *image, size_t size)
{
    struct arm_smccc_res res;

    // Call secure monitor to verify next boot stage
    arm_smccc_smc(ARM_SMCCC_CALL_VAL(ARM_SMCCC_FAST_CALL,
                                      ARM_SMCCC_SMC_64,
                                      ARM_SMCCC_OWNER_SIP,
                                      TRUSTZONE_VERIFY_IMAGE),
                  (unsigned long)image, size, 0, 0, 0, 0, 0, &res);

    return res.a0;
}

// Device tree secure boot configuration
/ {
    firmware {
        secure-boot {
            compatible = "arm,secure-boot";
            status = "okay";

            trusted-keys = <&signing_key>;
            hash-algorithm = "sha256";
            signature-algorithm = "rsa2048";

            boot-stages {
                bootloader {
                    verify = <1>;
                    mandatory = <1>;
                };

                kernel {
                    verify = <1>;
                    mandatory = <1>;
                };

                modules {
                    verify = <1>;
                    mandatory = <0>;
                };
            };
        };
    };
};
```

**Explanation**:

- **Stage Verification**: Each boot stage verified before execution
- **Public Key Infrastructure**: Uses PKI for verification
- **Cryptographic Signatures**: Digital signatures for authenticity
- **Secure Storage**: Keys stored in secure hardware
- **Trust Hierarchy**: Root of trust in hardware

**Where**: Chain of trust is fundamental in:

- **Secure Boot Process**: All secure boot implementations
- **UEFI Systems**: UEFI secure boot
- **ARM TrustZone**: ARM secure boot
- **TPM Systems**: Trusted Platform Module integration
- **Embedded Systems**: Secure embedded boot

## Kernel Module Signing

**What**: Kernel module signing ensures that only signed kernel modules can be loaded into a running kernel, extending secure boot protection to runtime.

**Why**: Understanding module signing is important because:

- **Runtime Protection**: Protects kernel after boot
- **Module Verification**: Ensures module authenticity
- **Attack Prevention**: Prevents malicious module loading
- **Integrity Assurance**: Verifies module integrity
- **Security Extension**: Extends secure boot to runtime

**How**: Module signing works through:

```c
// Example: Kernel module signature verification
// Module signature structure
struct module_signature {
    __u8 algo;              // Hash algorithm
    __u8 hash;              // Hash type
    __u8 id_type;           // Key identifier type
    __u8 signer_len;        // Signer length
    __u8 key_id_len;        // Key ID length
    __u8 __pad[3];
    __be32 sig_len;         // Signature length
};

// Verify module signature
static int mod_verify_sig(const void *mod, unsigned long *_modlen)
{
    struct module_signature ms;
    size_t modlen = *_modlen, sig_len;
    int ret;

    // Check for module signature marker
    if (modlen <= sizeof(ms))
        return -EBADMSG;

    memcpy(&ms, mod + (modlen - sizeof(ms)), sizeof(ms));
    modlen -= sizeof(ms);

    sig_len = be32_to_cpu(ms.sig_len);
    if (sig_len >= modlen)
        return -EBADMSG;
    modlen -= sig_len;

    // Verify the signature
    ret = verify_pkcs7_signature(mod, modlen,
                                 mod + modlen, sig_len,
                                 VERIFY_USE_SECONDARY_KEYRING |
                                 VERIFY_USE_PLATFORM_KEYRING,
                                 VERIFYING_MODULE_SIGNATURE,
                                 NULL, NULL);
    if (ret < 0)
        return ret;

    *_modlen = modlen;
    return 0;
}

// Load signed module
static int load_module(struct load_info *info, const char __user *uargs,
                      int flags)
{
    struct module *mod;
    long err;

    // Verify module signature
    err = mod_verify_sig(info->hdr, &info->len);
    if (err) {
        pr_err("Module verification failed: %ld\n", err);
        return err;
    }

    // Load the module
    mod = layout_and_allocate(info, flags);
    if (IS_ERR(mod))
        return PTR_ERR(mod);

    return do_init_module(mod);
}

// Module signing configuration
CONFIG_MODULE_SIG=y
CONFIG_MODULE_SIG_FORCE=y
CONFIG_MODULE_SIG_ALL=y
CONFIG_MODULE_SIG_SHA256=y
CONFIG_MODULE_SIG_HASH="sha256"
CONFIG_MODULE_SIG_KEY="certs/signing_key.pem"
```

**Explanation**:

- **Signature Verification**: Cryptographic signature checking
- **Key Management**: Public key infrastructure
- **Signature Format**: PKCS#7 signature format
- **Enforcement**: Mandatory or optional verification
- **Build Integration**: Automatic signing during build

**Where**: Module signing is used in:

- **Production Systems**: Secure production deployments
- **High-Security Systems**: Government and financial systems
- **Embedded Devices**: Secure embedded systems
- **Mobile Devices**: Smartphone security
- **Rock 5B+**: ARM64 module signing

## ARM64 Secure Boot

**What**: ARM64 secure boot leverages ARM TrustZone and UEFI secure boot to implement platform-specific secure boot mechanisms.

**Why**: Understanding ARM64 secure boot is important because:

- **Platform Specifics**: ARM64 specific implementation
- **TrustZone Integration**: Secure world utilization
- **Performance**: ARM64 performance characteristics
- **Embedded Systems**: Critical for embedded ARM64
- **Rock 5B+ Development**: Platform-specific security

**How**: ARM64 secure boot involves:

```c
// Example: ARM64 secure boot implementation
// ARM TrustZone secure boot
#define ARM_SMCCC_SECURE_BOOT_VERIFY    0xC2000001
#define ARM_SMCCC_SECURE_BOOT_ENABLE    0xC2000002
#define ARM_SMCCC_SECURE_BOOT_DISABLE   0xC2000003

// Verify boot image using TrustZone
static int arm64_verify_boot_image(const void *image, size_t size,
                                   const void *sig, size_t sig_size)
{
    struct arm_smccc_res res;

    // Call secure monitor to verify image
    arm_smccc_smc(ARM_SMCCC_SECURE_BOOT_VERIFY,
                  (unsigned long)image, size,
                  (unsigned long)sig, sig_size,
                  0, 0, 0, &res);

    if (res.a0 != 0) {
        pr_err("Boot image verification failed: 0x%lx\n", res.a0);
        return -EINVAL;
    }

    return 0;
}

// Rock 5B+ device tree secure boot
/ {
    compatible = "radxa,rock-5b-plus";

    firmware {
        rockchip-secure-boot {
            compatible = "rockchip,rk3588-secure-boot";
            status = "okay";

            secure-monitor = <&bl31>;

            boot-verify {
                bootloader = <1>;
                kernel = <1>;
                modules = <1>;
                devicetree = <1>;
            };

            keys {
                root-of-trust = <&rot_key>;
                signing-key = <&sign_key>;
            };
        };
    };

    reserved-memory {
        #address-cells = <2>;
        #size-cells = <2>;
        ranges;

        secure_memory: secure@10000000 {
            reg = <0x0 0x10000000 0x0 0x00100000>;
            no-map;
        };
    };
};

// ARM64 secure boot configuration
CONFIG_ARM64=y
CONFIG_ARM64_CRYPTO=y
CONFIG_CRYPTO_SHA256_ARM64=y
CONFIG_CRYPTO_AES_ARM64=y
CONFIG_EFI=y
CONFIG_EFI_SECURE_BOOT=y
CONFIG_MODULE_SIG=y
CONFIG_MODULE_SIG_FORCE=y
CONFIG_MODULE_SIG_SHA256=y
CONFIG_KEXEC_VERIFY_SIG=y
CONFIG_KEXEC_BZIMAGE_VERIFY_SIG=y

// UEFI secure boot on ARM64
static int efi_get_secureboot_mode(void)
{
    efi_guid_t var_guid = EFI_GLOBAL_VARIABLE_GUID;
    unsigned long size;
    u8 secboot, setupmode;
    efi_status_t status;

    size = sizeof(secboot);
    status = efi.get_variable(L"SecureBoot", &var_guid,
                              NULL, &size, &secboot);
    if (status != EFI_SUCCESS)
        return -ENODEV;

    size = sizeof(setupmode);
    status = efi.get_variable(L"SetupMode", &var_guid,
                              NULL, &size, &setupmode);
    if (status != EFI_SUCCESS)
        return -ENODEV;

    if (secboot == 1 && setupmode == 0)
        return EFI_SECURE_BOOT_MODE_ENABLED;
    else
        return EFI_SECURE_BOOT_MODE_DISABLED;
}
```

**Explanation**:

- **TrustZone Integration**: Using ARM secure world
- **UEFI Secure Boot**: Standard UEFI secure boot
- **Device Tree**: Platform-specific configuration
- **Secure Memory**: Reserved secure memory regions
- **Cryptographic Acceleration**: ARM64 crypto extensions

**Where**: ARM64 secure boot is used in:

- **ARM64 Servers**: Enterprise ARM64 servers
- **Embedded Devices**: ARM64 embedded systems
- **Mobile Devices**: ARM64 smartphones
- **Single-Board Computers**: Rock 5B+ and similar
- **Edge Computing**: ARM64 edge devices

## Key Management

**What**: Key management in secure boot involves generation, storage, and protection of cryptographic keys used for boot verification.

**Why**: Understanding key management is crucial because:

- **Security Foundation**: Keys are the foundation of trust
- **Key Protection**: Protecting private keys
- **Key Distribution**: Managing public keys
- **Key Rotation**: Updating keys securely
- **Compliance**: Meeting security standards

**How**: Key management works through:

```c
// Example: Secure boot key management
// Platform keyring
static struct key *platform_keyring;
static struct key *secondary_keyring;

// Initialize platform keyring
static int __init platform_keyring_init(void)
{
    int rc;

    platform_keyring = keyring_alloc(".platform",
                                     KUIDT_INIT(0), KGIDT_INIT(0),
                                     current_cred(),
                                     (KEY_POS_ALL & ~KEY_POS_SETATTR) |
                                     KEY_USR_VIEW | KEY_USR_READ |
                                     KEY_USR_SEARCH,
                                     KEY_ALLOC_NOT_IN_QUOTA |
                                     KEY_ALLOC_SET_KEEP,
                                     NULL, NULL);
    if (IS_ERR(platform_keyring))
        return PTR_ERR(platform_keyring);

    return 0;
}

// Load keys from UEFI
static int load_uefi_keys(void)
{
    efi_guid_t secure_var = EFI_IMAGE_SECURITY_DATABASE_GUID;
    unsigned long size = 0;
    void *data;
    int rc;

    // Get key database size
    efi.get_variable(L"db", &secure_var, NULL, &size, NULL);
    if (!size)
        return 0;

    // Allocate buffer
    data = kmalloc(size, GFP_KERNEL);
    if (!data)
        return -ENOMEM;

    // Get key database
    rc = efi.get_variable(L"db", &secure_var, NULL, &size, data);
    if (rc != EFI_SUCCESS) {
        kfree(data);
        return -ENODEV;
    }

    // Load keys into keyring
    rc = parse_efi_signature_list(data, size, platform_keyring);
    kfree(data);

    return rc;
}

// Hardware security module integration
static int hsm_store_key(const char *key_name, const void *key_data,
                        size_t key_size)
{
    struct arm_smccc_res res;

    arm_smccc_smc(ARM_SMCCC_HSM_STORE_KEY,
                  (unsigned long)key_name,
                  (unsigned long)key_data, key_size,
                  0, 0, 0, 0, &res);

    return res.a0;
}
```

**Explanation**:

- **Keyring Management**: Kernel keyring for public keys
- **UEFI Key Storage**: Keys stored in UEFI variables
- **Hardware Security**: HSM for private key protection
- **Key Hierarchy**: Root of trust and derived keys
- **Secure Storage**: Protected key storage

**Where**: Key management is essential in:

- **Secure Boot**: All secure boot implementations
- **Key Storage**: UEFI, TPM, HSM integration
- **Mobile Devices**: Secure key storage
- **Embedded Systems**: Secure key management
- **Rock 5B+**: ARM TrustZone key storage

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Secure Boot Understanding**: You understand secure boot architecture
2. **Chain of Trust**: You know how boot verification works
3. **Module Signing**: You understand kernel module signing
4. **ARM64 Implementation**: You know ARM64 specific secure boot
5. **Key Management**: You understand key management
6. **Production Readiness**: You can implement secure boot

**Why** these concepts matter:

- **Boot Security**: Protects system from boot
- **Attack Prevention**: Blocks boot-time attacks
- **Integrity Assurance**: Ensures system integrity
- **Compliance**: Required for certifications
- **Professional Skills**: Industry-standard security

**When** to use these concepts:

- **System Deployment**: Deploying secure systems
- **Firmware Updates**: Updating system firmware
- **Security Hardening**: Implementing security measures
- **Compliance**: Meeting security requirements
- **Production Systems**: Secure production deployment

**Where** these skills apply:

- **System Administration**: Managing secure boot
- **Embedded Security**: Implementing secure boot
- **Firmware Development**: Developing secure firmware
- **Security Engineering**: Designing secure systems
- **Professional Development**: Working in security

## Next Steps

**What** you're ready for next:

After mastering secure boot, you should be ready to:

1. **Learn Stack Protection**: Understand memory protection
2. **Study ASLR/KASLR**: Learn address randomization
3. **Explore SMEP/SMAP**: Understand CPU security features
4. **Master Hardening**: Learn kernel hardening techniques
5. **Implement Security**: Apply security in projects

**Where** to go next:

Continue with the next lesson on **"Stack Protection"** to learn:

- Stack canaries and protection
- Buffer overflow prevention
- Memory corruption detection
- ARM64 specific protections

**Why** the next lesson is important:

The next lesson builds on your secure boot knowledge by covering runtime memory protection, completing the security picture from boot to runtime execution.

**How** to continue learning:

1. **Study Secure Boot**: Analyze secure boot implementations
2. **Experiment with Rock 5B+**: Configure secure boot
3. **Read Documentation**: Study secure boot specifications
4. **Join Communities**: Engage with security developers
5. **Build Projects**: Implement secure boot in projects

## Resources

**Official Documentation**:

- [UEFI Secure Boot](https://uefi.org/specifications) - UEFI specifications
- [ARM Trusted Firmware](https://www.trustedfirmware.org/) - ARM secure boot
- [Kernel Module Signing](https://www.kernel.org/doc/html/latest/admin-guide/module-signing.html) - Module signing guide

**Community Resources**:

- [UEFI Forum](https://uefi.org/) - UEFI community
- [Trusted Firmware Project](https://www.trustedfirmware.org/) - TF-A community
- [Linux Security List](https://lore.kernel.org/linux-security-module/) - Security discussions

**Learning Resources**:

- [UEFI Programming](https://www.rodsbooks.com/efi-programming/) - UEFI development
- [ARM TrustZone Guide](https://developer.arm.com/documentation/100690/latest/) - TrustZone documentation
- [Secure Boot Best Practices](https://wiki.ubuntu.com/UEFI/SecureBoot) - Ubuntu guide

**Rock 5B+ Specific**:

- [Rock 5B+ Secure Boot](https://wiki.radxa.com/Rock5/secure-boot) - Board secure boot
- [RK3588 Security](https://www.rock-chips.com/a/en/products/RK3588/) - SoC security features
- [ARM64 Secure Boot](https://developer.arm.com/documentation/) - ARM64 security

Happy learning! 🐧

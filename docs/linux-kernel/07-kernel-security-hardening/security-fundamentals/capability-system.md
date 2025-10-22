---
sidebar_position: 3
---

# Linux Capability System

Master the Linux capability system and understand how to implement fine-grained privilege management for secure application development on the Rock 5B+ platform.

## What is the Linux Capability System?

**What**: The Linux capability system divides the traditional all-powerful root privileges into distinct units that can be independently enabled or disabled.

**Why**: Understanding capabilities is crucial because:

- **Least privilege** - Processes get only necessary privileges
- **Security** - Reduces impact of compromised processes
- **Container security** - Foundation for container isolation
- **Privilege separation** - Modern security architecture
- **Rock 5B+ development** - Secure embedded applications
- **Professional development** - Industry standard practice

**When**: Capabilities are used when:

- **Service deployment** - Running daemons with minimal privileges
- **Container execution** - Docker, LXC, Kubernetes
- **Network services** - Binding to privileged ports
- **File operations** - Bypassing permission checks
- **System administration** - Performing specific admin tasks
- **Development** - Testing privilege separation

**How**: Capabilities work through:

```c
// Example: Capability implementation
// Capability sets in task credentials
struct cred {
    kernel_cap_t cap_inheritable;  // Inheritable across exec()
    kernel_cap_t cap_permitted;    // Maximum capabilities
    kernel_cap_t cap_effective;    // Currently active
    kernel_cap_t cap_bset;         // Bounding set
    kernel_cap_t cap_ambient;      // Ambient capabilities
};

// Capability check
bool capable(int cap)
{
    return ns_capable(&init_user_ns, cap);
}

bool ns_capable(struct user_namespace *ns, int cap)
{
    if (security_capable(current_cred(), ns, cap, CAP_OPT_NONE) == 0) {
        current->flags |= PF_SUPERPRIV;
        return true;
    }
    return false;
}

// Check specific capability
static inline bool has_capability(int cap)
{
    return cap_raised(current_cred()->cap_effective, cap);
}

// Capability operations
#define CAP_TO_INDEX(x)     ((x) >> 5)
#define CAP_TO_MASK(x)      (1 << ((x) & 31))

#define cap_raise(c, flag)  ((c).cap[CAP_TO_INDEX(flag)] |= CAP_TO_MASK(flag))
#define cap_lower(c, flag)  ((c).cap[CAP_TO_INDEX(flag)] &= ~CAP_TO_MASK(flag))
#define cap_raised(c, flag) ((c).cap[CAP_TO_INDEX(flag)] & CAP_TO_MASK(flag))
```

**Where**: Capabilities are found in:

- **All modern Linux** - Kernel 2.2 and later
- **Container runtimes** - Docker, containerd, LXC
- **System daemons** - systemd, nginx, apache
- **Security tools** - AppArmor, SELinux integration
- **Embedded systems** - IoT devices
- **Rock 5B+** - ARM64 privilege management

## Capability Types

**What**: Linux defines 41+ capabilities, each controlling specific privileged operations.

**Why**: Understanding capability types is important because:

- **Granular control** - Specific privilege assignment
- **Security analysis** - Understand required privileges
- **Minimal sets** - Grant only necessary capabilities
- **Audit trails** - Track capability usage
- **Compliance** - Meet security requirements

**How**: Capability types are organized as:

```c
// Example: Common capabilities
// File system capabilities
#define CAP_CHOWN            0  // Change file ownership
#define CAP_DAC_OVERRIDE     1  // Bypass file read/write/execute checks
#define CAP_DAC_READ_SEARCH  2  // Bypass file read and directory search
#define CAP_FOWNER           3  // Bypass permission checks for file owner
#define CAP_FSETID           4  // Don't clear setuid/setgid bits

// Process capabilities
#define CAP_KILL             5  // Send signals to any process
#define CAP_SETGID           6  // Set process GID
#define CAP_SETUID           7  // Set process UID
#define CAP_SETPCAP          8  // Transfer capabilities

// Network capabilities
#define CAP_NET_BIND_SERVICE 10 // Bind to privileged ports (<1024)
#define CAP_NET_BROADCAST    11 // Network broadcast and multicast
#define CAP_NET_ADMIN        12 // Network administration
#define CAP_NET_RAW          13 // Use RAW and PACKET sockets

// System capabilities
#define CAP_SYS_CHROOT       18 // Use chroot()
#define CAP_SYS_PTRACE       19 // Trace any process
#define CAP_SYS_ADMIN        21 // Various system administration
#define CAP_SYS_BOOT         22 // Reboot system
#define CAP_SYS_TIME         25 // Set system clock
#define CAP_SYS_MODULE       16 // Load kernel modules

// Examples of capability usage
int bind_privileged_port(int sock, int port)
{
    struct sockaddr_in addr;

    // Check if process has CAP_NET_BIND_SERVICE
    if (!capable(CAP_NET_BIND_SERVICE) && port < 1024)
        return -EACCES;

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;

    return bind(sock, (struct sockaddr *)&addr, sizeof(addr));
}

int load_kernel_module(const char *name)
{
    if (!capable(CAP_SYS_MODULE))
        return -EPERM;

    return request_module("%s", name);
}

int modify_system_time(const struct timespec *ts)
{
    if (!capable(CAP_SYS_TIME))
        return -EPERM;

    return do_settimeofday(ts);
}
```

**Explanation**:

- **CAP_CHOWN** - Required to change file ownership
- **CAP_NET_BIND_SERVICE** - Bind to ports < 1024
- **CAP_SYS_ADMIN** - Catch-all for admin operations
- **CAP_SYS_MODULE** - Load/unload kernel modules
- **CAP_DAC_OVERRIDE** - Bypass DAC permissions

**Where**: Different capabilities are used in:

- **Web servers** - CAP_NET_BIND_SERVICE for port 80/443
- **Network tools** - CAP_NET_RAW for ping, tcpdump
- **Container runtimes** - Various capabilities for isolation
- **System daemons** - CAP_SYS_ADMIN for systemd
- **Rock 5B+** - Application-specific capabilities

## Capability Inheritance

**What**: Capability inheritance rules determine how capabilities are preserved or modified across exec() system calls.

**Why**: Understanding inheritance is important because:

- **Security model** - Proper privilege transitions
- **SUID replacement** - Safer than setuid binaries
- **Container security** - Capability preservation in containers
- **Debugging** - Understanding why processes have capabilities
- **Secure design** - Implementing least privilege

**How**: Capability inheritance works through:

```c
// Example: Capability inheritance rules
// Capability transformation across exec()
static inline kernel_cap_t cap_combine(const kernel_cap_t a,
                                       const kernel_cap_t b)
{
    kernel_cap_t dest;
    CAP_FOR_EACH_U32(i) {
        dest.cap[i] = a.cap[i] | b.cap[i];
    }
    return dest;
}

static inline kernel_cap_t cap_intersect(const kernel_cap_t a,
                                         const kernel_cap_t b)
{
    kernel_cap_t dest;
    CAP_FOR_EACH_U32(i) {
        dest.cap[i] = a.cap[i] & b.cap[i];
    }
    return dest;
}

// Capability transformation on exec
int cap_bprm_set_creds(struct linux_binprm *bprm)
{
    const struct cred *old = current_cred();
    struct cred *new = bprm->cred;
    bool effective, has_cap = false;
    int ret;

    // Get file capabilities
    ret = get_file_caps(bprm, &effective);
    if (ret < 0)
        return ret;

    // P'(permitted) = (P(inheritable) & F(inheritable)) |
    //                 (F(permitted) & cap_bset)
    new->cap_permitted = cap_combine(
        cap_intersect(old->cap_inheritable, new->cap_inheritable),
        cap_intersect(new->cap_permitted, new->cap_bset)
    );

    // P'(effective) = F(effective) ? P'(permitted) : P'(ambient)
    if (effective)
        new->cap_effective = new->cap_permitted;
    else
        new->cap_effective = new->cap_ambient;

    // P'(inheritable) = P(inheritable)
    new->cap_inheritable = old->cap_inheritable;

    // P'(ambient) = (file has no caps or UID changed) ? 0 : P(ambient)
    if (!has_cap || !uid_eq(new->uid, old->uid))
        new->cap_ambient = CAP_EMPTY_SET;

    return 0;
}

// Raise ambient capabilities
int cap_ambient_raise(kernel_cap_t *ambient, int cap)
{
    kernel_cap_t *permitted = &current_cred()->cap_permitted;
    kernel_cap_t *inheritable = &current_cred()->cap_inheritable;

    // Can only raise ambient if it's in permitted and inheritable
    if (!cap_raised(*permitted, cap) || !cap_raised(*inheritable, cap))
        return -EPERM;

    cap_raise(*ambient, cap);
    return 0;
}
```

**Explanation**:

- **Permitted** - Maximum capabilities the process can use
- **Effective** - Currently active capabilities
- **Inheritable** - Capabilities that can be inherited
- **Bounding set** - Limits on permitted capabilities
- **Ambient** - Preserved across exec for non-root

**Where**: Inheritance matters in:

- **Service startup** - systemd capability management
- **Container runtime** - Docker capability preservation
- **SUID alternatives** - Replacing setuid programs
- **Shell scripts** - Capability-aware shells
- **Rock 5B+** - Application deployment

## File Capabilities

**What**: File capabilities allow executables to have specific capabilities that are gained upon execution.

**Why**: Understanding file capabilities is important because:

- **SUID replacement** - Safer than setuid root
- **Minimal privilege** - Grant only needed capabilities
- **Security** - Reduces attack surface
- **Modern practice** - Industry standard approach
- **Container support** - Works with container security

**How**: File capabilities are implemented through:

```c
// Example: File capability implementation
// File capability structure
struct vfs_cap_data {
    __le32 magic_etc;
    struct {
        __le32 permitted;
        __le32 inheritable;
    } data[VFS_CAP_U32];
};

// Get file capabilities
static int get_vfs_caps_from_disk(const struct dentry *dentry,
                                  struct cpu_vfs_cap_data *cpu_caps)
{
    struct inode *inode = d_backing_inode(dentry);
    __le32 magic_etc;
    unsigned tocopy, i;
    int size;
    struct vfs_cap_data caps;

    memset(cpu_caps, 0, sizeof(*cpu_caps));

    size = __vfs_getxattr((struct dentry *)dentry, inode,
                         XATTR_NAME_CAPS, &caps, XATTR_CAPS_SZ);
    if (size == -ENODATA || size == -EOPNOTSUPP)
        return -ENODATA;

    if (size < 0)
        return size;

    magic_etc = le32_to_cpu(caps.magic_etc);

    switch (magic_etc & VFS_CAP_REVISION_MASK) {
    case VFS_CAP_REVISION_1:
        if (size != XATTR_CAPS_SZ_1)
            return -EINVAL;
        tocopy = VFS_CAP_U32_1;
        break;
    case VFS_CAP_REVISION_2:
        if (size != XATTR_CAPS_SZ_2)
            return -EINVAL;
        tocopy = VFS_CAP_U32_2;
        break;
    default:
        return -EINVAL;
    }

    CAP_FOR_EACH_U32(i) {
        if (i >= tocopy)
            break;
        cpu_caps->permitted.cap[i] = le32_to_cpu(caps.data[i].permitted);
        cpu_caps->inheritable.cap[i] = le32_to_cpu(caps.data[i].inheritable);
    }

    cpu_caps->magic_etc = magic_etc;
    return 0;
}

// Set file capabilities
int cap_convert_nscap(struct dentry *dentry, void **ivalue, size_t size)
{
    struct vfs_ns_cap_data *cap_nscap = *ivalue;
    struct vfs_cap_data cap_data;
    __le32 nsmagic, magic;
    unsigned tocopy;

    if (size < sizeof(__le32))
        return -EINVAL;

    magic = cpu_to_le32(VFS_CAP_REVISION_2);
    nsmagic = le32_to_cpu(cap_nscap->magic_etc);

    if (nsmagic & VFS_CAP_FLAGS_EFFECTIVE)
        magic |= VFS_CAP_FLAGS_EFFECTIVE;

    tocopy = VFS_CAP_U32_2;
    cap_data.magic_etc = magic;

    memcpy(&cap_data.data, &cap_nscap->data, tocopy * 2 * sizeof(__le32));

    *ivalue = kmemdup(&cap_data, sizeof(cap_data), GFP_ATOMIC);
    if (*ivalue == NULL)
        return -ENOMEM;

    return sizeof(cap_data);
}
```

**Explanation**:

- **Extended attribute** - Stored in security.capability
- **Permitted set** - Capabilities file grants
- **Inheritable set** - Capabilities that can be inherited
- **Effective flag** - Whether capabilities are effective
- **Version** - Capability format version

**Where**: File capabilities are used in:

- **ping** - CAP_NET_RAW instead of setuid
- **tcpdump** - CAP_NET_RAW and CAP_NET_ADMIN
- **systemd-networkd** - CAP_NET_ADMIN and CAP_NET_BIND_SERVICE
- **Custom services** - Application-specific capabilities
- **Rock 5B+** - Secure application packaging

## Capability Operations

**What**: The kernel provides system calls and operations to manipulate process and file capabilities.

**Why**: Understanding operations is important because:

- **Runtime control** - Modify process capabilities
- **Security enforcement** - Drop unnecessary capabilities
- **Debugging** - Inspect capability state
- **Container management** - Capability manipulation
- **Tool development** - Build security tools

**How**: Capability operations are performed through:

```c
// Example: Capability system calls
// cap_get/set for process capabilities
SYSCALL_DEFINE2(capget, cap_user_header_t, header,
                cap_user_data_t, dataptr)
{
    int ret = 0;
    pid_t pid;
    unsigned tocopy;
    kernel_cap_t pE, pI, pP;
    struct task_struct *target;

    if (get_user(pid, &header->pid))
        return -EFAULT;

    if (pid && (pid != task_pid_vnr(current))) {
        target = find_task_by_vpid(pid);
        if (!target)
            return -ESRCH;
    } else {
        target = current;
    }

    pE = target->cred->cap_effective;
    pI = target->cred->cap_inheritable;
    pP = target->cred->cap_permitted;

    ret = copy_to_user(dataptr, &pE, sizeof(kernel_cap_t));
    ret |= copy_to_user(dataptr + 1, &pI, sizeof(kernel_cap_t));
    ret |= copy_to_user(dataptr + 2, &pP, sizeof(kernel_cap_t));

    return ret;
}

SYSCALL_DEFINE2(capset, cap_user_header_t, header,
                const cap_user_data_t, data)
{
    struct cred *new;
    kernel_cap_t effective, permitted, inheritable;
    int ret;

    ret = get_user(effective.cap[0], &data[0].effective);
    ret |= get_user(permitted.cap[0], &data[0].permitted);
    ret |= get_user(inheritable.cap[0], &data[0].inheritable);

    new = prepare_creds();
    if (!new)
        return -ENOMEM;

    ret = security_capset(new, current_cred(),
                         &effective, &inheritable, &permitted);
    if (ret < 0)
        goto error;

    new->cap_effective = effective;
    new->cap_permitted = permitted;
    new->cap_inheritable = inheritable;

    return commit_creds(new);

error:
    abort_creds(new);
    return ret;
}

// Drop all capabilities
void cap_drop_all(void)
{
    struct cred *new = prepare_creds();
    if (new) {
        new->cap_effective = CAP_EMPTY_SET;
        new->cap_permitted = CAP_EMPTY_SET;
        new->cap_inheritable = CAP_EMPTY_SET;
        new->cap_ambient = CAP_EMPTY_SET;
        commit_creds(new);
    }
}

// Keep only specified capability
void cap_keep_only(int cap)
{
    struct cred *new = prepare_creds();
    if (new) {
        new->cap_effective = CAP_EMPTY_SET;
        new->cap_permitted = CAP_EMPTY_SET;
        new->cap_inheritable = CAP_EMPTY_SET;
        cap_raise(new->cap_effective, cap);
        cap_raise(new->cap_permitted, cap);
        commit_creds(new);
    }
}
```

**Explanation**:

- **capget** - Retrieve process capabilities
- **capset** - Set process capabilities
- **prepare_creds** - Create new credential structure
- **commit_creds** - Apply new credentials
- **CAP_EMPTY_SET** - No capabilities

**Where**: Operations are used in:

- **libcap** - User-space capability library
- **systemd** - Service capability management
- **Container runtimes** - Capability restriction
- **Security tools** - Capability analysis
- **Rock 5B+** - Application deployment

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Capability System** - Understanding Linux capability model
2. **Capability Types** - Knowledge of specific capabilities
3. **Inheritance** - How capabilities are preserved
4. **File Capabilities** - Safer than setuid binaries
5. **Operations** - Managing capabilities programmatically
6. **ARM64 Integration** - Rock 5B+ capability usage

**Why** these concepts matter:

- **Security** - Fundamental privilege management
- **Least privilege** - Modern security practice
- **Container security** - Foundation for isolation
- **SUID replacement** - Safer alternative
- **Professional development** - Industry standard

**When** to use capabilities:

- **Service deployment** - Running with minimal privileges
- **Container execution** - Docker, Kubernetes
- **Security hardening** - Reducing attack surface
- **Application development** - Capability-aware programs
- **Embedded systems** - Rock 5B+ secure deployment

**Where** capabilities apply:

- **All Linux systems** - Standard privilege mechanism
- **Container platforms** - Docker, LXC, containerd
- **System services** - systemd, network daemons
- **Security tools** - AppArmor, SELinux
- **Rock 5B+** - Embedded Linux security

## Next Steps

**What** you're ready for next:

1. **Learn SELinux** - MAC with SELinux
2. **Study AppArmor** - Path-based MAC
3. **Explore Secure Boot** - Boot-time verification
4. **Understand Hardening** - Stack protection, ASLR
5. **Apply Capabilities** - Secure Rock 5B+ applications

**Where** to go next:

Continue with **"SELinux Integration"** to learn:

- SELinux architecture and concepts
- Type enforcement policies
- Security contexts and domains
- Policy development

**How** to continue learning:

1. **Use capsh** - Experiment with capabilities
2. **Try getcap/setcap** - Manage file capabilities
3. **Study systemd** - Service capability configuration
4. **Read libcap** - User-space capability library
5. **Build applications** - Capability-aware development

## Resources

**Official Documentation**:

- [Capabilities](https://www.kernel.org/doc/html/latest/userspace-api/capabilities.html) - Complete capability reference
- [libcap](https://sites.google.com/site/fullycapable/) - User-space library

**Learning Resources**:

- [Linux Programming Interface](https://man7.org/tlpi/) - Comprehensive Linux programming
- [Container Security](https://www.oreilly.com/library/view/container-security/9781492056690/) - Container capabilities

**Rock 5B+ Specific**:

- [ARM Security](https://developer.arm.com/architectures/learn-the-architecture/armv8-a-architecture/security) - ARM64 security
- [Embedded Security](https://elinux.org/Security) - Embedded Linux best practices

Happy learning! 🛡️

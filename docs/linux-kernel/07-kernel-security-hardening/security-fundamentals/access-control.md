---
sidebar_position: 2
---

# Access Control Mechanisms

Master access control mechanisms in the Linux kernel, understanding how capability-based security, access control lists, and security contexts protect system resources on the Rock 5B+ platform.

## What is Access Control?

**What**: Access control is the mechanism by which the kernel determines whether a subject (process, user) can perform a requested operation on an object (file, resource).

**Why**: Understanding access control is crucial because:

- **Resource protection** - Prevents unauthorized access
- **Privilege separation** - Limits damage from compromised processes
- **Fine-grained control** - Precise permission management
- **Security policies** - Enforces organizational security rules
- **Rock 5B+ development** - Secures embedded systems
- **Professional development** - Essential security skill

**When**: Access control is applied when:

- **File access** - Reading, writing, executing files
- **System calls** - Performing privileged operations
- **Network operations** - Binding to privileged ports
- **Device access** - Accessing hardware devices
- **IPC operations** - Inter-process communication
- **Resource allocation** - Allocating system resources

**How**: Access control works through:

```c
// Example: Access control framework
// Permission check function
int generic_permission(struct inode *inode, int mask)
{
    int ret;

    // Check basic Unix permissions
    ret = acl_permission_check(inode, mask);
    if (ret != -EACCES)
        return ret;

    // Check capabilities
    if (capable_wrt_inode_uidgid(inode, CAP_DAC_OVERRIDE))
        return 0;

    // Check read-only filesystem
    if (IS_RDONLY(inode) && (mask & MAY_WRITE))
        return -EROFS;

    return -EACCES;
}

// Access Vector Cache (AVC) for MAC
struct avc_node {
    u32 ssid;                    // Source security ID
    u32 tsid;                    // Target security ID
    u16 tclass;                  // Target class
    struct av_decision avd;      // Access decision
};

// Check access with caching
int avc_has_perm(u32 ssid, u32 tsid, u16 tclass, u32 requested)
{
    struct avc_node *node;
    int rc = 0;

    // Check cache
    node = avc_lookup(ssid, tsid, tclass);
    if (node) {
        if ((node->avd.allowed & requested) == requested)
            return 0;
        else
            return -EACCES;
    }

    // Compute access decision
    rc = security_compute_av(ssid, tsid, tclass, requested, &node->avd);

    // Insert into cache
    avc_insert(ssid, tsid, tclass, &node->avd);

    return rc;
}
```

**Where**: Access control is found in:

- **All operating systems** - Fundamental security mechanism
- **File systems** - Protecting files and directories
- **Network stacks** - Controlling network access
- **Device drivers** - Hardware access control
- **Virtualization** - VM isolation
- **Rock 5B+** - ARM64 embedded security

## Capability-Based Security

**What**: Capabilities divide root privileges into distinct units that can be independently enabled or disabled for processes.

**Why**: Understanding capabilities is important because:

- **Least privilege** - Processes get only needed privileges
- **Privilege separation** - Reduces attack surface
- **Fine-grained control** - Specific privilege management
- **No SUID** - Reduces need for setuid binaries
- **Container security** - Essential for containerization

**How**: Capabilities are implemented through:

```c
// Example: Capability system
// Capability sets
struct cred {
    kernel_cap_t cap_inheritable;  // Capabilities inherited across exec
    kernel_cap_t cap_permitted;    // Maximum capabilities allowed
    kernel_cap_t cap_effective;    // Currently active capabilities
    kernel_cap_t cap_bset;         // Capability bounding set
    kernel_cap_t cap_ambient;      // Ambient capabilities
};

// Check capability
bool capable(int cap)
{
    return ns_capable(&init_user_ns, cap);
}

bool ns_capable(struct user_namespace *ns, int cap)
{
    return ns_capable_common(ns, cap, CAP_OPT_NONE);
}

bool ns_capable_common(struct user_namespace *ns, int cap, int opts)
{
    if (security_capable(current_cred(), ns, cap, opts) == 0) {
        current->flags |= PF_SUPERPRIV;
        return true;
    }
    return false;
}

// Raise capability
int cap_raise(kernel_cap_t *dst, int cap)
{
    cap_raise(*dst, cap);
    return 0;
}

// Drop capability
int cap_drop(kernel_cap_t *dst, int cap)
{
    cap_lower(*dst, cap);
    return 0;
}

// File capabilities
struct vfs_cap_data {
    __le32 magic_etc;
    struct {
        __le32 permitted;
        __le32 inheritable;
    } data[VFS_CAP_U32];
};

// Apply file capabilities
static inline int get_file_caps(struct linux_binprm *bprm, bool *effective)
{
    struct dentry *dentry;
    int rc = 0;
    struct vfs_cap_data vcaps;

    dentry = dget(bprm->file->f_path.dentry);

    rc = get_vfs_caps_from_disk(dentry, &vcaps);
    if (rc < 0) {
        if (rc == -ENODATA || rc == -EOPNOTSUPP)
            rc = 0;
        goto out;
    }

    rc = bprm_caps_from_vfs_caps(&vcaps, bprm, effective);

out:
    dput(dentry);
    return rc;
}

// Common capability checks
bool capable_wrt_inode_uidgid(const struct inode *inode, int cap)
{
    struct user_namespace *ns = current_user_ns();

    return ns_capable(ns, cap) &&
           kuid_has_mapping(ns, inode->i_uid) &&
           kgid_has_mapping(ns, inode->i_gid);
}
```

**Explanation**:

- **CAP_CHOWN** - Change file ownership
- **CAP_DAC_OVERRIDE** - Bypass file permission checks
- **CAP_NET_BIND_SERVICE** - Bind to privileged ports (\< 1024)
- **CAP_SYS_ADMIN** - Various administrative operations
- **CAP_SYS_TIME** - Set system clock
- **File capabilities** - Capabilities stored in file extended attributes

**Where**: Capabilities are essential in:

- **System daemons** - Running services with limited privileges
- **Container runtimes** - Docker, LXC, Kubernetes
- **Network services** - Binding to privileged ports
- **Embedded systems** - Minimal privilege applications
- **Rock 5B+** - Secure application deployment

## Access Control Lists (ACLs)

**What**: ACLs extend traditional Unix permissions by allowing fine-grained access control for multiple users and groups.

**Why**: Understanding ACLs is important because:

- **Fine-grained control** - Permissions for specific users/groups
- **Flexibility** - More than owner/group/other
- **Compatibility** - Extends existing permission model
- **Enterprise requirements** - Complex permission scenarios
- **Standards compliance** - POSIX ACL standard

**How**: ACLs are implemented through:

```c
// Example: ACL implementation
// ACL entry structure
struct posix_acl_entry {
    short e_tag;           // ACL_USER, ACL_GROUP, etc.
    unsigned short e_perm; // Read, write, execute
    union {
        kuid_t e_uid;
        kgid_t e_gid;
    } e_id;
};

// ACL structure
struct posix_acl {
    atomic_t a_refcount;
    unsigned int a_count;
    struct posix_acl_entry a_entries[0];
};

// ACL tags
#define ACL_USER_OBJ    0x01    // Owner
#define ACL_USER        0x02    // Named user
#define ACL_GROUP_OBJ   0x04    // Owning group
#define ACL_GROUP       0x08    // Named group
#define ACL_MASK        0x10    // Mask entry
#define ACL_OTHER       0x20    // Other

// Check ACL permission
int posix_acl_permission(struct inode *inode, const struct posix_acl *acl,
                        int want)
{
    const struct posix_acl_entry *pa, *pe, *mask_obj;
    int found = 0;

    // Check owner
    pa = acl->a_entries;
    pe = acl->a_entries + acl->a_count;

    for (; pa < pe; pa++) {
        switch (pa->e_tag) {
        case ACL_USER_OBJ:
            if (uid_eq(current_fsuid(), inode->i_uid)) {
                found = 1;
                if ((pa->e_perm & want) == want)
                    return 0;
            }
            break;

        case ACL_USER:
            if (uid_eq(current_fsuid(), pa->e_id.e_uid)) {
                found = 1;
                goto check_mask;
            }
            break;

        case ACL_GROUP_OBJ:
            if (in_group_p(inode->i_gid)) {
                found = 1;
                if ((pa->e_perm & want) == want)
                    goto check_mask;
            }
            break;

        case ACL_GROUP:
            if (in_group_p(pa->e_id.e_gid)) {
                found = 1;
                if ((pa->e_perm & want) == want)
                    goto check_mask;
            }
            break;

        case ACL_MASK:
            mask_obj = pa;
            break;

        case ACL_OTHER:
            if (found)
                return -EACCES;
            if ((pa->e_perm & want) == want)
                return 0;
            return -EACCES;
        }
    }

    return -EACCES;

check_mask:
    if (mask_obj) {
        if ((pa->e_perm & mask_obj->e_perm & want) == want)
            return 0;
        return -EACCES;
    }

    if ((pa->e_perm & want) == want)
        return 0;

    return -EACCES;
}

// Set ACL on inode
int posix_acl_chmod(struct inode *inode, umode_t mode)
{
    struct posix_acl *acl;
    int ret = 0;

    if (!IS_POSIXACL(inode))
        return 0;
    if (S_ISLNK(inode->i_mode))
        return -EOPNOTSUPP;

    acl = get_acl(inode, ACL_TYPE_ACCESS);
    if (IS_ERR_OR_NULL(acl)) {
        if (acl == ERR_PTR(-EOPNOTSUPP))
            return 0;
        return PTR_ERR(acl);
    }

    ret = __posix_acl_chmod(&acl, GFP_KERNEL, mode);
    if (ret)
        return ret;

    ret = inode->i_op->set_acl(inode, acl, ACL_TYPE_ACCESS);
    posix_acl_release(acl);

    return ret;
}
```

**Explanation**:

- **Named users** - Permissions for specific users
- **Named groups** - Permissions for specific groups
- **Mask entry** - Maximum permissions for named entries
- **Default ACLs** - Inherited by new files in directory
- **Extended attributes** - Stored in system.posix_acl_access

**Where**: ACLs are essential in:

- **File servers** - NFS, Samba file sharing
- **Multi-user systems** - Complex permission requirements
- **Enterprise environments** - Large organizations
- **Backup systems** - Preserving detailed permissions
- **Rock 5B+** - Shared file access control

## Security Contexts

**What**: Security contexts are labels attached to subjects and objects that define their security properties in MAC systems.

**Why**: Understanding security contexts is important because:

- **MAC implementation** - Core of mandatory access control
- **Policy enforcement** - Define security domains
- **Type enforcement** - Control access based on types
- **Information flow** - Control data movement
- **Compliance** - Meet security requirements

**How**: Security contexts work through:

```c
// Example: Security context implementation
// Security context structure
struct security_context {
    u32 user;        // SELinux user
    u32 role;        // SELinux role
    u32 type;        // SELinux type
    u32 range;       // MLS range
};

// Get security context
int security_inode_getsecurity(struct inode *inode, const char *name,
                              void **buffer, bool alloc)
{
    if (unlikely(IS_PRIVATE(inode)))
        return -EOPNOTSUPP;

    return call_int_hook(inode_getsecurity, -EOPNOTSUPP, inode, name,
                        buffer, alloc);
}

// Set security context
int security_inode_setsecurity(struct inode *inode, const char *name,
                              const void *value, size_t size, int flags)
{
    if (unlikely(IS_PRIVATE(inode)))
        return -EOPNOTSUPP;

    return call_int_hook(inode_setsecurity, -EOPNOTSUPP, inode, name,
                        value, size, flags);
}

// Context transition on exec
int security_task_create(unsigned long clone_flags)
{
    return call_int_hook(task_create, 0, clone_flags);
}

// SELinux context structure
struct selinux_context {
    char *user;
    char *role;
    char *type;
    char *range;
};

// Parse context string
int selinux_parse_context(const char *str, struct selinux_context *ctx)
{
    char *user, *role, *type, *range;
    char *s = kstrdup(str, GFP_KERNEL);

    if (!s)
        return -ENOMEM;

    user = s;
    role = strchr(user, ':');
    if (!role)
        goto error;
    *role++ = '\0';

    type = strchr(role, ':');
    if (!type)
        goto error;
    *type++ = '\0';

    range = strchr(type, ':');
    if (range)
        *range++ = '\0';

    ctx->user = kstrdup(user, GFP_KERNEL);
    ctx->role = kstrdup(role, GFP_KERNEL);
    ctx->type = kstrdup(type, GFP_KERNEL);
    ctx->range = range ? kstrdup(range, GFP_KERNEL) : NULL;

    kfree(s);
    return 0;

error:
    kfree(s);
    return -EINVAL;
}

// Context-based access check
int selinux_check_access(struct selinux_context *source,
                        struct selinux_context *target,
                        u16 tclass, u32 requested)
{
    u32 ssid, tsid;
    int rc;

    // Convert contexts to security IDs
    rc = security_context_to_sid(source, &ssid);
    if (rc)
        return rc;

    rc = security_context_to_sid(target, &tsid);
    if (rc)
        return rc;

    // Check access
    return avc_has_perm(ssid, tsid, tclass, requested);
}
```

**Explanation**:

- **User** - SELinux user identity
- **Role** - SELinux role (RBAC component)
- **Type** - SELinux type (main enforcement)
- **Range** - MLS security level and categories
- **Transitions** - Context changes on exec or file creation

**Where**: Security contexts are essential in:

- **SELinux systems** - Type enforcement MAC
- **MLS systems** - Multi-level security
- **Government systems** - Classified environments
- **High-security systems** - Financial, healthcare
- **Rock 5B+** - Embedded system hardening

## Extended Attributes

**What**: Extended attributes are name-value pairs associated with files and directories, used to store security information.

**Why**: Understanding extended attributes is important because:

- **Metadata storage** - Store additional file information
- **Security labels** - Store security contexts
- **ACL implementation** - Store ACL data
- **Capabilities** - Store file capabilities
- **Flexibility** - Extensible metadata system

**How**: Extended attributes work through:

```c
// Example: Extended attributes
// Get extended attribute
ssize_t vfs_getxattr(struct dentry *dentry, const char *name,
                    void *value, size_t size)
{
    struct inode *inode = dentry->d_inode;
    int error;

    error = xattr_permission(inode, name, MAY_READ);
    if (error)
        return error;

    error = security_inode_getxattr(dentry, name);
    if (error)
        return error;

    if (!strncmp(name, XATTR_SECURITY_PREFIX,
                XATTR_SECURITY_PREFIX_LEN)) {
        const char *suffix = name + XATTR_SECURITY_PREFIX_LEN;
        int ret = security_inode_getsecurity(inode, suffix, &value,
                                            true);
        if (ret > 0)
            return ret;
    }

    if (inode->i_op->getxattr)
        error = inode->i_op->getxattr(dentry, name, value, size);
    else
        error = -EOPNOTSUPP;

    return error;
}

// Set extended attribute
int vfs_setxattr(struct dentry *dentry, const char *name,
                const void *value, size_t size, int flags)
{
    struct inode *inode = dentry->d_inode;
    int error;

    error = xattr_permission(inode, name, MAY_WRITE);
    if (error)
        return error;

    error = security_inode_setxattr(dentry, name, value, size, flags);
    if (error)
        goto out;

    error = __vfs_setxattr_noperm(dentry, name, value, size, flags);

out:
    return error;
}

// List extended attributes
ssize_t vfs_listxattr(struct dentry *dentry, char *list, size_t size)
{
    struct inode *inode = dentry->d_inode;
    ssize_t error;

    error = security_inode_listxattr(dentry);
    if (error)
        return error;

    if (inode->i_op->listxattr) {
        error = inode->i_op->listxattr(dentry, list, size);
    } else {
        error = security_inode_listsecurity(inode, list, size);
        if (size && error > size)
            error = -ERANGE;
    }

    return error;
}

// Remove extended attribute
int vfs_removexattr(struct dentry *dentry, const char *name)
{
    struct inode *inode = dentry->d_inode;
    int error;

    error = xattr_permission(inode, name, MAY_WRITE);
    if (error)
        return error;

    error = security_inode_removexattr(dentry, name);
    if (error)
        goto out;

    mutex_lock(&inode->i_mutex);
    error = __vfs_removexattr(dentry, name);
    mutex_unlock(&inode->i_mutex);

out:
    return error;
}

// Security namespace
#define XATTR_SECURITY_PREFIX "security."
#define XATTR_SELINUX_SUFFIX "selinux"
#define XATTR_NAME_SELINUX XATTR_SECURITY_PREFIX XATTR_SELINUX_SUFFIX

// Capability namespace
#define XATTR_CAPS_SUFFIX "capability"
#define XATTR_NAME_CAPS XATTR_SECURITY_PREFIX XATTR_CAPS_SUFFIX

// POSIX ACL namespace
#define XATTR_POSIX_ACL_ACCESS "system.posix_acl_access"
#define XATTR_POSIX_ACL_DEFAULT "system.posix_acl_default"
```

**Explanation**:

- **Namespaces** - security., system., trusted., user.
- **Security labels** - SELinux, AppArmor contexts
- **Capabilities** - File capability sets
- **ACLs** - POSIX ACL storage
- **Filesystem support** - Requires filesystem support

**Where**: Extended attributes are essential in:

- **MAC systems** - SELinux, AppArmor labels
- **ACL systems** - POSIX ACL implementation
- **Capability systems** - File capabilities
- **Backup systems** - Preserving metadata
- **Rock 5B+** - Security metadata storage

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Access Control Understanding** - You understand access control mechanisms
2. **Capability Knowledge** - You know capability-based security
3. **ACL Knowledge** - You understand access control lists
4. **Security Context Knowledge** - You know how security contexts work
5. **Extended Attribute Knowledge** - You understand xattr system
6. **Implementation Skills** - You can implement access control

**Why** these concepts matter:

- **Security enforcement** - Control access to resources
- **Privilege management** - Limit process privileges
- **Fine-grained control** - Precise permission management
- **Policy implementation** - Enforce security policies
- **Embedded security** - Critical for Rock 5B+

**When** to use these concepts:

- **Security design** - Implementing access control
- **Privilege reduction** - Using capabilities
- **Complex permissions** - Implementing ACLs
- **MAC deployment** - Using security contexts
- **Metadata management** - Using extended attributes

**Where** these skills apply:

- **Kernel development** - Access control implementation
- **System administration** - Configuring permissions
- **Container security** - Capability management
- **Enterprise systems** - Complex ACL requirements
- **Professional development** - Security engineering

## Next Steps

**What** you're ready for next:

After mastering access control mechanisms, you should be ready to:

1. **Learn Capability System** - Deep dive into Linux capabilities
2. **Study SELinux** - Implement MAC with SELinux
3. **Explore AppArmor** - Alternative MAC approach
4. **Understand Secure Boot** - Boot-time security
5. **Apply Access Control** - Implement in Rock 5B+ projects

**Where** to go next:

Continue with the next lesson on **"Capability System"** to learn:

- Linux capability model in detail
- Capability inheritance and transitions
- Capability-aware applications
- Securing services with capabilities

**Why** the next lesson is important:

The next lesson provides in-depth coverage of the Linux capability system, which is fundamental to modern privilege separation and container security.

**How** to continue learning:

1. **Experiment with capabilities** - Use capsh, getcap, setcap
2. **Study ACLs** - Practice with getfacl, setfacl
3. **Explore SELinux** - Try security contexts
4. **Read security code** - Kernel security subsystem
5. **Build secure applications** - Apply to Rock 5B+

## Resources

**Official Documentation**:

- [Capabilities](https://www.kernel.org/doc/html/latest/userspace-api/capabilities.html) - Linux capabilities
- [ACLs](https://www.kernel.org/doc/html/latest/filesystems/ext4/acls.html) - POSIX ACLs
- [Extended Attributes](https://www.kernel.org/doc/html/latest/filesystems/ext4/xattrs.html) - xattr system

**Learning Resources**:

- [Linux Security Modules](https://www.kernel.org/doc/html/latest/admin-guide/LSM/) - LSM framework
- [SELinux Documentation](https://github.com/SELinuxProject) - SELinux project

**Rock 5B+ Specific**:

- [ARM TrustZone](https://developer.arm.com/ip-products/security-ip/trustzone) - Hardware security
- [Embedded Security](https://elinux.org/Security) - Embedded Linux security

Happy learning! 🔐

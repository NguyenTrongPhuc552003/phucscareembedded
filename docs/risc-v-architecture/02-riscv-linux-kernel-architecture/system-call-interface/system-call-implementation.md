---
sidebar_position: 2
---

# System Call Implementation

Master RISC-V system call implementation that processes system call requests in the kernel, understanding how system calls are dispatched, how arguments are validated, and how user space data is safely accessed essential for kernel system call development.

## What Is System Call Implementation?

**What**: System call implementation is the kernel-side code that handles system call requests, validates arguments, accesses user space data safely, performs requested operations, and returns results to user space. This includes dispatch mechanisms, argument handling, and security checks.

**Why**: Understanding system call implementation is crucial because:

- **Kernel Development** - Required for implementing new system calls
- **Security** - Must validate arguments and protect kernel
- **User Space Access** - Safely access user space data
- **Error Handling** - Proper error handling and reporting
- **Performance** - Optimize system call performance
- **Compatibility** - Maintain compatibility with user programs

**When**: System call implementation is used when:

- **System Call Dispatch** - Dispatching system call to handler
- **Argument Validation** - Validating system call arguments
- **User Data Access** - Accessing data from user space
- **Operation Execution** - Performing requested operation
- **Result Return** - Returning results to user space
- **Error Reporting** - Reporting errors to user space

**How**: System call implementation works through:

- **Dispatch Table** - sys_call_table maps numbers to handlers
- **Handler Functions** - Each system call has handler function
- **Argument Extraction** - Extract arguments from pt_regs
- **User Space Access** - Safe access to user space memory
- **Operation Execution** - Perform actual operation
- **Return Value** - Store return value in pt_regs->a0

**Where**: System call implementation is found in:

- **System Call Table** - Kernel system call table
- **Handler Functions** - Individual system call implementations
- **Syscall Dispatcher** - System call dispatch code
- **User Access Helpers** - copy_from_user, copy_to_user, etc.
- **Error Handling** - Error code and reporting

## System Call Dispatch

**What**: System call dispatch routes system call requests to appropriate handlers.

**How**: Dispatch works:

```c
// Example: System call dispatch mechanism
// Entry point for all system calls

// System call table type
typedef asmlinkage long (*sys_call_ptr_t)(const struct pt_regs *regs);

// System call table (defined per architecture)
const sys_call_ptr_t sys_call_table[] __visible = {
    [0 ... __NR_syscalls - 1] = __sys_ni_syscall,  // Default: not implemented

    // System calls
    [__NR_write] = (sys_call_ptr_t)sys_write,
    [__NR_read] = (sys_call_ptr_t)sys_read,
    [__NR_open] = (sys_call_ptr_t)sys_open,
    [__NR_close] = (sys_call_ptr_t)sys_close,
    [__NR_exit] = (sys_call_ptr_t)sys_exit,
    [__NR_fork] = (sys_call_ptr_t)sys_fork,
    [__NR_getpid] = (sys_call_ptr_t)sys_getpid,
    [__NR_gettid] = (sys_call_ptr_t)sys_gettid,
    // ... more system calls
};

// Example: System call dispatch function
static long do_syscall_64(struct pt_regs *regs) {
    unsigned long nr = regs->a7;
    long ret;

    // Validate system call number
    if (nr >= NR_syscalls) {
        ret = -ENOSYS;
        goto out;
    }

    // Get handler from table
    sys_call_ptr_t call = sys_call_table[nr];

    if (call == __sys_ni_syscall || call == NULL) {
        // System call not implemented
        ret = -ENOSYS;
        goto out;
    }

    // Call system call handler
    // Handler receives pt_regs pointer
    ret = call(regs);

out:
    // Store return value in a0
    regs->a0 = ret;

    // Advance program counter past ECALL
    regs->epc += 4;

    return ret;
}

// Example: System call entry wrapper
void do_trap_user(struct pt_regs *regs) {
    unsigned long scause = regs->cause;

    if (scause == CAUSE_USER_ECALL) {
        // System call from user space
        do_syscall_64(regs);
    } else {
        // Other exception, handle differently
        do_handle_exception(regs);
    }
}

// Example: System call not implemented handler
asmlinkage long __sys_ni_syscall(const struct pt_regs *regs) {
    return -ENOSYS;  // Function not implemented
}
```

**Explanation**:

- **Dispatch table** sys_call_table maps system call numbers to handlers
- **Validation** validate system call number before dispatch
- **Handler lookup** look up handler function in table
- **Handler call** call handler with pt_regs pointer
- **Return value** store return value in regs->a0
- **PC advancement** advance program counter past ECALL

## System Call Handler Structure

**What**: System call handlers are functions that implement specific system calls.

**How**: Handler structure works:

```c
// Example: System call handler signature
// All handlers receive pt_regs pointer and return long

// Example: Simple system call handler (getpid)
asmlinkage long sys_getpid(const struct pt_regs *regs) {
    // No arguments needed
    // Return current process ID

    return current->tgid;  // Thread group ID (PID)
}

// Example: System call with arguments (write)
asmlinkage long sys_write(const struct pt_regs *regs) {
    // Extract arguments from pt_regs
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    // Validate arguments
    if (count > MAX_RW_COUNT) {
        return -EINVAL;
    }

    // Call implementation function
    return ksys_write(fd, buf, count);
}

// Example: System call with pointer argument (read)
asmlinkage long sys_read(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    // Validate count
    if (count > MAX_RW_COUNT) {
        return -EINVAL;
    }

    // Call implementation
    return ksys_read(fd, buf, count);
}

// Example: System call with string argument (open)
asmlinkage long sys_open(const struct pt_regs *regs) {
    char __user *filename = (char __user *)regs->a0;
    int flags = regs->a1;
    umode_t mode = regs->a2;

    // Call implementation
    return ksys_open(filename, flags, mode);
}

// Example: System call with structure argument (stat)
asmlinkage long sys_stat(const struct pt_regs *regs) {
    char __user *filename = (char __user *)regs->a0;
    struct stat __user *statbuf = (struct stat __user *)regs->a1;

    // Call implementation
    return ksys_stat(filename, statbuf);
}

// Example: System call with multiple arguments
asmlinkage long sys_fcntl(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    unsigned int cmd = regs->a1;
    unsigned long arg = regs->a2;  // May be pointer or value

    return ksys_fcntl(fd, cmd, arg);
}
```

**Explanation**:

- **Handler signature** all handlers receive pt_regs and return long
- **Argument extraction** extract arguments from pt_regs registers
- **Argument validation** validate arguments before use
- **Implementation call** call actual implementation function
- **Return value** return value stored in regs->a0 by dispatcher
- **Type conversion** cast register values to appropriate types

## User Space Data Access

**What**: Accessing user space data requires special kernel functions for safety.

**How**: User space access works:

```c
// Example: Safe user space memory access
// Kernel must use special functions to access user space

// Example: Copy data from user space
asmlinkage long sys_write(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    // Validate count
    if (count > MAX_RW_COUNT) {
        return -EINVAL;
    }

    // Allocate kernel buffer
    char *kernel_buf = kmalloc(count, GFP_KERNEL);
    if (!kernel_buf) {
        return -ENOMEM;
    }

    // Copy data from user space to kernel
    // Returns number of bytes not copied (0 = success)
    if (copy_from_user(kernel_buf, buf, count)) {
        kfree(kernel_buf);
        return -EFAULT;  // Bad user space address
    }

    // Use kernel buffer
    ssize_t ret = do_write(fd, kernel_buf, count);

    // Free kernel buffer
    kfree(kernel_buf);

    return ret;
}

// Example: Copy data to user space
asmlinkage long sys_read(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    if (count > MAX_RW_COUNT) {
        return -EINVAL;
    }

    // Allocate kernel buffer
    char *kernel_buf = kmalloc(count, GFP_KERNEL);
    if (!kernel_buf) {
        return -ENOMEM;
    }

    // Read data into kernel buffer
    ssize_t ret = do_read(fd, kernel_buf, count);

    if (ret > 0) {
        // Copy data from kernel to user space
        if (copy_to_user(buf, kernel_buf, ret)) {
            ret = -EFAULT;
        }
    }

    kfree(kernel_buf);

    return ret;
}

// Example: Access single value from user space
asmlinkage long sys_getuid(const struct pt_regs *regs) {
    // No user space access needed
    return current_uid().val;
}

// Example: Accessing user space string
asmlinkage long sys_open(const struct pt_regs *regs) {
    char __user *filename = (char __user *)regs->a0;

    // Get filename from user space
    // getname() validates and copies user space string
    struct filename *name = getname(filename);

    if (IS_ERR(name)) {
        return PTR_ERR(name);
    }

    // Use kernel copy of filename
    long ret = do_open(name, regs->a1, regs->a2);

    // Free kernel copy
    putname(name);

    return ret;
}

// Example: Copy structure from user space
asmlinkage long sys_stat(const struct pt_regs *regs) {
    char __user *filename = (char __user *)regs->a0;
    struct stat __user *statbuf = (struct stat __user *)regs->a1;

    struct stat stat;
    long ret;

    // Get stat structure
    ret = vfs_stat(filename, &stat);
    if (ret) {
        return ret;
    }

    // Copy structure to user space
    if (copy_to_user(statbuf, &stat, sizeof(stat))) {
        return -EFAULT;
    }

    return 0;
}

// Example: Validate user space pointer
bool access_ok(const void __user *ptr, size_t size) {
    // Check if user space pointer is valid
    // Returns true if pointer is in user space and accessible

    unsigned long addr = (unsigned long)ptr;
    unsigned long size_increment = size;

    // Check address is in user space
    if (addr >= TASK_SIZE) {
        return false;
    }

    // Check for overflow
    if (addr + size_increment < addr) {
        return false;
    }

    // Check doesn't exceed user space
    if (addr + size_increment > TASK_SIZE) {
        return false;
    }

    return true;
}
```

**Explanation**:

- **copy_from_user** copy data from user space to kernel
- **copy_to_user** copy data from kernel to user space
- **getname** get and validate user space strings
- **access_ok** validate user space pointers
- **Safety checks** validate pointers before access
- **Error handling** return -EFAULT for invalid addresses

## Argument Validation

**What**: System call arguments must be validated before use.

**How**: Argument validation works:

```c
// Example: System call argument validation
asmlinkage long sys_write(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    // Validate file descriptor
    if (fd >= current->files->fd_array_size) {
        return -EBADF;  // Bad file descriptor
    }

    // Validate count
    if (count == 0) {
        return 0;  // Valid, nothing to write
    }

    if (count > MAX_RW_COUNT) {
        return -EINVAL;  // Count too large
    }

    // Validate buffer pointer
    if (!access_ok(buf, count)) {
        return -EFAULT;  // Invalid pointer
    }

    // Arguments validated, proceed
    return ksys_write(fd, buf, count);
}

// Example: Flags validation
asmlinkage long sys_open(const struct pt_regs *regs) {
    char __user *filename = (char __user *)regs->a0;
    int flags = regs->a1;
    umode_t mode = regs->a2;

    // Validate flags
    if (flags & ~O_ACCMODE) {
        // Check for invalid flag combinations
        if ((flags & O_CREAT) && (flags & O_DIRECTORY)) {
            return -EINVAL;  // Invalid combination
        }
    }

    // Validate mode if O_CREAT is set
    if (flags & O_CREAT) {
        // Mode must be valid
        if (mode & ~0777) {
            return -EINVAL;  // Invalid mode bits
        }
    }

    return ksys_open(filename, flags, mode);
}

// Example: Range validation
asmlinkage long sys_lseek(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    loff_t offset = (loff_t)regs->a1 | ((loff_t)regs->a2 << 32);
    unsigned int whence = regs->a3;

    // Validate whence
    if (whence > SEEK_END) {
        return -EINVAL;  // Invalid whence
    }

    // Validate offset range (if needed)
    if (offset < 0 && whence != SEEK_SET) {
        return -EINVAL;
    }

    return ksys_lseek(fd, offset, whence);
}

// Example: Size validation
asmlinkage long sys_read(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    // Validate count
    if (count > INT_MAX) {
        return -EINVAL;  // Count too large for ssize_t
    }

    if (!access_ok(buf, count)) {
        return -EFAULT;
    }

    return ksys_read(fd, buf, count);
}
```

**Explanation**:

- **Range checks** validate numeric ranges
- **Pointer validation** validate user space pointers
- **Flag validation** validate flag values and combinations
- **Size limits** enforce size limits
- **Type validation** validate argument types
- **Early return** return error immediately on invalid input

## System Call Completion

**What**: System call completion prepares and returns results to user space.

**How**: Completion works:

```c
// Example: Successful system call completion
asmlinkage long sys_getpid(const struct pt_regs *regs) {
    // Simple return value
    return current->tgid;  // Positive value indicates success
}

// Example: System call returning resource ID
asmlinkage long sys_open(const struct pt_regs *regs) {
    char __user *filename = (char __user *)regs->a0;
    int flags = regs->a1;
    umode_t mode = regs->a2;

    int fd = ksys_open(filename, flags, mode);

    // fd >= 0: success (file descriptor)
    // fd < 0: error code
    return fd;
}

// Example: System call returning count
asmlinkage long sys_read(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    ssize_t ret = ksys_read(fd, buf, count);

    // ret > 0: bytes read (success)
    // ret == 0: end of file
    // ret < 0: error code
    return ret;
}

// Example: System call returning status
asmlinkage long sys_close(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;

    int ret = ksys_close(fd);

    // 0: success
    // < 0: error code
    return ret;
}

// Example: Error handling
asmlinkage long sys_write(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    char __user *buf = (char __user *)regs->a1;
    size_t count = regs->a2;

    // Validate arguments
    if (count > MAX_RW_COUNT) {
        return -EINVAL;  // Return error immediately
    }

    if (!access_ok(buf, count)) {
        return -EFAULT;
    }

    // Attempt operation
    ssize_t ret = ksys_write(fd, buf, count);

    // ret >= 0: bytes written (success)
    // ret < 0: error code
    return ret;
}

// Example: Partial success handling
asmlinkage long sys_readv(const struct pt_regs *regs) {
    unsigned int fd = regs->a0;
    const struct iovec __user *vec = (const struct iovec __user *)regs->a1;
    unsigned long vlen = regs->a2;

    ssize_t ret = ksys_readv(fd, vec, vlen);

    // ret >= 0: total bytes read (may be less than requested)
    // ret < 0: error code
    return ret;
}
```

**Explanation**:

- **Success values** positive or zero values indicate success
- **Error codes** negative values indicate errors
- **Return types** different system calls return different types
- **Partial success** handle partial operation success
- **Error propagation** propagate errors from implementation
- **Completion handling** proper completion handling

## Next Steps

**What** you're ready for next:

After understanding system call implementation, you should be ready to:

1. **Learn Signal Handling** - Signal delivery mechanisms
2. **Study User/Kernel Transitions** - Detailed transition mechanisms
3. **Explore System Call Tracing** - Debugging system calls
4. **Understand Compatibility** - System call compatibility
5. **Begin System Call Development** - Write new system calls

**Where** to go next:

Continue with the next lesson on **"Signal Handling"** to learn:

- Signal delivery mechanisms
- Signal handler invocation
- Signal mask and blocking
- Signal queue management
- Signal handling in kernel

**Why** the next lesson is important:

Signal handling is a critical part of process management and requires understanding how the kernel delivers signals to user processes.

**How** to continue learning:

1. **Study Kernel Code** - Examine signal handling code
2. **Use Kill Command** - Send signals to processes
3. **Write Signal Handlers** - Write user space signal handlers
4. **Read Documentation** - Study signal documentation
5. **Experiment** - Modify signal handling and observe

## Resources

**Official Documentation**:

- [Linux System Calls](https://man7.org/linux/man-pages/man2/syscalls.2.html) - System call documentation
- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Kernel documentation

**Kernel Sources**:

- [Linux System Call Implementation](https://github.com/torvalds/linux/tree/master/kernel) - System call code

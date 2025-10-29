---
sidebar_position: 1
---

# System Call Convention

Master RISC-V system call convention that defines how user processes invoke kernel services, understanding how system calls are made, how arguments are passed, and how results are returned essential for system programming and kernel development.

## What Is System Call Convention?

**What**: System call convention is the standardized interface between user space and kernel space that defines how system calls are invoked, how arguments are passed, and how return values and errors are returned. RISC-V uses registers to pass arguments and return values.

**Why**: Understanding system call convention is crucial because:

- **System Programming** - Required for all system programming
- **Kernel Development** - Kernel must implement convention correctly
- **ABI Compliance** - Must follow RISC-V ABI
- **Performance** - Convention affects performance
- **Compatibility** - Ensures compatibility with user programs
- **Documentation** - Standard interface documentation

**When**: System call convention is used when:

- **System Call Invocation** - User process calls system call
- **Argument Passing** - Passing arguments to kernel
- **Return Value** - Returning result from kernel
- **Error Handling** - Returning error codes
- **Interface Design** - Designing new system calls
- **Debugging** - Debugging system call issues

**How**: System call convention works through:

- **ECALL Instruction** - RISC-V instruction to invoke system call
- **Register Arguments** - Arguments passed in registers (a0-a5)
- **System Call Number** - System call number in register (a7)
- **Return Value** - Return value in register (a0)
- **Error Codes** - Error codes returned in same register
- **ABI Specification** - Following RISC-V ABI

**Where**: System call convention is found in:

- **ABI Specification** - RISC-V ABI documentation
- **Kernel Code** - System call handlers
- **User Libraries** - libc system call wrappers
- **System Call Tables** - sys_call_table
- **Assembly Code** - System call invocation code

## RISC-V System Call Invocation

**What**: RISC-V uses the ECALL instruction to invoke system calls from user space.

**How**: System call invocation works:

```c
// Example: System call invocation (user space)
// From user program:

// User space system call wrapper (C library)
long syscall(long syscall_nr, long arg1, long arg2, long arg3,
             long arg4, long arg5, long arg6) {
    long ret;

    // Load system call number into a7
    // Load arguments into a0-a5
    // Execute ECALL instruction
    // Read return value from a0

    __asm__ volatile(
        "mv a7, %1\n"    // System call number
        "mv a0, %2\n"    // arg1
        "mv a1, %3\n"    // arg2
        "mv a2, %4\n"    // arg3
        "mv a3, %5\n"    // arg4
        "mv a4, %6\n"    // arg5
        "mv a5, %7\n"    // arg6
        "ecall\n"        // Invoke system call
        "mv %0, a0"      // Return value in a0
        : "=r"(ret)
        : "r"(syscall_nr), "r"(arg1), "r"(arg2), "r"(arg3),
          "r"(arg4), "r"(arg5), "r"(arg6)
        : "a0", "a1", "a2", "a3", "a4", "a5", "a7"
    );

    return ret;
}

// Example: Direct system call (assembly)
// User assembly code:
/*
    li a7, __NR_write      # System call number
    li a0, 1               # File descriptor (stdout)
    la a1, message         # Buffer address
    li a2, 13              # Buffer length
    ecall                  # Invoke system call
    # Return value in a0
*/

// Example: System call with 7 arguments
// For system calls with more than 6 arguments, use structure
long syscall_7_args(long syscall_nr, struct syscall_args *args) {
    long ret;

    // First 6 args in registers
    // 7th arg and more passed via structure pointer
    __asm__ volatile(
        "mv a7, %1\n"
        "mv a0, %2\n"
        "mv a1, %3\n"
        "mv a2, %4\n"
        "mv a3, %5\n"
        "mv a4, %6\n"
        "mv a5, %7\n"
        "ld a6, 0(%8)\n"   // 7th arg from structure
        "ecall\n"
        "mv %0, a0"
        : "=r"(ret)
        : "r"(syscall_nr), "r"(args->arg1), "r"(args->arg2),
          "r"(args->arg3), "r"(args->arg4), "r"(args->arg5),
          "r"(args->arg6), "r"(&args->arg7)
        : "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7"
    );

    return ret;
}
```

**Explanation**:

- **ECALL instruction** triggers exception that enters kernel
- **Register arguments** a0-a5 contain up to 6 arguments
- **System call number** a7 contains system call number
- **Return value** a0 contains return value after ECALL
- **More arguments** structures used for 7+ arguments
- **ABI compliance** follows RISC-V calling convention

## System Call Number Assignment

**What**: Each system call has a unique number used to identify it.

**How**: System call numbers work:

```c
// Example: System call number definitions
// In kernel: include/uapi/asm-generic/unistd.h
// User space: <unistd.h>

#define __NR_write          64
#define __NR_read           63
#define __NR_open           1024
#define __NR_close          57
#define __NR_exit           93
#define __NR_fork           220
#define __NR_getpid         172
#define __NR_gettid         178

// Example: System call table
// Maps system call number to handler function
typedef long (*sys_call_ptr_t)(unsigned long, unsigned long,
                                unsigned long, unsigned long,
                                unsigned long, unsigned long);

const sys_call_ptr_t sys_call_table[] = {
    [0] = sys_ni_syscall,           // Reserved
    [__NR_write] = sys_write,      // Write system call
    [__NR_read] = sys_read,         // Read system call
    [__NR_open] = sys_open,        // Open system call
    [__NR_close] = sys_close,      // Close system call
    [__NR_exit] = sys_exit,        // Exit system call
    [__NR_fork] = sys_fork,        // Fork system call
    [__NR_getpid] = sys_getpid,    // Getpid system call
    // ... more system calls
};

#define NR_syscalls (sizeof(sys_call_table) / sizeof(sys_call_ptr_t))

// Example: System call handler dispatch
void do_syscall(struct pt_regs *regs) {
    unsigned long syscall_nr = regs->a7;
    long ret;

    // Validate system call number
    if (syscall_nr >= NR_syscalls) {
        ret = -ENOSYS;  // System call not implemented
    } else {
        sys_call_ptr_t call = sys_call_table[syscall_nr];

        if (call == sys_ni_syscall) {
            // System call not implemented
            ret = -ENOSYS;
        } else {
            // Call system call handler
            ret = call(
                regs->a0,  // arg1
                regs->a1,  // arg2
                regs->a2,  // arg3
                regs->a3,  // arg4
                regs->a4,  // arg5
                regs->a5   // arg6
            );
        }
    }

    // Store return value in a0
    regs->a0 = ret;

    // Advance program counter past ECALL instruction
    regs->epc += 4;
}
```

**Explanation**:

- **Unique numbers** each system call has unique number
- **Table mapping** sys_call_table maps numbers to handlers
- **Validation** validate system call number before dispatch
- **Handler call** call appropriate handler with arguments
- **Return value** handler return value stored in regs->a0
- **Not implemented** ENOSYS for unimplemented system calls

## Argument Passing

**What**: System call arguments are passed in registers a0 through a5.

**How**: Argument passing works:

```c
// Example: Argument passing conventions
// RISC-V uses registers for first 6 arguments

// Example: System call with different argument types
long sys_write(unsigned long fd, unsigned long buf, unsigned long count) {
    // Arguments already in registers:
    // a0 = fd
    // a1 = buf
    // a2 = count

    // Access arguments
    int file_descriptor = (int)fd;
    char __user *buffer = (char __user *)buf;
    size_t size = (size_t)count;

    // Use arguments
    return ksys_write(file_descriptor, buffer, size);
}

// Example: System call with pointer arguments
long sys_read(unsigned long fd, unsigned long buf, unsigned long count) {
    int file_descriptor = (int)fd;
    char __user *buffer = (char __user *)buf;  // User space pointer
    size_t size = (size_t)count;

    // Validate user pointer
    if (!access_ok(buffer, size)) {
        return -EFAULT;
    }

    // Read from user buffer
    return ksys_read(file_descriptor, buffer, size);
}

// Example: System call with structure argument
// For complex structures, pass pointer
long sys_stat(unsigned long pathname, unsigned long statbuf) {
    char __user *path = (char __user *)pathname;
    struct stat __user *stat = (struct stat __user *)statbuf;

    // Validate pointers
    if (!access_ok(path, 1) || !access_ok(stat, sizeof(*stat))) {
        return -EFAULT;
    }

    // Call implementation
    return ksys_stat(path, stat);
}

// Example: System call with 64-bit arguments
long sys_lseek(unsigned long fd, unsigned long offset_low,
               unsigned long offset_high, unsigned long whence) {
    int file_descriptor = (int)fd;
    loff_t offset = (loff_t)offset_low | ((loff_t)offset_high << 32);
    int when = (int)whence;

    // 64-bit offset constructed from two 32-bit args
    // Or use single 64-bit register on RV64
    return ksys_lseek(file_descriptor, offset, when);
}

// Example: System call with string arguments
long sys_open(unsigned long pathname, unsigned long flags, unsigned long mode) {
    char __user *path = (char __user *)pathname;
    int open_flags = (int)flags;
    umode_t file_mode = (umode_t)mode;

    // Validate path string
    if (!access_ok(path, 1)) {
        return -EFAULT;
    }

    return ksys_open(path, open_flags, file_mode);
}
```

**Explanation**:

- **Register arguments** first 6 arguments in a0-a5 registers
- **Pointer arguments** user pointers must be validated
- **Structure arguments** pass structures via pointers
- **64-bit values** construct 64-bit values from registers
- **Type conversion** cast registers to appropriate types
- **User space access** use access_ok and copy_from_user

## Return Values and Error Codes

**What**: System calls return values in a0, with negative values indicating errors.

**How**: Return values work:

```c
// Example: Return value convention
// Positive or zero: success value
// Negative: error code (errno)

// Example: System call with return value
long sys_getpid(void) {
    // Return process ID
    return current->tgid;
}

// Example: System call returning error
long sys_open(unsigned long pathname, unsigned long flags, unsigned long mode) {
    char __user *path = (char __user *)pathname;

    // Validate path
    if (!access_ok(path, 1)) {
        return -EFAULT;  // Error: bad address
    }

    // Try to open file
    struct file *file = do_open(path, flags, mode);

    if (IS_ERR(file)) {
        return PTR_ERR(file);  // Return error code
    }

    // Return file descriptor
    return fd_install(file);
}

// Example: Error code conversion
// User space: errno = -return_value
// Kernel: return -errno

// Example: System call with different return types
long sys_read(unsigned long fd, unsigned long buf, unsigned long count) {
    ssize_t ret;

    ret = ksys_read((int)fd, (char __user *)buf, (size_t)count);

    // Return value:
    // > 0: number of bytes read
    // = 0: end of file
    // < 0: error code
    return ret;
}

// Example: Common error codes
#define EPERM    1   // Operation not permitted
#define ENOENT   2   // No such file or directory
#define ESRCH    3   // No such process
#define EINTR    4   // Interrupted system call
#define EIO      5   // I/O error
#define ENXIO    6   // No such device or address
#define E2BIG    7   // Argument list too long
#define ENOEXEC  8   // Exec format error
#define EBADF    9   // Bad file descriptor
#define ECHILD  10   // No child processes
#define EAGAIN  11   // Try again
#define ENOMEM  12   // Out of memory
#define EACCES  13   // Permission denied
#define EFAULT  14   // Bad address
#define ENOTBLK 15   // Block device required
#define EBUSY   16   // Device or resource busy
#define EEXIST  17   // File exists
#define EXDEV   18   // Cross-device link
#define ENODEV  19   // No such device
#define ENOTDIR 20   // Not a directory
#define EISDIR  21   // Is a directory
#define EINVAL  22   // Invalid argument
#define ENFILE  23   // File table overflow
#define EMFILE  24   // Too many open files
#define ENOTTY  25   // Not a typewriter
#define ETXTBSY 26   // Text file busy
#define EFBIG   27   // File too large
#define ENOSPC  28   // No space left on device
#define ESPIPE  29   // Illegal seek
#define EROFS   30   // Read-only file system
#define EMLINK  31   // Too many links
#define EPIPE   32   // Broken pipe
#define EDOM    33   // Math argument out of domain
#define ERANGE  34   // Math result not representable
```

**Explanation**:

- **Return register** a0 contains return value
- **Success values** positive/zero indicates success
- **Error codes** negative values indicate errors
- **Error conversion** user space converts -errno to errno
- **Return types** different system calls return different types
- **Standard errors** standard errno values

## User Space System Call Wrappers

**What**: User space libraries provide wrappers for system calls.

**How**: Wrappers work:

```c
// Example: glibc system call wrapper
// In user space C library:

// Write system call wrapper
ssize_t write(int fd, const void *buf, size_t count) {
    ssize_t ret;

    // Invoke system call
    ret = syscall(__NR_write, fd, buf, count);

    // Check for error
    if (ret < 0) {
        errno = -ret;  // Set errno from return value
        return -1;
    }

    // Return success value
    return ret;
}

// Example: Read system call wrapper
ssize_t read(int fd, void *buf, size_t count) {
    ssize_t ret;

    ret = syscall(__NR_read, fd, buf, count);

    if (ret < 0) {
        errno = -ret;
        return -1;
    }

    return ret;
}

// Example: Open system call wrapper
int open(const char *pathname, int flags, ...) {
    int ret;
    mode_t mode = 0;

    // Handle variable arguments
    if (flags & O_CREAT) {
        va_list ap;
        va_start(ap, flags);
        mode = va_arg(ap, mode_t);
        va_end(ap);
    }

    ret = syscall(__NR_open, pathname, flags, mode);

    if (ret < 0) {
        errno = -ret;
        return -1;
    }

    return ret;
}

// Example: Getpid wrapper
pid_t getpid(void) {
    return syscall(__NR_getpid);
}

// Example: Exit wrapper
void exit(int status) {
    syscall(__NR_exit, status);
    // Should never return
    __builtin_unreachable();
}
```

**Explanation**:

- **Library wrappers** C library provides convenient wrappers
- **Error handling** wrappers convert errors to errno
- **Type conversion** wrappers provide proper types
- **Variable arguments** handle variable argument system calls
- **Convenience** simpler interface than raw syscall()

## Next Steps

**What** you're ready for next:

After understanding system call convention, you should be ready to:

1. **Learn System Call Implementation** - How system calls are implemented in kernel
2. **Study Signal Handling** - Signal delivery mechanisms
3. **Understand User/Kernel Transitions** - Detailed transition mechanisms
4. **Explore System Call Tracing** - Debugging system calls
5. **Begin System Programming** - Write system programs

**Where** to go next:

Continue with the next lesson on **"System Call Implementation"** to learn:

- System call handler implementation
- Argument validation
- User space data access
- System call completion
- Special cases

**Why** the next lesson is important:

System call implementation shows how kernel processes system call requests, validates arguments, and implements the actual functionality.

**How** to continue learning:

1. **Study Kernel Code** - Examine system call implementations
2. **Use Strace** - Trace system calls
3. **Write Tests** - Write test programs
4. **Read Documentation** - Study system call documentation
5. **Experiment** - Modify system calls and observe

## Resources

**Official Documentation**:

- [RISC-V ABI Specification](https://github.com/riscv/riscv-abi) - Calling conventions
- [Linux System Calls](https://man7.org/linux/man-pages/man2/syscalls.2.html) - System call documentation

**Kernel Sources**:

- [Linux System Call Table](https://github.com/torvalds/linux/tree/master/kernel/sys.c) - System call implementations

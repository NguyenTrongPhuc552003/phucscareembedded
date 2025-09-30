# Yocto Image Customization

Learn how to customize Yocto images for your embedded projects, including adding custom packages, configurations, and system services.

## Introduction

Yocto image customization allows you to create tailored embedded Linux images for your specific hardware and application requirements. This guide covers various customization techniques for the Rock 5B+ platform.

## Image Types and Selection

### 1. Standard Image Types

```bitbake
# Core images
core-image-minimal          # Minimal system
core-image-base            # Basic system with tools
core-image-sato            # X11-based system
core-image-weston          # Wayland-based system

# Development images
core-image-sdk             # SDK for development
core-image-toolchain       # Cross-compilation tools
core-image-dev             # Development tools

# Specialized images
core-image-rt              # Real-time system
core-image-multilib        # Multi-library support
```

### 2. Custom Image Recipe

```bitbake
# custom-image.bb
DESCRIPTION = "Custom embedded image for Rock 5B+"
LICENSE = "MIT"

inherit core-image

# Base packages
IMAGE_INSTALL = "packagegroup-core-boot"
IMAGE_INSTALL += "kernel-modules"
IMAGE_INSTALL += "udev"

# Custom packages
IMAGE_INSTALL += "custom-app"
IMAGE_INSTALL += "custom-service"
IMAGE_INSTALL += "custom-config"

# Development packages
IMAGE_INSTALL += "packagegroup-core-tools-debug"
IMAGE_INSTALL += "gdb gdbserver"
IMAGE_INSTALL += "strace tcpdump"

# Network packages
IMAGE_INSTALL += "packagegroup-core-networking"
IMAGE_INSTALL += "openssh openssh-sftp-server"
IMAGE_INSTALL += "ntp ntpdate"

# Graphics packages
IMAGE_INSTALL += "packagegroup-core-x11"
IMAGE_INSTALL += "xserver-xorg"
IMAGE_INSTALL += "xterm"

# Audio packages
IMAGE_INSTALL += "packagegroup-core-audio"
IMAGE_INSTALL += "alsa-utils"
IMAGE_INSTALL += "pulseaudio"

# System configuration
IMAGE_INSTALL += "custom-systemd-units"
IMAGE_INSTALL += "custom-scripts"
IMAGE_INSTALL += "custom-firmware"
```

## Package Groups

### 1. Creating Package Groups

```bitbake
# packagegroup-custom.bb
DESCRIPTION = "Custom package group for embedded system"
LICENSE = "MIT"

inherit packagegroup

PACKAGES = "${PN}"

RDEPENDS_${PN} = " \
    custom-app \
    custom-service \
    custom-config \
    packagegroup-core-boot \
    packagegroup-core-networking \
    packagegroup-core-tools-debug \
"

# Optional packages
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'x11', 'packagegroup-core-x11', '', d)}"
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'audio', 'packagegroup-core-audio', '', d)}"
```

### 2. Conditional Package Groups

```bitbake
# packagegroup-custom-optional.bb
DESCRIPTION = "Optional packages for custom system"
LICENSE = "MIT"

inherit packagegroup

PACKAGES = "${PN}"

# Graphics packages
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'x11', 'packagegroup-core-x11', '', d)}"
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'wayland', 'packagegroup-core-wayland', '', d)}"

# Audio packages
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'audio', 'packagegroup-core-audio', '', d)}"

# Network packages
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'wifi', 'packagegroup-core-wifi', '', d)}"
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'bluetooth', 'packagegroup-core-bluetooth', '', d)}"
```

## System Configuration

### 1. Custom Systemd Units

```bitbake
# custom-systemd-units.bb
DESCRIPTION = "Custom systemd units for embedded system"
LICENSE = "MIT"

inherit systemd

SYSTEMD_SERVICE_${PN} = "custom-app.service"
SYSTEMD_SERVICE_${PN} += "custom-service.service"

FILES_${PN} += "${systemd_system_unitdir}/custom-app.service"
FILES_${PN} += "${systemd_system_unitdir}/custom-service.service"

do_install() {
    install -d ${D}${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/custom-app.service ${D}${systemd_system_unitdir}/
    install -m 0644 ${WORKDIR}/custom-service.service ${D}${systemd_system_unitdir}/
}
```

### 2. Systemd Service Files

```ini
# custom-app.service
[Unit]
Description=Custom Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/custom-app
ExecStart=/opt/custom-app/custom-app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 3. Custom Scripts

```bitbake
# custom-scripts.bb
DESCRIPTION = "Custom scripts for embedded system"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${bindir}/custom-init"
FILES_${PN} += "${sysconfdir}/init.d/custom-service"

do_install() {
    install -d ${D}${bindir}
    install -d ${D}${sysconfdir}/init.d
    
    install -m 0755 ${WORKDIR}/custom-init ${D}${bindir}/
    install -m 0755 ${WORKDIR}/custom-service ${D}${sysconfdir}/init.d/
}
```

## File System Customization

### 1. Custom Directories

```bitbake
# custom-filesystem.bb
DESCRIPTION = "Custom filesystem structure"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${localstatedir}/custom-app/"
FILES_${PN} += "${sysconfdir}/custom-app/"
FILES_${PN} += "${datadir}/custom-app/"

do_install() {
    # Create custom directories
    install -d ${D}${localstatedir}/custom-app
    install -d ${D}${localstatedir}/log/custom-app
    install -d ${D}${sysconfdir}/custom-app
    install -d ${D}${datadir}/custom-app
    
    # Set permissions
    chmod 755 ${D}${localstatedir}/custom-app
    chmod 755 ${D}${localstatedir}/log/custom-app
    chmod 755 ${D}${sysconfdir}/custom-app
    chmod 755 ${D}${datadir}/custom-app
}
```

### 2. Configuration Files

```bitbake
# custom-config.bb
DESCRIPTION = "Custom configuration files"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/custom-app.conf"
FILES_${PN} += "${sysconfdir}/custom-app.d/"

do_install() {
    install -d ${D}${sysconfdir}
    install -d ${D}${sysconfdir}/custom-app.d
    
    install -m 0644 ${WORKDIR}/custom-app.conf ${D}${sysconfdir}/
    install -m 0644 ${WORKDIR}/*.conf ${D}${sysconfdir}/custom-app.d/
}
```

### 3. Firmware and Drivers

```bitbake
# custom-firmware.bb
DESCRIPTION = "Custom firmware for embedded system"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${nonarch_base_libdir}/firmware/custom/"
FILES_${PN} += "${nonarch_base_libdir}/firmware/custom-driver/"

do_install() {
    install -d ${D}${nonarch_base_libdir}/firmware/custom
    install -d ${D}${nonarch_base_libdir}/firmware/custom-driver
    
    install -m 0644 ${WORKDIR}/*.bin ${D}${nonarch_base_libdir}/firmware/custom/
    install -m 0644 ${WORKDIR}/*.fw ${D}${nonarch_base_libdir}/firmware/custom-driver/
}
```

## Boot Configuration

### 1. Bootloader Configuration

```bitbake
# custom-bootloader.bb
DESCRIPTION = "Custom bootloader configuration"
LICENSE = "MIT"

inherit deploy

FILES_${PN} = "${DEPLOY_DIR_IMAGE}/u-boot.img"
FILES_${PN} += "${DEPLOY_DIR_IMAGE}/u-boot.cfg"

do_deploy() {
    install -d ${D}${DEPLOY_DIR_IMAGE}
    install -m 0644 ${WORKDIR}/u-boot.img ${D}${DEPLOY_DIR_IMAGE}/
    install -m 0644 ${WORKDIR}/u-boot.cfg ${D}${DEPLOY_DIR_IMAGE}/
}
```

### 2. Kernel Configuration

```bitbake
# custom-kernel.bb
DESCRIPTION = "Custom kernel configuration"
LICENSE = "MIT"

inherit kernel

# Kernel configuration
KERNEL_CONFIG_COMMAND = "oe_runmake_call -C ${S} O=${B} olddefconfig"
KERNEL_CONFIG_COMMAND += " && oe_runmake_call -C ${S} O=${B} menuconfig"

# Custom kernel patches
SRC_URI += "file://0001-custom-kernel-patch.patch"
SRC_URI += "file://0002-enable-custom-driver.patch"

# Kernel modules
KERNEL_MODULE_AUTOLOAD += "custom-driver"
KERNEL_MODULE_AUTOLOAD += "custom-sensor"
```

### 3. Device Tree Customization

```bitbake
# custom-device-tree.bb
DESCRIPTION = "Custom device tree for Rock 5B+"
LICENSE = "MIT"

inherit deploy

FILES_${PN} = "${DEPLOY_DIR_IMAGE}/custom.dtb"
FILES_${PN} += "${DEPLOY_DIR_IMAGE}/custom-overlay.dtbo"

do_deploy() {
    install -d ${D}${DEPLOY_DIR_IMAGE}
    install -m 0644 ${WORKDIR}/custom.dtb ${D}${DEPLOY_DIR_IMAGE}/
    install -m 0644 ${WORKDIR}/custom-overlay.dtbo ${D}${DEPLOY_DIR_IMAGE}/
}
```

## Network Configuration

### 1. Network Services

```bitbake
# custom-network.bb
DESCRIPTION = "Custom network configuration"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/network/"
FILES_${PN} += "${sysconfdir}/netplan/"

do_install() {
    install -d ${D}${sysconfdir}/network
    install -d ${D}${sysconfdir}/netplan
    
    install -m 0644 ${WORKDIR}/interfaces ${D}${sysconfdir}/network/
    install -m 0644 ${WORKDIR}/custom.yaml ${D}${sysconfdir}/netplan/
}
```

### 2. SSH Configuration

```bitbake
# custom-ssh.bb
DESCRIPTION = "Custom SSH configuration"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/ssh/"

do_install() {
    install -d ${D}${sysconfdir}/ssh
    
    install -m 0644 ${WORKDIR}/sshd_config ${D}${sysconfdir}/ssh/
    install -m 0600 ${WORKDIR}/ssh_host_rsa_key ${D}${sysconfdir}/ssh/
    install -m 0644 ${WORKDIR}/ssh_host_rsa_key.pub ${D}${sysconfdir}/ssh/
}
```

## Security Configuration

### 1. Firewall Rules

```bitbake
# custom-firewall.bb
DESCRIPTION = "Custom firewall configuration"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/iptables/"

do_install() {
    install -d ${D}${sysconfdir}/iptables
    
    install -m 0644 ${WORKDIR}/iptables.rules ${D}${sysconfdir}/iptables/
    install -m 0755 ${WORKDIR}/iptables-restore ${D}${sysconfdir}/iptables/
}
```

### 2. User Management

```bitbake
# custom-users.bb
DESCRIPTION = "Custom user accounts"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/passwd"
FILES_${PN} += "${sysconfdir}/group"
FILES_${PN} += "${sysconfdir}/shadow"

do_install() {
    install -d ${D}${sysconfdir}
    
    install -m 0644 ${WORKDIR}/passwd ${D}${sysconfdir}/
    install -m 0644 ${WORKDIR}/group ${D}${sysconfdir}/
    install -m 0600 ${WORKDIR}/shadow ${D}${sysconfdir}/
}
```

## Performance Optimization

### 1. System Tuning

```bitbake
# custom-tuning.bb
DESCRIPTION = "System performance tuning"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/sysctl.conf"
FILES_${PN} += "${sysconfdir}/limits.conf"

do_install() {
    install -d ${D}${sysconfdir}
    
    install -m 0644 ${WORKDIR}/sysctl.conf ${D}${sysconfdir}/
    install -m 0644 ${WORKDIR}/limits.conf ${D}${sysconfdir}/
}
```

### 2. Memory Management

```bitbake
# custom-memory.bb
DESCRIPTION = "Memory management configuration"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${sysconfdir}/cgroup/"
FILES_${PN} += "${sysconfdir}/systemd/system/"

do_install() {
    install -d ${D}${sysconfdir}/cgroup
    install -d ${D}${sysconfdir}/systemd/system
    
    install -m 0644 ${WORKDIR}/cgroup.conf ${D}${sysconfdir}/cgroup/
    install -m 0644 ${WORKDIR}/memory.service ${D}${sysconfdir}/systemd/system/
}
```

## Testing and Validation

### 1. Image Testing

```bitbake
# custom-image-test.bb
DESCRIPTION = "Custom image testing"
LICENSE = "MIT"

inherit core-image

# Test packages
IMAGE_INSTALL += "packagegroup-core-tools-test"
IMAGE_INSTALL += "custom-test-suite"

# Test configuration
IMAGE_INSTALL += "custom-test-config"
IMAGE_INSTALL += "custom-test-scripts"
```

### 2. Validation Scripts

```bitbake
# custom-validation.bb
DESCRIPTION = "Image validation scripts"
LICENSE = "MIT"

inherit allarch

FILES_${PN} = "${bindir}/validate-image"
FILES_${PN} += "${bindir}/test-system"

do_install() {
    install -d ${D}${bindir}
    
    install -m 0755 ${WORKDIR}/validate-image ${D}${bindir}/
    install -m 0755 ${WORKDIR}/test-system ${D}${bindir}/
}
```

## Best Practices

### 1. Image Organization
- Use descriptive names
- Group related packages
- Maintain consistent structure
- Document customizations

### 2. Performance Considerations
- Minimize image size
- Optimize boot time
- Reduce memory usage
- Improve responsiveness

### 3. Security
- Implement proper access controls
- Use secure configurations
- Regular security updates
- Monitor system integrity

## Conclusion

Yocto image customization is essential for creating tailored embedded systems. By following this guide and implementing the provided examples, you can create robust and efficient custom images for your projects.

Remember to:
- Test customizations thoroughly
- Document your changes
- Use version control
- Follow best practices

## Resources

- [Yocto Project Documentation](https://docs.yoctoproject.org/)
- [OpenEmbedded Core](https://github.com/openembedded/openembedded-core)
- [Rock 5B+ Yocto Support](https://wiki.radxa.com/Rock5/software/yocto)
- [Embedded Linux Development](https://elinux.org/)

Happy customizing! 🔧

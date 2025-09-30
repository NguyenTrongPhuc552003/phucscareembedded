# Creating Custom Yocto Recipes

Learn how to create custom recipes for the Yocto Project to build and package your own software components.

## Introduction

Yocto recipes are the building blocks of the Yocto Project. They define how to fetch, configure, compile, and package software components. This guide covers creating custom recipes for your embedded projects.

## Recipe Structure

### 1. Basic Recipe Template

```bitbake
# custom-app_1.0.bb
SUMMARY = "Custom application for embedded system"
DESCRIPTION = "A custom application designed for Rock 5B+ embedded development"
HOMEPAGE = "https://github.com/your-org/custom-app"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://LICENSE;md5=1234567890abcdef"

SRC_URI = "git://github.com/your-org/custom-app.git;protocol=https;branch=main"
SRCREV = "1234567890abcdef1234567890abcdef12345678"

S = "${WORKDIR}/git"

inherit cmake

DEPENDS = "libc6 libstdc++"
RDEPENDS_${PN} = "libc6 libstdc++"

FILES_${PN} = "${bindir}/custom-app"
```

### 2. Recipe Metadata

```bitbake
# Recipe metadata
SUMMARY = "Brief description of the package"
DESCRIPTION = "Detailed description of the package functionality"
HOMEPAGE = "https://example.com"
LICENSE = "MIT|GPL-2.0|Apache-2.0"
LIC_FILES_CHKSUM = "file://LICENSE;md5=1234567890abcdef"

# Source information
SRC_URI = "git://github.com/user/repo.git;protocol=https;branch=main"
SRCREV = "commit-hash-or-tag"
S = "${WORKDIR}/git"

# Build system
inherit cmake
# or
inherit autotools
# or
inherit meson
```

## Source Code Management

### 1. Git Repository

```bitbake
# Git repository with specific branch
SRC_URI = "git://github.com/user/repo.git;protocol=https;branch=main"
SRCREV = "1234567890abcdef1234567890abcdef12345678"

# Git repository with tag
SRC_URI = "git://github.com/user/repo.git;protocol=https;tag=v1.0.0"
SRCREV = "v1.0.0"

# Git repository with submodules
SRC_URI = "git://github.com/user/repo.git;protocol=https;branch=main"
SRC_URI += "file://0001-fix-build-issue.patch"
```

### 2. Local Files

```bitbake
# Local source files
SRC_URI = "file://custom-app-${PV}.tar.gz"
SRC_URI += "file://0001-fix-compilation.patch"
SRC_URI += "file://custom-app.service"

# Local patches
SRC_URI += "file://0001-fix-build-issue.patch"
SRC_URI += "file://0002-add-feature.patch"
```

### 3. Multiple Sources

```bitbake
# Multiple source locations
SRC_URI = "git://github.com/user/repo.git;protocol=https;branch=main"
SRC_URI += "file://0001-fix-build-issue.patch"
SRC_URI += "file://custom-app.service"
SRC_URI += "file://custom-app.conf"
```

## Build System Integration

### 1. CMake Integration

```bitbake
# CMake-based recipe
inherit cmake

# CMake configuration options
EXTRA_OECMAKE = "-DCMAKE_BUILD_TYPE=Release"
EXTRA_OECMAKE += "-DENABLE_TESTS=OFF"
EXTRA_OECMAKE += "-DINSTALL_PREFIX=${prefix}"

# CMake dependencies
DEPENDS = "cmake-native libc6 libstdc++"
RDEPENDS_${PN} = "libc6 libstdc++"
```

### 2. Autotools Integration

```bitbake
# Autotools-based recipe
inherit autotools

# Autotools configuration
EXTRA_OECONF = "--enable-shared --disable-static"
EXTRA_OECONF += "--with-prefix=${prefix}"

# Autotools dependencies
DEPENDS = "autoconf-native automake-native libtool-native"
RDEPENDS_${PN} = "libc6 libstdc++"
```

### 3. Meson Integration

```bitbake
# Meson-based recipe
inherit meson

# Meson configuration options
EXTRA_OEMESON = "-Dbuildtype=release"
EXTRA_OEMESON += "-Ddefault_library=shared"

# Meson dependencies
DEPENDS = "meson-native ninja-native"
RDEPENDS_${PN} = "libc6 libstdc++"
```

## Dependencies and Requirements

### 1. Build Dependencies

```bitbake
# Build-time dependencies
DEPENDS = "cmake-native libc6 libstdc++"
DEPENDS += "pkgconfig-native"
DEPENDS += "autoconf-native automake-native"

# Runtime dependencies
RDEPENDS_${PN} = "libc6 libstdc++"
RDEPENDS_${PN} += "libssl libcrypto"
```

### 2. Conditional Dependencies

```bitbake
# Conditional dependencies
DEPENDS += "${@bb.utils.contains('DISTRO_FEATURES', 'x11', 'libx11', '', d)}"
RDEPENDS_${PN} += "${@bb.utils.contains('DISTRO_FEATURES', 'x11', 'libx11', '', d)}"
```

### 3. Virtual Dependencies

```bitbake
# Virtual dependencies
DEPENDS += "virtual/libc"
RDEPENDS_${PN} += "virtual/libc"
```

## File Installation

### 1. Basic File Installation

```bitbake
# Install files
FILES_${PN} = "${bindir}/custom-app"
FILES_${PN} += "${libdir}/libcustom.so"
FILES_${PN} += "${sysconfdir}/custom-app.conf"

# Install directories
FILES_${PN} += "${datadir}/custom-app/"
FILES_${PN} += "${localstatedir}/custom-app/"
```

### 2. Package Splitting

```bitbake
# Split into multiple packages
PACKAGES = "${PN} ${PN}-dev ${PN}-dbg ${PN}-doc"

# Development package
FILES_${PN}-dev = "${includedir}/custom-app/"
FILES_${PN}-dev += "${libdir}/libcustom.so"

# Debug package
FILES_${PN}-dbg = "${bindir}/.debug/"
FILES_${PN}-dbg += "${libdir}/.debug/"

# Documentation package
FILES_${PN}-doc = "${docdir}/custom-app/"
FILES_${PN}-doc += "${mandir}/man1/custom-app.1"
```

### 3. Service Files

```bitbake
# Systemd service
FILES_${PN} += "${systemd_system_unitdir}/custom-app.service"

# Install service file
do_install_append() {
    install -d ${D}${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/custom-app.service ${D}${systemd_system_unitdir}/
}
```

## Build Configuration

### 1. Compiler Flags

```bitbake
# Compiler flags
TARGET_CC_ARCH += "-O2 -Wall"
TARGET_CXXFLAGS += "-std=c++17"

# Architecture-specific flags
TARGET_CC_ARCH_append_arm = " -march=armv8-a"
TARGET_CC_ARCH_append_aarch64 = " -march=armv8-a"
```

### 2. Build Options

```bitbake
# Build options
EXTRA_OECMAKE = "-DCMAKE_BUILD_TYPE=Release"
EXTRA_OECMAKE += "-DENABLE_TESTS=OFF"
EXTRA_OECMAKE += "-DINSTALL_PREFIX=${prefix}"

# Conditional build options
EXTRA_OECMAKE += "${@bb.utils.contains('DISTRO_FEATURES', 'x11', '-DENABLE_X11=ON', '', d)}"
```

### 3. Environment Variables

```bitbake
# Environment variables
export CFLAGS = "${TARGET_CC_ARCH}"
export CXXFLAGS = "${TARGET_CXXFLAGS}"
export LDFLAGS = "${TARGET_LDFLAGS}"
```

## Custom Tasks

### 1. Pre-build Tasks

```bitbake
# Pre-build task
do_configure_prepend() {
    # Custom configuration steps
    echo "Configuring custom application..."
    sed -i 's/DEBUG=1/DEBUG=0/' ${S}/Makefile
}
```

### 2. Post-build Tasks

```bitbake
# Post-build task
do_install_append() {
    # Custom installation steps
    install -d ${D}${sysconfdir}/custom-app
    install -m 0644 ${WORKDIR}/custom-app.conf ${D}${sysconfdir}/custom-app/
    
    # Create directories
    install -d ${D}${localstatedir}/custom-app
    install -d ${D}${localstatedir}/log/custom-app
}
```

### 3. Clean Tasks

```bitbake
# Clean task
do_clean() {
    # Custom cleanup steps
    rm -rf ${S}/build
    rm -rf ${S}/.git
}
```

## Testing and Validation

### 1. Unit Tests

```bitbake
# Enable tests
EXTRA_OECMAKE += "-DENABLE_TESTS=ON"

# Run tests
do_compile_append() {
    # Run unit tests
    cd ${S}
    make test
}
```

### 2. Integration Tests

```bitbake
# Integration tests
do_install_append() {
    # Install test scripts
    install -d ${D}${bindir}/tests
    install -m 0755 ${S}/tests/test-script.sh ${D}${bindir}/tests/
}
```

### 3. Validation

```bitbake
# Validation task
do_validate() {
    # Check installed files
    if [ ! -f ${D}${bindir}/custom-app ]; then
        bbfatal "custom-app binary not found"
    fi
    
    # Check file permissions
    if [ ! -x ${D}${bindir}/custom-app ]; then
        bbfatal "custom-app binary not executable"
    fi
}
```

## Advanced Features

### 1. Conditional Builds

```bitbake
# Conditional build
python do_configure() {
    if bb.utils.contains('DISTRO_FEATURES', 'x11', True, False, d):
        d.setVar('EXTRA_OECMAKE', d.getVar('EXTRA_OECMAKE') + ' -DENABLE_X11=ON')
    else:
        d.setVar('EXTRA_OECMAKE', d.getVar('EXTRA_OECMAKE') + ' -DENABLE_X11=OFF')
}
```

### 2. Dynamic Dependencies

```bitbake
# Dynamic dependencies
python do_configure() {
    if bb.utils.contains('DISTRO_FEATURES', 'x11', True, False, d):
        d.setVar('DEPENDS', d.getVar('DEPENDS') + ' libx11')
        d.setVar('RDEPENDS_${PN}', d.getVar('RDEPENDS_${PN}') + ' libx11')
}
```

### 3. Custom Variables

```bitbake
# Custom variables
CUSTOM_APP_VERSION = "1.0.0"
CUSTOM_APP_REVISION = "1234567"

# Use in recipe
SRC_URI = "git://github.com/user/repo.git;protocol=https;tag=v${CUSTOM_APP_VERSION}"
SRCREV = "${CUSTOM_APP_REVISION}"
```

## Best Practices

### 1. Recipe Organization
- Use descriptive names
- Group related recipes
- Use consistent naming conventions
- Document recipe purpose

### 2. Error Handling
- Use proper error checking
- Implement fallback mechanisms
- Provide meaningful error messages
- Log important operations

### 3. Performance
- Minimize build time
- Use parallel builds
- Optimize dependencies
- Cache build artifacts

## Troubleshooting

### 1. Common Issues
- Build failures
- Dependency problems
- File installation errors
- Runtime issues

### 2. Debugging Techniques
- Use verbose output
- Check build logs
- Validate dependencies
- Test in clean environment

### 3. Solutions
- Update dependencies
- Fix build scripts
- Correct file paths
- Validate configurations

## Conclusion

Creating custom Yocto recipes is essential for embedded development. By following this guide and implementing the provided examples, you can create robust and maintainable recipes for your projects.

Remember to:
- Test recipes thoroughly
- Document your changes
- Use version control
- Follow best practices

## Resources

- [Yocto Project Documentation](https://docs.yoctoproject.org/)
- [BitBake User Manual](https://docs.yoctoproject.org/bitbake/)
- [OpenEmbedded Core](https://github.com/openembedded/openembedded-core)
- [Rock 5B+ Yocto Support](https://wiki.radxa.com/Rock5/software/yocto)

Happy building! 🔧

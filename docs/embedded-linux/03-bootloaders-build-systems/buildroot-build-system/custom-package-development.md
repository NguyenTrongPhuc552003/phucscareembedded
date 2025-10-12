# Custom Package Development

## What is Custom Package Development?

Custom package development in Buildroot involves creating packages for software that isn't available in the official Buildroot package repository. This includes proprietary software, custom applications, or modified versions of existing packages.

### Package Types

- **Generic Packages**: Standard software packages with configure/make/install
- **CMake Packages**: Packages using CMake build system
- **Python Packages**: Python modules and applications
- **Go Packages**: Go modules and applications
- **Node.js Packages**: Node.js modules and applications

## Why Develop Custom Packages?

### Requirements

- **Proprietary Software**: Company-specific or proprietary applications
- **Custom Modifications**: Modified versions of existing software
- **New Software**: Recently released software not yet in Buildroot
- **Integration**: Software that needs specific integration with target system

### Benefits

- **Control**: Full control over package configuration and build process
- **Optimization**: Optimize packages for specific target hardware
- **Integration**: Seamless integration with Buildroot build system
- **Maintenance**: Easy maintenance and updates

## When to Develop Custom Packages?

### Development Phase

- **Prototyping**: Rapid prototyping of new features
- **Testing**: Testing new software on target hardware
- **Integration**: Integrating software with existing system

### Production Phase

- **Deployment**: Deploying custom software to production systems
- **Updates**: Updating custom software components
- **Maintenance**: Maintaining custom software packages

## Where are Custom Packages Located?

### Package Directory Structure

```
package/
├── mypackage/
│   ├── Config.in          # Package configuration
│   ├── mypackage.mk       # Package makefile
│   ├── mypackage.hash     # Package hash file
│   └── patches/           # Package patches
│       ├── 0001-fix-build.patch
│       └── 0002-add-feature.patch
```

### Board-Specific Packages

```
board/
├── rock5b/
│   ├── packages/
│   │   ├── mypackage/
│   │   │   ├── Config.in
│   │   │   └── mypackage.mk
│   │   └── anotherpackage/
│   └── overlay/
```

## How to Develop Custom Packages?

### 1. Generic Package Development

#### Package Configuration File

```makefile
# package/mypackage/Config.in
config BR2_PACKAGE_MYPACKAGE
    bool "mypackage"
    depends on BR2_PACKAGE_LIBUSB
    depends on BR2_PACKAGE_OPENSSL
    select BR2_PACKAGE_LIBPTHREAD
    help
      My custom package for embedded Linux.

      This package provides custom functionality
      for embedded systems.

      https://github.com/user/mypackage
```

#### Package Makefile

```makefile
# package/mypackage/mypackage.mk
MYPACKAGE_VERSION = 1.2.3
MYPACKAGE_SITE = https://github.com/user/mypackage/archive
MYPACKAGE_SOURCE = v$(MYPACKAGE_VERSION).tar.gz
MYPACKAGE_LICENSE = GPL-2.0
MYPACKAGE_LICENSE_FILES = LICENSE
MYPACKAGE_DEPENDENCIES = libusb openssl

# Build configuration
MYPACKAGE_CONF_OPTS = \
    --enable-debug \
    --with-openssl \
    --with-libusb

# Build commands
define MYPACKAGE_BUILD_CMDS
    $(MAKE) $(TARGET_CONFIGURE_OPTS) -C $(@D)
endef

# Install commands
define MYPACKAGE_INSTALL_TARGET_CMDS
    $(INSTALL) -D -m 0755 $(@D)/mypackage $(TARGET_DIR)/usr/bin/mypackage
    $(INSTALL) -D -m 0644 $(@D)/mypackage.conf $(TARGET_DIR)/etc/mypackage.conf
    $(INSTALL) -D -m 0755 $(@D)/mypackage.service $(TARGET_DIR)/etc/systemd/system/mypackage.service
endef

# Install to staging directory
define MYPACKAGE_INSTALL_STAGING_CMDS
    $(INSTALL) -D -m 0644 $(@D)/mypackage.h $(STAGING_DIR)/usr/include/mypackage.h
    $(INSTALL) -D -m 0644 $(@D)/libmypackage.a $(STAGING_DIR)/usr/lib/libmypackage.a
    $(INSTALL) -D -m 0755 $(@D)/libmypackage.so $(STAGING_DIR)/usr/lib/libmypackage.so
endef

$(eval $(generic-package))
```

#### Package Hash File

```bash
# package/mypackage/mypackage.hash
# sha256  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
sha256  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2  v1.2.3.tar.gz
```

### 2. CMake Package Development

#### CMake Package Makefile

```makefile
# package/mypackage/mypackage.mk
MYPACKAGE_VERSION = 2.0.0
MYPACKAGE_SITE = https://github.com/user/mypackage/archive
MYPACKAGE_SOURCE = v$(MYPACKAGE_VERSION).tar.gz
MYPACKAGE_LICENSE = MIT
MYPACKAGE_LICENSE_FILES = LICENSE
MYPACKAGE_DEPENDENCIES = cmake

# CMake configuration options
MYPACKAGE_CONF_OPTS = \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/usr \
    -DENABLE_TESTS=OFF \
    -DENABLE_DOCS=OFF

# Build commands
define MYPACKAGE_BUILD_CMDS
    $(TARGET_MAKE_ENV) $(MAKE) -C $(@D)/build
endef

# Install commands
define MYPACKAGE_INSTALL_TARGET_CMDS
    $(TARGET_MAKE_ENV) $(MAKE) -C $(@D)/build install
endef

$(eval $(cmake-package))
```

### 3. Python Package Development

#### Python Package Makefile

```makefile
# package/mypackage/mypackage.mk
MYPACKAGE_VERSION = 1.0.0
MYPACKAGE_SITE = https://pypi.org/packages/source/m/mypackage
MYPACKAGE_SOURCE = mypackage-$(MYPACKAGE_VERSION).tar.gz
MYPACKAGE_LICENSE = Apache-2.0
MYPACKAGE_LICENSE_FILES = LICENSE
MYPACKAGE_DEPENDENCIES = python3

# Python package configuration
MYPACKAGE_SETUP_TYPE = setuptools
MYPACKAGE_PYTHON_DEPENDENCIES = requests numpy

# Install commands
define MYPACKAGE_INSTALL_TARGET_CMDS
    $(TARGET_MAKE_ENV) $(MAKE) -C $(@D) install
endef

$(eval $(python-package))
```

### 4. Go Package Development

#### Go Package Makefile

```makefile
# package/mypackage/mypackage.mk
MYPACKAGE_VERSION = 1.0.0
MYPACKAGE_SITE = https://github.com/user/mypackage/archive
MYPACKAGE_SOURCE = v$(MYPACKAGE_VERSION).tar.gz
MYPACKAGE_LICENSE = MIT
MYPACKAGE_LICENSE_FILES = LICENSE
MYPACKAGE_DEPENDENCIES = go

# Go package configuration
MYPACKAGE_GOPATH = $(@D)/gopath
MYPACKAGE_BUILD_TARGETS = ./cmd/mypackage

# Build commands
define MYPACKAGE_BUILD_CMDS
    cd $(@D) && \
    $(HOST_DIR)/bin/go build -o mypackage $(MYPACKAGE_BUILD_TARGETS)
endef

# Install commands
define MYPACKAGE_INSTALL_TARGET_CMDS
    $(INSTALL) -D -m 0755 $(@D)/mypackage $(TARGET_DIR)/usr/bin/mypackage
endef

$(eval $(generic-package))
```

### 5. Package Patching

#### Create Patches

```bash
# Create patch directory
mkdir -p package/mypackage/patches

# Create patch for build fixes
cat > package/mypackage/patches/0001-fix-build.patch << 'EOF'
--- a/configure.ac
+++ b/configure.ac
@@ -10,7 +10,7 @@ AC_PROG_CC
 AC_PROG_CXX
 AC_PROG_INSTALL
 AC_PROG_LN_S
-AC_PROG_RANLIB
+AC_PROG_RANLIB([${CROSS_COMPILE}ranlib])

 # Check for required libraries
 AC_CHECK_LIB([usb-1.0], [libusb_init])
EOF

# Create patch for feature additions
cat > package/mypackage/patches/0002-add-feature.patch << 'EOF'
--- a/src/main.c
+++ b/src/main.c
@@ -5,6 +5,7 @@
 #include <stdlib.h>
 #include <string.h>
 #include <unistd.h>
+#include <mypackage.h>

 int main(int argc, char *argv[]) {
     printf("My Package v1.0.0\n");
+    mypackage_init();
     return 0;
 }
EOF
```

### 6. Package Testing

#### Test Script

```bash
#!/bin/bash
# package/mypackage/test_mypackage.sh

# Test script for mypackage
set -e

echo "Testing mypackage..."

# Test basic functionality
if ! mypackage --version; then
    echo "ERROR: mypackage --version failed"
    exit 1
fi

# Test configuration
if ! mypackage --config /etc/mypackage.conf; then
    echo "ERROR: mypackage --config failed"
    exit 1
fi

# Test daemon mode
if ! mypackage --daemon --pid-file /var/run/mypackage.pid; then
    echo "ERROR: mypackage --daemon failed"
    exit 1
fi

# Test stop
if ! kill $(cat /var/run/mypackage.pid); then
    echo "ERROR: Failed to stop mypackage daemon"
    exit 1
fi

echo "All tests passed!"
```

#### Test Makefile

```makefile
# package/mypackage/mypackage.mk
# ... existing configuration ...

# Test commands
define MYPACKAGE_TEST_CMDS
    $(TARGET_MAKE_ENV) $(MAKE) -C $(@D) test
endef

# Test installation
define MYPACKAGE_INSTALL_TARGET_CMDS
    $(INSTALL) -D -m 0755 $(@D)/mypackage $(TARGET_DIR)/usr/bin/mypackage
    $(INSTALL) -D -m 0755 package/mypackage/test_mypackage.sh $(TARGET_DIR)/usr/bin/test_mypackage.sh
endef
```

### 7. Package Dependencies

#### Dependency Management

```makefile
# package/mypackage/mypackage.mk
MYPACKAGE_DEPENDENCIES = \
    libusb \
    openssl \
    json-c \
    $(if $(BR2_PACKAGE_SYSTEMD),systemd) \
    $(if $(BR2_PACKAGE_DBUS),dbus)

# Optional dependencies
ifeq ($(BR2_PACKAGE_MYPACKAGE_OPTIONAL_FEATURE),y)
MYPACKAGE_DEPENDENCIES += optional-package
MYPACKAGE_CONF_OPTS += --enable-optional-feature
endif

# Runtime dependencies
MYPACKAGE_RUNTIME_DEPENDENCIES = \
    libusb \
    openssl \
    json-c
```

#### Dependency Configuration

```makefile
# package/mypackage/Config.in
config BR2_PACKAGE_MYPACKAGE
    bool "mypackage"
    depends on BR2_PACKAGE_LIBUSB
    depends on BR2_PACKAGE_OPENSSL
    select BR2_PACKAGE_JSON_C
    help
      My custom package for embedded Linux.

if BR2_PACKAGE_MYPACKAGE

config BR2_PACKAGE_MYPACKAGE_OPTIONAL_FEATURE
    bool "Enable optional feature"
    depends on BR2_PACKAGE_OPTIONAL_PACKAGE
    help
      Enable optional feature that requires additional package.

endif
```

### 8. Package Configuration

#### Configuration Options

```makefile
# package/mypackage/mypackage.mk
# Configuration options
MYPACKAGE_CONF_OPTS = \
    --prefix=/usr \
    --sysconfdir=/etc \
    --localstatedir=/var \
    --enable-shared \
    --disable-static

# Debug configuration
ifeq ($(BR2_PACKAGE_MYPACKAGE_DEBUG),y)
MYPACKAGE_CONF_OPTS += --enable-debug
MYPACKAGE_CONF_OPTS += --enable-verbose
endif

# Feature configuration
ifeq ($(BR2_PACKAGE_MYPACKAGE_FEATURE_A),y)
MYPACKAGE_CONF_OPTS += --enable-feature-a
endif

ifeq ($(BR2_PACKAGE_MYPACKAGE_FEATURE_B),y)
MYPACKAGE_CONF_OPTS += --enable-feature-b
endif
```

#### Configuration File

```makefile
# package/mypackage/Config.in
config BR2_PACKAGE_MYPACKAGE
    bool "mypackage"
    depends on BR2_PACKAGE_LIBUSB
    help
      My custom package for embedded Linux.

if BR2_PACKAGE_MYPACKAGE

config BR2_PACKAGE_MYPACKAGE_DEBUG
    bool "Enable debug support"
    help
      Enable debug support and verbose output.

config BR2_PACKAGE_MYPACKAGE_FEATURE_A
    bool "Enable feature A"
    help
      Enable feature A functionality.

config BR2_PACKAGE_MYPACKAGE_FEATURE_B
    bool "Enable feature B"
    depends on BR2_PACKAGE_OPTIONAL_PACKAGE
    help
      Enable feature B functionality.

endif
```

## Best Practices

### Package Development

1. **Standards**: Follow Buildroot package development standards
2. **Testing**: Test packages on target hardware
3. **Documentation**: Document package functionality and dependencies
4. **Maintenance**: Keep packages updated and maintained

### Configuration Management

1. **Version Control**: Keep package configurations in version control
2. **Documentation**: Document all configuration options
3. **Testing**: Test configurations on multiple hardware platforms
4. **Backup**: Maintain backup configurations for recovery

### Build Optimization

1. **Parallel Building**: Use parallel building for faster builds
2. **Caching**: Implement build caching for repeated builds
3. **Incremental Builds**: Use incremental builds for development
4. **Monitoring**: Monitor build performance and identify bottlenecks

## Conclusion

Custom package development in Buildroot provides a powerful way to integrate custom software into embedded Linux systems. By following best practices and understanding the package development process, developers can create robust and maintainable packages that integrate seamlessly with the Buildroot build system.

## Further Reading

- [Buildroot Package Development](https://buildroot.org/downloads/manual/manual.html#adding-packages)
- [Buildroot Package Types](https://buildroot.org/downloads/manual/manual.html#adding-packages)
- [Buildroot Patches](https://buildroot.org/downloads/manual/manual.html#adding-patches)
- [Buildroot Dependencies](https://buildroot.org/downloads/manual/manual.html#adding-packages-dependencies)

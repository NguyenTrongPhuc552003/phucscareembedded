# Yocto SDK Generation

Learn how to generate and use Software Development Kits (SDKs) from Yocto builds for cross-compilation and development.

## Introduction

Yocto SDKs provide a complete development environment for cross-compiling applications for your target hardware. This guide covers SDK generation, configuration, and usage for Rock 5B+ development.

## SDK Types

### 1. Standard SDK

```bash
# Generate standard SDK
bitbake core-image-sato -c populate_sdk

# SDK location
ls tmp/deploy/sdk/
```

### 2. Extensible SDK

```bash
# Generate extensible SDK
bitbake core-image-sato -c populate_sdk_ext

# Extensible SDK location
ls tmp/deploy/sdk/
```

### 3. Custom SDK

```bash
# Generate custom SDK
bitbake custom-image -c populate_sdk

# Custom SDK location
ls tmp/deploy/sdk/
```

## SDK Generation

### 1. Basic SDK Generation

```bitbake
# custom-sdk.bb
DESCRIPTION = "Custom SDK for Rock 5B+ development"
LICENSE = "MIT"

inherit populate_sdk

# SDK packages
TOOLCHAIN_TARGET_TASK = "packagegroup-core-toolchain-target"
TOOLCHAIN_HOST_TASK = "packagegroup-core-toolchain-host"

# Additional packages
TOOLCHAIN_TARGET_TASK += "custom-app-dev"
TOOLCHAIN_TARGET_TASK += "custom-lib-dev"
TOOLCHAIN_HOST_TASK += "cmake-native"
TOOLCHAIN_HOST_TASK += "ninja-native"
```

### 2. SDK Configuration

```bitbake
# SDK configuration
SDK_MACHINE = "aarch64"
SDK_ARCH = "aarch64"
SDK_VENDOR = "custom"
SDK_VERSION = "1.0.0"

# SDK packages
SDK_PACKAGES = "packagegroup-core-toolchain-target"
SDK_PACKAGES += "packagegroup-core-toolchain-host"
SDK_PACKAGES += "custom-app-dev"
SDK_PACKAGES += "custom-lib-dev"
```

### 3. SDK Dependencies

```bitbake
# SDK dependencies
DEPENDS = "packagegroup-core-toolchain-target"
DEPENDS += "packagegroup-core-toolchain-host"
DEPENDS += "cmake-native"
DEPENDS += "ninja-native"
DEPENDS += "pkgconfig-native"
```

## SDK Installation

### 1. Standard SDK Installation

```bash
# Download SDK
wget https://example.com/sdk/custom-sdk-1.0.0.sh

# Install SDK
chmod +x custom-sdk-1.0.0.sh
./custom-sdk-1.0.0.sh

# Follow installation prompts
# Choose installation directory: /opt/custom-sdk
# Choose installation mode: Full
```

### 2. Extensible SDK Installation

```bash
# Download extensible SDK
wget https://example.com/sdk/custom-sdk-ext-1.0.0.sh

# Install extensible SDK
chmod +x custom-sdk-ext-1.0.0.sh
./custom-sdk-ext-1.0.0.sh

# Follow installation prompts
# Choose installation directory: /opt/custom-sdk-ext
# Choose installation mode: Full
```

### 3. SDK Environment Setup

```bash
# Source SDK environment
source /opt/custom-sdk/environment-setup-aarch64-poky-linux

# Verify environment
echo $CC
echo $CXX
echo $PKG_CONFIG_SYSROOT_DIR
echo $PKG_CONFIG_PATH
```

## SDK Usage

### 1. Cross-Compilation Setup

```bash
# Set up cross-compilation environment
export CC=aarch64-poky-linux-gcc
export CXX=aarch64-poky-linux-g++
export AR=aarch64-poky-linux-ar
export STRIP=aarch64-poky-linux-strip
export PKG_CONFIG_SYSROOT_DIR=/opt/custom-sdk/sysroots/aarch64-poky-linux
export PKG_CONFIG_PATH=/opt/custom-sdk/sysroots/aarch64-poky-linux/usr/lib/pkgconfig
```

### 2. CMake Cross-Compilation

```cmake
# CMakeLists.txt for cross-compilation
cmake_minimum_required(VERSION 3.10)
project(CrossCompileApp)

# Set cross-compilation variables
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)

# Set compiler
set(CMAKE_C_COMPILER aarch64-poky-linux-gcc)
set(CMAKE_CXX_COMPILER aarch64-poky-linux-g++)

# Set sysroot
set(CMAKE_SYSROOT /opt/custom-sdk/sysroots/aarch64-poky-linux)

# Find packages
find_package(PkgConfig REQUIRED)
pkg_check_modules(CUSTOM_LIB REQUIRED custom-lib)

# Add executable
add_executable(cross-compile-app main.cpp)

# Link libraries
target_link_libraries(cross-compile-app ${CUSTOM_LIB_LIBRARIES})
target_include_directories(cross-compile-app PRIVATE ${CUSTOM_LIB_INCLUDE_DIRS})
target_compile_options(cross-compile-app PRIVATE ${CUSTOM_LIB_CFLAGS_OTHER})
```

### 3. Makefile Cross-Compilation

```makefile
# Makefile for cross-compilation
CC = aarch64-poky-linux-gcc
CXX = aarch64-poky-linux-g++
AR = aarch64-poky-linux-ar
STRIP = aarch64-poky-linux-strip

# Compiler flags
CFLAGS = -O2 -Wall
CXXFLAGS = -O2 -Wall -std=c++17

# Include directories
INCLUDES = -I/opt/custom-sdk/sysroots/aarch64-poky-linux/usr/include

# Library directories
LIBDIRS = -L/opt/custom-sdk/sysroots/aarch64-poky-linux/usr/lib

# Libraries
LIBS = -lcustom -lpthread

# Source files
SOURCES = main.cpp custom.cpp
OBJECTS = $(SOURCES:.cpp=.o)

# Target
TARGET = cross-compile-app

# Build rules
all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET) $(LIBDIRS) $(LIBS)
	$(STRIP) $(TARGET)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)

.PHONY: all clean
```

## SDK Development

### 1. Adding Packages to SDK

```bitbake
# custom-sdk-packages.bb
DESCRIPTION = "Additional packages for custom SDK"
LICENSE = "MIT"

inherit populate_sdk

# Additional SDK packages
TOOLCHAIN_TARGET_TASK += "custom-app-dev"
TOOLCHAIN_TARGET_TASK += "custom-lib-dev"
TOOLCHAIN_TARGET_TASK += "custom-headers"

# Host packages
TOOLCHAIN_HOST_TASK += "cmake-native"
TOOLCHAIN_HOST_TASK += "ninja-native"
TOOLCHAIN_HOST_TASK += "pkgconfig-native"
```

### 2. SDK Package Groups

```bitbake
# packagegroup-custom-sdk.bb
DESCRIPTION = "Custom SDK package group"
LICENSE = "MIT"

inherit packagegroup

PACKAGES = "${PN}"

# Target packages
RDEPENDS_${PN} = "packagegroup-core-toolchain-target"
RDEPENDS_${PN} += "custom-app-dev"
RDEPENDS_${PN} += "custom-lib-dev"
RDEPENDS_${PN} += "custom-headers"

# Host packages
RDEPENDS_${PN} += "packagegroup-core-toolchain-host"
RDEPENDS_${PN} += "cmake-native"
RDEPENDS_${PN} += "ninja-native"
RDEPENDS_${PN} += "pkgconfig-native"
```

### 3. SDK Configuration

```bitbake
# SDK configuration
SDK_MACHINE = "aarch64"
SDK_ARCH = "aarch64"
SDK_VENDOR = "custom"
SDK_VERSION = "1.0.0"

# SDK packages
SDK_PACKAGES = "packagegroup-custom-sdk"
SDK_PACKAGES += "custom-app-dev"
SDK_PACKAGES += "custom-lib-dev"
```

## SDK Testing

### 1. SDK Validation

```bash
# Validate SDK installation
/opt/custom-sdk/sysroots/aarch64-poky-linux/usr/bin/aarch64-poky-linux-gcc --version

# Check available libraries
ls /opt/custom-sdk/sysroots/aarch64-poky-linux/usr/lib/

# Check available headers
ls /opt/custom-sdk/sysroots/aarch64-poky-linux/usr/include/
```

### 2. Cross-Compilation Test

```c
// test-cross-compile.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    printf("Cross-compilation test successful!\n");
    printf("Target architecture: aarch64\n");
    printf("Compiler: aarch64-poky-linux-gcc\n");
    
    return 0;
}
```

```bash
# Compile test program
aarch64-poky-linux-gcc test-cross-compile.c -o test-cross-compile

# Check binary
file test-cross-compile
# Should show: ELF 64-bit LSB executable, ARM aarch64

# Test on target
scp test-cross-compile root@rock5b:/tmp/
ssh root@rock5b "chmod +x /tmp/test-cross-compile && /tmp/test-cross-compile"
```

## Advanced SDK Features

### 1. SDK Extensions

```bitbake
# custom-sdk-extension.bb
DESCRIPTION = "Custom SDK extension"
LICENSE = "MIT"

inherit populate_sdk

# Extension packages
TOOLCHAIN_TARGET_TASK += "custom-extension-dev"
TOOLCHAIN_HOST_TASK += "custom-extension-host"
```

### 2. SDK Customization

```bitbake
# SDK customization
SDK_MACHINE = "aarch64"
SDK_ARCH = "aarch64"
SDK_VENDOR = "custom"
SDK_VERSION = "1.0.0"

# Custom SDK packages
SDK_PACKAGES = "packagegroup-custom-sdk"
SDK_PACKAGES += "custom-extension-dev"
SDK_PACKAGES += "custom-extension-host"
```

### 3. SDK Dependencies

```bitbake
# SDK dependencies
DEPENDS = "packagegroup-custom-sdk"
DEPENDS += "custom-extension-dev"
DEPENDS += "custom-extension-host"
```

## SDK Distribution

### 1. SDK Packaging

```bash
# Create SDK package
tar -czf custom-sdk-1.0.0.tar.gz /opt/custom-sdk/

# Create SDK installer
cat > custom-sdk-installer.sh << 'EOF'
#!/bin/bash
echo "Installing Custom SDK 1.0.0..."
tar -xzf custom-sdk-1.0.0.tar.gz -C /
echo "SDK installation complete!"
echo "Source the environment: source /opt/custom-sdk/environment-setup-aarch64-poky-linux"
EOF

chmod +x custom-sdk-installer.sh
```

### 2. SDK Documentation

```bash
# Create SDK documentation
cat > SDK-README.md << 'EOF'
# Custom SDK 1.0.0

## Installation
1. Download the SDK package
2. Extract to /opt/custom-sdk/
3. Source the environment: source /opt/custom-sdk/environment-setup-aarch64-poky-linux

## Usage
- Cross-compilation: Use aarch64-poky-linux-gcc
- CMake: Set CMAKE_SYSROOT to /opt/custom-sdk/sysroots/aarch64-poky-linux
- Makefile: Use the provided cross-compilation variables

## Examples
See examples/ directory for sample projects.
EOF
```

## Best Practices

### 1. SDK Organization
- Use descriptive names
- Group related packages
- Maintain consistent structure
- Document SDK contents

### 2. Performance
- Minimize SDK size
- Optimize build time
- Use parallel builds
- Cache build artifacts

### 3. Maintenance
- Regular updates
- Version control
- Documentation updates
- Testing procedures

## Troubleshooting

### 1. Common Issues
- SDK installation failures
- Cross-compilation errors
- Missing dependencies
- Environment problems

### 2. Debugging Techniques
- Check SDK contents
- Verify environment variables
- Test cross-compilation
- Validate dependencies

### 3. Solutions
- Reinstall SDK
- Update environment
- Fix dependencies
- Correct configurations

## Conclusion

Yocto SDK generation is essential for cross-compilation development. By following this guide and implementing the provided examples, you can create robust and efficient SDKs for your projects.

Remember to:
- Test SDKs thoroughly
- Document your changes
- Use version control
- Follow best practices

## Resources

- [Yocto Project Documentation](https://docs.yoctoproject.org/)
- [OpenEmbedded Core](https://github.com/openembedded/openembedded-core)
- [Rock 5B+ Yocto Support](https://wiki.radxa.com/Rock5/software/yocto)
- [Cross-Compilation Guide](https://elinux.org/Cross_Compilation)

Happy developing! 🔧

---
sidebar_position: 1
---

# Yocto Project Basics

This guide covers Yocto Project fundamentals for building custom Linux distributions for embedded systems.

## What is Yocto Project?

Yocto Project is a Linux Foundation collaborative project that provides tools and processes for creating custom Linux distributions for embedded systems.

## Key Components

- **BitBake**: Build tool and task executor
- **OpenEmbedded-Core**: Metadata and recipes
- **Poky**: Reference distribution
- **Recipes**: Build instructions for packages

## Getting Started

### 1. Install Dependencies

```bash
sudo apt install -y gawk wget git-core diffstat unzip texinfo gcc-multilib
sudo apt install -y build-essential chrpath socat cpio python3 python3-pip
sudo apt install -y python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev
```

### 2. Set Up Environment

```bash
mkdir -p ~/yocto-workspace
cd ~/yocto-workspace
git clone -b kirkstone git://git.yoctoproject.org/poky.git
cd poky
source oe-init-build-env build-rock5b
```

### 3. Configure Build

```bash
# Edit local.conf
echo 'MACHINE = "rock5b"' >> conf/local.conf
echo 'DISTRO = "poky"' >> conf/local.conf
```

### 4. Build Image

```bash
bitbake core-image-minimal
```

## Next Steps

- [Custom Recipes](./custom-recipes.md)
- [Image Customization](./image-customization.md)
- [SDK Generation](./sdk-generation.md)

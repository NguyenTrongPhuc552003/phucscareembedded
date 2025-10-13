# Phuc's Embedded Development Guide

A comprehensive documentation website for embedded Linux, GPU development, and Rust programming, built with Docusaurus and deployed on GitHub Pages.

## 🌟 Features

- **Comprehensive Documentation**: Complete guides for embedded Linux development, GPU programming, and Rust programming
- **Multi-language Support**: Available in 8 languages (English, Vietnamese, Chinese, Spanish, French, German, Japanese, Korean)
- **Interactive Search**: Powered by Algolia DocSearch for fast content discovery
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with persistent user preferences
- **Blog Integration**: Technical tutorials, project showcases, and industry updates
- **SEO Optimized**: Meta tags, structured data, and performance optimizations

## 🚀 Live Website

Visit the live website at: [https://nguyentrongphuc552003.github.io/phucscareembedded/](https://nguyentrongphuc552003.github.io/phucscareembedded/)

## 📚 Documentation Topics

### Rust Programming

- **Rust Basics**: Variables, functions, ownership, and control flow
- **Rust Fundamentals**: Structs, enums, pattern matching, and error handling
- **Advanced Concepts**: Generics, traits, lifetimes, and smart pointers
- **Embedded Rust Development**: no_std programming, hardware abstraction layers, interrupts, and communication protocols

### Embedded Linux Development

- **Kernel and Driver Foundations**: Learn the Linux kernel’s architecture, dive into writing device drivers, and gain hands-on experience with system-level programming for interacting with custom hardware.
- **Boot Process and Customization**: Understand the Linux boot process—from bootloaders like U-Boot to flexible build systems such as Buildroot and Yocto—focusing on tailoring embedded distributions to unique hardware requirements.
- **Storage and Filesystem Strategies**: Explore filesystem design principles relevant to embedded systems, including flash memory constraints, filesystems like ext4 and UBI, and overlay techniques for reliable, updatable storage.
- **Real-Time Linux Techniques**: Examine deterministic system requirements, leverage the PREEMPT_RT patch for bounded latencies, and integrate real-time concepts to build responsive, time-sensitive applications.

### GPU Development

- **Embedded GPU Ecosystem**: Grasp the architecture and programming paradigms of modern embedded GPUs, with hands-on guides for Mali GPUs and practical use of graphics standards like OpenGL ES and Vulkan.
- **Parallel Computing with OpenCL**: Learn how to offload compute workloads to GPUs, analyze memory hierarchies, and apply kernel optimization tactics for accelerating embedded applications.
- **Advanced Vulkan Programming**: Delve into low-level graphics and compute with Vulkan, focusing on maximizing performance, cross-platform compatibility, and efficient resource management.
- **Sophisticated Memory Management**: Master explicit control over GPU memory, synchronization, and data transfer, essential for high-performance graphics and compute applications in resource-constrained devices.

### Yocto Project

- **Building Tailored Linux Images**: Navigate every step of crafting custom embedded Linux images, understanding metadata, layer structure, and configuration best practices in Yocto.
- **Recipe and Layer Development**: Develop, extend, and maintain custom recipes and layers—optimizing for modularity, maintainability, and reusability across multiple projects.
- **SDK and Toolchain Provisioning**: Generate and distribute robust cross-compilation SDKs, empowering seamless application development for target architectures.
- **Streamlined Cross-Compilation**: Set up, troubleshoot, and optimize toolchains and environments, ensuring reproducible builds and smooth developer workflows.

### Rock 5B+ Development

- **System-Level Hardware Insight**: Get an in-depth look at the Rock 5B+ platform—from board architecture and SoC features to power management and connectivity options.
- **Operating System Deployment**: Step-by-step guides for selecting, flashing, and debugging embedded operating systems specialized for the Rock 5B+.
- **Customizing and Using Peripherals**: Interface with on-board peripherals (GPIO, SPI, I2C, etc.), tune system performance, and create robust, real-world hardware integrations.
- **Diagnostics, Debugging, and Optimization**: Adopt proven strategies for isolating hardware and software faults, optimizing performance, and ensuring system reliability in production deployments.

## 🛠️ Technology Stack

- **Framework**: [Docusaurus](https://docusaurus.io/) v3
- **Deployment**: GitHub Pages with GitHub Actions
- **Search**: Algolia DocSearch
- **Styling**: Infima CSS framework with custom themes
- **Internationalization**: Built-in i18n support
- **Performance**: Optimized for Core Web Vitals

## 🚀 Quick Start

### Prerequisites

- Node.js 19+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/nguyentrongphuc552003/phucscareembedded.git
cd phucscareembedded

# Install dependencies
npm install
```

### Local Development

```bash
# Start development server
npm start

# Or with yarn
yarn start
```

This command starts a local development server at `http://localhost:3000` and opens it in your browser. Most changes are reflected live without restarting the server.

### Build

```bash
# Build for production
npm run build

# Or with yarn
yarn build
```

This generates static content in the `build` directory, ready for deployment.

### Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

Manual deployment:

```bash
# Deploy to GitHub Pages
npm run deploy

# Or with yarn
yarn deploy
```

## 📁 Project Structure

```
phucscareembedded/
├── docs/                    # Documentation content
│   ├── getting-started/     # Introduction and setup guides
│   ├── embedded-linux/      # Linux kernel and drivers
│   ├── gpu-development/     # GPU programming guides
│   ├── rust-programming/    # Rust programming guide
│   ├── yocto-projects/      # Yocto build system
│   └── rock-5b-setup/       # Hardware-specific guides
├── blog/                    # Blog posts and tutorials
├── src/                     # Source code
│   ├── components/          # Custom React components
│   ├── css/                 # Custom styles
│   └── pages/               # Additional pages
├── static/                  # Static assets
├── docusaurus.config.js     # Docusaurus configuration
└── sidebars.js              # Documentation navigation
```

## 🎯 Target Audience

- **Embedded Systems Engineers**: Professionals working with ARM-based systems
- **Rust Developers**: Learning embedded Rust programming and systems development
- **Linux Kernel Developers**: Developers working on device drivers and kernel modules
- **GPU Programmers**: Developers working with Mali GPUs and OpenCL/Vulkan
- **Students**: Learning embedded systems and Rust programming
- **Hobbyists**: DIY enthusiasts working with single-board computers

## 📖 Content Categories

### Technical Tutorials

- Step-by-step guides for embedded development
- Rust programming from basics to advanced embedded systems
- Code examples and best practices
- Hardware interfacing techniques
- Performance optimization strategies

### Project Showcases

- Real-world embedded projects
- IoT applications with Rock 5B+
- Smart home automation systems
- Industrial control solutions

### Tool Reviews

- Development IDEs and environments
- Hardware debugging tools
- Performance profiling software
- Version control for embedded projects

### Industry Updates

- Latest trends in edge computing
- New ARM processor releases
- Linux kernel updates
- Embedded security best practices

## 🌐 Internationalization

The website supports multiple languages:

- 🇺🇸 English (default)
- 🇻🇳 Tiếng Việt

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- **Content**: Add new tutorials, fix documentation, improve examples
- **Translation**: Help translate content to other languages
- **Bug Reports**: Report issues and suggest improvements
- **Feature Requests**: Suggest new features and enhancements

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm start`
5. Submit a pull request

## 📄 License

This project is licensed under the GNU General Public License v2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Docusaurus](https://docusaurus.io/) team for the excellent documentation framework
- [Algolia](https://www.algolia.com/) for the powerful search functionality
- [Infima](https://infima.dev/) for the beautiful CSS framework
- The embedded development community for inspiration and feedback

## 📞 Contact

- **Author**: Phuc Nguyen
- **GitHub**: [@nguyentrongphuc552003](https://github.com/nguyentrongphuc552003)
- **Website**: [https://nguyentrongphuc552003.github.io/phucscareembedded/](https://nguyentrongphuc552003.github.io/phucscareembedded/)
- **Email**: [trong552003@gmail.com](mailto:trong552003@gmail.com)

## 🔗 Related Resources

- [Rock 5B+ Official Documentation](https://wiki.radxa.com/Rock5)
- [The Rust Book](https://doc.rust-lang.org/book/) - Comprehensive Rust programming guide
- [Embedded Rust Book](https://docs.rust-embedded.org/book/) - Embedded systems with Rust
- [ARM Mali GPU Programming](https://developer.arm.com/ip-products/graphics-and-multimedia/mali-gpus)
- [Linux Kernel Documentation](https://www.kernel.org/doc/)
- [OpenCL Specification](https://www.khronos.org/opencl/)
- [Yocto Project Documentation](https://docs.yoctoproject.org/)

---

**Built with ❤️ for the embedded development community**

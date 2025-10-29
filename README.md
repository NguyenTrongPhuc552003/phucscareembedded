# Phuc's Embedded Development Guide

A comprehensive documentation website for Linux kernel development, Rust programming, and embedded Linux development, built with Docusaurus and deployed on GitHub Pages.

## 🌟 Features

- **Comprehensive Documentation**: Complete guides for Linux kernel development, Rust programming, and embedded Linux development
- **Multi-language Support**: Available in English and Vietnamese
- **Interactive Search**: Powered by Algolia DocSearch for fast content discovery
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with persistent user preferences
- **Blog Integration**: Technical tutorials, project showcases, and industry updates
- **SEO Optimized**: Meta tags, structured data, and performance optimizations

## 🚀 Live Website

Visit the live website at: [https://nguyentrongphuc552003.github.io/phucscareembedded/](https://nguyentrongphuc552003.github.io/phucscareembedded/)

## 📚 Documentation Topics

### Linux Kernel Development

Comprehensive Linux kernel development from fundamentals to advanced topics, including real-time systems (PREEMPT_RT), device drivers, memory management, synchronization, security hardening, and production deployment on Rock 5B+ ARM64 platform.

### Rust Programming

Complete Rust programming guide from basics to embedded systems development, covering ownership, borrowing, lifetimes, concurrency, unsafe code, FFI, performance optimization, and bare-metal programming for ARM-based platforms.

### Embedded Linux Development

End-to-end embedded Linux development covering kernel drivers, bootloaders (U-Boot), build systems (Buildroot, Yocto), filesystems, networking protocols, real-time optimization, security practices, and production deployment.

### Linux Kernel on RISC-V Architecture

Complete guide to Linux kernel development on RISC-V architecture, covering RISC-V ISA fundamentals, kernel architecture, development environment setup, kernel modules and drivers, memory management, interrupt handling, system optimization, and advanced topics including vector extensions and hypervisor support. Includes practical examples with QEMU emulation and VisionFive 2 development board.

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
│   ├── linux-kernel/        # Linux kernel development (8 phases)
│   ├── rust-programming/    # Rust programming guide (7 phases)
│   ├── embedded-linux/      # Embedded Linux development (8 phases)
│   └── risc-v-architecture/ # Linux kernel on RISC-V (8 phases)
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

- **Linux Kernel Developers**: Developers working on device drivers, kernel modules, real-time systems, and kernel development
- **Embedded Systems Engineers**: Professionals working with ARM-based systems, RISC-V architecture, and embedded Linux
- **RISC-V Developers**: Learning RISC-V architecture and kernel development on RISC-V platforms
- **Rust Developers**: Learning embedded Rust programming and systems development
- **Students**: Learning embedded systems, kernel development, Rust programming, and RISC-V architecture
- **Hobbyists**: DIY enthusiasts working with single-board computers like Rock 5B+ and VisionFive 2

## 📖 Content Categories

### Technical Tutorials

- Step-by-step guides for embedded development
- Linux kernel development from fundamentals to advanced topics
- Rust programming from basics to advanced embedded systems
- Code examples and best practices
- Hardware interfacing techniques
- Performance optimization strategies
- Architecture-aware programming

### Project Showcases

- Real-world embedded projects
- Linux kernel modules and device drivers
- IoT applications with Rock 5B+
- Smart home automation systems
- Industrial control solutions

### Tool Reviews

- Development IDEs and environments
- Kernel debugging tools and techniques
- Hardware debugging tools
- Performance profiling software
- Version control for embedded projects

### Industry Updates

- Latest trends in edge computing
- New ARM and RISC-V processor releases
- Linux kernel updates and new features
- Real-time Linux developments
- Embedded security best practices
- RISC-V ecosystem growth and adoption

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

- [Linux Kernel Documentation](https://www.kernel.org/doc/) - Official kernel documentation
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64-specific documentation
- [RISC-V Linux Kernel](https://www.kernel.org/doc/html/latest/riscv/) - RISC-V-specific documentation
- [RISC-V ISA Specifications](https://riscv.org/technical/specifications/) - RISC-V architecture specifications
- [PREEMPT_RT Documentation](https://www.kernel.org/doc/html/latest/scheduler/) - Real-time Linux documentation
- [The Rust Book](https://doc.rust-lang.org/book/) - Official Rust programming guide
- [Embedded Rust Book](https://docs.rust-embedded.org/book/) - Embedded systems with Rust
- [Rock 5B+ Official Documentation](https://wiki.radxa.com/Rock5) - Hardware platform documentation
- [VisionFive 2 Documentation](https://www.starfivetech.com/en/site/boards) - RISC-V development board
- [QEMU RISC-V Support](https://www.qemu.org/) - RISC-V emulation
- [Yocto Project Documentation](https://docs.yoctoproject.org/) - Build system documentation

---

**Built with ❤️ for the embedded development community**

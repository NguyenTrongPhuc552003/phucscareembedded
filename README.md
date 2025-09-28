# Phuc's Embedded Development Guide

A comprehensive documentation website for embedded Linux, GPU development, and C/C++ programming, built with Docusaurus and deployed on GitHub Pages.

## 🌟 Features

- **Comprehensive Documentation**: Complete guides for embedded Linux development, GPU programming, and C/C++ best practices
- **Multi-language Support**: Available in 8 languages (English, Vietnamese, Chinese, Spanish, French, German, Japanese, Korean)
- **Interactive Search**: Powered by Algolia DocSearch for fast content discovery
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with persistent user preferences
- **Blog Integration**: Technical tutorials, project showcases, and industry updates
- **SEO Optimized**: Meta tags, structured data, and performance optimizations

## 🚀 Live Website

Visit the live website at: [https://nguyentrongphuc552003.github.io/phucscareembedded/](https://nguyentrongphuc552003.github.io/phucscareembedded/)

## 📚 Documentation Topics

### Embedded Linux Development
- Kernel development and device drivers
- Bootloader configuration
- Filesystem management
- Real-time systems programming

### GPU Development
- Mali GPU programming on Rock 5B+
- OpenCL performance optimization
- Vulkan development
- GPU memory management

### C/C++ Programming
- Modern C++ best practices for embedded systems
- Memory management and optimization
- Debugging techniques
- Performance tuning

### Yocto Project
- Custom Linux image building
- Recipe development
- SDK generation
- Cross-compilation setup

### Rock 5B+ Development
- Hardware overview and setup
- OS installation guides
- Peripheral configuration
- Troubleshooting and optimization

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
│   ├── c-cpp-programming/   # C/C++ best practices
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
- **Linux Kernel Developers**: Developers working on device drivers and kernel modules
- **GPU Programmers**: Developers working with Mali GPUs and OpenCL/Vulkan
- **Students**: Learning embedded systems and C/C++ programming
- **Hobbyists**: DIY enthusiasts working with single-board computers

## 📖 Content Categories

### Technical Tutorials
- Step-by-step guides for embedded development
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
- 🇨🇳 简体中文
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇯🇵 日本語
- 🇰🇷 한국어

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
- [ARM Mali GPU Programming](https://developer.arm.com/ip-products/graphics-and-multimedia/mali-gpus)
- [Linux Kernel Documentation](https://www.kernel.org/doc/)
- [OpenCL Specification](https://www.khronos.org/opencl/)
- [Yocto Project Documentation](https://docs.yoctoproject.org/)

---

**Built with ❤️ for the embedded development community**

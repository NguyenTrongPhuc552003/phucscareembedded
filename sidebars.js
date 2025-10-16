// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
	// By default, Docusaurus generates a sidebar from the docs folder structure
	tutorialSidebar: [
		'intro',
		{
			type: 'category',
			label: 'Getting Started',
			items: [
				'getting-started/introduction',
				'getting-started/hardware-setup',
				'getting-started/development-environment',
				'getting-started/troubleshooting',
			],
		},
		{
			type: 'category',
			label: 'Embedded Linux',
			items: [
				{
					type: 'category',
					label: '01. Introduction to Embedded Linux',
					items: [
						{
							type: 'category',
							label: 'Overview of Embedded Systems',
							items: [
								'embedded-linux/introduction/overview-embedded-systems/embedded-systems-fundamentals',
								'embedded-linux/introduction/overview-embedded-systems/what-is-embedded-linux',
							],
						},
						{
							type: 'category',
							label: 'Development Environment Setup',
							items: [
								'embedded-linux/introduction/dev-environment-setup/cross-compilation-toolchain',
								'embedded-linux/introduction/dev-environment-setup/development-board-setup',
							],
						},
					],
				},
				{
					type: 'category',
					label: '02. Linux Kernel and Device Drivers',
					items: [
						{
							type: 'category',
							label: 'Linux Kernel Architecture',
							items: [
								'embedded-linux/kernel-device-drivers/kernel-architecture/kernel-overview',
								'embedded-linux/kernel-device-drivers/kernel-architecture/kernel-subsystems',
								'embedded-linux/kernel-device-drivers/kernel-architecture/kernel-boot-process',
							],
						},
						{
							type: 'category',
							label: 'Kernel Modules and Device Drivers',
							items: [
								'embedded-linux/kernel-device-drivers/kernel-modules-drivers/character-devices',
								'embedded-linux/kernel-device-drivers/kernel-modules-drivers/driver-registration',
								'embedded-linux/kernel-device-drivers/kernel-modules-drivers/kernel-modules',
							],
						},
						{
							type: 'category',
							label: 'Interrupt Handling and Memory Management',
							items: [
								'embedded-linux/kernel-device-drivers/interrupt-memory-management/interrupt-handling',
								'embedded-linux/kernel-device-drivers/interrupt-memory-management/dma-operations',
								'embedded-linux/kernel-device-drivers/interrupt-memory-management/kernel-memory-management',
							],
						},
						{
							type: 'category',
							label: 'Advanced Device Drivers Development',
							items: [
								'embedded-linux/kernel-device-drivers/advanced-driver-development/platform-drivers',
								'embedded-linux/kernel-device-drivers/advanced-driver-development/device-tree-integration',
								'embedded-linux/kernel-device-drivers/advanced-driver-development/professional-driver-development',
							],
						}
					],
				},
				{
					type: 'category',
					label: '03. Bootloaders and Build Systems',
					items: [
						{
							type: 'category',
							label: 'Boot Process and U-Boot',
							items: [
								'embedded-linux/bootloaders-build-systems/boot-process-uboot/boot-process-overview',
								'embedded-linux/bootloaders-build-systems/boot-process-uboot/uboot-configuration',
								'embedded-linux/bootloaders-build-systems/boot-process-uboot/secure-boot-implementation',
							],
						},
						{
							type: 'category',
							label: 'Buildroot Build System',
							items: [
								'embedded-linux/bootloaders-build-systems/buildroot-build-system/buildroot-basics',
								'embedded-linux/bootloaders-build-systems/buildroot-build-system/custom-package-development',
							],
						},
						{
							type: 'category',
							label: 'Yocto Project Build System',
							items: [
								'embedded-linux/bootloaders-build-systems/yocto-project/yocto-fundamentals',
							],
						},
						{
							type: 'category',
							label: 'Advanced Build System Techniques',
							items: [
								'embedded-linux/bootloaders-build-systems/advanced-build-techniques/build-optimization',
							],
						},
					],
				},
				{
					type: 'category',
					label: '04. Filesystems and Storage',
					items: [
						{
							type: 'category',
							label: 'Introduction to Filesystems in Embedded Linux',
							items: [
								'embedded-linux/filesystems-storage/filesystem-introduction/filesystem-fundamentals',
								'embedded-linux/filesystems-storage/filesystem-introduction/filesystem-selection',
							],
						},
						{
							type: 'category',
							label: 'Flash Memory Filesystems',
							items: [
								'embedded-linux/filesystems-storage/flash-memory-filesystems/flash-memory-basics',
								'embedded-linux/filesystems-storage/flash-memory-filesystems/mtd-subsystem',
								'embedded-linux/filesystems-storage/flash-memory-filesystems/jffs2-ubifs',
							],
						},
						{
							type: 'category',
							label: 'Block-Based Filesystems and Storage Management',
							items: [
								'embedded-linux/filesystems-storage/block-filesystems-storage/block-devices-filesystems',
								'embedded-linux/filesystems-storage/block-filesystems-storage/storage-management',
							],
						},
						{
							type: 'category',
							label: 'Advanced Storage Topics',
							items: [
								'embedded-linux/filesystems-storage/advanced-storage-topics/wear-leveling-bad-blocks',
								'embedded-linux/filesystems-storage/advanced-storage-topics/filesystem-optimization',
							],
						},
					],
				},
				{
					type: 'category',
					label: '05. Networking and Communication Protocols',
					items: [
						{
							type: 'category',
							label: 'Networking Basics',
							items: [
								'embedded-linux/networking-communication-protocols/networking-basics/network-configuration',
								'embedded-linux/networking-communication-protocols/networking-basics/socket-programming',
							],
						},
						{
							type: 'category',
							label: 'I2C and SPI Communication',
							items: [
								'embedded-linux/networking-communication-protocols/i2c-spi-communication/i2c-protocol',
								'embedded-linux/networking-communication-protocols/i2c-spi-communication/spi-protocol',
							],
						},
						{
							type: 'category',
							label: 'UART and Serial Communication',
							items: [
								'embedded-linux/networking-communication-protocols/uart-serial-communication/uart-basics',
								'embedded-linux/networking-communication-protocols/uart-serial-communication/modbus-protocols',
							],
						},
						{
							type: 'category',
							label: 'CAN and Industrial Communication',
							items: [
								'embedded-linux/networking-communication-protocols/can-industrial-communication/can-protocol',
								'embedded-linux/networking-communication-protocols/can-industrial-communication/industrial-protocols',
							],
						},
					],
				},
				{
					type: 'category',
					label: '06. Real-Time Systems and Performance Optimization',
					items: [
						{
							type: 'category',
							label: 'Real-Time Linux',
							items: [
								'embedded-linux/realtime-performance-optimization/realtime-linux/realtime-concepts',
								'embedded-linux/realtime-performance-optimization/realtime-linux/preempt-rt-patch',
								'embedded-linux/realtime-performance-optimization/realtime-linux/realtime-monitoring',
							],
						},
						{
							type: 'category',
							label: 'Performance Tuning',
							items: [
								'embedded-linux/realtime-performance-optimization/performance-tuning/system-profiling',
								'embedded-linux/realtime-performance-optimization/performance-tuning/kernel-parameter-tuning',
								'embedded-linux/realtime-performance-optimization/performance-tuning/performance-monitoring',
							],
						},
						{
							type: 'category',
							label: 'Power Management',
							items: [
								'embedded-linux/realtime-performance-optimization/power-management/cpu-power-management',
								'embedded-linux/realtime-performance-optimization/power-management/system-power-management',
								'embedded-linux/realtime-performance-optimization/power-management/battery-management',
							],
						},
						{
							type: 'category',
							label: 'Advanced Performance Optimization',
							items: [
								'embedded-linux/realtime-performance-optimization/advanced-optimization/hardware-performance-counters',
								'embedded-linux/realtime-performance-optimization/advanced-optimization/system-integration',
							],
						},
					],
				},
				{
					type: 'category',
					label: '07. Security and Debugging',
					items: [
						{
							type: 'category',
							label: 'Security Practices',
							items: [
								'embedded-linux/security-debugging/security-practices/embedded-security-fundamentals',
								'embedded-linux/security-debugging/security-practices/secure-boot-trusted-computing',
								'embedded-linux/security-debugging/security-practices/cryptographic-key-management',
							],
						},
						{
							type: 'category',
							label: 'System Hardening',
							items: [
								'embedded-linux/security-debugging/system-hardening/kernel-security-configuration',
								'embedded-linux/security-debugging/system-hardening/access-control-authentication',
								'embedded-linux/security-debugging/system-hardening/secure-coding-practices',
							],
						},
						{
							type: 'category',
							label: 'Debugging Techniques',
							items: [
								'embedded-linux/security-debugging/debugging-techniques/debugging-tools-techniques',
								'embedded-linux/security-debugging/debugging-techniques/memory-debugging-analysis',
								'embedded-linux/security-debugging/debugging-techniques/kernel-debugging',
							],
						},
						{
							type: 'category',
							label: 'System Monitoring and Diagnostics',
							items: [
								'embedded-linux/security-debugging/system-monitoring/system-monitoring-fundamentals',
								'embedded-linux/security-debugging/system-monitoring/performance-monitoring-optimization',
								'embedded-linux/security-debugging/system-monitoring/alerting-notification-systems',
							],
						},
					],
				},
				{
					type: 'category',
					label: '08. Project Development and Case Studies',
					items: [
						{
							type: 'category',
							label: 'Capstone Project Planning',
							items: [
								'embedded-linux/project-development-case-studies/capstone-project-planning/project-requirements-analysis',
								'embedded-linux/project-development-case-studies/capstone-project-planning/system-architecture-design',
								'embedded-linux/project-development-case-studies/capstone-project-planning/technology-selection-justification',
							],
						},
						{
							type: 'category',
							label: 'Capstone Project Implementation',
							items: [
								'embedded-linux/project-development-case-studies/capstone-project-implementation/development-methodologies',
								'embedded-linux/project-development-case-studies/capstone-project-implementation/integration-testing',
								'embedded-linux/project-development-case-studies/capstone-project-implementation/performance-optimization',
							],
						},
						{
							type: 'category',
							label: 'Case Studies Analysis',
							items: [
								'embedded-linux/project-development-case-studies/case-studies-analysis/industrial-automation-case-study',
								'embedded-linux/project-development-case-studies/case-studies-analysis/iot-smart-city-case-study',
								'embedded-linux/project-development-case-studies/case-studies-analysis/automotive-embedded-case-study',
							],
						},
						{
							type: 'category',
							label: 'Project Completion and Portfolio',
							items: [
								'embedded-linux/project-development-case-studies/project-completion-portfolio/final-testing-optimization',
								'embedded-linux/project-development-case-studies/project-completion-portfolio/documentation-maintenance',
								'embedded-linux/project-development-case-studies/project-completion-portfolio/professional-portfolio-development',
							],
						},
					],
				},
			],
		},
		{
			type: 'category',
			label: 'Rust Programming',
			items: [
				{
					type: 'category',
					label: '01. Rust Basics',
					items: [
						{
							type: 'category',
							label: 'Getting Started',
							items: [
								'rust-programming/basics/getting-started/installation-setup',
								'rust-programming/basics/getting-started/cargo-basics',
								'rust-programming/basics/getting-started/hello-world',
								'rust-programming/basics/getting-started/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Variables and Data Types',
							items: [
								'rust-programming/basics/variables-data-types/variables-mutability',
								'rust-programming/basics/variables-data-types/scalar-types',
								'rust-programming/basics/variables-data-types/compound-types',
								'rust-programming/basics/variables-data-types/type-conversions',
								'rust-programming/basics/variables-data-types/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Functions and Control Flow',
							items: [
								'rust-programming/basics/functions-control-flow/function-basics',
								'rust-programming/basics/functions-control-flow/if-expressions',
								'rust-programming/basics/functions-control-flow/loops',
								'rust-programming/basics/functions-control-flow/match-expressions',
								'rust-programming/basics/functions-control-flow/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Ownership Fundamentals',
							items: [
								'rust-programming/basics/ownership-fundamentals/ownership-rules',
								'rust-programming/basics/ownership-fundamentals/references-borrowing',
								'rust-programming/basics/ownership-fundamentals/stack-heap',
								'rust-programming/basics/ownership-fundamentals/practical-exercises',
							],
						},
					],
				},
				{
					type: 'category',
					label: '02. Rust Fundamentals',
					items: [
						{
							type: 'category',
							label: 'Structs and Enums',
							items: [
								'rust-programming/fundamentals/structs-enums/structs-basics',
								'rust-programming/fundamentals/structs-enums/struct-methods',
								'rust-programming/fundamentals/structs-enums/enums-basics',
								'rust-programming/fundamentals/structs-enums/option-enum',
								'rust-programming/fundamentals/structs-enums/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Pattern Matching and Error Handling',
							items: [
								'rust-programming/fundamentals/pattern-matching-error-handling/match-expressions',
								'rust-programming/fundamentals/pattern-matching-error-handling/error-handling-result',
								'rust-programming/fundamentals/pattern-matching-error-handling/option-handling',
								'rust-programming/fundamentals/pattern-matching-error-handling/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Collections and Strings',
							items: [
								'rust-programming/fundamentals/collections-strings/vectors-basics',
								'rust-programming/fundamentals/collections-strings/hashmaps-basics',
								'rust-programming/fundamentals/collections-strings/hashsets-basics',
								'rust-programming/fundamentals/collections-strings/string-handling',
								'rust-programming/fundamentals/collections-strings/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Modules and Packages',
							items: [
								'rust-programming/fundamentals/modules-packages/modules-basics',
								'rust-programming/fundamentals/modules-packages/packages-crates',
								'rust-programming/fundamentals/modules-packages/library-development',
								'rust-programming/fundamentals/modules-packages/advanced-module-patterns',
							],
						},
					],
				},
				{
					type: 'category',
					label: '03. Advanced Concepts',
					items: [
						{
							type: 'category',
							label: 'Generics and Traits',
							items: [
								'rust-programming/advanced-concepts/generics-traits/generics-basics',
								'rust-programming/advanced-concepts/generics-traits/generics-methods',
								'rust-programming/advanced-concepts/generics-traits/traits-basics',
								'rust-programming/advanced-concepts/generics-traits/trait-bounds',
								'rust-programming/advanced-concepts/generics-traits/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Lifetimes',
							items: [
								'rust-programming/advanced-concepts/lifetimes/lifetimes-basics',
								'rust-programming/advanced-concepts/lifetimes/lifetime-annotations',
								'rust-programming/advanced-concepts/lifetimes/lifetime-elision',
								'rust-programming/advanced-concepts/lifetimes/advanced-lifetimes',
							],
						},
						{
							type: 'category',
							label: 'Smart Pointers',
							items: [
								'rust-programming/advanced-concepts/smart-pointers/box-smart-pointer',
								'rust-programming/advanced-concepts/smart-pointers/rc-refcell',
								'rust-programming/advanced-concepts/smart-pointers/arc-mutex',
								'rust-programming/advanced-concepts/smart-pointers/weak-reference-cycles',
								'rust-programming/advanced-concepts/smart-pointers/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Concurrency',
							items: [
								'rust-programming/advanced-concepts/concurrency/threads-basics',
								'rust-programming/advanced-concepts/concurrency/message-passing',
								'rust-programming/advanced-concepts/concurrency/concurrency',
							],
						},
					],
				},
				{
					type: 'category',
					label: '04. Embedded Rust Development',
					items: [
						{
							type: 'category',
							label: 'no_std Programming',
							items: [
								'rust-programming/embedded-rust/no-std-programming/no-std-basics',
								'rust-programming/embedded-rust/no-std-programming/panic-handling',
								'rust-programming/embedded-rust/no-std-programming/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Hardware Abstraction Layers',
							items: [
								'rust-programming/embedded-rust/hardware-abstraction-layers/hal-design-patterns',
								'rust-programming/embedded-rust/hardware-abstraction-layers/register-access',
								'rust-programming/embedded-rust/hardware-abstraction-layers/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Interrupts and Timers',
							items: [
								'rust-programming/embedded-rust/interrupts-timers/interrupt-handling',
								'rust-programming/embedded-rust/interrupts-timers/timer-peripherals',
								'rust-programming/embedded-rust/interrupts-timers/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Communication Protocols',
							items: [
								'rust-programming/embedded-rust/communication-protocols/uart-serial-communication',
								'rust-programming/embedded-rust/communication-protocols/i2c-spi-protocols',
								'rust-programming/embedded-rust/communication-protocols/practical-exercises',
							],
						},
					],
				},
				{
					type: 'category',
					label: '05. Systems Programming',
					items: [
						{
							type: 'category',
							label: 'Memory Management',
							items: [
								'rust-programming/systems-programming/memory-management/memory-layout',
								'rust-programming/systems-programming/memory-management/custom-allocators',
								'rust-programming/systems-programming/memory-management/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Unsafe Rust',
							items: [
								'rust-programming/systems-programming/unsafe-rust/unsafe-basics',
								'rust-programming/systems-programming/unsafe-rust/ffi-integration',
								'rust-programming/systems-programming/unsafe-rust/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Operating System Integration',
							items: [
								'rust-programming/systems-programming/operating-system-integration/system-calls',
								'rust-programming/systems-programming/operating-system-integration/process-thread-management',
								'rust-programming/systems-programming/operating-system-integration/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Device Drivers',
							items: [
								'rust-programming/systems-programming/device-drivers/driver-architecture',
								'rust-programming/systems-programming/device-drivers/kernel-integration',
								'rust-programming/systems-programming/device-drivers/practical-exercises',
							],
						},
					],
				},
				{
					type: 'category',
					label: '06. Performance Optimization',
					items: [
						{
							type: 'category',
							label: 'Profiling and Benchmarking',
							items: [
								'rust-programming/performance-optimization/profiling-benchmarking/profiling-tools',
								'rust-programming/performance-optimization/profiling-benchmarking/benchmarking-techniques',
								'rust-programming/performance-optimization/profiling-benchmarking/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Compiler Optimizations',
							items: [
								'rust-programming/performance-optimization/compiler-optimizations/optimization-levels',
								'rust-programming/performance-optimization/compiler-optimizations/code-generation',
								'rust-programming/performance-optimization/compiler-optimizations/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Memory Optimization',
							items: [
								'rust-programming/performance-optimization/memory-optimization/memory-layout-optimization',
								'rust-programming/performance-optimization/memory-optimization/allocation-optimization',
								'rust-programming/performance-optimization/memory-optimization/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Parallel Processing',
							items: [
								'rust-programming/performance-optimization/parallel-processing/parallel-algorithms',
								'rust-programming/performance-optimization/parallel-processing/advanced-concurrency',
								'rust-programming/performance-optimization/parallel-processing/practical-exercises',
							],
						},
					],
				},
				{
					type: 'category',
					label: '07. Testing and Debugging',
					items: [
						{
							type: 'category',
							label: 'Unit Testing',
							items: [
								'rust-programming/testing-and-debugging/unit-testing/testing-fundamentals',
								'rust-programming/testing-and-debugging/unit-testing/advanced-testing',
								'rust-programming/testing-and-debugging/unit-testing/practical-exercises',
							],
						},
						{
							type: 'category',
							label: 'Property-Based Testing',
							items: [
								'rust-programming/testing-and-debugging/property-based-testing/property-based-testing',
								'rust-programming/testing-and-debugging/property-based-testing/fuzzing',
							],
						},
						{
							type: 'category',
							label: 'Debugging Techniques',
							items: [
								'rust-programming/testing-and-debugging/debugging-techniques/debugging-tools',
							],
						},
						{
							type: 'category',
							label: 'Error Handling and Recovery',
							items: [
								'rust-programming/testing-and-debugging/error-handling-recovery/error-handling-patterns',
								'rust-programming/testing-and-debugging/error-handling-recovery/recovery-strategies',
							],
						},
					],
				},
			],
		},
	],
};

export default sidebars;

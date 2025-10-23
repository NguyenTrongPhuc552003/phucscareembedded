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
			label: 'Computer Architecture',
			items: [
				{
					type: 'category',
					label: '01. Digital Logic and Computer Organization',
					items: [
						{
							type: 'category',
							label: 'Boolean Algebra and Logic Gates',
							items: [
								'computer-architecture/digital-logic-computer-organization/boolean-algebra-logic-gates/boolean-algebra-fundamentals',
							],
						},
						{
							type: 'category',
							label: 'Combinational Logic Circuits',
							items: [
								'computer-architecture/digital-logic-computer-organization/combinational-logic/combinational-circuits',
							],
						},
						{
							type: 'category',
							label: 'Sequential Logic and Memory Elements',
							items: [
								'computer-architecture/digital-logic-computer-organization/sequential-logic-memory/latches-flipflops',
							],
						},
						{
							type: 'category',
							label: 'Computer Organization Fundamentals',
							items: [
								'computer-architecture/digital-logic-computer-organization/computer-organization-fundamentals/von-neumann-architecture',
							],
						},
					],
				},
				{
					type: 'category',
					label: '02. Instruction Set Architecture (ISA)',
					items: [
						{
							type: 'category',
							label: 'ARM64 ISA Fundamentals',
							items: [
								'computer-architecture/instruction-set-architecture/arm64-isa-fundamentals/arm64-overview',
							],
						},
						{
							type: 'category',
							label: 'Instruction Formats and Addressing Modes',
							items: [
								'computer-architecture/instruction-set-architecture/instruction-formats-addressing/instruction-encoding',
							],
						},
						{
							type: 'category',
							label: 'Control Flow and Branching',
							items: [
								'computer-architecture/instruction-set-architecture/control-flow-branching/branch-instructions',
							],
						},
						{
							type: 'category',
							label: 'SIMD and Advanced Instructions',
							items: [
								'computer-architecture/instruction-set-architecture/simd-advanced-instructions/neon-simd',
							],
						},
					],
				},
				{
					type: 'category',
					label: '03. Processor Design and Microarchitecture',
					items: [
						{
							type: 'category',
							label: 'Single-Cycle and Multi-Cycle Processors',
							items: [
								'computer-architecture/processor-design-microarchitecture/single-multi-cycle-processors/processor-design',
							],
						},
						{
							type: 'category',
							label: 'Pipelining Fundamentals',
							items: [
								'computer-architecture/processor-design-microarchitecture/pipelining-fundamentals/pipelining-basics',
							],
						},
						{
							type: 'category',
							label: 'Branch Prediction and Speculation',
							items: [
								'computer-architecture/processor-design-microarchitecture/branch-prediction-speculation/branch-prediction',
							],
						},
						{
							type: 'category',
							label: 'Superscalar and Out-of-Order Execution',
							items: [
								'computer-architecture/processor-design-microarchitecture/superscalar-out-of-order/superscalar-design',
							],
						},
					],
				},
				{
					type: 'category',
					label: '04. Memory Hierarchy and Cache Systems',
					items: [
						{
							type: 'category',
							label: 'Memory Hierarchy Fundamentals',
							items: [
								'computer-architecture/memory-hierarchy-cache-systems/memory-hierarchy-fundamentals/memory-hierarchy',
							],
						},
						{
							type: 'category',
							label: 'Cache Organization and Design',
							items: [
								'computer-architecture/memory-hierarchy-cache-systems/cache-organization-design/cache-design',
							],
						},
						{
							type: 'category',
							label: 'Multi-Level Caches and Cache Coherence',
							items: [
								'computer-architecture/memory-hierarchy-cache-systems/multi-level-cache-coherence/cache-coherence',
							],
						},
						{
							type: 'category',
							label: 'Virtual Memory and TLBs',
							items: [
								'computer-architecture/memory-hierarchy-cache-systems/virtual-memory-tlbs/virtual-memory',
							],
						},
					],
				},
				{
					type: 'category',
					label: '05. Parallel Processing and Multi-core Architecture',
					items: [
						{
							type: 'category',
							label: 'Parallel Processing Fundamentals',
							items: [
								'computer-architecture/parallel-processing-multi-core/parallel-processing-fundamentals/parallel-basics',
							],
						},
						{
							type: 'category',
							label: 'Multi-Core Architecture',
							items: [
								'computer-architecture/parallel-processing-multi-core/multi-core-architecture/multi-core-design',
							],
						},
						{
							type: 'category',
							label: 'Cache Coherence and Memory Consistency',
							items: [
								'computer-architecture/parallel-processing-multi-core/cache-coherence-consistency/coherence-protocols',
							],
						},
						{
							type: 'category',
							label: 'SIMD and Vector Processing',
							items: [
								'computer-architecture/parallel-processing-multi-core/simd-vector-processing/simd-programming',
							],
						},
					],
				},
				{
					type: 'category',
					label: '06. I/O Systems and Interconnects',
					items: [
						{
							type: 'category',
							label: 'I/O Fundamentals and Interfaces',
							items: [
								'computer-architecture/io-systems-interconnects/io-fundamentals-interfaces/io-systems',
							],
						},
						{
							type: 'category',
							label: 'Bus Architectures and Protocols',
							items: [
								'computer-architecture/io-systems-interconnects/bus-architectures-protocols/amba-protocols',
							],
						},
						{
							type: 'category',
							label: 'Peripheral Interfaces',
							items: [
								'computer-architecture/io-systems-interconnects/peripheral-interfaces/uart-spi-i2c',
							],
						},
						{
							type: 'category',
							label: 'Storage and Network I/O',
							items: [
								'computer-architecture/io-systems-interconnects/storage-network-io/storage-systems',
							],
						},
					],
				},
				{
					type: 'category',
					label: '07. Performance Optimization and Architecture-Aware Programming',
					items: [
						{
							type: 'category',
							label: 'Performance Measurement and Profiling',
							items: [
								'computer-architecture/performance-optimization/performance-measurement-profiling/profiling-tools',
							],
						},
						{
							type: 'category',
							label: 'Cache Optimization Techniques',
							items: [
								'computer-architecture/performance-optimization/cache-optimization/cache-optimization',
							],
						},
						{
							type: 'category',
							label: 'Instruction-Level Optimization',
							items: [
								'computer-architecture/performance-optimization/instruction-level-optimization/compiler-optimization',
							],
						},
						{
							type: 'category',
							label: 'System-Level Optimization',
							items: [
								'computer-architecture/performance-optimization/system-level-optimization/system-optimization',
							],
						},
					],
				},
				{
					type: 'category',
					label: '08. Advanced Topics and SoC Design',
					items: [
						{
							type: 'category',
							label: 'GPU Architecture',
							items: [
								'computer-architecture/advanced-topics-soc-design/gpu-architecture/gpu-fundamentals',
							],
						},
						{
							type: 'category',
							label: 'NPU and AI Acceleration',
							items: [
								'computer-architecture/advanced-topics-soc-design/npu-ai-acceleration/npu-architecture',
							],
						},
						{
							type: 'category',
							label: 'Power Management and Energy Efficiency',
							items: [
								'computer-architecture/advanced-topics-soc-design/power-management-energy-efficiency/power-management',
							],
						},
						{
							type: 'category',
							label: 'SoC Design and Capstone Project',
							items: [
								'computer-architecture/advanced-topics-soc-design/soc-design-capstone-project/soc-design',
							],
						},
					],
				},
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
			label: 'Linux Kernel Development',
			items: [
				{
					type: 'category',
					label: '01. Linux Kernel Fundamentals',
					items: [
						{
							type: 'category',
							label: 'Kernel Architecture Overview',
							items: [
								'linux-kernel/kernel-fundamentals/kernel-architecture/linux-kernel-introduction',
								'linux-kernel/kernel-fundamentals/kernel-architecture/kernel-subsystems',
								'linux-kernel/kernel-fundamentals/kernel-architecture/kernel-boot-process',
								'linux-kernel/kernel-fundamentals/kernel-architecture/rock5b-kernel-setup',
							],
						},
						{
							type: 'category',
							label: 'Process and Thread Management',
							items: [
								'linux-kernel/kernel-fundamentals/process-thread-management/process-lifecycle',
								'linux-kernel/kernel-fundamentals/process-thread-management/scheduling-algorithms',
								'linux-kernel/kernel-fundamentals/process-thread-management/context-switching',
							],
						},
						{
							type: 'category',
							label: 'Memory Management Basics',
							items: [
								'linux-kernel/kernel-fundamentals/memory-management-basics/virtual-memory-concepts',
								'linux-kernel/kernel-fundamentals/memory-management-basics/page-allocation',
								'linux-kernel/kernel-fundamentals/memory-management-basics/memory-mapping',
							],
						},
						{
							type: 'category',
							label: 'System Calls and Interrupts',
							items: [
								'linux-kernel/kernel-fundamentals/system-calls-interrupts/system-call-interface',
								'linux-kernel/kernel-fundamentals/system-calls-interrupts/interrupt-handling',
								'linux-kernel/kernel-fundamentals/system-calls-interrupts/exception-handling',
							],
						},
					],
				},
				{
					type: 'category',
					label: '02. Kernel Development Environment',
					items: [
						{
							type: 'category',
							label: 'Development Environment Setup',
							items: [
								'linux-kernel/kernel-dev-environment/dev-environment-setup/cross-compilation-toolchain',
								'linux-kernel/kernel-dev-environment/dev-environment-setup/kernel-build-system',
								'linux-kernel/kernel-dev-environment/dev-environment-setup/rock5b-development-setup',
							],
						},
						{
							type: 'category',
							label: 'Kernel Configuration and Compilation',
							items: [
								'linux-kernel/kernel-dev-environment/kernel-config-compilation/kconfig-system',
								'linux-kernel/kernel-dev-environment/kernel-config-compilation/kernel-compilation',
								'linux-kernel/kernel-dev-environment/kernel-config-compilation/module-compilation',
							],
						},
						{
							type: 'category',
							label: 'Debugging Tools and Techniques',
							items: [
								'linux-kernel/kernel-dev-environment/debugging-tools-techniques/gdb-kgdb-debugging',
								'linux-kernel/kernel-dev-environment/debugging-tools-techniques/kernel-logging',
								'linux-kernel/kernel-dev-environment/debugging-tools-techniques/crash-analysis',
							],
						},
						{
							type: 'category',
							label: 'Testing and Validation',
							items: [
								'linux-kernel/kernel-dev-environment/testing-validation/kernel-testing',
								'linux-kernel/kernel-dev-environment/testing-validation/static-analysis',
								'linux-kernel/kernel-dev-environment/testing-validation/code-review',
							],
						},
					],
				},
				{
					type: 'category',
					label: '03. Kernel Modules and Device Drivers',
					items: [
						{
							type: 'category',
							label: 'Loadable Kernel Modules (LKMs)',
							items: [
								'linux-kernel/kernel-modules-device-drivers/lkm-basics/module-structure',
								'linux-kernel/kernel-modules-device-drivers/lkm-basics/module-loading-unloading',
								'linux-kernel/kernel-modules-device-drivers/lkm-basics/module-parameters',
							],
						},
						{
							type: 'category',
							label: 'Character Device Drivers',
							items: [
								'linux-kernel/kernel-modules-device-drivers/character-device-drivers/char-device-framework',
								'linux-kernel/kernel-modules-device-drivers/character-device-drivers/device-file-operations',
								'linux-kernel/kernel-modules-device-drivers/character-device-drivers/ioctl-implementation',
							],
						},
						{
							type: 'category',
							label: 'Platform and Bus Drivers',
							items: [
								'linux-kernel/kernel-modules-device-drivers/platform-bus-drivers/platform-device-model',
								'linux-kernel/kernel-modules-device-drivers/platform-bus-drivers/device-tree-integration',
								'linux-kernel/kernel-modules-device-drivers/platform-bus-drivers/pci-usb-drivers',
							],
						},
						{
							type: 'category',
							label: 'Advanced Driver Development',
							items: [
								'linux-kernel/kernel-modules-device-drivers/advanced-driver-development/dma-operations',
								'linux-kernel/kernel-modules-device-drivers/advanced-driver-development/interrupt-handling',
								'linux-kernel/kernel-modules-device-drivers/advanced-driver-development/power-management',
							],
						},
					],
				},
				{
					type: 'category',
					label: '04. Real-Time Linux Kernel',
					items: [
						{
							type: 'category',
							label: 'Real-Time Concepts and PREEMPT_RT',
							items: [
								'linux-kernel/realtime-linux-kernel/realtime-concepts-preempt-rt/real-time-fundamentals',
								'linux-kernel/realtime-linux-kernel/realtime-concepts-preempt-rt/preempt-rt-patch',
								'linux-kernel/realtime-linux-kernel/realtime-concepts-preempt-rt/latency-optimization',
							],
						},
						{
							type: 'category',
							label: 'Real-Time Scheduling',
							items: [
								'linux-kernel/realtime-linux-kernel/realtime-scheduling/scheduling-policies',
								'linux-kernel/realtime-linux-kernel/realtime-scheduling/priority-inheritance',
								'linux-kernel/realtime-linux-kernel/realtime-scheduling/deadline-scheduling',
							],
						},
						{
							type: 'category',
							label: 'Real-Time Performance Analysis',
							items: [
								'linux-kernel/realtime-linux-kernel/realtime-performance-analysis/latency-measurement',
								'linux-kernel/realtime-linux-kernel/realtime-performance-analysis/jitter-analysis',
								'linux-kernel/realtime-linux-kernel/realtime-performance-analysis/performance-tuning',
							],
						},
						{
							type: 'category',
							label: 'Real-Time Applications on Rock 5B+',
							items: [
								'linux-kernel/realtime-linux-kernel/realtime-applications-rock5b/industrial-control',
								'linux-kernel/realtime-linux-kernel/realtime-applications-rock5b/audio-processing',
								'linux-kernel/realtime-linux-kernel/realtime-applications-rock5b/robotics-control',
							],
						},
					],
				},
				{
					type: 'category',
					label: '05. Advanced Memory Management',
					items: [
						{
							type: 'category',
							label: 'Virtual Memory Management',
							items: [
								'linux-kernel/advanced-memory-management/virtual-memory-management/vma-management',
								'linux-kernel/advanced-memory-management/virtual-memory-management/page-tables',
								'linux-kernel/advanced-memory-management/virtual-memory-management/memory-mapping',
							],
						},
						{
							type: 'category',
							label: 'Memory Allocation Strategies',
							items: [
								'linux-kernel/advanced-memory-management/memory-allocation-strategies/slab-allocator',
								'linux-kernel/advanced-memory-management/memory-allocation-strategies/page-allocator',
								'linux-kernel/advanced-memory-management/memory-allocation-strategies/memory-compaction',
							],
						},
						{
							type: 'category',
							label: 'DMA and Coherent Memory',
							items: [
								'linux-kernel/advanced-memory-management/dma-coherent-memory/dma-fundamentals',
								'linux-kernel/advanced-memory-management/dma-coherent-memory/coherent-memory-allocation',
								'linux-kernel/advanced-memory-management/dma-coherent-memory/dma-mapping',
							],
						},
						{
							type: 'category',
							label: 'Memory Debugging and Profiling',
							items: [
								'linux-kernel/advanced-memory-management/memory-debugging-profiling/memory-leak-detection',
								'linux-kernel/advanced-memory-management/memory-debugging-profiling/memory-profiling',
								'linux-kernel/advanced-memory-management/memory-debugging-profiling/oom-handling',
							],
						},
					],
				},
				{
					type: 'category',
					label: '06. Kernel Synchronization and Concurrency',
					items: [
						{
							type: 'category',
							label: 'Synchronization Primitives',
							items: [
								'linux-kernel/kernel-synchronization-concurrency/sync-primitives/spinlocks-mutexes',
								'linux-kernel/kernel-synchronization-concurrency/sync-primitives/semaphores-completion',
								'linux-kernel/kernel-synchronization-concurrency/sync-primitives/read-write-locks',
							],
						},
						{
							type: 'category',
							label: 'Lock-Free Programming',
							items: [
								'linux-kernel/kernel-synchronization-concurrency/lock-free-programming/atomic-operations',
								'linux-kernel/kernel-synchronization-concurrency/lock-free-programming/memory-barriers',
								'linux-kernel/kernel-synchronization-concurrency/lock-free-programming/rcu-mechanism',
							],
						},
						{
							type: 'category',
							label: 'Per-CPU Variables and Workqueues',
							items: [
								'linux-kernel/kernel-synchronization-concurrency/per-cpu-workqueues/per-cpu-variables',
								'linux-kernel/kernel-synchronization-concurrency/per-cpu-workqueues/workqueue-framework',
								'linux-kernel/kernel-synchronization-concurrency/per-cpu-workqueues/timer-management',
							],
						},
						{
							type: 'category',
							label: 'Deadlock Prevention and Debugging',
							items: [
								'linux-kernel/kernel-synchronization-concurrency/deadlock-prevention-debugging/deadlock-detection',
								'linux-kernel/kernel-synchronization-concurrency/deadlock-prevention-debugging/lockdep-framework',
								'linux-kernel/kernel-synchronization-concurrency/deadlock-prevention-debugging/debugging-techniques',
							],
						},
					],
				},
				{
					type: 'category',
					label: '07. Kernel Security and Hardening',
					items: [
						{
							type: 'category',
							label: 'Kernel Security Fundamentals',
							items: [
								'linux-kernel/kernel-security-hardening/security-fundamentals/security-models',
								'linux-kernel/kernel-security-hardening/security-fundamentals/access-control',
								'linux-kernel/kernel-security-hardening/security-fundamentals/capability-system',
							],
						},
						{
							type: 'category',
							label: 'Security Frameworks',
							items: [
								'linux-kernel/kernel-security-hardening/security-frameworks/selinux-integration',
								'linux-kernel/kernel-security-hardening/security-frameworks/apparmor-integration',
								'linux-kernel/kernel-security-hardening/security-frameworks/secure-boot',
							],
						},
						{
							type: 'category',
							label: 'Kernel Hardening Techniques',
							items: [
								'linux-kernel/kernel-security-hardening/kernel-hardening-techniques/stack-protection',
								'linux-kernel/kernel-security-hardening/kernel-hardening-techniques/aslr-kaslr',
								'linux-kernel/kernel-security-hardening/kernel-hardening-techniques/smep-smap',
							],
						},
						{
							type: 'category',
							label: 'Security Monitoring and Auditing',
							items: [
								'linux-kernel/kernel-security-hardening/security-monitoring-auditing/audit-framework',
								'linux-kernel/kernel-security-hardening/security-monitoring-auditing/security-events',
								'linux-kernel/kernel-security-hardening/security-monitoring-auditing/intrusion-detection',
							],
						},
					],
				},
				{
					type: 'category',
					label: '08. Advanced Kernel Topics and Projects',
					items: [
						{
							type: 'category',
							label: 'Kernel Performance Optimization',
							items: [
								'linux-kernel/advanced-kernel-topics-projects/kernel-performance-optimization/profiling-tools',
								'linux-kernel/advanced-kernel-topics-projects/kernel-performance-optimization/performance-tuning',
								'linux-kernel/advanced-kernel-topics-projects/kernel-performance-optimization/scalability-optimization',
							],
						},
						{
							type: 'category',
							label: 'Power Management',
							items: [
								'linux-kernel/advanced-kernel-topics-projects/power-management/cpu-frequency-scaling',
								'linux-kernel/advanced-kernel-topics-projects/power-management/sleep-states',
								'linux-kernel/advanced-kernel-topics-projects/power-management/device-power-management',
							],
						},
						{
							type: 'category',
							label: 'Kernel Contribution and Community',
							items: [
								'linux-kernel/advanced-kernel-topics-projects/kernel-contribution-community/contribution-process',
								'linux-kernel/advanced-kernel-topics-projects/kernel-contribution-community/code-review',
								'linux-kernel/advanced-kernel-topics-projects/kernel-contribution-community/maintainer-guidelines',
							],
						},
						{
							type: 'category',
							label: 'Capstone Projects on Rock 5B+',
							items: [
								'linux-kernel/advanced-kernel-topics-projects/capstone-projects-rock5b/custom-device-driver',
								'linux-kernel/advanced-kernel-topics-projects/capstone-projects-rock5b/realtime-application',
								'linux-kernel/advanced-kernel-topics-projects/capstone-projects-rock5b/performance-optimization',
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
							],
						},
						{
							type: 'category',
							label: 'Ownership Fundamentals',
							items: [
								'rust-programming/basics/ownership-fundamentals/ownership-rules',
								'rust-programming/basics/ownership-fundamentals/references-borrowing',
								'rust-programming/basics/ownership-fundamentals/stack-heap',
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
							],
						},
						{
							type: 'category',
							label: 'Pattern Matching and Error Handling',
							items: [
								'rust-programming/fundamentals/pattern-matching-error-handling/match-expressions',
								'rust-programming/fundamentals/pattern-matching-error-handling/error-handling-result',
								'rust-programming/fundamentals/pattern-matching-error-handling/option-handling',
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
							],
						},
						{
							type: 'category',
							label: 'Hardware Abstraction Layers',
							items: [
								'rust-programming/embedded-rust/hardware-abstraction-layers/hal-design-patterns',
								'rust-programming/embedded-rust/hardware-abstraction-layers/register-access',
							],
						},
						{
							type: 'category',
							label: 'Interrupts and Timers',
							items: [
								'rust-programming/embedded-rust/interrupts-timers/interrupt-handling',
								'rust-programming/embedded-rust/interrupts-timers/timer-peripherals',
							],
						},
						{
							type: 'category',
							label: 'Communication Protocols',
							items: [
								'rust-programming/embedded-rust/communication-protocols/uart-serial-communication',
								'rust-programming/embedded-rust/communication-protocols/i2c-spi-protocols',
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
							],
						},
						{
							type: 'category',
							label: 'Unsafe Rust',
							items: [
								'rust-programming/systems-programming/unsafe-rust/unsafe-basics',
								'rust-programming/systems-programming/unsafe-rust/ffi-integration',
							],
						},
						{
							type: 'category',
							label: 'Operating System Integration',
							items: [
								'rust-programming/systems-programming/operating-system-integration/system-calls',
								'rust-programming/systems-programming/operating-system-integration/process-thread-management',
							],
						},
						{
							type: 'category',
							label: 'Device Drivers',
							items: [
								'rust-programming/systems-programming/device-drivers/driver-architecture',
								'rust-programming/systems-programming/device-drivers/kernel-integration',
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
							],
						},
						{
							type: 'category',
							label: 'Compiler Optimizations',
							items: [
								'rust-programming/performance-optimization/compiler-optimizations/optimization-levels',
								'rust-programming/performance-optimization/compiler-optimizations/code-generation',
							],
						},
						{
							type: 'category',
							label: 'Memory Optimization',
							items: [
								'rust-programming/performance-optimization/memory-optimization/memory-layout-optimization',
								'rust-programming/performance-optimization/memory-optimization/allocation-optimization',
							],
						},
						{
							type: 'category',
							label: 'Parallel Processing',
							items: [
								'rust-programming/performance-optimization/parallel-processing/parallel-algorithms',
								'rust-programming/performance-optimization/parallel-processing/advanced-concurrency',
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

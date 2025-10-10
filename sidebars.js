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
        'embedded-linux/kernel-development',
        'embedded-linux/device-drivers',
        'embedded-linux/bootloader',
        'embedded-linux/filesystem',
      ],
    },
    {
      type: 'category',
      label: 'GPU Development',
      items: [
        'gpu-development/mali-gpu',
        'gpu-development/opencl-programming',
        'gpu-development/performance-optimization',
        'gpu-development/vulkan-development',
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
      ],
    },
    {
      type: 'category',
      label: 'Yocto Project',
      items: [
        'yocto-projects/yocto-basics',
        'yocto-projects/custom-recipes',
        'yocto-projects/image-customization',
        'yocto-projects/sdk-generation',
      ],
    },
    {
      type: 'category',
      label: 'Rock 5B+ Setup',
      items: [
        'rock-5b-setup/hardware-overview',
        'rock-5b-setup/os-installation',
        'rock-5b-setup/peripheral-setup',
      ],
    },
  ],
};

export default sidebars;

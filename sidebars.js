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

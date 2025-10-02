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
      ],
    },
    {
      type: 'category',
      label: 'C/C++ Programming',
      items: [
        'c-cpp-programming/README',
        {
          type: 'category',
          label: '01. Programming Basics',
          items: [
            'c-cpp-programming/basics/README',
            'c-cpp-programming/basics/introduction',
            'c-cpp-programming/basics/programming-concepts',
            'c-cpp-programming/basics/syntax-basics',
            'c-cpp-programming/basics/comments-and-documentation',
            'c-cpp-programming/basics/development-environment',
            'c-cpp-programming/basics/first-program',
            'c-cpp-programming/basics/c-vs-cpp',
          ],
        },
        {
          type: 'category',
          label: '02. C Language Fundamentals',
          items: [
            'c-cpp-programming/c-fundamentals/README',
            'c-cpp-programming/c-fundamentals/variables-and-data-types',
            'c-cpp-programming/c-fundamentals/operators-and-expressions',
            'c-cpp-programming/c-fundamentals/control-structures',
            'c-cpp-programming/c-fundamentals/functions',
            'c-cpp-programming/c-fundamentals/arrays-and-strings',
            'c-cpp-programming/c-fundamentals/pointers-basics',
            'c-cpp-programming/c-fundamentals/embedded-c',
          ],
        },
        {
          type: 'category',
          label: '03. Advanced C Programming',
          items: [
            'c-cpp-programming/advanced-c/README',
            'c-cpp-programming/advanced-c/advanced-pointers',
            'c-cpp-programming/advanced-c/structures-and-unions',
            'c-cpp-programming/advanced-c/file-operations',
            'c-cpp-programming/advanced-c/dynamic-memory',
            'c-cpp-programming/advanced-c/preprocessor',
            'c-cpp-programming/advanced-c/error-handling',
          ],
        },
        {
          type: 'category',
          label: '04. C++ Programming Basics',
          items: [
            'c-cpp-programming/cpp-basics/README',
            'c-cpp-programming/cpp-basics/cpp-introduction',
            'c-cpp-programming/cpp-basics/classes-and-objects',
            'c-cpp-programming/cpp-basics/constructors-destructors',
            'c-cpp-programming/cpp-basics/inheritance',
            'c-cpp-programming/cpp-basics/polymorphism',
            'c-cpp-programming/cpp-basics/memory-management',
            'c-cpp-programming/cpp-basics/standard-library',
          ],
        },
        {
          type: 'category',
          label: '05. Advanced C++ Programming',
          items: [
            'c-cpp-programming/advanced-cpp/README',
            'c-cpp-programming/advanced-cpp/templates',
            'c-cpp-programming/advanced-cpp/stl-containers',
            'c-cpp-programming/advanced-cpp/smart-pointers',
            'c-cpp-programming/advanced-cpp/lambda-expressions',
            'c-cpp-programming/advanced-cpp/modern-cpp-features',
            'c-cpp-programming/advanced-cpp/cpp-best-practices',
          ],
        },
        {
          type: 'category',
          label: '06. Embedded-Specific Programming',
          items: [
            'c-cpp-programming/embedded-specific/README',
            'c-cpp-programming/embedded-specific/embedded-c-best-practices',
            'c-cpp-programming/embedded-specific/real-time-programming',
            'c-cpp-programming/embedded-specific/hardware-interfacing',
            'c-cpp-programming/embedded-specific/optimization-techniques',
            'c-cpp-programming/embedded-specific/memory-management',
          ],
        },
        {
          type: 'category',
          label: '07. Debugging and Testing',
          items: [
            'c-cpp-programming/debugging-and-testing/README',
            'c-cpp-programming/debugging-and-testing/debugging-techniques',
            'c-cpp-programming/debugging-and-testing/unit-testing',
            'c-cpp-programming/debugging-and-testing/static-analysis',
            'c-cpp-programming/debugging-and-testing/profiling',
          ],
        },
        {
          type: 'category',
          label: '08. Practical Projects',
          items: [
            'c-cpp-programming/practical-projects/README',
            'c-cpp-programming/practical-projects/led-blink-project',
            'c-cpp-programming/practical-projects/sensor-reading-project',
            'c-cpp-programming/practical-projects/communication-protocols',
            'c-cpp-programming/practical-projects/data-logging-system',
          ],
        },
        {
          type: 'category',
          label: '09. Advanced Topics',
          items: [
            'c-cpp-programming/advanced-topics/README',
            'c-cpp-programming/advanced-topics/real-time-systems',
            'c-cpp-programming/advanced-topics/concurrent-programming',
            'c-cpp-programming/advanced-topics/performance-optimization',
            'c-cpp-programming/advanced-topics/security-considerations',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Yocto Project',
      items: [
        'yocto-projects/yocto-basics',
      ],
    },
    {
      type: 'category',
      label: 'Rock 5B+ Setup',
      items: [
        'rock-5b-setup/hardware-overview',
        'rock-5b-setup/os-installation',
      ],
    },
  ],
};

export default sidebars;

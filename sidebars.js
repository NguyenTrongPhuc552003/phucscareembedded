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
      ],
    },
    {
      type: 'category',
      label: 'Embedded Linux',
      items: [
        'embedded-linux/kernel-development',
        'embedded-linux/device-drivers',
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
        'c-cpp-programming/embedded-c',
        'c-cpp-programming/cpp-best-practices',
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
      ],
    },
  ],
};

export default sidebars;

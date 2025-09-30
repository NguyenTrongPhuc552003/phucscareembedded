---
sidebar_position: 2
---

# OpenCL Programming

This comprehensive guide covers OpenCL programming for GPU acceleration on embedded systems, focusing on the Mali-G610 MP4 GPU on the Rock 5B+ platform.

## Understanding OpenCL

OpenCL (Open Computing Language) is an open standard for parallel programming of heterogeneous systems. It allows you to write programs that execute across CPUs, GPUs, and other processors.

### OpenCL Architecture

```
┌─────────────────────────────────────┐
│           Host Application          │
├─────────────────────────────────────┤
│           OpenCL Runtime            │
├─────────────────────────────────────┤
│  ┌────────────────────────────────┐ │
│  │        Command Queue           │ │
│  ├────────────────────────────────┤ │
│  │        Memory Objects          │ │
│  ├────────────────────────────────┤ │
│  │        Kernels                 │ │
│  └────────────────────────────────┘ │
├─────────────────────────────────────┤
│           Compute Devices           │
│  ┌────────────────────────────────┐ │
│  │        GPU (Mali-G610)         │ │
│  ├────────────────────────────────┤ │
│  │        CPU Cores               │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Development Environment Setup

### 1. Install OpenCL Development Tools

```bash
# Install OpenCL development libraries
sudo apt install -y opencl-headers ocl-icd-opencl-dev
sudo apt install -y clinfo

# Install Mali GPU development tools
sudo apt install -y libmali-g610-dkm libmali-g610-dkm-dev
sudo apt install -y libmali-g610-dkm-tools
```

### 2. Verify OpenCL Installation

```bash
# Check available OpenCL devices
clinfo

# Expected output for Rock 5B+:
# Platform Name: ARM Platform
# Device Name: Mali-G610 MP4
# Device Type: GPU
# Max Compute Units: 4
```

## Basic OpenCL Program

### 1. Simple Vector Addition

```c
// vector_add.c
#include <CL/cl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SOURCE_SIZE (0x100000)

int main() {
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;
    
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_a = NULL;
    cl_mem memobj_b = NULL;
    cl_mem memobj_c = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    cl_uint ret_num_events_in_wait_list;
    
    // Data for computation
    const int N = 1024;
    float *A = (float*)malloc(sizeof(float) * N);
    float *B = (float*)malloc(sizeof(float) * N);
    float *C = (float*)malloc(sizeof(float) * N);
    
    // Initialize input data
    for (int i = 0; i < N; i++) {
        A[i] = i;
        B[i] = i * 2;
    }
    
    // Get platform and device information
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    if (ret != CL_SUCCESS) {
        printf("Failed to get platform IDs\n");
        return -1;
    }
    
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_GPU, 1, &device_id, &ret_num_devices);
    if (ret != CL_SUCCESS) {
        printf("Failed to get device IDs\n");
        return -1;
    }
    
    // Create context
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);
    if (ret != CL_SUCCESS) {
        printf("Failed to create context\n");
        return -1;
    }
    
    // Create command queue
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);
    if (ret != CL_SUCCESS) {
        printf("Failed to create command queue\n");
        return -1;
    }
    
    // Create memory buffers
    memobj_a = clCreateBuffer(context, CL_MEM_READ_ONLY, sizeof(float) * N, NULL, &ret);
    memobj_b = clCreateBuffer(context, CL_MEM_READ_ONLY, sizeof(float) * N, NULL, &ret);
    memobj_c = clCreateBuffer(context, CL_MEM_WRITE_ONLY, sizeof(float) * N, NULL, &ret);
    
    // Copy data to device
    ret = clEnqueueWriteBuffer(command_queue, memobj_a, CL_TRUE, 0, sizeof(float) * N, A, 0, NULL, NULL);
    ret = clEnqueueWriteBuffer(command_queue, memobj_b, CL_TRUE, 0, sizeof(float) * N, B, 0, NULL, NULL);
    
    // OpenCL kernel source code
    const char *source_str = 
        "__kernel void vector_add(__global const float *a, __global const float *b, __global float *c) {\n"
        "    int i = get_global_id(0);\n"
        "    c[i] = a[i] + b[i];\n"
        "}\n";
    
    // Create program from source
    program = clCreateProgramWithSource(context, 1, &source_str, NULL, &ret);
    if (ret != CL_SUCCESS) {
        printf("Failed to create program\n");
        return -1;
    }
    
    // Build program
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);
    if (ret != CL_SUCCESS) {
        printf("Failed to build program\n");
        
        // Get build log
        size_t log_size;
        clGetProgramBuildInfo(program, device_id, CL_PROGRAM_BUILD_LOG, 0, NULL, &log_size);
        char *log = (char*)malloc(log_size);
        clGetProgramBuildInfo(program, device_id, CL_PROGRAM_BUILD_LOG, log_size, log, NULL);
        printf("Build log:\n%s\n", log);
        free(log);
        return -1;
    }
    
    // Create kernel
    kernel = clCreateKernel(program, "vector_add", &ret);
    if (ret != CL_SUCCESS) {
        printf("Failed to create kernel\n");
        return -1;
    }
    
    // Set kernel arguments
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void*)&memobj_a);
    ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void*)&memobj_b);
    ret = clSetKernelArg(kernel, 2, sizeof(cl_mem), (void*)&memobj_c);
    
    // Execute kernel
    size_t global_work_size = N;
    size_t local_work_size = 64;
    
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 1, NULL, &global_work_size, &local_work_size, 0, NULL, NULL);
    if (ret != CL_SUCCESS) {
        printf("Failed to execute kernel\n");
        return -1;
    }
    
    // Read result from device
    ret = clEnqueueReadBuffer(command_queue, memobj_c, CL_TRUE, 0, sizeof(float) * N, C, 0, NULL, NULL);
    
    // Verify result
    printf("First 10 results:\n");
    for (int i = 0; i < 10; i++) {
        printf("C[%d] = %.2f\n", i, C[i]);
    }
    
    // Cleanup
    clReleaseKernel(kernel);
    clReleaseProgram(program);
    clReleaseMemObject(memobj_a);
    clReleaseMemObject(memobj_b);
    clReleaseMemObject(memobj_c);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);
    
    free(A);
    free(B);
    free(C);
    
    printf("OpenCL vector addition completed successfully!\n");
    return 0;
}
```

### 2. Compile and Run

```bash
# Compile the program
gcc -o vector_add vector_add.c -lOpenCL

# Run the program
./vector_add
```

## Advanced OpenCL Programming

### 1. Matrix Multiplication

```c
// matrix_multiply.c
#include <CL/cl.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define N 512
#define BLOCK_SIZE 16

int main() {
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;
    
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_a = NULL;
    cl_mem memobj_b = NULL;
    cl_mem memobj_c = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    
    // Allocate matrices
    float *A = (float*)malloc(sizeof(float) * N * N);
    float *B = (float*)malloc(sizeof(float) * N * N);
    float *C = (float*)malloc(sizeof(float) * N * N);
    
    // Initialize matrices
    for (int i = 0; i < N * N; i++) {
        A[i] = (float)rand() / RAND_MAX;
        B[i] = (float)rand() / RAND_MAX;
        C[i] = 0.0f;
    }
    
    // Get platform and device
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_GPU, 1, &device_id, &ret_num_devices);
    
    // Create context and command queue
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);
    
    // Create memory buffers
    memobj_a = clCreateBuffer(context, CL_MEM_READ_ONLY, sizeof(float) * N * N, NULL, &ret);
    memobj_b = clCreateBuffer(context, CL_MEM_READ_ONLY, sizeof(float) * N * N, NULL, &ret);
    memobj_c = clCreateBuffer(context, CL_MEM_WRITE_ONLY, sizeof(float) * N * N, NULL, &ret);
    
    // Copy data to device
    clEnqueueWriteBuffer(command_queue, memobj_a, CL_TRUE, 0, sizeof(float) * N * N, A, 0, NULL, NULL);
    clEnqueueWriteBuffer(command_queue, memobj_b, CL_TRUE, 0, sizeof(float) * N * N, B, 0, NULL, NULL);
    
    // Optimized matrix multiplication kernel
    const char *source_str = 
        "__kernel void matrix_multiply(__global const float *A, __global const float *B, __global float *C, const int N) {\n"
        "    int row = get_global_id(0);\n"
        "    int col = get_global_id(1);\n"
        "    \n"
        "    if (row < N && col < N) {\n"
        "        float sum = 0.0f;\n"
        "        for (int k = 0; k < N; k++) {\n"
        "            sum += A[row * N + k] * B[k * N + col];\n"
        "        }\n"
        "        C[row * N + col] = sum;\n"
        "    }\n"
        "}\n";
    
    // Create and build program
    program = clCreateProgramWithSource(context, 1, &source_str, NULL, &ret);
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);
    
    // Create kernel
    kernel = clCreateKernel(program, "matrix_multiply", &ret);
    
    // Set kernel arguments
    clSetKernelArg(kernel, 0, sizeof(cl_mem), (void*)&memobj_a);
    clSetKernelArg(kernel, 1, sizeof(cl_mem), (void*)&memobj_b);
    clSetKernelArg(kernel, 2, sizeof(cl_mem), (void*)&memobj_c);
    clSetKernelArg(kernel, 3, sizeof(int), (void*)&N);
    
    // Execute kernel
    size_t global_work_size[2] = {N, N};
    size_t local_work_size[2] = {BLOCK_SIZE, BLOCK_SIZE};
    
    clock_t start = clock();
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 2, NULL, global_work_size, local_work_size, 0, NULL, NULL);
    clFinish(command_queue);
    clock_t end = clock();
    
    // Read result
    clEnqueueReadBuffer(command_queue, memobj_c, CL_TRUE, 0, sizeof(float) * N * N, C, 0, NULL, NULL);
    
    double time_taken = ((double)(end - start)) / CLOCKS_PER_SEC;
    printf("Matrix multiplication completed in %.4f seconds\n", time_taken);
    
    // Verify result (check first few elements)
    printf("First 3x3 result:\n");
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%.2f ", C[i * N + j]);
        }
        printf("\n");
    }
    
    // Cleanup
    clReleaseKernel(kernel);
    clReleaseProgram(program);
    clReleaseMemObject(memobj_a);
    clReleaseMemObject(memobj_b);
    clReleaseMemObject(memobj_c);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);
    
    free(A);
    free(B);
    free(C);
    
    return 0;
}
```

### 2. Image Processing with OpenCL

```c
// image_filter.c
#include <CL/cl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define WIDTH 1024
#define HEIGHT 1024

int main() {
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;
    
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_input = NULL;
    cl_mem memobj_output = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    
    // Allocate image data
    unsigned char *input_image = (unsigned char*)malloc(sizeof(unsigned char) * WIDTH * HEIGHT);
    unsigned char *output_image = (unsigned char*)malloc(sizeof(unsigned char) * WIDTH * HEIGHT);
    
    // Initialize input image with test pattern
    for (int i = 0; i < WIDTH * HEIGHT; i++) {
        input_image[i] = (unsigned char)(i % 256);
    }
    
    // Get platform and device
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_GPU, 1, &device_id, &ret_num_devices);
    
    // Create context and command queue
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);
    
    // Create memory buffers
    memobj_input = clCreateBuffer(context, CL_MEM_READ_ONLY, sizeof(unsigned char) * WIDTH * HEIGHT, NULL, &ret);
    memobj_output = clCreateBuffer(context, CL_MEM_WRITE_ONLY, sizeof(unsigned char) * WIDTH * HEIGHT, NULL, &ret);
    
    // Copy input data to device
    clEnqueueWriteBuffer(command_queue, memobj_input, CL_TRUE, 0, sizeof(unsigned char) * WIDTH * HEIGHT, input_image, 0, NULL, NULL);
    
    // Sobel edge detection kernel
    const char *source_str = 
        "__kernel void sobel_filter(__global const unsigned char *input, __global unsigned char *output, const int width, const int height) {\n"
        "    int x = get_global_id(0);\n"
        "    int y = get_global_id(1);\n"
        "    \n"
        "    if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {\n"
        "        // Sobel X kernel\n"
        "        int gx = -input[(y-1)*width + (x-1)] + input[(y-1)*width + (x+1)]\n"
        "                - 2*input[y*width + (x-1)] + 2*input[y*width + (x+1)]\n"
        "                - input[(y+1)*width + (x-1)] + input[(y+1)*width + (x+1)];\n"
        "        \n"
        "        // Sobel Y kernel\n"
        "        int gy = -input[(y-1)*width + (x-1)] - 2*input[(y-1)*width + x] - input[(y-1)*width + (x+1)]\n"
        "                + input[(y+1)*width + (x-1)] + 2*input[(y+1)*width + x] + input[(y+1)*width + (x+1)];\n"
        "        \n"
        "        // Calculate magnitude\n"
        "        int magnitude = (int)sqrt((float)(gx*gx + gy*gy));\n"
        "        \n"
        "        // Clamp to 0-255 range\n"
        "        output[y*width + x] = (unsigned char)min(255, max(0, magnitude));\n"
        "    } else {\n"
        "        output[y*width + x] = 0;\n"
        "    }\n"
        "}\n";
    
    // Create and build program
    program = clCreateProgramWithSource(context, 1, &source_str, NULL, &ret);
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);
    
    // Create kernel
    kernel = clCreateKernel(program, "sobel_filter", &ret);
    
    // Set kernel arguments
    clSetKernelArg(kernel, 0, sizeof(cl_mem), (void*)&memobj_input);
    clSetKernelArg(kernel, 1, sizeof(cl_mem), (void*)&memobj_output);
    clSetKernelArg(kernel, 2, sizeof(int), (void*)&WIDTH);
    clSetKernelArg(kernel, 3, sizeof(int), (void*)&HEIGHT);
    
    // Execute kernel
    size_t global_work_size[2] = {WIDTH, HEIGHT};
    size_t local_work_size[2] = {16, 16};
    
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 2, NULL, global_work_size, local_work_size, 0, NULL, NULL);
    clFinish(command_queue);
    
    // Read result
    clEnqueueReadBuffer(command_queue, memobj_output, CL_TRUE, 0, sizeof(unsigned char) * WIDTH * HEIGHT, output_image, 0, NULL, NULL);
    
    printf("Sobel edge detection completed!\n");
    printf("First 10x10 output pixels:\n");
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            printf("%3d ", output_image[i * WIDTH + j]);
        }
        printf("\n");
    }
    
    // Cleanup
    clReleaseKernel(kernel);
    clReleaseProgram(program);
    clReleaseMemObject(memobj_input);
    clReleaseMemObject(memobj_output);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);
    
    free(input_image);
    free(output_image);
    
    return 0;
}
```

## Memory Management

### 1. Memory Types

```c
// Memory allocation examples
cl_mem buffer = clCreateBuffer(context, CL_MEM_READ_WRITE, size, NULL, &ret);

// Read-only memory
cl_mem read_only = clCreateBuffer(context, CL_MEM_READ_ONLY, size, NULL, &ret);

// Write-only memory
cl_mem write_only = clCreateBuffer(context, CL_MEM_WRITE_ONLY, size, NULL, &ret);

// Memory with host pointer
float *host_ptr = malloc(size);
cl_mem buffer_with_host = clCreateBuffer(context, CL_MEM_READ_WRITE | CL_MEM_USE_HOST_PTR, size, host_ptr, &ret);
```

### 2. Memory Transfer Optimization

```c
// Asynchronous memory transfer
cl_event write_event;
clEnqueueWriteBuffer(command_queue, buffer, CL_FALSE, 0, size, data, 0, NULL, &write_event);

// Wait for completion
clWaitForEvents(1, &write_event);
clReleaseEvent(write_event);

// Non-blocking read
cl_event read_event;
clEnqueueReadBuffer(command_queue, buffer, CL_FALSE, 0, size, result, 0, NULL, &read_event);
```

## Performance Optimization

### 1. Work Group Size Optimization

```c
// Query device capabilities
cl_uint max_compute_units;
clGetDeviceInfo(device_id, CL_DEVICE_MAX_COMPUTE_UNITS, sizeof(max_compute_units), &max_compute_units, NULL);

size_t max_work_group_size;
clGetDeviceInfo(device_id, CL_DEVICE_MAX_WORK_GROUP_SIZE, sizeof(max_work_group_size), &max_work_group_size, NULL);

size_t max_work_item_sizes[3];
clGetDeviceInfo(device_id, CL_DEVICE_MAX_WORK_ITEM_SIZES, sizeof(max_work_item_sizes), max_work_item_sizes, NULL);

printf("Max compute units: %u\n", max_compute_units);
printf("Max work group size: %zu\n", max_work_group_size);
printf("Max work item sizes: [%zu, %zu, %zu]\n", max_work_item_sizes[0], max_work_item_sizes[1], max_work_item_sizes[2]);
```

### 2. Memory Access Patterns

```c
// Optimized kernel for coalesced memory access
const char *optimized_kernel = 
    "__kernel void optimized_add(__global const float *a, __global const float *b, __global float *c) {\n"
    "    int i = get_global_id(0);\n"
    "    int local_i = get_local_id(0);\n"
    "    int group_size = get_local_size(0);\n"
    "    \n"
    "    // Use local memory for better performance\n"
    "    __local float local_a[256];\n"
    "    __local float local_b[256];\n"
    "    \n"
    "    // Load data to local memory\n"
    "    local_a[local_i] = a[i];\n"
    "    local_b[local_i] = b[i];\n"
    "    \n"
    "    // Synchronize work items in work group\n"
    "    barrier(CLK_LOCAL_MEM_FENCE);\n"
    "    \n"
    "    // Perform computation\n"
    "    c[i] = local_a[local_i] + local_b[local_i];\n"
    "}\n";
```

### 3. Profiling and Timing

```c
// Enable profiling
cl_command_queue_properties props = CL_QUEUE_PROFILING_ENABLE;
cl_command_queue prof_queue = clCreateCommandQueue(context, device_id, props, &ret);

// Profile kernel execution
cl_event kernel_event;
clEnqueueNDRangeKernel(prof_queue, kernel, 1, NULL, &global_size, &local_size, 0, NULL, &kernel_event);

clFinish(prof_queue);

// Get timing information
cl_ulong start_time, end_time;
clGetEventProfilingInfo(kernel_event, CL_PROFILING_COMMAND_START, sizeof(start_time), &start_time, NULL);
clGetEventProfilingInfo(kernel_event, CL_PROFILING_COMMAND_END, sizeof(end_time), &end_time, NULL);

double execution_time = (end_time - start_time) / 1000000.0; // Convert to milliseconds
printf("Kernel execution time: %.3f ms\n", execution_time);

clReleaseEvent(kernel_event);
```

## Debugging OpenCL Programs

### 1. Error Checking

```c
// Check OpenCL errors
#define CHECK_ERROR(ret) \
    if (ret != CL_SUCCESS) { \
        printf("OpenCL error at line %d: %d\n", __LINE__, ret); \
        return -1; \
    }

// Usage
ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
CHECK_ERROR(ret);
```

### 2. Build Log Analysis

```c
// Get detailed build information
size_t log_size;
clGetProgramBuildInfo(program, device_id, CL_PROGRAM_BUILD_LOG, 0, NULL, &log_size);
char *log = (char*)malloc(log_size);
clGetProgramBuildInfo(program, device_id, CL_PROGRAM_BUILD_LOG, log_size, log, NULL);
printf("Build log:\n%s\n", log);
free(log);
```

### 3. Device Information

```c
// Print device information
void print_device_info(cl_device_id device) {
    char device_name[256];
    char device_vendor[256];
    char device_version[256];
    char driver_version[256];
    
    clGetDeviceInfo(device, CL_DEVICE_NAME, sizeof(device_name), device_name, NULL);
    clGetDeviceInfo(device, CL_DEVICE_VENDOR, sizeof(device_vendor), device_vendor, NULL);
    clGetDeviceInfo(device, CL_DEVICE_VERSION, sizeof(device_version), device_version, NULL);
    clGetDeviceInfo(device, CL_DRIVER_VERSION, sizeof(driver_version), driver_version, NULL);
    
    printf("Device Name: %s\n", device_name);
    printf("Device Vendor: %s\n", device_vendor);
    printf("Device Version: %s\n", device_version);
    printf("Driver Version: %s\n", driver_version);
}
```

## Best Practices

### 1. Memory Management

- Use appropriate memory flags (CL_MEM_READ_ONLY, CL_MEM_WRITE_ONLY)
- Minimize memory transfers between host and device
- Use memory mapping for large datasets
- Release all OpenCL objects properly

### 2. Kernel Optimization

- Optimize work group sizes for your device
- Use local memory for frequently accessed data
- Minimize branching in kernels
- Use vectorized operations when possible

### 3. Error Handling

- Always check OpenCL return values
- Use proper error reporting
- Implement graceful error recovery
- Test on different devices

## Next Steps

- [Vulkan Development](./vulkan-development.md)
- [Performance Optimization](./performance-optimization.md)
- [Mali GPU Development](./mali-gpu.md)

## Resources

- [OpenCL Specification](https://www.khronos.org/opencl/)
- [OpenCL Programming Guide](https://www.khronos.org/registry/OpenCL/specs/3.0-unified/html/OpenCL_API.html)
- [Mali GPU OpenCL Guide](https://developer.arm.com/ip-products/graphics-and-multimedia/mali-gpus)
- [Rock 5B+ OpenCL Documentation](https://wiki.radxa.com/Rock5/software/opencl)

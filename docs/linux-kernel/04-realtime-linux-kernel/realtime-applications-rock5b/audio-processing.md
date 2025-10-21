---
sidebar_position: 2
---

# Real-Time Audio Processing

Master real-time audio processing applications on the Rock 5B+ platform, understanding low-latency audio systems, DSP algorithms, and professional audio interfaces for high-quality audio applications.

## What is Real-Time Audio Processing?

**What**: Real-time audio processing involves capturing, processing, and playing audio with minimal latency while maintaining high quality and avoiding artifacts like clicks, pops, or dropouts.

**Why**: Understanding real-time audio is crucial because:

- **Low latency requirements** - Human perception sensitive to audio delays
- **High throughput** - Audio requires continuous data processing
- **Quality demands** - Professional audio requires high fidelity
- **Real-time constraints** - Missing deadlines causes audible artifacts
- **Rock 5B+ capability** - ARM64 platform suitable for audio processing

**When**: Real-time audio processing is used in:

- **Professional audio** - Recording studios, live sound
- **Music production** - Digital audio workstations (DAWs)
- **Telecommunications** - VoIP, video conferencing
- **Gaming** - Interactive audio, spatial sound
- **Embedded audio** - Smart speakers, audio appliances

**How**: Real-time audio processing works by:

- **Low-latency capture** - Minimizing input latency
- **Buffer management** - Efficient audio buffer handling
- **DSP algorithms** - Effects, filters, synthesis
- **Real-time scheduling** - Priority-based audio processing
- **Low-latency playback** - Minimizing output latency

**Where**: Real-time audio is found in:

- **Studio equipment** - Mixers, effects processors
- **Musical instruments** - Synthesizers, drum machines
- **Audio interfaces** - USB/network audio devices
- **Embedded systems** - Smart speakers, audio appliances
- **Rock 5B+** - ARM64 audio processing platform

## Low-Latency Audio Systems

**What**: Low-latency audio systems minimize the delay between audio input and output, critical for interactive audio applications.

**Why**: Understanding low-latency systems is important because:

- **Interactive performance** - Musicians need immediate audio feedback
- **Monitoring** - Real-time monitoring during recording
- **Live processing** - Effects processing without noticeable delay
- **User experience** - Low latency improves perceived quality

**How**: Low-latency audio systems work through:

```c
// Example: ALSA low-latency audio configuration
#include <alsa/asoundlib.h>

struct audio_config {
    snd_pcm_t *playback_handle;
    snd_pcm_t *capture_handle;
    snd_pcm_hw_params_t *hw_params;

    unsigned int sample_rate;
    unsigned int channels;
    snd_pcm_format_t format;
    snd_pcm_uframes_t buffer_size;
    snd_pcm_uframes_t period_size;
};

int configure_low_latency_audio(struct audio_config *config) {
    int err;

    // Configure playback
    err = snd_pcm_open(&config->playback_handle, "hw:0,0",
                      SND_PCM_STREAM_PLAYBACK, 0);
    if (err < 0) {
        pr_err("Playback open error: %s\n", snd_strerror(err));
        return err;
    }

    // Allocate hardware parameters
    snd_pcm_hw_params_alloca(&config->hw_params);
    snd_pcm_hw_params_any(config->playback_handle, config->hw_params);

    // Set access type
    snd_pcm_hw_params_set_access(config->playback_handle, config->hw_params,
                                 SND_PCM_ACCESS_RW_INTERLEAVED);

    // Set format (32-bit float for quality)
    config->format = SND_PCM_FORMAT_FLOAT_LE;
    snd_pcm_hw_params_set_format(config->playback_handle, config->hw_params,
                                config->format);

    // Set sample rate (48kHz standard)
    config->sample_rate = 48000;
    snd_pcm_hw_params_set_rate_near(config->playback_handle, config->hw_params,
                                    &config->sample_rate, 0);

    // Set channels (stereo)
    config->channels = 2;
    snd_pcm_hw_params_set_channels(config->playback_handle, config->hw_params,
                                  config->channels);

    // Set low-latency buffer size (64 samples = 1.3ms @ 48kHz)
    config->period_size = 64;
    config->buffer_size = config->period_size * 2;

    snd_pcm_hw_params_set_period_size_near(config->playback_handle,
                                           config->hw_params,
                                           &config->period_size, 0);
    snd_pcm_hw_params_set_buffer_size_near(config->playback_handle,
                                           config->hw_params,
                                           &config->buffer_size);

    // Apply configuration
    err = snd_pcm_hw_params(config->playback_handle, config->hw_params);
    if (err < 0) {
        pr_err("HW params error: %s\n", snd_strerror(err));
        return err;
    }

    pr_info("Audio configured: %d Hz, %d channels, %lu frame buffer\n",
            config->sample_rate, config->channels, config->buffer_size);

    return 0;
}
```

**Explanation**:

- **Small buffers** - 64-sample periods for low latency
- **High sample rate** - 48kHz for professional quality
- **Float format** - High dynamic range processing
- **Hardware access** - Direct hardware access for efficiency

## Audio Buffer Management

**What**: Audio buffer management involves efficiently handling audio data buffers to prevent underruns (dropouts) while minimizing latency.

**Why**: Understanding buffer management is important because:

- **Preventing dropouts** - Buffer underruns cause audible clicks
- **Minimizing latency** - Smaller buffers reduce latency
- **CPU efficiency** - Proper buffering reduces CPU load
- **Quality assurance** - Consistent audio without artifacts

**How**: Audio buffer management works through:

```c
// Example: Real-time audio processing loop
#define BUFFER_SIZE 64
#define NUM_CHANNELS 2

struct audio_processor {
    float input_buffer[BUFFER_SIZE * NUM_CHANNELS];
    float output_buffer[BUFFER_SIZE * NUM_CHANNELS];
    float process_buffer[BUFFER_SIZE * NUM_CHANNELS];

    // Processing state
    struct dsp_state *dsp;
    unsigned long frames_processed;
};

int audio_process_callback(struct audio_processor *proc,
                          snd_pcm_t *capture, snd_pcm_t *playback) {
    snd_pcm_sframes_t frames;
    int i;

    // Read input
    frames = snd_pcm_readi(capture, proc->input_buffer, BUFFER_SIZE);
    if (frames < 0) {
        snd_pcm_prepare(capture);
        pr_warn("Buffer underrun on capture\n");
        return frames;
    }

    // Process audio (DSP)
    for (i = 0; i < BUFFER_SIZE * NUM_CHANNELS; i++) {
        proc->output_buffer[i] = process_sample(proc->dsp,
                                               proc->input_buffer[i]);
    }

    // Write output
    frames = snd_pcm_writei(playback, proc->output_buffer, BUFFER_SIZE);
    if (frames < 0) {
        snd_pcm_prepare(playback);
        pr_warn("Buffer underrun on playback\n");
        return frames;
    }

    proc->frames_processed += BUFFER_SIZE;

    return 0;
}
```

**Explanation**:

- **Double buffering** - Separate input/output buffers
- **Error handling** - Recovering from underruns
- **Processing loop** - Per-sample DSP processing
- **Performance tracking** - Monitoring processed frames

## Rock 5B+ Audio Processing

**What**: The Rock 5B+ platform provides ARM64 computing power and audio hardware suitable for real-time audio processing with proper configuration.

**Why**: Understanding Rock 5B+ for audio is important because:

- **Cost-effective** - Affordable high-quality audio platform
- **Powerful** - 8-core ARM64 handles complex audio DSP
- **Audio hardware** - Built-in audio codec support
- **Linux audio stack** - ALSA, PulseAudio, JACK support
- **Real-time capable** - PREEMPT_RT for low-latency audio

**How**: Rock 5B+ audio processing involves:

```bash
# Rock 5B+ configuration for low-latency audio

# 1. Real-time kernel
# Boot with PREEMPT_RT kernel

# 2. CPU configuration
isolcpus=6,7 nohz_full=6,7
echo performance > /sys/devices/system/cpu/cpu6/cpufreq/scaling_governor
echo performance > /sys/devices/system/cpu/cpu7/cpufreq/scaling_governor

# 3. Audio thread configuration
# Run audio process with real-time priority
chrt -f 85 -p $(pidof audio_process)
taskset -cp 7 $(pidof audio_process)

# 4. IRQ affinity
# Move audio IRQs to dedicated core
echo 40 > /proc/irq/$(grep audio /proc/interrupts | cut -d: -f1)/smp_affinity

# 5. JACK configuration (if using JACK)
# ~/.jackdrc
/usr/bin/jackd -R -P85 -dalsa -dhw:0 -r48000 -p64 -n2

# 6. Disable audio power management
echo 0 > /sys/module/snd_hda_intel/parameters/power_save
```

**Explanation**:

- **Dedicated cores** - CPUs 6-7 for audio processing
- **Real-time priority** - SCHED_FIFO priority 85
- **IRQ affinity** - Audio interrupts on audio core
- **JACK configuration** - Professional audio server
- **Power management** - Disable to reduce latency

## Key Takeaways

**What** you've accomplished:

1. **Audio Processing Understanding** - You understand real-time audio requirements
2. **Low-Latency Systems** - You know how to configure low-latency audio
3. **Buffer Management** - You understand audio buffer handling
4. **Rock 5B+ Audio** - You understand Rock 5B+ for audio processing

**Why** these concepts matter:

- **Professional audio** - High-value skill in audio industry
- **User experience** - Low latency improves perceived quality
- **Platform expertise** - Rock 5B+ for cost-effective audio

## Next Steps

Continue with:

1. **Robotics Control** - Robot control systems

## Resources

**Audio Programming**:

- [ALSA Project](https://www.alsa-project.org/) - Advanced Linux Sound Architecture
- [JACK Audio](https://jackaudio.org/) - Professional audio server

**Rock 5B+ Resources**:

- [Rock 5B+ Audio](https://wiki.radxa.com/Rock5/hardware/audio) - Audio hardware guide

Happy learning! 🐧

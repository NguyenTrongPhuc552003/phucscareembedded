---
sidebar_position: 1
---

# Kernel Contribution Process

Master the Linux kernel contribution workflow, understanding how to prepare, submit, and shepherd patches through the community review process to become part of the mainline kernel.

## What is the Kernel Contribution Process?

**What**: The kernel contribution process is the formal workflow by which developers submit patches, respond to reviews, and integrate changes into the Linux kernel mainline.

**Why**: Understanding the contribution process is crucial because:

- **Community Participation**: Become part of the kernel community
- **Code Quality**: Learn industry-standard development practices
- **Professional Growth**: Build reputation in open source
- **Problem Solving**: Fix bugs and add features you need
- **Career Development**: Valuable professional experience
- **Knowledge Sharing**: Share improvements with community

**When**: The contribution process is used when:

- **Bug Fixes**: Found and fixed a kernel bug
- **Feature Addition**: Implemented a new feature
- **Performance Improvement**: Optimized kernel code
- **Driver Development**: Created or improved a driver
- **Documentation**: Improved kernel documentation
- **Testing**: Found issues that need reporting

**How**: The contribution process works through:

```bash
# Example: Kernel contribution workflow
# 1. Fork and clone kernel
git clone git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
cd linux

# 2. Create topic branch
git checkout -b my-feature

# 3. Make changes
# Edit files...
vim drivers/my_driver.c

# 4. Commit changes
git add drivers/my_driver.c
git commit -s -v

# Commit message format:
# subsystem: Short description (50 chars or less)
#
# More detailed explanation of what this patch does.
# - Use bullet points for clarity
# - Explain WHY, not just WHAT
# - Reference any relevant issues
#
# Signed-off-by: Your Name <your.email@example.com>

# 5. Format patches
git format-patch -1 HEAD

# 6. Check patches
scripts/checkpatch.pl 0001-*.patch

# 7. Find maintainers
scripts/get_maintainer.pl 0001-*.patch

# 8. Send patch
git send-email --to=maintainer@example.com \
               --cc=list@vger.kernel.org \
               0001-*.patch

# 9. Respond to reviews
# Address feedback and send v2
git format-patch -v2 -1 HEAD
git send-email --to=maintainer@example.com \
               --cc=list@vger.kernel.org \
               --in-reply-to=<original-message-id> \
               v2-0001-*.patch
```

**Where**: The contribution process is essential in:

- **Open Source Development**: Linux kernel and other projects
- **Professional Work**: Contributing employer code upstream
- **Personal Projects**: Sharing improvements
- **Community Building**: Building open source community
- **Career Growth**: Establishing professional reputation

## Preparing Patches

**What**: Patch preparation involves creating well-formed, properly formatted patches that follow kernel coding standards and submission requirements.

**Why**: Understanding patch preparation is important because:

- **Code Quality**: Ensures patches meet quality standards
- **Review Success**: Well-prepared patches get accepted faster
- **Maintainer Time**: Reduces maintainer review burden
- **Community Respect**: Shows respect for community standards
- **Professional Image**: Demonstrates professional competence

**How**: Patches are prepared through:

```bash
# Example: Patch preparation
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Enable signed-off-by
git config --global format.signoff true

# Configure email for git send-email
git config --global sendemail.smtpserver smtp.gmail.com
git config --global sendemail.smtpserverport 587
git config --global sendemail.smtpencryption tls
git config --global sendemail.smtpuser your.email@example.com

# Create logical commits
# Each commit should be:
# - Atomic: One logical change
# - Complete: Builds and works
# - Bisectable: Doesn't break bisection

# Good commit example
git add drivers/my_driver.c
git commit -s

# Commit message:
# drivers: my_driver: Fix memory leak in probe function
#
# The probe function was not freeing allocated memory in the error
# path, causing a memory leak when probe failed.
#
# This patch adds proper error handling to free allocated resources
# before returning error.
#
# Fixes: abc123def456 ("drivers: my_driver: Add initial driver")
# Signed-off-by: Your Name <your.email@example.com>

# Split large changes into patch series
# Example: Add new feature in multiple logical steps
git format-patch -3 HEAD  # Last 3 commits as patch series

# Add cover letter for patch series
git format-patch --cover-letter -3 HEAD
# Edit 0000-cover-letter.patch with series description

# Check patch compliance
scripts/checkpatch.pl --strict 0001-*.patch

# Common checkpatch warnings to fix:
# - Line too long (>80 chars)
# - Missing blank line after declarations
# - Incorrect spacing around operators
# - Use of deprecated functions
# - Missing SPDX license identifier

# Build test patches
make allmodconfig
make -j$(nproc)
make modules

# Test on multiple architectures
make ARCH=arm64 defconfig
make ARCH=arm64 -j$(nproc)

make ARCH=x86_64 defconfig
make ARCH=x86_64 -j$(nproc)
```

**Explanation**:

- **Git configuration**: Set up identity and email
- **Commit structure**: One logical change per commit
- **Commit messages**: Clear, descriptive messages
- **Code standards**: Follow kernel coding style
- **Build testing**: Verify patches build correctly
- **Multi-arch testing**: Test on different architectures

**Where**: Patch preparation applies to:

- **Bug fixes**: Any kernel bug fix
- **New features**: Feature additions
- **Driver development**: New or updated drivers
- **Performance improvements**: Optimization patches
- **Documentation**: Documentation updates

## Submitting Patches

**What**: Patch submission involves sending properly formatted patches to the appropriate maintainers and mailing lists using the correct procedures.

**Why**: Understanding patch submission is important because:

- **Correct Delivery**: Ensures patches reach right people
- **Community Standards**: Follows established procedures
- **Review Efficiency**: Facilitates timely review
- **Tracking**: Allows proper patch tracking
- **Professional Conduct**: Demonstrates professionalism

**How**: Patches are submitted through:

```bash
# Example: Patch submission
# Find maintainers and lists
scripts/get_maintainer.pl --no-rolestats 0001-*.patch
# Output:
# John Doe <john@example.com> (maintainer)
# linux-kernel@vger.kernel.org (open list)
# dri-devel@lists.freedesktop.org (subscriber list)

# For patch series, create cover letter
git format-patch --cover-letter --thread -3 HEAD

# Edit cover letter (0000-cover-letter.patch)
# Subject: [PATCH 0/3] Add feature X support
#
# This patch series adds support for feature X by:
# 1. Refactoring existing code
# 2. Adding new infrastructure
# 3. Implementing feature X
#
# Tested on Rock 5B+ with the following configurations:
# - Default config
# - Allmodconfig
# - Feature X enabled/disabled
#
# Performance testing shows 10% improvement in benchmark Y.
#
# Changes in v2:
# - Fixed build warning reported by kernel test robot
# - Addressed review comments from John Doe
# - Added more detailed commit messages

# Send patch or series
git send-email --to="John Doe <john@example.com>" \
               --cc=linux-kernel@vger.kernel.org \
               --cc=dri-devel@lists.freedesktop.org \
               0000-*.patch 0001-*.patch 0002-*.patch 0003-*.patch

# Alternative: Send single patch
git send-email --to=maintainer@example.com \
               --cc=list@vger.kernel.org \
               0001-my-patch.patch

# Mark patch as RFC (Request For Comments)
git format-patch --subject-prefix="RFC PATCH" -1 HEAD
# Use for work-in-progress or design discussion

# Send patch version 2
git format-patch -v2 -1 HEAD
# Include changelog in cover letter or below ---

# Example patch with changelog:
# Subject: [PATCH v2] drivers: my_driver: Fix memory leak
#
# Fix memory leak in probe error path.
#
# Signed-off-by: Your Name <your.email@example.com>
# ---
# Changes in v2:
# - Use devm_kzalloc instead of kfree in error path (suggested by John)
# - Add Fixes tag
#
#  drivers/my_driver.c | 5 +++--
#  1 file changed, 3 insertions(+), 2 deletions(-)

# Track patch status
# Use public-inbox archives
# https://lore.kernel.org/linux-kernel/
# Search by subject or message ID

# Use patchwork
# https://patchwork.kernel.org/
# Track patch review status
```

**Explanation**:

- **Maintainer identification**: Find correct recipients
- **Cover letters**: Explain patch series context
- **Threading**: Keep related patches in thread
- **Version tracking**: Properly version iterations
- **Status tracking**: Monitor patch progress

**Where**: Patch submission applies to:

- **All kernel changes**: Any kernel modification
- **Mailing lists**: Appropriate subsystem lists
- **Maintainer trees**: Subsystem maintainer repositories
- **Public archives**: Permanent patch records

## Responding to Review Feedback

**What**: Review response involves addressing maintainer and community feedback, making requested changes, and resubmitting improved patches.

**Why**: Understanding review response is important because:

- **Improvement**: Feedback improves patch quality
- **Learning**: Learn from experienced developers
- **Acceptance**: Required for patch acceptance
- **Collaboration**: Essential for community work
- **Professional Growth**: Builds review skills

**How**: Review feedback is handled through:

```bash
# Example: Responding to review feedback
# Read feedback carefully
# Example feedback:
# > On Mon, Oct 22, 2024, John Doe wrote:
# > > +   ptr = kmalloc(sizeof(*ptr), GFP_KERNEL);
# > > +   if (!ptr)
# > > +       return -ENOMEM;
# >
# > Please use devm_kzalloc() here to avoid manual cleanup.
# > Also, this allocation should probably be moved earlier
# > in the probe function before registering the device.

# Make requested changes
vim drivers/my_driver.c
# Change kmalloc to devm_kzalloc
# Move allocation earlier

# Commit with explanatory message
git add drivers/my_driver.c
git commit -s
# Commit message:
# drivers: my_driver: Use devm_kzalloc and fix probe ordering
#
# As suggested by John Doe, switch to devm_kzalloc() to simplify
# cleanup and move memory allocation earlier in probe sequence
# before device registration to avoid race conditions.
#
# Signed-off-by: Your Name <your.email@example.com>

# Create v2 patch
git format-patch -v2 -1 HEAD

# Add changelog below ---
# Edit the patch file to add:
# ---
# Changes in v2:
# - Switch to devm_kzalloc() (John Doe)
# - Move allocation before device registration (John Doe)
# - Fixed typo in comment (Jane Smith)

# Respond to review email
# Don't send patch immediately - respond first
# Example email:
# Subject: Re: [PATCH] drivers: my_driver: Fix memory leak
#
# Hi John,
#
# Thank you for the review!
#
# On Mon, Oct 22, 2024 at 10:00 AM, John Doe <john@example.com> wrote:
# > Please use devm_kzalloc() here
#
# Good point. I've switched to devm_kzalloc() in v2.
#
# > Also, this allocation should probably be moved earlier
#
# Agreed. I've moved it before device registration to avoid
# the race condition you pointed out.
#
# I'll send v2 shortly.
#
# Thanks,
# Your Name

# Then send v2
git send-email --to="John Doe <john@example.com>" \
               --cc=linux-kernel@vger.kernel.org \
               --in-reply-to="<original-message-id@example.com>" \
               v2-0001-*.patch

# Handle disagreements professionally
# If you disagree with feedback:
# 1. Explain your reasoning clearly
# 2. Provide technical justification
# 3. Be open to discussion
# 4. Accept maintainer decision

# Example disagreement response:
# Subject: Re: [PATCH] drivers: my_driver: Add feature X
#
# Hi John,
#
# On Mon, Oct 22, 2024 at 10:00 AM, John Doe <john@example.com> wrote:
# > I think this should use approach Y instead of X
#
# I considered approach Y, but chose X because:
# 1. Performance: X is 20% faster in benchmarks
# 2. Memory: X uses 10KB less memory
# 3. Compatibility: X matches existing driver patterns
#
# However, I'm happy to switch to Y if you feel the benefits
# of consistency outweigh the performance difference. Please
# let me know your preference.
#
# Thanks,
# Your Name

# Multiple review iterations
# Be patient - patches may require several revisions
# Common iteration reasons:
# - Code style issues
# - Design concerns
# - Performance questions
# - Compatibility issues
# - Testing requests

# Keep track of all feedback
# Create checklist of review comments
# - [ ] Fix coding style (John)
# - [ ] Add error handling (Jane)
# - [ ] Update documentation (Bob)
# - [ ] Test on ARM64 (kernel test robot)
```

**Explanation**:

- **Careful reading**: Understand feedback completely
- **Prompt response**: Acknowledge and address quickly
- **Clear changes**: Explain what was changed and why
- **Professional tone**: Maintain respectful communication
- **Persistence**: Continue through multiple iterations

**Where**: Review response applies to:

- **All submissions**: Every patch receives feedback
- **Community interaction**: Essential for participation
- **Learning process**: Key to improvement
- **Relationship building**: Establishes community connections

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Process Understanding**: You understand the contribution workflow
2. **Patch Preparation**: You know how to prepare quality patches
3. **Submission Skills**: You can submit patches correctly
4. **Review Response**: You know how to handle feedback
5. **Community Participation**: You can engage with the community

**Why** these concepts matter:

- **Open Source Contribution**: Enable kernel contributions
- **Professional Development**: Build development skills
- **Community Membership**: Join kernel community
- **Code Quality**: Learn best practices
- **Career Growth**: Valuable professional experience

**When** to use these concepts:

- **Bug Fixes**: Found a bug to fix
- **Feature Development**: Adding new capabilities
- **Driver Creation**: Developing drivers
- **Documentation**: Improving docs
- **Learning**: Understanding kernel development

**Where** these skills apply:

- **Linux Kernel**: Primary application
- **Open Source**: Other open source projects
- **Professional Work**: Corporate kernel work
- **Personal Projects**: Individual contributions
- **Community Service**: Helping others

## Next Steps

**What** you're ready for next:

After mastering the contribution process, you should be ready to:

1. **Learn Code Review**: Understand how to review others' patches
2. **Study Maintainer Guidelines**: Learn maintainer responsibilities
3. **Make First Contribution**: Submit your first patch
4. **Build Reputation**: Establish yourself in community

**Where** to go next:

Continue with the next lesson on **"Code Review"** to learn:

- How to review patches effectively
- What to look for in code review
- Providing constructive feedback
- Review etiquette and standards

**Why** the next lesson is important:

The next lesson teaches you how to review others' code, which is essential for becoming a trusted community member and eventually a maintainer.

**How** to continue learning:

1. **Study Existing Patches**: Read kernel mailing list archives
2. **Practice Locally**: Create and format patches
3. **Start Small**: Begin with simple fixes
4. **Get Feedback**: Submit patches and learn from reviews
5. **Help Others**: Review others' patches

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Submitting Patches](https://www.kernel.org/doc/html/latest/process/submitting-patches.html) - Patch submission guide
- [Coding Style](https://www.kernel.org/doc/html/latest/process/coding-style.html) - Kernel coding standards
- [Email Clients](https://www.kernel.org/doc/html/latest/process/email-clients.html) - Email client configuration

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Beginner resources
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - LKML archives
- [Patchwork](https://patchwork.kernel.org/) - Patch tracking
- [First Kernel Patch](https://kernelnewbies.org/FirstKernelPatch) - Tutorial for first patch

**Tools and Scripts**:

- [get_maintainer.pl](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/scripts/get_maintainer.pl) - Find maintainers
- [checkpatch.pl](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/scripts/checkpatch.pl) - Check patch style
- [git send-email](https://git-scm.com/docs/git-send-email) - Send patches via email

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development guide
- [Kernel Development Tutorial](https://kernelnewbies.org/KernelHacking) - Hacking tutorial
- [The Linux Programming Interface](https://man7.org/tlpi/) - Linux system programming

Happy contributing! 🐧✨


---
sidebar_position: 3
---

# Maintainer Guidelines

Master the responsibilities and workflows of Linux kernel maintainers, understanding how to manage subsystems, coordinate with contributors, and maintain high-quality code in the kernel.

## What is Kernel Maintenance?

**What**: Kernel maintenance is the ongoing responsibility of reviewing patches, managing subsystem development, coordinating releases, and ensuring code quality for a specific kernel subsystem or driver.

**Why**: Understanding kernel maintenance is crucial because:

- **Code Quality**: Maintainers ensure subsystem quality
- **Community Leadership**: Guide subsystem development direction
- **Knowledge Stewardship**: Preserve subsystem knowledge
- **Gatekeeping**: Control what enters the kernel
- **Coordination**: Organize development efforts
- **Career Growth**: Leadership in open source

**When**: Maintenance activities occur when:

- **Patch Review**: Reviewing submitted patches
- **Integration**: Merging accepted changes
- **Release Coordination**: Preparing for kernel releases
- **Bug Triage**: Addressing reported bugs
- **Planning**: Directing subsystem evolution
- **Mentoring**: Helping contributors

**How**: Maintenance operates through:

```bash
# Example: Maintainer workflow
# Setup maintainer tree
git clone git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
cd linux
git remote add my-tree git://git.kernel.org/.../my-tree.git

# Create topic branches for different features
git checkout -b topic/feature-a mainline/master
git checkout -b topic/feature-b mainline/master
git checkout -b topic/fixes mainline/master

# Review and apply patches
# Receive patch via email
# Review patch (see Code Review lesson)
# If accepted:
git am /path/to/patch.mbox

# OR use b4 tool
b4 am <message-id>
git am ./v1_*.mbx

# Create integration branch
git checkout -b for-next mainline/master
git merge topic/feature-a
git merge topic/feature-b

# Push to maintainer tree
git push my-tree for-next

# Send pull request to upstream
git request-pull mainline/master my-tree for-next > pull-request.txt
# Email pull-request.txt to upstream maintainer

# Example pull request:
The following changes since commit abc123:

  Author (2024-10-22 10:00 +0000)
    Some previous commit

are available in the git repository at:

  git://git.kernel.org/.../my-tree.git for-next

for you to fetch changes up to def456:

  Author (2024-10-22 11:00 +0000)
    My latest commit

This pull request contains:
- Feature A implementation (5 patches)
- Feature B support (3 patches)
- Bug fixes for issue #123 (2 patches)

All patches have been reviewed and tested on Rock 5B+ and x86_64.

----------------------------------------------------------------
Author (3):
      patch 1 title
      patch 2 title
      patch 3 title

Another Author (2):
      patch 4 title
      patch 5 title

 drivers/mydriver/main.c    | 120 ++++++++++++++++++++++++++++++-
 drivers/mydriver/feature.c |  45 ++++++++++++
 2 files changed, 165 insertions(+)
```

**Where**: Maintenance is essential in:

- **Kernel Subsystems**: Every kernel subsystem
- **Driver Trees**: Device driver maintenance
- **Architecture Trees**: CPU architecture code
- **Tool Maintenance**: Kernel tools and scripts
- **Documentation**: Documentation tree

## Maintainer Responsibilities

**What**: Maintainer responsibilities encompass the various duties and obligations that maintainers have toward their subsystem, contributors, and the broader kernel community.

**Why**: Understanding responsibilities is important because:

- **Role Clarity**: Know what's expected
- **Time Management**: Allocate effort appropriately
- **Community Service**: Fulfill obligations to community
- **Quality Assurance**: Maintain subsystem standards
- **Sustainability**: Ensure long-term subsystem health

**How**: Responsibilities are fulfilled through:

```bash
# Example: Maintainer responsibilities

# 1. Patch Review
# - Review all patches for subsystem
# - Provide timely feedback (within 1-2 weeks)
# - Apply or reject with clear reasoning
# - Mentor new contributors

# Review template:
From: Maintainer <maintainer@example.com>
To: Contributor <contributor@example.com>
Subject: Re: [PATCH] subsystem: Add feature X

Hi Contributor,

Thank you for the patch!

Overall this looks good. A few comments:

1. [Technical feedback]
2. [Code review]
3. [Testing request]

With these changes:
Acked-by: Maintainer <maintainer@example.com>

Thanks,
Maintainer

# 2. Integration and Testing
# - Test patches before applying
# - Ensure no regressions
# - Run automated tests
# - Build test multiple configs

# Testing script example:
#!/bin/bash
# Test patch on multiple configurations

CONFIGS="defconfig allmodconfig"
ARCHES="x86_64 arm64"

for arch in $ARCHES; do
    for config in $CONFIGS; do
        echo "Testing $arch $config..."
        make ARCH=$arch $config
        make ARCH=$arch -j$(nproc) || exit 1
    done
done

echo "All tests passed!"

# 3. Tree Management
# - Maintain clean git history
# - Organize topic branches
# - Prepare pull requests
# - Track patch status

# Branch organization:
# - for-next: Integration branch for next merge window
# - fixes: Critical fixes for current release
# - topic/*: Feature-specific branches

# 4. Release Coordination
# - Submit pull requests on time
# - Coordinate with upstream maintainer
# - Handle merge window submissions
# - Manage stable backports

# Release calendar awareness:
# - Merge window: ~2 weeks after release
# - RC cycle: ~7 weeks
# - Prepare pull requests before merge window
# - Fixes only during RC cycle

# 5. Bug Triage
# - Monitor bug reports
# - Assign priority
# - Coordinate fixes
# - Verify resolutions

# Bug triage template:
Priority: High/Medium/Low
Status: New/Assigned/Fixed/Verified
Assignee: [Name]
Target: [Release/Date]
Description: [Bug description]
Reproduction: [Steps]
Impact: [Affected users/systems]

# 6. Documentation
# - Maintain subsystem documentation
# - Update with API changes
# - Document design decisions
# - Provide examples

# Documentation files:
# - Documentation/subsystem/overview.rst
# - Documentation/subsystem/api.rst
# - Documentation/subsystem/examples/

# 7. Community Engagement
# - Answer questions on mailing list
# - Participate in discussions
# - Represent subsystem in meetings
# - Recruit contributors

# Example response to question:
From: Maintainer <maintainer@example.com>
To: User <user@example.com>
Cc: linux-subsystem@vger.kernel.org
Subject: Re: Question about subsystem API

Hi User,

> How should I use API X in situation Y?

For situation Y, you should use API X like this:
[Example code]

The reason is [explanation].

See also: Documentation/subsystem/api.rst section 3.

Let me know if you have more questions!

Thanks,
Maintainer

# 8. Succession Planning
# - Identify potential co-maintainers
# - Delegate responsibilities
# - Document processes
# - Plan for handoff

# Co-maintainer responsibilities:
# - Share patch review load
# - Backup during vacation/leave
# - Specialized area expertise
# - Eventual succession
```

**Explanation**:

- **Patch review**: Timely, thorough review
- **Integration**: Careful merging and testing
- **Tree management**: Clean, organized repositories
- **Release coordination**: On-time submissions
- **Bug triage**: Prioritize and track fixes
- **Documentation**: Keep docs current
- **Community**: Engage and support users
- **Succession**: Plan for continuity

**Where**: Responsibilities apply across:

- **Subsystem maintenance**: All maintained areas
- **Time commitment**: Ongoing, not one-time
- **Skill levels**: Scale with subsystem complexity
- **Community interaction**: Constant engagement

## Managing Contributions

**What**: Managing contributions involves efficiently processing patch submissions, providing feedback, tracking revisions, and deciding what to accept or reject.

**Why**: Understanding contribution management is important because:

- **Efficiency**: Process patches quickly
- **Quality**: Maintain high standards
- **Fairness**: Treat all contributors equally
- **Transparency**: Clear decision-making
- **Sustainability**: Manageable workload

**How**: Contributions are managed through:

```bash
# Example: Contribution management

# 1. Patch Tracking
# Use patchwork or b4 to track patches
# https://patchwork.kernel.org/project/subsystem/

# Mark patch status:
# - New: Just submitted
# - Under Review: Being reviewed
# - Accepted: Will be merged
# - Rejected: Won't be merged
# - Changes Requested: Needs revision
# - Superseded: New version submitted

# 2. Prioritization
# Triage patches by priority:
# P0: Critical bugs, regressions
# P1: Important features, significant bugs
# P2: Nice-to-have features, minor bugs
# P3: Cleanup, documentation

# Review high-priority patches first
# Communicate expected timeline for lower priority

# 3. Delegation
# For large subsystems, delegate to co-maintainers:
# - By component/driver
# - By type (features vs. fixes)
# - By contributor level (experienced vs. new)

# Delegation email:
"Hi Co-maintainer,

Could you review the patches for component X? I'll handle
component Y. Let's sync on Friday to discuss any issues.

Thanks!"

# 4. Batch Processing
# Process patches in batches:
# - Set aside dedicated review time
# - Review similar patches together
# - Apply related patches as series

# Example schedule:
# Monday: Review new patches
# Wednesday: Follow up on revisions
# Friday: Integration and testing

# 5. Communication Templates
# Save time with templates for common responses

# Template: Need more info
"Hi Author,

Thanks for the patch! Could you provide more information:
1. Test results showing this fixes the issue
2. Explanation of why approach X was chosen over Y
3. Impact analysis on existing users

Thanks,
Maintainer"

# Template: Needs revision
"Hi Author,

Thank you for the patch! Please make the following changes:
1. [Change 1]
2. [Change 2]
3. [Change 3]

Please send v2 addressing these points.

Thanks,
Maintainer"

# Template: Accepted
"Hi Author,

Thanks for the patch! This looks good now.

Applied to my tree for-next branch.

Regards,
Maintainer"

# 6. Automated Tools
# Use tools to streamline workflow:

# b4: Retrieve and apply patches
b4 am <message-id>
b4 ty <message-id>  # Send thank-you

# checkpatch: Verify style
scripts/checkpatch.pl --strict patch.diff

# get_maintainer: Verify recipients
scripts/get_maintainer.pl patch.diff

# kernel test robot: Automatic build testing
# Automatically tests patches and reports issues

# 7. Version Tracking
# Track patch versions:
# v1 -> v2 -> v3
# Ensure v2 addresses v1 feedback
# Check changelog in commit message

# If changelog missing:
"Please include a changelog after the --- line explaining
what changed from v1 to v2."

# 8. Series Management
# For patch series:
# - Review cover letter first
# - Understand overall design
# - Review patches in order
# - Check interdependencies
# - Test series as a whole

# Series review template:
"Hi Author,

Thanks for the series!

Overall design looks good. Some comments on individual patches:

Patch 1: [feedback]
Patch 2: [feedback]
Patch 3: Looks good
Patch 4: [feedback]

Please send v2 addressing these points for patches 1, 2, and 4.

Thanks,
Maintainer"
```

**Explanation**:

- **Tracking**: Monitor patch status
- **Prioritization**: Focus on important patches
- **Delegation**: Share workload
- **Batching**: Efficient processing
- **Templates**: Save time
- **Automation**: Use available tools
- **Versioning**: Track iterations
- **Series**: Handle multi-patch submissions

**Where**: Contribution management applies to:

- **All maintainers**: Required for all
- **High-volume subsystems**: Especially important
- **Team maintenance**: Shared responsibilities
- **Long-term sustainability**: Prevents burnout

## Subsystem Governance

**What**: Subsystem governance involves making decisions about technical direction, API design, and major changes that affect the subsystem's evolution.

**Why**: Understanding governance is important because:

- **Direction**: Guides subsystem development
- **Consistency**: Maintains design coherence
- **Stakeholder Management**: Balances different interests
- **Conflict Resolution**: Handles disagreements
- **Long-term Planning**: Ensures sustainable evolution

**How**: Governance works through:

```bash
# Example: Subsystem governance

# 1. Technical Direction
# Define and communicate subsystem goals:

# Example: Subsystem vision document
SUBSYSTEM GOALS FOR 2025
=========================

Short-term (next release):
- Improve performance by 20%
- Add feature X
- Fix known bugs

Medium-term (next year):
- Redesign API for better usability
- Support new hardware generation
- Improve power management

Long-term (2-3 years):
- Complete rewrite for scalability
- Integration with subsystem Y
- Full ARM64 optimization

# 2. API Design Decisions
# Make deliberate API choices:

# API design review process:
1. Proposal on mailing list
2. Gather feedback (1-2 weeks)
3. Discuss alternatives
4. Make decision
5. Document rationale

# Example API discussion:
"After discussion, we've decided to use approach X for API Y
because:
1. Better performance in common case
2. Simpler for users
3. Easier to maintain
4. Follows precedent in subsystem Z

Alternative approach A was considered but rejected because
[reasons]. See discussion thread [link].

This decision is final for this release cycle. We can
revisit in future if new information arises."

# 3. Change Management
# Control major changes:

# Major change criteria:
# - ABI/API changes
# - Architectural changes
# - Performance impact
# - Compatibility impact

# Major change process:
1. RFC (Request for Comments) patch
2. Extended discussion period
3. Proof of concept
4. Testing on multiple platforms
5. Migration plan for users
6. Documentation update
7. Approval from multiple reviewers

# 4. Conflict Resolution
# Handle disagreements:

# Resolution process:
1. Understand all viewpoints
2. Gather technical facts
3. Consider precedents
4. Weigh trade-offs
5. Make decision
6. Explain reasoning
7. Move forward

# Example conflict resolution:
"After reviewing both proposals and considering feedback,
I've decided to go with approach X because [technical
reasons]. I understand the concerns about [issue], but
believe the benefits outweigh the drawbacks.

For those who prefer approach Y, we can revisit if X
proves problematic in practice. Let's move forward with
X and reassess after next release.

Thanks everyone for the discussion."

# 5. Backward Compatibility
# Maintain stability:

# Compatibility rules:
# - Never break userspace ABI
# - Deprecate before removing
# - Provide migration path
# - Document incompatibilities

# Deprecation process:
1. Mark as deprecated in code
2. Add to deprecation schedule
3. Update documentation
4. Provide alternatives
5. Wait minimum 2 releases
6. Remove with clear notice

# Example deprecation:
/**
 * old_api() - Deprecated API
 *
 * This API is deprecated and will be removed in kernel 6.10.
 * Use new_api() instead.
 *
 * Returns: ...
 */
__deprecated
int old_api(void);

# 6. Quality Standards
# Define and enforce standards:

# Code quality requirements:
# - Passes checkpatch
# - Builds without warnings
# - Includes tests
# - Has documentation
# - Reviewed by 2+ people for major changes

# Performance requirements:
# - No regressions
# - Benchmarks for performance claims
# - Scalability tested

# Security requirements:
# - No known vulnerabilities
# - Security review for security-sensitive code
# - Secure coding practices

# 7. Community Building
# Foster healthy community:

# Community health practices:
# - Welcoming to newcomers
# - Credit contributors
# - Share knowledge
# - Recognize good work
# - Mentor actively

# Example recognition:
"Thanks to all contributors this release!

Special thanks to:
- NewContributor for persistent work on feature X
- Reviewer for thorough reviews
- Tester for extensive testing on ARM64

Couldn't do it without you!"

# 8. Succession Planning
# Ensure continuity:

# Succession checklist:
# - Document processes
# - Identify co-maintainers
# - Delegate incrementally
# - Share tribal knowledge
# - Plan transition

# Co-maintainer promotion:
"I'd like to propose NewMaintainer as co-maintainer for
component X. They have:
- Contributed 50+ patches over 2 years
- Consistently provided quality reviews
- Deep knowledge of component X
- Shown good judgment and professionalism

Any objections? If not, will update MAINTAINERS next week.

Thanks,
Maintainer"
```

**Explanation**:

- **Direction**: Set technical vision
- **API design**: Make deliberate choices
- **Change management**: Control major changes
- **Conflict resolution**: Handle disagreements
- **Compatibility**: Maintain stability
- **Standards**: Enforce quality
- **Community**: Build healthy culture
- **Succession**: Plan continuity

**Where**: Governance applies to:

- **Established subsystems**: Mature code areas
- **Growing subsystems**: Scaling areas
- **Critical subsystems**: Core kernel components
- **Large communities**: Many contributors

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Maintenance Understanding**: You understand maintainer role
2. **Responsibility Knowledge**: You know maintainer duties
3. **Contribution Management**: You can manage patches
4. **Governance Skills**: You understand subsystem governance
5. **Leadership Readiness**: You're prepared for maintainer role

**Why** these concepts matter:

- **Code Quality**: Maintainers ensure quality
- **Community Health**: Maintainers build community
- **Kernel Evolution**: Maintainers guide development
- **Professional Growth**: Leadership opportunity
- **Open Source**: Essential for sustainability

**When** to use these concepts:

- **Subsystem Maintenance**: Active maintainer role
- **Co-Maintenance**: Sharing responsibilities
- **Aspiring Maintenance**: Preparing for role
- **Understanding Process**: Knowing how kernel works
- **Career Planning**: Professional development

**Where** these skills apply:

- **Kernel Maintenance**: Linux kernel subsystems
- **Open Source**: Other open source projects
- **Professional Work**: Technical leadership
- **Community Service**: Giving back to community
- **Career Growth**: Leadership positions

## Next Steps

**What** you're ready for next:

After understanding maintainer guidelines, you should be ready to:

1. **Apply Knowledge**: Work toward maintainer role
2. **Practice Leadership**: Take on responsibilities
3. **Build Relationships**: Network with maintainers
4. **Continue Learning**: Deepen subsystem knowledge
5. **Start Projects**: Apply all learned skills

**Where** to go next:

Continue with the **Capstone Projects** lessons to apply everything you've learned in comprehensive real-world projects on the Rock 5B+ platform.

**Why** capstone projects are important:

Capstone projects integrate all the skills you've learned throughout the course, from kernel fundamentals to maintainer guidelines, into practical, portfolio-worthy implementations.

**How** to continue your maintainer journey:

1. **Contribute Regularly**: Build track record
2. **Review Actively**: Establish review expertise
3. **Document Knowledge**: Share what you learn
4. **Network**: Build relationships with maintainers
5. **Be Patient**: Maintainer role takes time

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Maintainer Handbook](https://www.kernel.org/doc/html/latest/maintainer/) - Official maintainer guide
- [MAINTAINERS File](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/MAINTAINERS) - Current maintainers

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Community resources
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Main mailing list
- [Kernel Summit](https://events.linuxfoundation.org/linux-kernel-summit/) - Annual maintainer summit

**Tools**:

- [b4](https://git.kernel.org/pub/scm/utils/b4/b4.git/) - Patch workflow tool
- [Patchwork](https://patchwork.kernel.org/) - Patch tracking
- [0day Robot](https://01.org/lkp/documentation/0-day-quick-start) - Automated testing

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development guide
- [How to Become a Kernel Maintainer](https://www.kernel.org/doc/html/latest/maintainer/maintainer-entry-profile.html) - Maintainer path
- [Maintainer Tools](https://github.com/mricon/kw) - Konstantin's workflow tools

Happy maintaining! 🛠️👨‍💼


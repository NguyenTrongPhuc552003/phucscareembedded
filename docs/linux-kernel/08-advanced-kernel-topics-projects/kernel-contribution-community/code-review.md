---
sidebar_position: 2
---

# Code Review

Master the art of kernel code review, understanding how to provide constructive feedback, identify potential issues, and help improve patch quality while maintaining professional community standards.

## What is Code Review?

**What**: Code review is the process of examining submitted patches for correctness, style, performance, security, and maintainability before they are accepted into the kernel.

**Why**: Understanding code review is crucial because:

- **Quality Assurance**: Ensures high code quality
- **Knowledge Sharing**: Spreads knowledge across community
- **Bug Prevention**: Catches bugs before merging
- **Mentorship**: Helps newer developers learn
- **Community Building**: Strengthens community relationships
- **Professional Growth**: Develops critical analysis skills

**When**: Code review happens when:

- **Patch Submission**: New patches are posted to lists
- **Maintainer Review**: Maintainers evaluate patches
- **Community Feedback**: Community members provide input
- **Pre-Merge**: Before pulling into maintainer trees
- **Post-Merge**: Sometimes after initial integration
- **Backport Review**: When backporting fixes

**How**: Code review operates through:

```bash
# Example: Code review workflow
# Subscribe to relevant mailing lists
# linux-kernel@vger.kernel.org (main list)
# subsystem-specific lists (e.g., dri-devel@lists.freedesktop.org)

# Review patches from mailing list
# 1. Read patch email carefully
# 2. Check commit message
# 3. Review code changes
# 4. Test if possible
# 5. Provide feedback

# Example review response:
From: Reviewer Name <reviewer@example.com>
To: Author Name <author@example.com>
Cc: linux-kernel@vger.kernel.org
Subject: Re: [PATCH] drivers: my_driver: Add feature X

Hi Author,

Thank you for the patch! A few comments below:

On Mon, Oct 22, 2024 at 10:00 AM, Author Name wrote:
> +static int my_function(struct device *dev)
> +{
> +    struct my_struct *ptr;
> +    ptr = kmalloc(sizeof(struct my_struct), GFP_KERNEL);

Please use sizeof(*ptr) instead of sizeof(struct my_struct) to
maintain consistency if the type changes.

Also, consider using devm_kzalloc() to simplify cleanup.

> +    if (!ptr)
> +        return -ENOMEM;
> +
> +    /* Initialize ptr */

Missing error handling for initialization. What happens if init fails?

> +    ptr->value = 0;

Use kzalloc() or memset() instead of manual zero initialization.

Otherwise looks good!

Reviewed-by: Reviewer Name <reviewer@example.com>

Thanks,
Reviewer
```

**Where**: Code review is essential in:

- **Kernel Development**: All kernel patches
- **Open Source Projects**: Community software development
- **Professional Work**: Corporate development processes
- **Learning**: Teaching and mentoring
- **Quality Control**: Maintaining code standards

## Review Criteria

**What**: Review criteria are the standards and guidelines used to evaluate patches, covering correctness, style, performance, security, and maintainability.

**Why**: Understanding review criteria is important because:

- **Consistency**: Provides consistent evaluation standards
- **Completeness**: Ensures thorough review
- **Quality**: Maintains high code quality
- **Education**: Helps reviewers know what to check
- **Efficiency**: Focuses review on important aspects

**How**: Review criteria include:

```c
// Example: Review criteria checklist

// 1. Correctness
// - Does the patch actually fix the stated problem?
// - Are there any logic errors?
// - Are edge cases handled?
// - Is error handling complete?

// Example issues:
// BAD: Missing NULL check
void process_data(struct data *d)
{
    // Missing NULL check for d
    d->value = 0;  // Potential NULL dereference
}

// GOOD: Proper NULL checking
void process_data(struct data *d)
{
    if (!d)
        return;
    d->value = 0;
}

// 2. Coding Style
// - Follows kernel coding style?
// - Proper indentation (tabs, not spaces)?
// - Line length under 80 characters?
// - Function/variable naming conventions?
// - Comment style correct?

// BAD: Style violations
int my_function( struct device * dev ) {  // Extra spaces
  int result;  // Spaces instead of tab
    if(dev==NULL) return -EINVAL;  // Multiple issues
        result=processDevice(dev);  // Naming, spacing
    return result; }  // Brace placement

// GOOD: Proper style
static int my_function(struct device *dev)
{
	int result;
	
	if (!dev)
		return -EINVAL;
		
	result = process_device(dev);
	
	return result;
}

// 3. Performance
// - Are there unnecessary allocations?
// - Can loops be optimized?
// - Are operations in hot paths efficient?
// - Memory usage reasonable?

// BAD: Inefficient
for (i = 0; i < count; i++) {
    // Allocating inside loop
    tmp = kmalloc(sizeof(*tmp), GFP_KERNEL);
    process(tmp);
    kfree(tmp);
}

// GOOD: Efficient
tmp = kmalloc(sizeof(*tmp), GFP_KERNEL);
for (i = 0; i < count; i++) {
    process(tmp);
}
kfree(tmp);

// 4. Security
// - Buffer overflows prevented?
// - Integer overflows checked?
// - User input validated?
// - Proper privilege checks?
// - Information leaks prevented?

// BAD: Buffer overflow risk
void copy_data(char *dest, const char *src)
{
    strcpy(dest, src);  // No bounds checking
}

// GOOD: Safe bounds checking
void copy_data(char *dest, const char *src, size_t size)
{
    strncpy(dest, src, size - 1);
    dest[size - 1] = '\0';
}

// 5. Maintainability
// - Code is readable and clear?
// - Functions are appropriately sized?
// - Complex logic is commented?
// - Magic numbers are avoided?
// - Proper error messages?

// BAD: Unmaintainable
int func(int x) {
    if (x > 100) return x * 2; else if (x > 50) return x + 10;
    else if (x > 25) return x - 5; else return 0;  // Hard to read
}

// GOOD: Maintainable
#define THRESHOLD_HIGH  100
#define THRESHOLD_MED   50
#define THRESHOLD_LOW   25

static int calculate_value(int input)
{
    if (input > THRESHOLD_HIGH)
        return input * 2;
    else if (input > THRESHOLD_MED)
        return input + 10;
    else if (input > THRESHOLD_LOW)
        return input - 5;
    else
        return 0;
}

// 6. Documentation
// - Commit message clear and complete?
// - Code comments explain WHY, not just WHAT?
// - Function documentation present?
// - User-visible changes documented?

// BAD: Poor documentation
// Get data
void get_data(struct device *dev) {
    // Process dev
    process(dev);
}

// GOOD: Good documentation
/**
 * get_device_data - Retrieve and process device data
 * @dev: Device pointer
 *
 * Fetches current device state and processes it according to
 * the device configuration. Must be called with device lock held.
 *
 * Return: 0 on success, negative error code on failure
 */
static int get_device_data(struct device *dev)
{
    /* Validate device is in correct state before processing */
    if (!device_is_ready(dev))
        return -ENODEV;
        
    return process_device_data(dev);
}

// 7. Testing
// - Has patch been tested?
// - Test results included?
// - Covers error paths?
// - Tested on appropriate architectures?

// Include in commit message:
// Tested on Rock 5B+ (ARM64) with:
// - Default configuration
// - Module loaded/unloaded 100 times
// - Error injection testing
// - Stress testing with 1000 concurrent operations
```

**Explanation**:

- **Correctness**: Patch must actually work
- **Style**: Follow kernel coding standards
- **Performance**: Avoid unnecessary overhead
- **Security**: Prevent vulnerabilities
- **Maintainability**: Code must be maintainable
- **Documentation**: Clear explanation
- **Testing**: Adequate verification

**Where**: Review criteria apply to:

- **All patches**: Every kernel contribution
- **Different levels**: Varying depth based on complexity
- **Pre-commit**: Before accepting changes
- **Post-commit**: Sometimes in follow-up reviews

## Providing Constructive Feedback

**What**: Constructive feedback helps patch authors improve their work while maintaining positive community relationships and encouraging continued participation.

**Why**: Understanding constructive feedback is important because:

- **Improvement**: Helps authors improve
- **Learning**: Facilitates knowledge transfer
- **Motivation**: Encourages continued contribution
- **Community**: Builds positive community culture
- **Efficiency**: Gets patches accepted faster

**How**: Constructive feedback is provided through:

```bash
# Example: Constructive feedback techniques

# 1. Be Specific
# BAD:
"This code is bad."

# GOOD:
"In function foo(), the error path on line 45 doesn't free
allocated memory, which will cause a memory leak. Please add
kfree(ptr) before returning the error."

# 2. Explain WHY
# BAD:
"Don't use kmalloc here."

# GOOD:
"Please use devm_kzalloc() instead of kmalloc() here. The devm_
variant automatically frees memory on device removal, simplifying
error handling and preventing memory leaks if probe fails."

# 3. Suggest Solutions
# BAD:
"This locking is wrong."

# GOOD:
"The current locking could cause a race condition if function A
and function B are called simultaneously. Consider holding the
lock across both the read and write operations, or using a
read-write lock if appropriate. See how driver XYZ handles
similar situation in drivers/xyz/main.c:123."

# 4. Point to Examples
# BAD:
"Fix the style."

# GOOD:
"Please follow the kernel coding style for comments. See
Documentation/process/coding-style.rst section 8, or look at
how similar drivers like drivers/similar/driver.c format
multi-line comments."

# 5. Acknowledge Good Work
# Don't only point out problems:
"Hi Author,

Thank you for the patch! The overall approach looks good and
I like how you've structured the error handling.

A few minor comments:

1. [specific feedback]
2. [specific feedback]

Otherwise looks great!

Reviewed-by: Reviewer <reviewer@example.com>"

# 6. Use Appropriate Tone
# BAD:
"Obviously this is wrong. Anyone can see that."

# GOOD:
"I think there might be an issue here. If X happens, then Y
could occur. Have you considered this case?"

# 7. Ask Questions
# Instead of assuming:
"I'm not sure I understand the intent here. Could you explain
why approach X was chosen over Y? I may be missing something."

# 8. Provide Context
# Don't just say what to change:
"In the networking subsystem, we prefer approach X because it
has better performance characteristics and is more maintainable.
See commit abc123 for rationale and examples."

# 9. Prioritize Feedback
# Distinguish must-fix from suggestions:
"Critical:
1. The NULL pointer dereference on line 50 must be fixed
2. Missing error handling in probe function

Nice to have:
1. Consider adding a comment explaining the timeout value
2. Variable name could be more descriptive

Nit:
1. Extra blank line on line 75"

# 10. Follow Up
# After changes are made:
"Thanks for addressing the feedback! The v2 looks much better.
The error handling is now correct and the code is clearer.

Just one minor thing: [small issue]

Otherwise:
Reviewed-by: Reviewer <reviewer@example.com>"

# Example complete review:
From: Reviewer <reviewer@example.com>
To: Author <author@example.com>
Cc: linux-kernel@vger.kernel.org
Subject: Re: [PATCH] drivers: my_driver: Add feature X

Hi Author,

Thank you for working on this! The feature is useful and the
overall implementation looks solid.

A few comments below:

On Mon, Oct 22, 2024 at 10:00 AM, Author wrote:
> +static int init_device(struct my_device *dev)
> +{
> +    dev->buffer = kmalloc(BUFFER_SIZE, GFP_KERNEL);

Please use devm_kzalloc() here. It will automatically free the
memory on device removal, simplifying your cleanup code in both
the error path and remove function.

Also, please add a NULL check after the allocation.

> +    memset(dev->buffer, 0, BUFFER_SIZE);

If you switch to kzalloc() or devm_kzalloc(), this memset is
unnecessary as the memory is already zeroed.

> +    dev->status = STATUS_INIT;

Could you add a comment explaining what STATUS_INIT means? It's
not immediately obvious from the name alone.

> +    return 0;

Missing error handling. What happens if the allocation fails?

> +void cleanup_device(struct my_device *dev)
> +{
> +    kfree(dev->buffer);

If you switch to devm_kzalloc() as suggested above, you can
remove this entire cleanup function.

Minor nit: The function name should probably be my_driver_cleanup()
to match the prefix used elsewhere in the file.

Overall the patch is good! Just needs these small fixes and it
should be ready.

Thanks,
Reviewer
```

**Explanation**:

- **Specificity**: Point to exact issues
- **Explanation**: Explain reasons
- **Solutions**: Suggest how to fix
- **Examples**: Provide references
- **Positivity**: Acknowledge good work
- **Respect**: Maintain professional tone
- **Clarity**: Make feedback understandable
- **Priorities**: Distinguish severity
- **Follow-up**: Track progress

**Where**: Constructive feedback applies to:

- **Code review**: All patch reviews
- **Mentoring**: Helping new contributors
- **Discussions**: Technical discussions
- **Collaboration**: Team work
- **Community building**: Fostering participation

## Review Best Practices

**What**: Review best practices are guidelines for conducting effective, efficient, and professional code reviews.

**Why**: Understanding best practices is important because:

- **Efficiency**: Reviews proceed quickly
- **Effectiveness**: Issues are caught
- **Professionalism**: Maintains standards
- **Relationships**: Builds positive community
- **Quality**: Improves overall quality

**How**: Best practices include:

```bash
# Example: Code review best practices

# 1. Review Promptly
# - Respond to patches within 1-2 days if possible
# - Don't let patches sit unreviewed
# - If busy, acknowledge and set expectation:
"Hi Author, thanks for the patch. I'll try to review by end of
week. If someone else wants to review sooner, please go ahead!"

# 2. Focus on Important Issues
# Prioritize:
# - Correctness bugs
# - Security issues
# - API design problems
# - Performance regressions
# Over:
# - Minor style nits
# - Cosmetic changes
# - Personal preferences

# 3. Test When Possible
# If you have the hardware/setup:
"I tested this on my Rock 5B+ and confirmed it fixes the issue.

Tested-by: Reviewer <reviewer@example.com>"

# If you reviewed but didn't test:
"Code looks good to me, though I haven't tested on hardware.

Reviewed-by: Reviewer <reviewer@example.com>"

# 4. Use Appropriate Tags
# Reviewed-by: Thoroughly reviewed code
"Reviewed-by: Name <email@example.com>"

# Acked-by: Approve but didn't review in detail
"Acked-by: Name <email@example.com>"

# Tested-by: Tested on hardware
"Tested-by: Name <email@example.com>"

# Suggested-by: Suggested the approach
"Suggested-by: Name <email@example.com>"

# 5. Be Consistent
# Apply same standards to all patches
# Don't be more lenient with experienced developers
# Don't be overly harsh with newcomers

# 6. Admit When Unsure
# If you don't know:
"I'm not familiar with this subsystem, but the code looks
reasonable to me. Someone more familiar should probably review."

# If you might be wrong:
"I might be misunderstanding, but it seems like there could be
a race here. Could you clarify?"

# 7. Review Entire Context
# Don't just review the diff
# Consider:
# - How change fits in larger codebase
# - Impact on other code
# - Consistency with subsystem patterns
# - Interaction with other features

# 8. Use Reply Format Correctly
# Quote relevant parts:
> +    ptr = kmalloc(size, GFP_KERNEL);
> +    if (!ptr)
> +        return -ENOMEM;

Please use devm_kzalloc() instead.

# Don't quote entire patch unnecessarily

# 9. Track Follow-ups
# Keep track of your reviews
# Follow up on v2, v3, etc.
# Make sure your feedback was addressed

# 10. Know When to Take Discussion Off-List
# Complex design discussions:
"This is getting complex. Let's discuss on IRC or video call
and summarize conclusions back to the list."

# 11. Escalate Appropriately
# If patch needs subsystem maintainer attention:
"This looks like it could affect the API design. Adding
[Maintainer] for input."

# If you notice pattern of issues:
# Mention to maintainer privately

# 12. Give Credit
# When author makes improvements:
"Thanks for the quick fix in v2! This looks much better now."

# When someone else reviewed:
"I agree with John's review. After those fixes:
Reviewed-by: Me <me@example.com>"

# 13. Review Your Own Code
# Before sending review:
# - Check for typos
# - Verify suggestions are correct
# - Ensure tone is professional
# - Confirm you're not being repetitive

# 14. Time-box Review
# For large patch series:
# - Don't try to review everything at once
# - Focus on high-level design first
# - Then detailed code review
# - Multiple review passes okay
```

**Explanation**:

- **Timeliness**: Prompt responses
- **Focus**: Prioritize important issues
- **Testing**: Test when possible
- **Consistency**: Apply consistent standards
- **Humility**: Admit uncertainty
- **Context**: Review holistically
- **Efficiency**: Use time effectively
- **Relationships**: Build positive interactions

**Where**: Best practices apply to:

- **All reviews**: Every code review
- **Personal development**: Improving review skills
- **Team work**: Professional collaboration
- **Open source**: Community participation
- **Mentoring**: Teaching others

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Review Understanding**: You understand code review purpose
2. **Criteria Knowledge**: You know what to look for
3. **Feedback Skills**: You can provide constructive feedback
4. **Best Practices**: You know review best practices
5. **Professional Conduct**: You can review professionally

**Why** these concepts matter:

- **Quality Assurance**: Maintains code quality
- **Community Participation**: Essential for involvement
- **Professional Growth**: Develops critical skills
- **Knowledge Sharing**: Facilitates learning
- **Relationship Building**: Builds community

**When** to use these concepts:

- **Patch Review**: Reviewing submitted patches
- **Mentoring**: Helping new contributors
- **Collaboration**: Working with others
- **Learning**: Understanding quality standards
- **Career Development**: Professional skill building

**Where** these skills apply:

- **Kernel Development**: Linux kernel community
- **Open Source**: Other open source projects
- **Professional Work**: Corporate code review
- **Teaching**: Mentoring and education
- **Quality Control**: Ensuring code quality

## Next Steps

**What** you're ready for next:

After mastering code review, you should be ready to:

1. **Learn Maintainer Guidelines**: Understand maintainer role
2. **Practice Reviews**: Start reviewing patches
3. **Build Reputation**: Establish yourself as reviewer
4. **Consider Maintenance**: Path to becoming maintainer

**Where** to go next:

Continue with the next lesson on **"Maintainer Guidelines"** to learn:

- Maintainer responsibilities
- Subsystem maintenance
- Tree management
- Pull request workflow

**Why** the next lesson is important:

The next lesson teaches you about the maintainer role, which is the natural progression for active reviewers and contributors.

**How** to continue learning:

1. **Read Reviews**: Study existing reviews on mailing lists
2. **Practice**: Review patches in areas you know
3. **Ask Questions**: Learn from experienced reviewers
4. **Give Feedback**: Start providing reviews
5. **Improve**: Continuously refine review skills

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Code Review](https://www.kernel.org/doc/html/latest/process/code-review.html) - Code review guidelines
- [Maintainer Handbook](https://www.kernel.org/doc/html/latest/maintainer/) - Maintainer guide

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Beginner resources
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - LKML archives for review examples
- [Patchwork](https://patchwork.kernel.org/) - Track patches

**Learning Resources**:

- [Code Review Best Practices](https://mtlynch.io/code-review-love/) - General code review guide
- [Google Code Review Guidelines](https://google.github.io/eng-practices/review/) - Code review practices
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/) - Writing clear code

Happy reviewing! 👀✨


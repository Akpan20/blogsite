<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Resource;

class ResourceSeeder extends Seeder
{
    public function run(): void
    {
        $resources = [
            [
                'title'        => 'How to Grow Your Audience',
                'excerpt'      => 'Practical tips on SEO, social sharing, and audience engagement to help your blog reach more readers.',
                'category'     => 'Growth',
                'icon'         => 'BookOpen',
                'slug'         => 'how-to-grow-your-audience',
                'is_published' => true,
                'content'      => <<<MD
## How to Grow Your Audience

Growing a loyal readership takes time, but the right strategies can accelerate your journey significantly. Here's what works.

---

## 1. Master the Basics of SEO

Search engine optimisation is the single most powerful long-term growth channel for bloggers.

- **Write for humans first, search engines second.** Google rewards content that genuinely helps readers.
- **Target long-tail keywords.** Instead of "blogging tips", try "blogging tips for beginners in Nigeria".
- **Optimise your title and excerpt.** Keep your title under 70 characters and your meta description between 120–160 characters.
- **Use headings (H2, H3) to structure content.** This helps both readers and search crawlers.
- **Add internal links.** Link to your older posts to keep readers on your site longer.

---

## 2. Leverage Social Sharing

Your content won't spread on its own. You need to actively share it.

- **Post on Twitter/X and LinkedIn** immediately after publishing.
- **Join niche communities** — WhatsApp groups, Facebook Groups, Reddit — and share when relevant (never spam).
- **Create shareable snippets.** Pull a compelling quote from your post and turn it into a graphic.
- **Ask your readers to share.** A simple "if this helped you, share it with someone" at the end of a post works.

---

## 3. Build an Email List Early

Social media algorithms change. Your email list is yours forever.

- Add a newsletter subscribe form to every post.
- Offer a small incentive — a checklist, a free guide, or exclusive content.
- Send consistently — weekly or bi-weekly — so readers remember you.

---

## 4. Engage Authentically

Readers become loyal fans when they feel seen.

- **Reply to every comment**, especially in the early days.
- **Respond to DMs and emails** from readers.
- **Feature reader feedback** in your posts or newsletters.

---

## 5. Consistency Beats Perfection

Publishing one good post per week consistently will outperform publishing a great post once a month.

> "You don't rise to the level of your goals, you fall to the level of your systems." — James Clear

Build a content calendar and stick to it. Your audience will learn when to expect you.

---

## Quick Checklist

- [ ] Research keywords before writing
- [ ] Optimise title, slug, and excerpt for SEO
- [ ] Share on at least two social platforms after publishing
- [ ] Respond to all comments within 24 hours
- [ ] Include a newsletter subscribe CTA in every post
MD,
            ],

            [
                'title'        => 'Monetization Best Practices for Nigerian Creators',
                'excerpt'      => 'Proven strategies for earning through subscriptions, sponsored content, and digital products — tailored for the Nigerian market.',
                'category'     => 'Monetization',
                'icon'         => 'Lightbulb',
                'slug'         => 'monetization-best-practices-nigeria',
                'is_published' => true,
                'content'      => <<<MD
## Monetization Best Practices for Nigerian Creators

Turning your blog into a revenue stream is absolutely achievable. Here's how to approach it strategically in the Nigerian context.

---

## 1. Premium Subscriptions

Offering exclusive content behind a paywall is one of the most sustainable monetization models.

- **Identify what your most loyal readers want more of** — deeper analysis, templates, Q&A access, or early content.
- **Price appropriately for your market.** ₦1,000–₦3,000/month is a reasonable range for most Nigerian audiences.
- **Use Paystack** for seamless Nigerian card and bank transfer payments — it's built into this platform.
- **Deliver consistent value.** Subscribers will cancel if the premium content isn't meaningfully better than the free content.

---

## 2. Sponsored Content

Brands pay creators to write about their products or services.

- **Build your audience first.** Sponsors typically look for creators with at least 1,000–5,000 engaged readers.
- **Be selective.** Only partner with brands you genuinely believe in — your audience trusts you.
- **Disclose sponsorships clearly.** Nigerian readers appreciate transparency, and it's increasingly a legal requirement globally.
- **Set a rate card.** Know what a sponsored post, newsletter mention, or social shoutout costs before a brand approaches you.

---

## 3. Digital Products

Sell things you create once and sell many times.

- **E-books and guides** on topics you already write about
- **Templates** — content calendars, proposal templates, email scripts
- **Online courses or cohorts** for a deeper learning experience
- **Consultation calls** for readers who want personal advice

Use Paystack or Selar for payments and delivery.

---

## 4. Affiliate Marketing

Earn a commission when readers buy products you recommend.

- Join affiliate programmes relevant to your niche (Jumia, Konga, software tools).
- Only recommend products you have used and trust.
- Disclose affiliate relationships honestly.

---

## 5. Avoid These Common Mistakes

- **Monetizing too early** before building an audience leads to low conversions and can alienate readers.
- **Too many income streams at once** dilutes your focus. Start with one and master it.
- **Ignoring payment friction** — always offer local payment options (Paystack, bank transfer) alongside international ones.

---

## Summary

| Method | Effort | Revenue Potential |
|---|---|---|
| Subscriptions | High setup, recurring | High |
| Sponsorships | Medium | Medium–High |
| Digital Products | High setup, passive | Medium–High |
| Affiliate | Low | Low–Medium |

Start with subscriptions if you have a loyal audience. Start with affiliates if you're just building.
MD,
            ],

            [
                'title'        => 'Content Creation Guide: Writing Posts That Get Read',
                'excerpt'      => 'A practical guide to planning, writing, and publishing blog posts that attract readers and keep them coming back.',
                'category'     => 'Content',
                'icon'         => 'Video',
                'slug'         => 'content-creation-guide',
                'is_published' => true,
                'content'      => <<<MD
## Content Creation Guide: Writing Posts That Get Read

Great content isn't just well-written — it's well-planned, well-structured, and published consistently. Here's how to do it right.

---

## 1. Start With a Clear Topic and Angle

Don't just write about "finance" — write about "how to save ₦50,000 in 6 months on a Nigerian salary." Specificity wins.

**Before writing, answer these three questions:**
1. Who is this post for?
2. What problem does it solve?
3. Why should they read mine instead of someone else's?

---

## 2. Structure Your Post Before Writing

A good structure makes writing faster and reading easier.

```
- Headline (clear + compelling)
- Introduction (hook + promise)
- Section 1
- Section 2
- Section 3
- Conclusion (summary + CTA)
```

Write your headings first, then fill in the content. This prevents writer's block.

---

## 3. Write a Strong Introduction

You have 3 seconds to convince someone to keep reading. Your intro should:

- **Hook** — open with a surprising fact, a bold statement, or a relatable question
- **Agitate** — briefly describe the problem the reader has
- **Promise** — tell them what they'll get by reading on

> Bad intro: *"In this post, I will talk about productivity."*
> Good intro: *"Most people waste 2 hours every workday without realising it. Here's what I changed to get that time back."*

---

## 4. Use Markdown Effectively

This platform renders Markdown beautifully. Use it:

- `## Heading` for major sections
- `**bold**` for key terms and emphasis
- `- list items` for scannable points
- `> blockquote` for pull quotes
- ` ```code blocks``` ` for technical content

Break up walls of text. Most readers scan before they read.

---

## 5. End With a Clear Call to Action

Every post should tell the reader what to do next:

- Subscribe to your newsletter
- Read a related post
- Leave a comment
- Share with someone

Don't leave them hanging.

---

## 6. Edit Ruthlessly

The first draft is never the final draft.

- Cut any sentence that doesn't add value
- Replace passive voice with active voice
- Read it out loud — if it sounds awkward, rewrite it
- Check spelling and grammar before publishing

---

## Your Writing Checklist

- [ ] Clear, specific topic with a defined audience
- [ ] Compelling headline (use numbers, questions, or "how to")
- [ ] Strong hook in the first two sentences
- [ ] Subheadings every 200–300 words
- [ ] At least one call to action at the end
- [ ] Proofread before publishing
MD,
            ],

            [
                'title'        => 'Building a Community Around Your Blog',
                'excerpt'      => 'How to turn casual readers into an active, engaged community that supports your growth and amplifies your content.',
                'category'     => 'Community',
                'icon'         => 'Rss',
                'slug'         => 'building-a-community-around-your-blog',
                'is_published' => true,
                'content'      => <<<MD
## Building a Community Around Your Blog

Traffic is vanity. Community is longevity. Here's how to build one that lasts.

---

## 1. Understand the Difference Between an Audience and a Community

An **audience** consumes your content passively.
A **community** participates, contributes, and connects with each other — not just with you.

Your goal is to move readers from passive consumers to active participants.

---

## 2. Make Commenting Feel Worthwhile

Comments are the first step toward community.

- Respond to **every** comment, especially in your first year.
- Ask questions at the end of posts to invite responses.
- Acknowledge loyal commenters by name in future posts.
- Feature insightful comments in your newsletter.

---

## 3. Create a Space Beyond the Blog

Your blog is your home base, but community happens in real-time.

Consider creating:
- A **WhatsApp or Telegram group** for your most engaged readers
- A **newsletter** with a "reply and tell me" prompt
- A **monthly live Q&A** on Twitter Spaces or Google Meet

Start with one channel. Do it well before adding more.

---

## 4. Celebrate Your Members

People stay where they feel valued.

- Give shoutouts to readers who share your content
- Feature reader stories or success stories in your posts
- Create a "reader of the month" segment in your newsletter
- Thank people publicly for their support

---

## 5. Set Community Norms Early

Healthy communities have clear expectations.

- Define what kind of comments and conversations are welcome
- Moderate consistently and fairly
- Lead by example — be the tone you want others to follow

---

## 6. Think Long-Term

Communities take 12–24 months to feel genuinely alive. Don't give up at month three.

> "Build for the people who already showed up, not just the ones you hope will come."

The 10 readers who comment every week are worth more than 10,000 who never engage. Nurture them.
MD,
            ],

            [
                'title'        => 'Essential Tools for Bloggers in 2025',
                'excerpt'      => 'A curated list of free and affordable tools for writing, SEO, design, and analytics — handpicked for independent creators.',
                'category'     => 'Tools',
                'icon'         => 'Lightbulb',
                'slug'         => 'essential-tools-for-bloggers-2025',
                'is_published' => true,
                'content'      => <<<MD
## Essential Tools for Bloggers in 2025

You don't need expensive software to run a successful blog. Here are the tools worth your time and money.

---

## Writing & Editing

| Tool | Use | Cost |
|---|---|---|
| **Hemingway Editor** | Improve readability | Free |
| **Grammarly** | Grammar and spelling | Free / Paid |
| **Google Docs** | Draft and collaborate | Free |
| **Notion** | Content planning and notes | Free / Paid |

---

## SEO

| Tool | Use | Cost |
|---|---|---|
| **Google Search Console** | Monitor search performance | Free |
| **Ubersuggest** | Keyword research | Free (limited) |
| **Ahrefs Webmaster Tools** | Backlink and SEO audit | Free |
| **RankMath** (WordPress) | On-page SEO | Free / Paid |

---

## Design & Visuals

| Tool | Use | Cost |
|---|---|---|
| **Canva** | Featured images, social graphics | Free / Paid |
| **Unsplash / Pexels** | Free stock photos | Free |
| **Remove.bg** | Remove image backgrounds | Free (limited) |

---

## Analytics

| Tool | Use | Cost |
|---|---|---|
| **Google Analytics 4** | Traffic and behaviour | Free |
| **Plausible** | Privacy-friendly analytics | Paid (affordable) |
| Built-in Analytics | Post views and engagement | Included here |

---

## Email & Newsletter

| Tool | Use | Cost |
|---|---|---|
| **Brevo (Sendinblue)** | Email marketing | Free up to 300/day |
| **Mailchimp** | Email campaigns | Free up to 500 contacts |
| Built-in Newsletter | Subscriber management | Included here |

---

## Payments (Nigeria)

| Tool | Use | Cost |
|---|---|---|
| **Paystack** | Subscriptions, one-time payments | % per transaction |
| **Selar** | Digital product sales | % per transaction |
| **Flutterwave** | Multi-currency payments | % per transaction |

---

## Recommended Starter Stack

If you're just starting out, you only need three things:

1. **Google Docs** for writing
2. **Canva** for visuals
3. **Google Search Console** for SEO tracking

Add more tools only when you have a specific problem they solve. Tool overload is real.
MD,
            ],
        ];

        foreach ($resources as $resource) {
            Resource::updateOrCreate(
                ['slug' => $resource['slug']],
                $resource
            );
        }

        $this->command->info('✅ Resources seeded successfully (' . count($resources) . ' items).');
    }
}
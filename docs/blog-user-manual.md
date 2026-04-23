# Blog / Market Education — User Manual

## Overview

The Blog system powers the **Market Education Center** across two surfaces:

| Surface | URL | Who sees it |
|---------|-----|-------------|
| Admin Panel | `/admin/blog` | Admins only |
| Student Panel | `/student/blog` | Logged-in students |

The public page at `/market-education` redirects visitors to Discord login. After login they land on `/student/blog`. Already logged-in users go directly to `/student/blog`.

Only **published** posts appear on the student blog page.

---

## Admin: Managing Categories

Categories are managed directly on the blog page (`/admin/blog`) in the left sidebar panel.

### Add a Category

1. Go to **Admin Panel → Blog**
2. In the **Categories** panel, type a name in the input field
3. Click **Add**

### Rename a Category

1. Click the **pencil icon** next to the category name
2. Edit the name inline
3. Press **Enter** or click the **checkmark** to save

### Delete a Category

1. Click the **trash icon** next to the category
2. If posts still use this category, you must reassign them first — deletion is blocked

### Default Categories

Four categories are seeded by default:
- Library
- Fractal Model
- Core Concepts
- Advanced Concepts

You can rename, delete, or add more at any time.

---

## Admin: Managing Posts

### Create a Post

1. Go to **Admin Panel → Blog** (sidebar)
2. Click **New Post**
3. Fill in the fields:

| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | Post title — also generates the URL slug automatically |
| Excerpt | Yes | Short summary shown on blog cards (1-2 sentences) |
| Content | Yes | Full article body — supports **Markdown** (see below) |
| Category | Yes | Select from categories you've created in the admin panel |
| Read Time | No | Estimated read time, e.g. `8 min` |
| Format | No | Content format label, e.g. `PDF`, `Video` |
| Thumbnail URL | No | Image URL shown on the blog listing cards only (not on the post page) |
| Published / Draft | — | Toggle to control visibility |

4. Click **Create Post**

### Edit a Post

1. Go to **Admin Panel → Blog**
2. Click **Edit** on any post
3. Modify fields and click **Update Post**

### Delete a Post

1. Go to **Admin Panel → Blog**
2. Click the **trash icon** on any post
3. Confirm the deletion

### Publishing

- **Draft** posts are only visible in the admin panel
- **Published** posts appear on the student blog
- You can toggle between Draft and Published at any time by editing the post

---

## Writing Content with Markdown

The content field supports full Markdown syntax. Here is a reference for everything you can use.

### Text Formatting

```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
```

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

Use headings to break your article into sections. Start with `##` for main sections since the post title is already displayed as `h1`.

### Images

Add images anywhere in the content:

```markdown
![Description of the image](https://your-image-url.com/image.png)
```

The description text appears as a caption below the image.

**Example — image between paragraphs:**

```markdown
The daily bias was bullish based on the higher timeframe structure.

![Daily chart showing bullish structure](https://example.com/daily-chart.png)

However, the 1-hour chart showed a bearish divergence forming at the premium zone.

![1H chart with bearish divergence](https://example.com/1h-divergence.png)

This is where the invalidation trade comes into play.
```

**Note:** The thumbnail URL set in the post form only appears on blog listing cards. It does not appear at the top of the article page. To show images inside the article, use the markdown `![alt](url)` syntax in the content field.

**Where to host images:**

- Upload to any image host (Imgur, Cloudinary, your own S3 bucket)
- Use direct image URLs that end in `.png`, `.jpg`, `.webp`, etc.
- Place images in `public/blog/` folder and reference as `/blog/image-name.png`

### Links

```markdown
[Click here to read more](https://example.com)
```

Links open in a new tab automatically.

### Lists

**Unordered list:**

```markdown
- First item
- Second item
- Third item
```

**Ordered list:**

```markdown
1. Step one
2. Step two
3. Step three
```

### Blockquotes

```markdown
> Key takeaway: Always wait for confirmation before entering a trade.
```

Use blockquotes for important callouts, key takeaways, or quotes.

### Code

**Inline code:**

```markdown
Use the `ATR` indicator for volatility measurement.
```

**Code block:**

````markdown
```
Entry: 1.0850
Stop Loss: 1.0820
Take Profit: 1.0910
Risk/Reward: 1:2
```
````

### Horizontal Rule

```markdown
---
```

Use to visually separate major sections.

---

## Full Post Example

Here is a complete example of a well-structured blog post:

```markdown
## Understanding the Setup

Before entering any trade, we need to identify the **daily bias**. This is determined by the higher timeframe market structure.

![Daily chart with marked structure](https://example.com/images/daily-structure.png)

In this example, the daily chart shows a clear bullish structure with higher highs and higher lows.

## Identifying the Entry

Once the bias is established, we drop down to the 1-hour timeframe to find our entry.

![1H entry setup](https://example.com/images/1h-entry.png)

Key criteria for entry:
- Price reaches a discount zone (below 50% of the range)
- Bullish order block is present
- Displacement candle confirms the move

> Remember: The entry is only valid if the daily bias has not been invalidated.

## Risk Management

```
Entry: 1.0850
Stop Loss: 1.0820 (below the order block)
Take Profit: 1.0910 (previous swing high)
Risk/Reward: 1:2
```

Always risk no more than **1-2%** of your account per trade.

---

## Summary

1. Identify daily bias from higher timeframe
2. Find entry on lower timeframe
3. Use order blocks and displacement for confirmation
4. Maintain strict risk management

![Final result showing the completed trade](https://example.com/images/result.png)

The trade played out exactly as planned, reaching the take profit level within the same session.
```

---

## Categories

Categories are dynamic — admins can add, rename, and delete them from the blog page.

The following are seeded by default:

| Category | Purpose |
|----------|---------|
| **Library** | Foundational concepts, beginner-friendly material |
| **Fractal Model** | TTFM and fractal-based trading strategies |
| **Core Concepts** | Essential trading concepts (structure, pairing, strength) |
| **Advanced Concepts** | Advanced strategies (SMT, relative strength, multi-asset) |

Students can filter by category on the blog page. Only categories that have at least one published post appear as filter tabs.

---

## Student View

Students access the blog at `/student/blog` from the **Blog** link in the navbar.

- Posts display in a grid with thumbnail, title, excerpt, date, and read time
- Category filter tabs and search bar are available
- Clicking a card opens the full article with rendered markdown and images
- The thumbnail image is only shown on the listing cards, not on the article page itself

---

## Access Flow

1. Visitor clicks **Trading Education** on the homepage
2. If not logged in → redirected to `/login` with Discord login
3. After Discord login → redirected to `/student/blog`
4. If already logged in → redirected directly to `/student/blog`

---
name: universalbookmarks
description: Official skill for how to use universalbookmarks (the bookmark manager) and interact with it programmatically.
metadata:
  tags: bookmarks, bookmark manager, 2nd brain, productivity
  openclaw:
    envVars:
      - name: UNIVERSALBOOKMARKS_API_KEY
        required: false
        description: Optional API key override. The CLI can also read it from its config file.
      - name: UNIVERSALBOOKMARKS_SERVER_ADDR
        required: false
        description: Optional server override. The CLI can also read it from its config file.
    primaryEnv: UNIVERSALBOOKMARKS_API_KEY
    requires:
      bins:
        - universalbookmarks
    homepage: https://universalbookmarks.com
    links:
      repository: https://github.com/universalbookmarks-app/universalbookmarks
      documentation: https://docs.universalbookmarks.com
    emoji: 📦
    cliHelp: universalbookmarks --help
    install:
      - kind: node
        package: "@universalbookmarks/cli"
        bins: [universalbookmarks]
---

# Universal Bookmarks

Universal Bookmarks is an open source bookmark manager for collecting, organizing, and searching links, notes, images, and PDFs. Use this skill to operate a Universal Bookmarks instance through the official CLI.

## When to use

Use this skill when the user asks to add, retrieve, search, organize, export, or otherwise manage content in Universal Bookmarks.

Prefer the CLI over writing direct HTTP requests. Run `universalbookmarks --help` or `universalbookmarks <command> --help` when a command is not covered here. `universalbookmarks skill` prints the skill bundled with the installed CLI, which may be newer than a separately installed copy.

## Core concepts

Universal Bookmarks stores three bookmark types:

- Links. Universal Bookmarks can fetch the page title, description, image, screenshot, readable content, and full-page archive.
- Text. Notes and text snippets stored as bookmarks.
- Assets. Images and PDFs uploaded as bookmarks.

Bookmarks can have tags, notes, highlights, favorite and archive state, and membership in one or more lists. Manual lists contain selected bookmarks. Smart lists use a saved search query and update as matching bookmarks change.

Saving a link that already exists does not create a duplicate. For ordinary saves, including the CLI, Universal Bookmarks restores the existing bookmark from the archive and moves it to the top. Metadata that the caller did not supply remains unchanged.

Universal Bookmarks can consume RSS feeds and publish lists as RSS feeds. Its rule engine can tag, favorite, or route new bookmarks to lists. Webhooks report bookmark events.

## Search query language

Spaces between conditions mean `and`. Use `and`, `or`, and parentheses for explicit boolean logic. Prefix a qualifier with `-` or `!` to negate it. Text that is not part of a qualifier becomes the search text.

| Qualifier | Meaning | Example |
| --- | --- | --- |
| `is:fav` | Favorite bookmarks | `is:fav` |
| `is:archived` | Archived bookmarks | `-is:archived` |
| `is:tagged` | Bookmarks with at least one tag | `-is:tagged` |
| `is:inlist` | Bookmarks in at least one list | `is:inlist` |
| `has:notes` | Bookmarks with a non-empty note | `has:notes` |
| `has:highlights` | Bookmarks with at least one highlight | `-has:highlights` |
| `is:link` | Link bookmarks | `is:link` |
| `is:text` | Text bookmarks | `is:text` |
| `is:media` | Image or PDF bookmarks | `is:media` |
| `is:broken` | Failed crawls or non-2xx responses | `is:broken` |
| `url:<value>` | URL substring | `url:github.com` |
| `title:<value>` | Title substring | `title:"release notes"` |
| `#<tag>` or `tag:<tag>` | Tag name | `#important`, `tag:"in progress"` |
| `list:<name>` | List name | `list:"to review"` |
| `after:<date>` | Created on or after `YYYY-MM-DD` | `after:2026-01-01` |
| `before:<date>` | Created on or before `YYYY-MM-DD` | `before:2026-06-01` |
| `age:<range>` | Creation age using `d`, `w`, `m`, or `y` | `age:<1w`, `age:>6m` |
| `feed:<name>` | Source RSS feed | `feed:Hackernews` |
| `source:<value>` | Capture source | `source:cli`, `-source:rss` |

Valid capture sources are `api`, `web`, `cli`, `mobile`, `extension`, `singlefile`, `rss`, and `import`.

Examples:

```text
is:fav after:2026-01-01 #important
is:archived and (list:reading or #work)
-is:tagged or -is:inlist
has:notes -has:highlights
machine learning is:fav -is:archived
```

## Install the CLI

```bash
npm install -g @universalbookmarks/cli
```

The container image is also available:

```bash
docker run --rm ghcr.io/yashhasan570/universalbookmarks-cli:release --help
```

## Authenticate

Create an API key in the Universal Bookmarks settings page. The simplest persistent setup is:

```bash
universalbookmarks auth init
universalbookmarks whoami
```

`auth init` prompts for the server address and API key. It writes a mode `0600` JSON file to `$XDG_CONFIG_HOME/universalbookmarks/config.json`, or `~/.config/universalbookmarks/config.json` when `XDG_CONFIG_HOME` is unset. It asks before changing an existing file. Use `--force` to overwrite it without confirmation.

For non-interactive setup, put the global options before `auth init`:

```bash
universalbookmarks --server-addr "https://universalbookmarks.example.com" --api-key "$UNIVERSALBOOKMARKS_API_KEY" auth init --force
```

The CLI resolves credentials in this order:

1. Global command options, `--api-key` and `--server-addr`.
2. `UNIVERSALBOOKMARKS_API_KEY` and `UNIVERSALBOOKMARKS_SERVER_ADDR` environment variables.
3. The persistent config file.

The server address defaults to `https://cloud.universalbookmarks.com`. The API key has no default. Use global options for a one-off command without changing saved config:

```bash
universalbookmarks --api-key <key> --server-addr <addr> whoami
```

## Add and import bookmarks

```bash
# Add one or more links. Repeat --link for multiple URLs.
universalbookmarks bookmarks add --link "https://example.com"

# Add tags and list membership while saving.
universalbookmarks bookmarks add --link "https://example.com" --tag-name reading --tag-name work --list-id <list-id>

# Add text directly or from stdin.
universalbookmarks bookmarks add --note "Review the proposal" --title "Reminder"
printf '%s\n' "Long note" | universalbookmarks bookmarks add --stdin

# Upload an image or PDF as an asset bookmark.
universalbookmarks bookmarks add --asset ./paper.pdf --title "Research paper"
```

Import a SingleFile HTML archive with its original URL:

```bash
universalbookmarks bookmarks import-singlefile ./page.html --url "https://example.com/page"
universalbookmarks bookmarks import-singlefile ./page.html --url "https://example.com/page" --if-exists overwrite-recrawl
```

`--if-exists` accepts `skip`, `overwrite`, `overwrite-recrawl`, `append`, or `append-recrawl`. The default is `skip`. The `recrawl` variants queue a crawl after storing the archive.

## Find bookmarks

`bookmarks search` supports three modes:

- `fts` is the default full-text search.
- `semantic` searches bookmark embeddings. It requires non-empty search text and configured embedding and vector-store providers. Results below the similarity threshold are omitted, so it may return fewer than the requested limit.
- `hybrid` combines full-text and semantic rankings. It falls back to full-text search when the query contains only qualifiers or semantic infrastructure is unavailable.

Semantic and hybrid searches support relevance sorting only when semantic ranking runs. The instance must also enable semantic search and automatic embedding indexing.

```bash
# Full-text search with qualifiers.
universalbookmarks bookmarks search "rust is:fav" --limit 10

# Find conceptually related content even when wording differs.
universalbookmarks bookmarks search "durable background jobs" --search-mode semantic

# Combine keyword and semantic ranking.
universalbookmarks bookmarks search "rust async patterns #programming" --search-mode hybrid

# Include stored content and fetch every result page.
universalbookmarks bookmarks search "incident review" --include-content --all
```

Use `bookmarks list` for structured filters that do not need the search language:

```bash
universalbookmarks bookmarks list --list-id <list-id> --include-archived
universalbookmarks bookmarks list --tag-id <tag-id> --all
```

Without `--all`, list and search commands print a cursor when another page exists. Pass it back with `--cursor <cursor>`.

## Read content and download assets

Get bookmark metadata with `bookmarks get`. `--include-content` includes stored content in the result.

```bash
universalbookmarks bookmarks get <bookmark-id>
universalbookmarks bookmarks get <bookmark-id> --include-content
```

For long content, use the bounded readable-content command. It returns Markdown or plain text and prints a continuation cursor when more content remains.

```bash
universalbookmarks bookmarks content <bookmark-id> --format markdown --max-chars 20000
universalbookmarks bookmarks content <bookmark-id> --cursor <cursor>
```

The maximum chunk size is 50,000 Unicode characters. Download an attachment or asset by the asset ID shown by `bookmarks get`:

```bash
universalbookmarks assets download <asset-id> --output ./download.pdf
universalbookmarks assets download <asset-id> --output ./download.pdf --force
```

## Update and organize bookmarks

```bash
universalbookmarks bookmarks update <bookmark-id> --title "New title" --description "New description"
universalbookmarks bookmarks update <bookmark-id> --archive
universalbookmarks bookmarks update <bookmark-id> --no-archive
universalbookmarks bookmarks update <bookmark-id> --favourite
universalbookmarks bookmarks update-tags <bookmark-id> --add-tag important --remove-tag inbox

universalbookmarks lists list
universalbookmarks lists create --name "Reading" --icon "📚"
universalbookmarks lists create --name "Recent AI" --icon "🤖" --type smart --query "#ai age:<1m"
universalbookmarks lists get <list-id>
universalbookmarks lists add-bookmark --list <list-id> --bookmark <bookmark-id>
universalbookmarks lists remove-bookmark --list <list-id> --bookmark <bookmark-id>

universalbookmarks tags list
universalbookmarks tags get --name important
universalbookmarks tags merge --into <target-tag-id> --from <tag-id> <tag-id>

universalbookmarks highlights list --bookmark <bookmark-id>
universalbookmarks highlights get <highlight-id>
```

Delete commands are available for bookmarks, lists, tags, and highlights. Confirm the target with the user before using them.

## Machine-readable output

Use the global `--json` option when another program or agent will consume the result. Put it before the command to avoid ambiguity:

```bash
universalbookmarks --json bookmarks search "#work" --all
universalbookmarks --json whoami
```

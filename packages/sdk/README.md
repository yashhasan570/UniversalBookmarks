# Universal Bookmarks SDK

This package contains the official typescript SDK for the universalbookmarks API.

## Installation

```
npm install @universalbookmarks/sdk
```

## Usage

```typescript
import { createUniversal BookmarksClient } from "@universalbookmarks/sdk";

// Create a client
const apiKey = "my-super-secret-key";
const addr = `https://universalbookmarks.mydomain.com`;
const client = createUniversal BookmarksClient({
  baseUrl: `${addr}/api/v1/`,
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${apiKey}`,
  },
});

// Create a bookmark
const {
  data: createdBookmark,
  response: createResponse,
  error: createError,
} = await client.POST("/bookmarks", {
  body: {
    type: "text",
    title: "Search Test 1",
    text: "This is a test bookmark for search",
  },
});

console.log(createResponse.status, createdBookmark, createError);

// Search for bookmarks
const {
  data: searchResults,
  response: searchResponse,
  error: searchError,
} = await client.GET("/bookmarks/search", {
  params: {
    query: {
      q: "test bookmark",
    },
  },
});
console.log(searchResponse.status, searchResults, searchError);
```

## Docs

API docs can be found [here](https://docs.universalbookmarks.com/api/universalbookmarks-api).

## Versioning

- This package follows the minor version of the universalbookmarks server. So new APIs introduced in Universal Bookmarks version `0.21.0` will be available in this package starting from version `0.21.0`.
- Universal Bookmarks strives to maintain backward compatibility in its APIs, so older versions of this package should continue working with newer universalbookmarks server versions.

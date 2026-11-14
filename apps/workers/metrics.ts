import { prometheus } from "@hono/prometheus";
import { Counter, Histogram, Registry } from "prom-client";

import serverConfig from "@universalbookmarks/shared/config";

export const registry = new Registry();

export const { printMetrics } = prometheus({
  registry: registry,
  prefix: "universalbookmarks_",
  // Default metrics start a recurring event-loop sampler and a GC observer.
  // Without a configured token, the metrics endpoint is inaccessible.
  collectDefaultMetrics: serverConfig.prometheus.enabled,
});

export const workerStatsCounter = new Counter({
  name: "universalbookmarks_worker_stats",
  help: "Stats for each worker",
  labelNames: ["worker_name", "status"],
});

export const crawlerStatusCodeCounter = new Counter({
  name: "universalbookmarks_crawler_status_codes_total",
  help: "HTTP status codes encountered during crawling",
  labelNames: ["status_code", "proxy"],
});

export const bookmarkCrawlLatencyHistogram = new Histogram({
  name: "universalbookmarks_bookmark_crawl_latency_seconds",
  help: "Latency from bookmark creation to crawl completion (excludes recrawls and imports)",
  buckets: [
    0.1, 0.25, 0.5, 1, 2.5, 5, 7.5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 300,
    600, 900, 1200,
  ],
});

registry.registerMetric(workerStatsCounter);
registry.registerMetric(crawlerStatusCodeCounter);
registry.registerMetric(bookmarkCrawlLatencyHistogram);

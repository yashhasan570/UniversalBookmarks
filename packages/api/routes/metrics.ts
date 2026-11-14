// Import stats to register Prometheus metrics
import "@universalbookmarks/trpc/stats";

import { prometheus } from "@hono/prometheus";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { register } from "prom-client";

import serverConfig from "@universalbookmarks/shared/config";

type PrometheusHandlers = ReturnType<typeof prometheus>;

const globalForPrometheus = globalThis as typeof globalThis & {
  __universalbookmarksApiPrometheus?: PrometheusHandlers;
};

const prometheusHandlers = (globalForPrometheus.__universalbookmarksApiPrometheus ??=
  prometheus({
    registry: register,
    prefix: "universalbookmarks_",
    collectDefaultMetrics: serverConfig.prometheus.enabled,
  }));

export const { printMetrics, registerMetrics } = prometheusHandlers;

const app = new Hono().get(
  "/",
  bearerAuth({ token: serverConfig.prometheus.metricsToken }),
  printMetrics,
);

export default app;

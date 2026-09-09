import { performance } from "node:perf_hooks"

import { parseRouteLocation } from "../dist/components/routes/location.js"
import { compileRouteBranches, matchRoutes } from "../dist/components/routes/matcher.js"

const cases = [
  { routes: 10, iterations: 100_000 },
  { routes: 100, iterations: 20_000 },
  { routes: 1_000, iterations: 2_000 },
]

function percentile(values, ratio) {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))]
}

function createRoutes(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `route-${index}`,
    path: `/module-${index}/records/:id`,
    title: `Route ${index}`,
    element: null,
  }))
}

function measureCompile(routes) {
  const samples = []
  for (let round = 0; round < 30; round += 1) {
    const startedAt = performance.now()
    compileRouteBranches(routes)
    samples.push(performance.now() - startedAt)
  }
  return percentile(samples, 0.5)
}

function measureMatch(compiled, location, iterations) {
  const warmup = Math.max(100, Math.floor(iterations / 10))
  for (let index = 0; index < warmup; index += 1) matchRoutes(compiled, location)

  const samples = []
  for (let round = 0; round < 7; round += 1) {
    const startedAt = performance.now()
    for (let index = 0; index < iterations; index += 1) matchRoutes(compiled, location)
    samples.push((performance.now() - startedAt) / iterations)
  }
  const medianMs = percentile(samples, 0.5)
  return {
    medianMicroseconds: medianMs * 1_000,
    operationsPerSecond: 1_000 / medianMs,
  }
}

const results = cases.map(({ routes: routeCount, iterations }) => {
  const routes = createRoutes(routeCount)
  const compiled = compileRouteBranches(routes)
  const location = parseRouteLocation(`/module-${routeCount - 1}/records/A-100`)
  const match = measureMatch(compiled, location, iterations)
  return {
    routes: routeCount,
    iterationsPerRound: iterations,
    compileMedianMs: Number(measureCompile(routes).toFixed(3)),
    matchMedianMicroseconds: Number(match.medianMicroseconds.toFixed(3)),
    matchOperationsPerSecond: Math.round(match.operationsPerSecond),
  }
})

console.log(JSON.stringify({
  runtime: process.version,
  platform: `${process.platform}-${process.arch}`,
  methodology: "30 compile samples; 7 warmed match rounds; median reported; worst-position route",
  results,
}, null, 2))

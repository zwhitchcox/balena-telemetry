'use strict';
// track async ids
const store = new Map()
const ah = require('async_hooks')
const fs = require('fs')
ah.createHook({ init(asyncId, type, triggerAsyncId) {
  if (store.has(triggerAsyncId)) {
    // fs.writeSync(1, asyncId+'\n')
    store.set(asyncId, store.get(triggerAsyncId))
  }
} }).enable()

// set up telemetry processor
const opentelemetry = require('@opentelemetry/api');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor
} = require('@opentelemetry/tracing');
const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
const tracer = opentelemetry.trace.getTracer('async-hooks-tracer');

// wrap functions
const {executionAsyncId} = require('async_hooks')
const fns1 = require('./lib1')
const fns2 = require('./lib2')
const shimmer = require('shimmer');
const wrapFn = (mod, name) => {
  shimmer.wrap(mod, name, function(original) {
    return function() {
      const parentSpan = store.get(executionAsyncId())
      let span;
      if (parentSpan) {
        const ctx = opentelemetry.setSpan(opentelemetry.context.active(), parentSpan)
        span = tracer.startSpan(name, undefined, ctx)
      } else {
        span = tracer.startSpan(name)
        store.set(executionAsyncId(), span)
      }
      const result = original.apply(this, arguments)
      span.end()
      return result
    }
  })
}

// wrapFn(fns1, 'fn1')
// wrapFn(fns1, 'fn2')
wrapAll(fns1)
wrapAll(fns2)

function wrapAll (mod) {
  for (const key of Object.keys(mod)) {
    wrapFn(mod, key)
  }
}
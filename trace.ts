import * as opentelemetry from '@opentelemetry/api'
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor
} from '@opentelemetry/tracing'
import * as ah from 'async_hooks'

// track async ids
const store = new Map()
const ids = new WeakMap()
ah.createHook({ init(asyncId, type, triggerAsyncId) {
  if (store.has(triggerAsyncId)) {
    const span = store.get(triggerAsyncId)
    store.set(asyncId, store.get(triggerAsyncId))
    ids.set(span, ids.get(span).concat(asyncId))
  }
} }).enable()

// set up telemetry processor
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
    return function(this: any) {
      const parentSpan = store.get(executionAsyncId())
      let span;
      if (parentSpan) {
        const ctx = opentelemetry
          .setSpan(opentelemetry.context.active(), parentSpan)
        span = tracer.startSpan(name, undefined, ctx)
      } else {
        span = tracer.startSpan(name)
        ids.set(span, [])
        store.set(executionAsyncId(), span)
      }
      const result = original.apply(this, arguments)
      for (const id of ids.get(span) || []) {
        store.delete(id)
      }
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

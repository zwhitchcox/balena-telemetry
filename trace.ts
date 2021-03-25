import { context, setSpan, trace } from '@opentelemetry/api'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
// import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor
} from '@opentelemetry/tracing'
import { NodeTracerProvider } from '@opentelemetry/node'


// set up telemetry processor
context.setGlobalContextManager(new AsyncHooksContextManager)
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter));
provider.register();
const tracer =trace.getTracer('async-hooks-tracer');

// wrap functions
const fns1 = require('./lib1')
const fns2 = require('./lib2')
const shimmer = require('shimmer');
const wrapFn = (mod, name) => {
  shimmer.wrap(mod, name, function(original) {
    return function(this: any) {
      const fnSpan = tracer.startSpan(name)
      return context.with(setSpan(context.active(), fnSpan), () => {
        const result =  original.apply(this, arguments)
        fnSpan.end()
        return result
      })
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

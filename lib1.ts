import { context, getSpan } from '@opentelemetry/api'
import { fn3, fn4 } from './lib2'

export const fn1 = async () => {
  await fn3()
}

export const fn2 = async () => {
  const span = getSpan(context.active())
  if (span) {
    span.setAttribute('my info', 'info info info')
    span.addEvent('getting list of volumes');
    span.addEvent('found 5 volumes');
  }
  await fn4()
}
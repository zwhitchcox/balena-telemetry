import { fn3, fn4 } from './lib2'
import { executionAsyncId } from 'async_hooks'
import { store } from './trace'

export const fn1 = async () => {
  await fn3()
}

export const fn2 = async () => {
  const span = store.get(executionAsyncId())
  span.setAttribute('my info', 'info info info')
  span.addEvent('getting list of volumes');
  span.addEvent('found 5 volumes');
  await fn4()
}
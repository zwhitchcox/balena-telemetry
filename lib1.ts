import { fn3, fn4 } from './lib2'

export const fn1 = async () => {
  await fn3()
}

export const fn2 = async () => {
  await fn4()
}
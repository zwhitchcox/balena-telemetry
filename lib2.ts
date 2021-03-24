import { fn2 } from './lib1'
export const fn3 = async () => {
  await fn2()
}


export const fn4 = async () => {
  console.log('running fn4')
}

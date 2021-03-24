const ah = require('async_hooks')
const fs = require('fs')
const { executionAsyncId } = ah

const store = new WeakMap()
ah.createHook({
  init(asyncId, type, triggerAsyncId) {
    const eid = ah.executionAsyncId();
    fs.writeSync(
      1,
      `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`);
  }
}).enable();


const fn1 = async () => {
  console.log('fn1', executionAsyncId())
  await fn2()
}

const fn2 = async () => {
  return new Promise((res, rej) => {
    console.log('fn2', executionAsyncId())
    console.log('calling fn2')
    res()
  })
}

fn1()
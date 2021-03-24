require('./trace')

const {fn1, fn2 } = require('./lib1')
const {fn3, fn4 } = require('./lib2')

async function main() {
  await fn1()
}

main().catch(console.error)
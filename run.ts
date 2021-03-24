import {fn1} from './lib1'
import './trace'

async function main() {
  await fn1()
}

main().catch(console.error)
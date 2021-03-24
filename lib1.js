
const fn1 = async () => {
  await require('./lib2').fn3()
}

const fn2 = async () => {
  await require('./lib2').fn4()
}

module.exports = {
  fn1,
  fn2,
}
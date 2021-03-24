const fn3 = async () => {
  await require('./lib1').fn2()
}


const fn4 = async () => {
  console.log('running fn4')
}

module.exports = {
  fn3,
  fn4,
}

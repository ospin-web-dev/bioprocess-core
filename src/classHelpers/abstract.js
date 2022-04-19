const forbidInitializing = (target, classRef) => {
  if (target === classRef) {
    throw new TypeError(`${target.name} is an abstract class - it cannot be initialized`)
  }
}

module.exports = {
  forbidInitializing,
}

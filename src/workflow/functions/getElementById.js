module.exports = (wf, id) => {
  const collectionNames = Object.keys(wf.elements)

  for (const col of collectionNames) {
    const el = wf.elements[col].find(colEl => colEl.id === id)
    if (el) return el
  }
}

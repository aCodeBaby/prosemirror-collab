export default class Pos {
  constructor(path, offset) {
    this.path = path
    this.offset = offset
  }

  toString() {
    return this.path.join("/") + ":" + this.offset
  }

  static cmp(pathA, offsetA, pathB, offsetB) {
    let lenA = pathA.length, lenB = pathB.length;
    for (var i = 0, end = Math.min(lenA, lenB); i < end; i++) {
      var diff = pathA[i] - pathB[i]
      if (diff != 0) return diff
    }
    if (lenA > lenB)
      return offsetB <= pathA[i] ? 1 : -1
    else if (lenB > lenA)
      return offsetA <= pathB[i] ? -1 : 1
    else
      return offsetA - offsetB
  }

  cmp(other) { return Pos.cmp(this.path, this.offset, other.path, other.offset) }

  shorten(to = null, offset = 0) {
    if (to == null) to = this.path.length - 1
    return new Pos(this.path.slice(0, to), this.path[to] + offset)
  }

  offsetAt(pos, offset) {
    let path = this.path.slice()
    path[pos] += offset
    return new Pos(path, this.offset)
  }

  static fromJSON(json) { return new Pos(json.path, json.offset) }
}

function findLeft(node, path) {
  if (node.type.contains == "inline")
    return new Pos(path, 0)
  for (let i = 0; i < node.content.length; i++) {
    path.push(i)
    let found = findLeft(node.content[i], path)
    if (found) return found
    path.pop()
  }
}

function findAfter(node, pos, path) {
  if (node.type.contains == "inline")
    return pos
  let atEnd = path.length == pos.path.length
  let start = atEnd ? pos.offset : pos.path[path.length]
  for (let i = start; i < node.content.length; i++) {
    path.push(i)
    let child = node.content[i]
    let found = i == start && !atEnd ? findAfter(child, pos, path) : findLeft(child, path)
    if (found) return found
    path.pop()
  }
}

Pos.after = function(node, pos) { return findAfter(node, pos, []) }
Pos.start = function(node) { return findLeft(node, []) }

function findRight(node, path) {
  if (node.type.contains == "inline")
    return new Pos(path, node.size)
  for (let i = node.content.length - 1; i >= 0; i--) {
    path.push(i)
    let found = findRight(node.content[i], path)
    if (found) return found
    path.pop()
  }
}

function findBefore(node, pos, path) {
  if (node.type.contains == "inline") return pos
  let atEnd = pos.path.length == path.length
  let end = atEnd ? pos.offset - 1 : pos.path[path.length]
  for (let i = end; i >= 0; i--) {
    path.push(i)
    let child = node.content[i]
    let found = i == end && !atEnd ? findBefore(child, pos, path) : findRight(child, path)
    if (found) return found
    path.pop()
  }
}

Pos.before = function(node, pos) { return findBefore(node, pos, []) }
Pos.end = function(node) { return findRight(node, []) }

export type DSAction =
  | 'stack:push'
  | 'stack:pop'
  | 'queue:enqueue'
  | 'queue:dequeue'
  | 'list:insertHead'
  | 'list:deleteHead'
  | 'bst:insert'
  | 'heap:insert'
  | 'heap:extract'
  | 'hash:put'
  | 'hash:get'
  | 'graph:addNode'
  | 'graph:addEdge'
  | 'graph:bfsStep'

export interface DSMetrics {
  operations: number
  push: number
  pop: number
  enqueue: number
  dequeue: number
  insertHead: number
  deleteHead: number
  bstInsert?: number
  heapInsert?: number
  heapExtract?: number
  hashPut?: number
  hashGet?: number
  graphAddNode?: number
  graphAddEdge?: number
  graphBfsStep?: number
  memoryBytes: number
  lastAction?: string
}

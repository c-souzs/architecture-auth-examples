import { useState } from 'react'

export function usePagination(initialPage = 0, initialSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)

  function goToPage(p: number) {
    setPage(p)
  }

  function changeSize(s: number) {
    setSize(s)
    setPage(0)
  }

  function reset() {
    setPage(0)
  }

  return { page, size, goToPage, changeSize, reset }
}

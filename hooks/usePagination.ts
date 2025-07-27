import { useState } from 'react';

export function usePagination(defaultPage = 1, defaultLimit = 10) {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultLimit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    setItemsPerPage
  };
}
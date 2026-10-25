import { useState, useMemo } from 'react';

/**
 * Custom hook to handle pagination state and calculations.
 *
 * @param {Array} items - Array of data items to paginate
 * @param {number} initialPageSize - Default page size (default 10)
 */
export const usePagination = (items = [], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page stays within valid bounds when items change
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, validCurrentPage, pageSize]);

  const goToPage = (page) => {
    const pageNum = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    if (validCurrentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (validCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    hasNextPage: validCurrentPage < totalPages,
    hasPrevPage: validCurrentPage > 1,
  };
};

export default usePagination;

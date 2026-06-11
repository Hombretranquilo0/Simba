const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
      <div className="aspect-square skeleton" />
      <div className="p-5 flex flex-col flex-grow space-y-3">
        <div className="h-3 w-1/4 skeleton rounded" />
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800">
          <div className="space-y-2">
            <div className="h-6 w-20 skeleton rounded" />
            <div className="h-3 w-12 skeleton rounded" />
          </div>
          <div className="h-10 w-10 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {[...Array(10)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

export default ProductSkeleton;

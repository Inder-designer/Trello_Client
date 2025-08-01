import { X } from "lucide-react";

const CardDetailsSkeleton = () => {
    return (
        <div className="p-0 animate-pulse">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border1">
                <div className="h-5 w-1/3 bg-gray-200 rounded" />
                <X className="text-gray-400" />
            </div>

            <div className="px-6 py-4 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white" />
                        ))}
                    </div>
                </div>

                <div className="mt-6 border-t pt-4 border-border">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/60 border border-border rounded">
                        <div className="h-6 bg-white rounded" />
                        <div className="h-6 bg-white rounded" />
                    </div>

                    <div className="mt-4 space-y-4">
                        <div className="h-20 bg-gray-100 rounded" />
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="p-3 bg-gray-100 rounded space-y-2">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                        <div className="h-3 w-full bg-gray-100 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardDetailsSkeleton;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BoardSkeleton = () => {
    return (
        <Card className="animate-pulse hover:shadow-lg transition-shadow">
            <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-gray-300" />
                        <CardTitle className="text-lg bg-gray-200 rounded w-28 h-4" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-5 h-5 bg-gray-300 rounded" />
                        <div className="w-5 h-5 bg-gray-300 rounded" />
                    </div>
                </div>
                <div className="mt-2 h-3 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="pb-3 pt-2 px-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-40 bg-gray-300 rounded" />
                    </div>
                    <Badge className="bg-gray-200 text-transparent">00 cards</Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default BoardSkeleton;

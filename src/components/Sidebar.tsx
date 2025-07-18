import { useState } from 'react';
import { Plus, Users, Filter, Archive, List, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Board } from '@/pages/Index';
import { Link, useParams } from 'react-router-dom';
import { useGetAllBoardsQuery } from '@/redux/api/Board';
import { IBoard } from '@/Types/IBoard';

interface SidebarProps {
  selectedBoard?: Board | null;
  onSelectBoard?: (board: Board | null) => void;
  onUpdateBoards?: (boards: Board[]) => void;
}

const Sidebar = () => {
  const { id } = useParams<{ id: string }>("");
  const { data: boards } = useGetAllBoardsQuery({})
  const allBoards = [
    ...(boards?.ownedBoards || []),
    ...(boards?.memberBoards || [])
  ];
  console.log(boards);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Workspace</h2>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <Link to="/boards" >
          <Button
            className="w-full justify-start"
          // onClick={() => onSelectBoard(null)}
          >
            <List className="h-4 w-4 mr-2" />
            All Boards
          </Button>
        </Link>
      </div>

      {/* Boards List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4 px-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">All Boards</h3>
          <Badge variant="secondary">{allBoards?.length}</Badge>
        </div>
        <div className='flex flex-col space-y-3'>
          {boards?.ownedBoards?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1 px-4">
                <Crown className="h-3.5 w-3.5 text-yellow-600" />
                <h2 className="font-semibold text-gray-900">Own Boards</h2>
              </div>

              <div className="space-y-2">
                {boards?.ownedBoards?.map((board: IBoard) => (
                  <button
                    key={board._id}
                    className={`w-full border text-left py-2 px-4 transition-colors ${id === board._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-100 border-transparent'
                      }`}
                  >
                    <Link to={`/board/${board._id}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${board.background}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${id === board._id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                            {board.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {board?.lists?.length} lists • {board?.members?.length} members
                          </p>
                        </div>
                      </div>
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          )}
          {boards?.memberBoards?.length > 0 &&
            <div>
              <div className="flex items-center gap-2 mb-1 px-4">
                <h2 className="font-semibold text-gray-900">Guest Boards</h2>
              </div>

              <div className="space-y-2">
                {boards?.memberBoards?.map((board: IBoard) => (
                  <button
                    key={board._id}
                    className={`w-full border text-left py-2 px-4 transition-colors ${id === board._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-100 border-transparent'
                      }`}
                  >
                    <Link to={`/board/${board._id}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${board.background}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${id === board._id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                            {board.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {board?.lists?.length} lists • {board?.members?.length} members
                          </p>
                        </div>
                      </div>
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
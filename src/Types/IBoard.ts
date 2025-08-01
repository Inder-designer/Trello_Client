import { ICard } from "./ICard";

export interface ILabel {
    name: string;
    color: string;
}
export interface IMember {
    _id?: string;
    fullName?: string;
    initials?: string;
    email?: string;
}
export interface IBoard {
    _id?: string;
    title?: string;
    description?: string;
    background?: string;
    owner?: string;
    members?: IMember[];
    lists?: [
        {
            _id?: string;
            title?: string;
            cards?: ICard[];
        }
    ];
    cardCounts?: number
    labels?: ILabel[];
    createdAt?: Date;
    updatedAt?: Date;
    joinRequests?: {
        _id: string;
        boardId: string;
        requestBy: string;
        status: 'pending' | 'accepted' | 'rejected';
    }[];
    isLeave: boolean;
    isClosed: boolean;
}
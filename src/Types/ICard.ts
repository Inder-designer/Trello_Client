import { IMember } from "./IBoard";

export interface IAttachment {
    name: string;
    url: string;
    type?: string;
    uploadedAt?: Date;
}
export interface IComment {
    _id?: string;
    cardId: ICard;
    userId: string;
    message: string;
    createdAt: Date;
    updatedAt: Date;
    reactions?: {
        userIds: string[];
        emoji: { emoji: string; unified: string };
        count: number;
    }[];
}

export interface ICard {
    _id?: string;
    shortLink?: string;
    title: string;
    description: string;
    priority: string;
    idCreator: string;
    listId: string;
    boardId: string;
    labels: { id: string; name: string }[];
    idMembers: IMember[];
    dueDate?: string;
    attachments: IAttachment[];
    createdAt: Date;
    updatedAt: Date;
    commentCounts?: number;
    activities?: any[];
    comments?: IComment[];
}

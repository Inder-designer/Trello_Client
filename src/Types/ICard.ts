import { IMember } from "./IBoard";

export interface IAttachment {
    name: string;
    url: string;
    type?: string;
    uploadedAt?: Date;
}

export interface ICard {
    _id?: string;
    title: string;
    description: string;
    priority: string;
    idCreator: string;
    listId: string;
    boardId: string;
    label: string;
    idMembers: IMember[];
    dueDate?: Date;
    attachments: IAttachment[];
    createdAt: Date;
    updatedAt: Date;
}

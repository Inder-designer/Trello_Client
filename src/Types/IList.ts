import { ICard } from "./ICard";

export interface IList {
    _id?: string;
    title: string;
    boardId: string;
    cards: ICard[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
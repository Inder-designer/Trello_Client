
export interface ILabel {
    name: string;
    color: string;
}
export interface IMember {
    _id?: string;
    fullName?: string;
    initials?: string;
}
export interface IBoard {
    _id?: string;
    title?: string;
    description?: string;
    background?: string;
    members?: IMember[];
    lists?: [];
    cardCounts?: number
    labels?: ILabel[];
    createdAt?: Date;
    updatedAt?: Date;
}
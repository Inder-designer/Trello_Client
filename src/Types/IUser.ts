export interface IUser {
    _id: string;
    fullName: string;
    userName?: string;
    initials: string;
    email: string;
    avatar?: string; 4
    idBoards?: string[];
    ownedBoards?: string[];
} 
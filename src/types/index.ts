
export const role = ['contributor', 'maintainer']

type Role = typeof role[number]

export interface IUser{
    name: string;
    email: string;
    password: string;
    role?: string;
}
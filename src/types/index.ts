
// export const ROLE = ['contributor', 'maintainer']

// type Role = typeof role[number]
export const ROLE = {
    maintainer: "maintainer",
    contributor: "contributor",
} as const;

export type ROLES =  "maintainer" | "contributor"

export interface IUser{
    name: string;
    email: string;
    password: string;
    role?: string;
}
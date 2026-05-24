// export const ROLE = ['contributor', 'maintainer']

// type Role = typeof role[number]
export const USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor",
} as const;

export type ROLES = "maintainer" | "contributor";

export interface IUser {
  id?: string | number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface IJwtPayload {
  id: string | number;
  name: string;
  role: string;
}


export interface IIssueFilters {
  sort?: "newest" | "oldest";
  type?: string;
  status?: string;
}

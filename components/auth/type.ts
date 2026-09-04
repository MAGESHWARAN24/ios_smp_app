import type { ReactNode } from "react";
import { FormSchemaType } from "./config";


export interface AuthUser
{
    name: string;
    email: string;
    avatar: string;
    createdAt: string
    token: string
}


export type AuthType = "email" | "google"

export interface AuthBase
{
    email: string
    password: string
    idToken?: string
}

export interface SignIn extends AuthBase
{

}

export interface SignUp extends FormSchemaType
{

}
export interface AuthProviderProps
{
    children: ReactNode
}

export interface AuthContextValue
{
    user: AuthUser | null
    isAuthenticated: boolean
    signInAsync: (payload: SignIn) => Promise<void>
    signUpAsync: (payload: SignUp) => Promise<void>
    signOutAsync: () => Promise<void>
}
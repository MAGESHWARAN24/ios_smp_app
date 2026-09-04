
export enum NextStepEnum
{
    NAVIGATION = 'navigation',
    NOTIFICATION = 'notification',
    LOCALSTORAGE = 'localstorage',
    DIALOGBOX = "dialogbox"
}

export interface Message
{
    category: string
    description: string
}

export enum NotificationEnum
{
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning'
}

export interface Notification
{
    variant: NotificationEnum
    message: Message
}

export enum NavigationEnum
{
    INTERNAL = 'internal',
    EXTERNAL = 'external',
    PERMENENT = 'permanent',
    TEMPORARY = 'temporary',
    SUBMISSTIONID = 'submissionid'
}

export interface Navigation
{
    variant: NavigationEnum
    baseUrl: string
    path: string
    state: Record<string, string>
}

export enum LocalStorageEnum
{
    SET = 'set',
    REMOVE = 'remove'
}

export interface LocalStorage
{
    variant: LocalStorageEnum
    propertyName: string
    propertyValue: any
}

export interface DialogBox
{
    icon: any
    action: string
    message: Message
}

export type NextStepAction =
    {
        type: NextStepEnum.NOTIFICATION
        step: Notification
    }
    | {
        type: NextStepEnum.NAVIGATION
        step: Navigation
    }
    | {
        type: NextStepEnum.LOCALSTORAGE
        step: LocalStorage
    } | {
        type: NextStepEnum.DIALOGBOX,
        step: DialogBox
    }


export interface BaseResponse<T>
{
    isSuccess: boolean
    isFailure: boolean
    message: Message
    payload: T
    actions: NextStepAction[]
}
/**
 * @interface IErrorData
 */
export interface IErrorData {
	status: number
	message: string
	name: string
	syscal: string
}

export interface IErrorNoException {
	errno?: number
    code?: number
    path?: string
    syscall?: string
    stack?: string
	message?: string
}

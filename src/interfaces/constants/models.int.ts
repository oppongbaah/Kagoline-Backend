export interface IModelConstants {
	collections: {
		users: string
		trucks: string
		trips: string,
		logs?: string
	}
	localFields?: {
		trucks?: string
		trips?: string
	}
	foreignFields?: {
		id: string
	}
	virtualFields?: {
		trucks: string
		trips: string
		username: string
		fullname: string
	}
}

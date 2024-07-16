import axios, { AxiosResponse, AxiosRequestConfig, Method } from "axios";

class AxiosExt {
	// eslint-disable-next-line @typescript-eslint/ban-types
	public static async call(basePath: string, path: string, method: Method, params: Object = {} )
		: Promise<AxiosResponse> {
		const config: AxiosRequestConfig = {
			baseURL: basePath,
			url: path,
			method: method,
			params: params
		};

		return axios.request(config);
	}
}

export { AxiosExt };
